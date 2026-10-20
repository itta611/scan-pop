import { createClient } from "redis";

async function connectRedis() {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 5000, reconnectStrategy: false },
  });
  client.on("error", (error) =>
    console.error("Redis connection failed", error),
  );
  await client.connect();
  return client;
}

type RedisClient = Awaited<ReturnType<typeof connectRedis>>;
let client: RedisClient | undefined;
let connecting: Promise<RedisClient> | undefined;

export async function getRedis() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not configured");
  if (client?.isOpen) return client;

  connecting ??= connectRedis()
    .then((connected) => {
      client = connected;
      return connected;
    })
    .finally(() => {
      connecting = undefined;
    });
  return connecting;
}
