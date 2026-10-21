import type {
  PublishedScreen,
  SavedScreen,
  ScreenConfig,
} from "@/schemas/screen";
import { HttpError } from "./http.server";
import { getRedis } from "./redis.server";

const screenKey = (id: string) => "qrpop:screen:" + id;
export const streamKey = (id: string) => "qrpop:scans:" + id;
export const countKey = (id: string) => "qrpop:count:" + id;

export async function readScreen(id: string): Promise<SavedScreen> {
  const value = await (await getRedis()).get(screenKey(id));
  if (!value)
    throw new HttpError(404, "この表示ページは見つかりませんでした。");
  return JSON.parse(value);
}

export async function publicScreen(id: string): Promise<PublishedScreen> {
  const { editToken: _editToken, ...screen } = await readScreen(id);
  return screen;
}

export async function saveScreen(
  id: string,
  editToken: string,
  config: ScreenConfig,
): Promise<SavedScreen> {
  const screen = { ...config, id, editToken };
  const redis = await getRedis();
  const created = await redis.set(screenKey(id), JSON.stringify(screen), {
    NX: true,
  });
  if (created) return screen;

  const current = await readScreen(id);
  if (editToken !== current.editToken)
    throw new HttpError(403, "この表示ページを編集する権限がありません。");
  await redis.set(screenKey(id), JSON.stringify(screen));
  const { editToken: _editToken, ...publicConfig } = screen;
  await redis.xAdd(streamKey(id), "*", {
    kind: "config",
    config: JSON.stringify(publicConfig),
  });
  await redis.expire(streamKey(id), 3600);
  return screen;
}

export async function recordScan(id: string): Promise<string> {
  const redis = await getRedis();
  const url = (await redis.eval(
    `
    local screen = redis.call('GET', KEYS[1])
    if not screen then return nil end
    local url = cjson.decode(screen).url
    local count = redis.call('INCR', KEYS[3])
    local time = redis.call('TIME')
    local cutoff = tostring(tonumber(time[1]) * 1000 - 60000) .. '-0'
    redis.call('XADD', KEYS[2], 'MINID', '~', cutoff, '*', 'kind', 'scan', 'count', tostring(count))
    redis.call('EXPIRE', KEYS[2], 3600)
    return url
  `,
    { keys: [screenKey(id), streamKey(id), countKey(id)], arguments: [] },
  )) as string | null;
  if (url === null)
    throw new HttpError(404, "この表示ページは見つかりませんでした。");
  return url;
}
