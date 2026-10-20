import assert from "node:assert/strict";
import { after, test } from "node:test";
import { getRedis } from "../src/server/redis.server.ts";

const clients = new Set<Awaited<ReturnType<typeof getRedis>>>();
after(() => {
  for (const client of clients) {
    if (client.isOpen) client.destroy();
  }
});

test("a closed Redis connection is replaced once and shared by concurrent requests", async () => {
  const first = await getRedis();
  clients.add(first);
  assert.equal(await first.ping(), "PONG");
  first.destroy();

  const reconnected = await Promise.all([getRedis(), getRedis(), getRedis()]);
  for (const client of reconnected) clients.add(client);
  assert.ok(reconnected[0] !== first, "must replace the closed Redis client");
  assert.ok(
    reconnected.every((client) => client === reconnected[0]),
    "concurrent requests must share the new connection",
  );
  assert.equal(await reconnected[0].ping(), "PONG");
});
