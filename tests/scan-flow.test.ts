import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { PUT } from "../src/app/api/screens/[id]/route.ts";
import { GET as visitScreen } from "../src/app/go/[id]/route.ts";
import { defaultScreen } from "../src/schemas/screen.ts";
import { getRedis } from "../src/server/redis.server.ts";
import {
  CONNECTION_MS,
  replayCursor,
  scanStream,
} from "../src/server/scan-stream.server.ts";
import {
  countKey,
  publicScreen,
  recordScan,
  saveScreen,
  streamKey,
} from "../src/server/screens.server.ts";

const ids: string[] = [];
async function fixture() {
  const screen = await saveScreen(randomUUID(), randomUUID(), {
    ...defaultScreen,
    url: "https://example.com/?test=scan-pop",
  });
  ids.push(screen.id);
  return screen;
}

async function redisNow() {
  const [seconds, micros] = (await (
    await getRedis()
  ).sendCommand(["TIME"])) as string[];
  return Number(seconds) * 1000 + Math.floor(Number(micros) / 1000);
}

function events(response: Response) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  return {
    async next() {
      while (true) {
        const boundary = buffer.indexOf("\n\n");
        if (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const lines = Object.fromEntries(
            frame
              .split("\n")
              .filter((line) => !line.startsWith(":"))
              .map((line) => {
                const i = line.indexOf(":");
                return [line.slice(0, i), line.slice(i + 1).trim()];
              }),
          );
          if (lines.event)
            return {
              type: lines.event,
              id: lines.id,
              data: JSON.parse(lines.data),
            };
          continue;
        }
        const result = await reader.read();
        if (result.done) return null;
        buffer += decoder.decode(result.value, { stream: true });
      }
    },
    close: () => reader.cancel(),
  };
}

after(async () => {
  const redis = await getRedis();
  for (const id of ids)
    await redis.del(["qrpop:screen:" + id, streamKey(id), countKey(id)]);
  redis.destroy();
});

test("public settings omit the edit token, and only the owner can update them", async () => {
  const screen = await fixture();
  assert.equal("editToken" in (await publicScreen(screen.id)), false);
  await assert.rejects(
    saveScreen(screen.id, "wrong-token", { ...screen, title: "上書き" }),
    { status: 403 },
  );
  await saveScreen(screen.id, screen.editToken, {
    ...screen,
    title: "ようこそ！",
  });
  assert.equal((await publicScreen(screen.id)).title, "ようこそ！");
});

test("a QR visit wakes a blocking SSE reader immediately", {
  timeout: 8000,
}, async () => {
  const screen = await fixture();
  const stream = events(
    await scanStream(screen, null, new AbortController().signal),
  );
  const ready = await stream.next();
  assert.equal(ready?.type, "ready");
  assert.match(ready!.id, /^\d+-\d+$/);
  const waiting = stream.next();
  await recordScan(screen.id);
  const event = await waiting;
  assert.equal(event?.type, "scan");
  assert.equal(event?.data.count, 1);
  assert.match(event!.id, /^\d+-\d+$/);
  await stream.close();
});

test("recovery skips old and received scans, and replays only unreceived scans within two seconds", {
  timeout: 8000,
}, async () => {
  const screen = await fixture();
  const redis = await getRedis();
  const now = await redisNow();
  const received = now - 1400 + "-0";
  const fresh = now - 600 + "-0";
  await redis.xAdd(streamKey(screen.id), now - 5000 + "-0", {
    kind: "scan",
    count: "1",
  });
  await redis.xAdd(streamKey(screen.id), received, {
    kind: "scan",
    count: "2",
  });
  await redis.xAdd(streamKey(screen.id), fresh, { kind: "scan", count: "3" });
  await redis.set(countKey(screen.id), "3");
  const stream = events(
    await scanStream(screen, received, new AbortController().signal),
  );
  await stream.next();
  const event = await stream.next();
  assert.equal(event?.id, fresh);
  assert.equal(event?.data.count, 3);
  const waiting = stream.next();
  await recordScan(screen.id);
  assert.equal((await waiting)?.data.count, 4);
  await stream.close();
});

test("first connections start at connection time, while an idle connection can still recover a gap", {
  timeout: 8000,
}, async () => {
  const screen = await fixture();
  const redis = await getRedis();
  const now = await redisNow();
  await redis.xAdd(streamKey(screen.id), now - 700 + "-0", {
    kind: "scan",
    count: "1",
  });
  await redis.set(countKey(screen.id), "1");
  const first = events(
    await scanStream(screen, null, new AbortController().signal),
  );
  const ready = await first.next();
  await first.close();
  await delay(30);
  await recordScan(screen.id);
  const recovered = events(
    await scanStream(screen, ready!.id, new AbortController().signal),
  );
  await recovered.next();
  assert.equal((await recovered.next())?.data.count, 2);
  await recovered.close();
});

