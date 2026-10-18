import { randomUUID } from "node:crypto";
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

export async function createScreen(config: ScreenConfig): Promise<SavedScreen> {
	const screen = { ...config, id: randomUUID(), editToken: randomUUID() };
	await (await getRedis()).set(screenKey(screen.id), JSON.stringify(screen));
	return screen;
}

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

export async function updateScreen(
	id: string,
	token: string | null,
	config: ScreenConfig,
) {
	const current = await readScreen(id);
	if (token !== current.editToken)
		throw new HttpError(403, "この表示ページを編集する権限がありません。");
	const screen = { ...current, ...config };
	const redis = await getRedis();
	await redis.set(screenKey(id), JSON.stringify(screen));
	const { editToken: _editToken, ...publicConfig } = screen;
	await redis.xAdd(streamKey(id), "*", {
		kind: "config",
		config: JSON.stringify(publicConfig),
	});
	await redis.expire(streamKey(id), 3600);
	return screen;
}

export async function recordScan(id: string) {
	const redis = await getRedis();
	await redis.eval(
		`
    local count = redis.call('INCR', KEYS[2])
    local time = redis.call('TIME')
    local cutoff = tostring(tonumber(time[1]) * 1000 - 60000) .. '-0'
    local id = redis.call('XADD', KEYS[1], 'MINID', '~', cutoff, '*', 'kind', 'scan', 'count', tostring(count))
    redis.call('EXPIRE', KEYS[1], 3600)
    return id
  `,
		{ keys: [streamKey(id), countKey(id)], arguments: [] },
	);
}
