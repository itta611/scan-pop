import type { PublishedScreen } from "@/schemas/screen";
import { getRedis } from "./redis.server";
import { countKey, streamKey } from "./screens.server";

export const CONNECTION_MS = 30_000;
export const REPLAY_MS = 2_000;

export function replayCursor(lastId: string | null, now: number) {
  const cutoff = now - (lastId ? REPLAY_MS : 0);
  const floor = String(cutoff - 1) + "-0";
  if (!lastId) return { cursor: floor, cutoff };
  const [lastTime, lastSequence] = lastId.split("-").map(BigInt);
  const [floorTime, floorSequence] = floor.split("-").map(BigInt);
  const isNewer =
    lastTime > floorTime ||
    (lastTime === floorTime && lastSequence > floorSequence);
  return { cursor: isNewer ? lastId : floor, cutoff };
}

export async function scanStream(
  screen: PublishedScreen,
  lastId: string | null,
  signal: AbortSignal,
) {
  const { id } = screen;
  const redis = await getRedis();
  const [seconds, micros] = (await redis.sendCommand(["TIME"])) as string[];
  const now = Number(seconds) * 1000 + Math.floor(Number(micros) / 1000);
  let { cursor, cutoff } = replayCursor(lastId, now);
  const count = Number((await redis.get(countKey(id))) ?? 0);
  const reader = redis.duplicate();
  reader.on("error", (error) => console.error("Redis stream failed", error));
  await reader.connect();

  const encoder = new TextEncoder();
  let stop = () => {};
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      let stopped = false;
      const send = (value: string) => controller.enqueue(encoder.encode(value));
      const close = (closeBody: boolean) => {
        if (stopped) return;
        stopped = true;
        clearTimeout(deadline);
        signal.removeEventListener("abort", onAbort);
        reader.destroy();
        if (closeBody) controller.close();
      };
      const onAbort = () => close(true);
      const deadline = setTimeout(() => close(true), CONNECTION_MS);
      stop = () => close(false);
      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) {
        close(true);
        return;
      }
      send("retry: 0\n\n");
      send(
        "id: " +
          cursor +
          "\nevent: ready\ndata: " +
          JSON.stringify({ count, screen }) +
          "\n\n",
      );
      void (async () => {
        try {
          while (!stopped) {
            const streams = await reader.xRead(
              { key: streamKey(id), id: cursor },
              { BLOCK: 5000, COUNT: 100 },
            );
            if (stopped) return;
            if (!streams) {
              send(": heartbeat\n\n");
              continue;
            }
            for (const stream of streams) {
              for (const event of stream.messages) {
                cursor = event.id;
                if (Number(event.id.split("-")[0]) < cutoff) continue;
                const kind = event.message.kind;
                const data =
                  kind === "config"
                    ? event.message.config
                    : JSON.stringify({ count: Number(event.message.count) });
                send(
                  "id: " +
                    event.id +
                    "\nevent: " +
                    kind +
                    "\ndata: " +
                    data +
                    "\n\n",
                );
              }
            }
          }
        } catch (error) {
          if (!stopped) {
            console.error("SSE delivery failed", error);
            close(true);
          }
        }
      })();
    },
    cancel() {
      stop();
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