test("a long disconnect discards stale events instead of celebrating the backlog", {
  timeout: 8000,
}, async () => {
  const screen = await fixture();
  const redis = await getRedis();
  const now = await redisNow();
  await redis.xAdd(streamKey(screen.id), now - 4000 + "-0", {
    kind: "scan",
    count: "1",
  });
  await redis.set(countKey(screen.id), "1");
  const stream = events(
    await scanStream(screen, now - 8000 + "-0", new AbortController().signal),
  );
  await stream.next();
  const waiting = stream.next();
  await delay(50);
  await recordScan(screen.id);
  assert.equal((await waiting)?.data.count, 2);
  await stream.close();
});

test("settings updates are broadcast without exposing the edit token", {
  timeout: 8000,
}, async () => {
  const screen = await fixture();
  const stream = events(
    await scanStream(screen, null, new AbortController().signal),
  );
  await stream.next();
  const waiting = stream.next();
  const colors: typeof screen.confetti = [
    "#123456",
    "#abcdef",
    "#789abc",
    "#def012",
  ];
  await saveScreen(screen.id, screen.editToken, {
    ...screen,
    theme: "night",
    confetti: colors,
  });
  const event = await waiting;
  assert.ok(event);
  assert.equal(event.type, "config");
  assert.equal(event.data.theme, "night");
  assert.deepEqual(event.data.confetti, colors);
  assert.deepEqual((await publicScreen(screen.id)).confetti, colors);
  assert.equal("editToken" in event.data, false);
  await stream.close();
});

test("replay cursor compares the sequence part numerically", () => {
  assert.equal(replayCursor("10000-12", 11000).cursor, "10000-12");
  assert.equal(replayCursor("10000-2", 11000).cursor, "10000-2");
  assert.equal(replayCursor("1-0", 11000).cutoff, 9000);
  assert.equal(replayCursor(null, 11000).cutoff, 11000);
});

test("the stream closes after 30 seconds and releases its reader", {
  timeout: 35000,
}, async () => {
  const screen = await fixture();
  const started = performance.now();
  const stream = events(
    await scanStream(screen, null, new AbortController().signal),
  );
  while (await stream.next()) {
    /* Drain heartbeats until the server closes. */
  }
  const elapsed = performance.now() - started;
  assert.ok(elapsed >= CONNECTION_MS - 100, "stream closed too early");
  assert.ok(elapsed < CONNECTION_MS + 3000, "stream did not close on schedule");
});

test("PUT creates a client UUID and rejects missing credentials and other owners", async () => {
  const id = randomUUID();
  const token = randomUUID();
  ids.push(id);
  const put = (editToken?: string) =>
    PUT(
      new Request(`http://localhost/api/screens/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(editToken ? { "X-Edit-Token": editToken } : {}),
        },
        body: JSON.stringify(defaultScreen),
      }),
      { params: Promise.resolve({ id }) },
    );
  assert.equal((await put()).status, 400);
  await assert.rejects(publicScreen(id), { status: 404 });
  const created = await put(token);
  assert.equal(created.status, 200);
  assert.equal((await created.json()).id, id);
  assert.equal((await publicScreen(id)).url, "https://scan.itta.dev");
  assert.equal((await put(randomUUID())).status, 403);
  assert.equal((await put(token)).status, 200);
});

test("concurrent creation of the same ID never replaces the winning owner", async () => {
  const id = randomUUID();
  ids.push(id);
  const results = await Promise.allSettled([
    saveScreen(id, randomUUID(), { ...defaultScreen, title: "first" }),
    saveScreen(id, randomUUID(), { ...defaultScreen, title: "second" }),
  ]);
  const success = results.find((result) => result.status === "fulfilled");
  const rejected = results.find((result) => result.status === "rejected");
  assert.ok(success && success.status === "fulfilled");
  assert.ok(rejected && rejected.status === "rejected");
  assert.equal(rejected.reason.status, 403);
  assert.equal((await publicScreen(id)).title, success.value.title);
});

test("a default project's first QR visit redirects home and notifies the ready editor", {
  timeout: 8000,
}, async () => {
  const id = randomUUID();
  ids.push(id);
  const screen = await saveScreen(id, randomUUID(), defaultScreen);
  const stream = events(
    await scanStream(screen, null, new AbortController().signal),
  );
  try {
    assert.equal((await stream.next())?.type, "ready");
    const waiting = stream.next();
    const response = await visitScreen(
      new Request(`http://localhost/go/${id}`),
      { params: Promise.resolve({ id }) },
    );
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("Location"), "https://scan.itta.dev");
    assert.equal((await waiting)?.type, "scan");
  } finally {
    await stream.close();
  }
});
