import assert from "node:assert/strict";
import { afterEach, beforeEach, test, type TestContext } from "node:test";
import { createStore } from "jotai/vanilla";
import {
	savedScreenAtom,
	saveScreenAtom,
	savingScreenAtom,
	screenConfigAtom,
	themeAtom,
	titleAtom,
	urlAtom,
} from "../src/features/screens/atoms.ts";
import {
	defaultScreen,
	type SavedScreen,
} from "../src/features/screens/schema.ts";

let storage: Map<string, string>;
beforeEach(() => {
	storage = new Map();
	Object.defineProperty(globalThis, "window", {
		configurable: true,
		value: {
			localStorage: {
				getItem: (key: string) => storage.get(key) ?? null,
				setItem: (key: string, value: string) => storage.set(key, value),
				removeItem: (key: string) => storage.delete(key),
			},
		},
	});
});
afterEach(() => {
	Reflect.deleteProperty(globalThis, "window");
});

function editor(t: TestContext) {
	const store = createStore();
	t.after(store.sub(screenConfigAtom, () => {}));
	return store;
}

const saved: SavedScreen = {
	...defaultScreen,
	url: "https://example.com/",
	id: "test-screen",
	editToken: "test-owner-token",
};

test("existing drafts retain settings and owner credentials in the same storage record", (t) => {
	storage.set(
		"qrpop.editor",
		JSON.stringify({ config: screenConfig(saved), saved }),
	);
	const store = editor(t);
	assert.deepEqual(store.get(screenConfigAtom), screenConfig(saved));
	assert.equal(store.get(savedScreenAtom)?.editToken, saved.editToken);
	store.set(titleAtom, "新しい見出し");
	const persisted = JSON.parse(storage.get("qrpop.editor") ?? "{}");
	assert.equal(persisted.config.title, "新しい見出し");
	assert.equal(persisted.saved.editToken, saved.editToken);
});

function screenConfig(screen: SavedScreen) {
	const { id: _id, editToken: _token, ...config } = screen;
	return config;
}

test("editing text does not notify a theme subscriber or change another store", (t) => {
	const first = editor(t);
	const second = editor(t);
	let themeUpdates = 0;
	t.after(
		first.sub(themeAtom, () => {
			themeUpdates += 1;
		}),
	);
	const previous = first.get(screenConfigAtom);
	first.set(titleAtom, "独立した編集");
	assert.equal(themeUpdates, 0);
	assert.equal(first.get(titleAtom), "独立した編集");
	assert.equal(second.get(titleAtom), defaultScreen.title);
	assert.equal(previous.title, defaultScreen.title);
});

test("invalid settings reject without calling the API", async (t) => {
	const store = editor(t);
	const fetchMock = t.mock.method(globalThis, "fetch", async () => {
		throw new Error("must not fetch");
	});
	await assert.rejects(store.set(saveScreenAtom), /http/);
	assert.equal(fetchMock.mock.callCount(), 0);
	assert.equal(store.get(savingScreenAtom), false);
});

test("saving creates a screen, normalizes text, and uses its owner token for updates", async (t) => {
	const store = editor(t);
	const requests: { path: unknown; init: RequestInit | undefined }[] = [];
	t.mock.method(
		globalThis,
		"fetch",
		async (path: unknown, init?: RequestInit) => {
			requests.push({ path, init });
			return Response.json({
				...JSON.parse(String(init?.body)),
				id: saved.id,
				editToken: saved.editToken,
			});
		},
	);
	store.set(urlAtom, saved.url);
	store.set(titleAtom, "  ようこそ  ");
	const created = await store.set(saveScreenAtom);
	assert.equal(created?.id, saved.id);
	assert.equal(store.get(titleAtom), "ようこそ");
	assert.equal(requests[0].path, "/api/screens");
	assert.equal(requests[0].init?.method, "POST");
	assert.equal(
		new Headers(requests[0].init?.headers).has("X-Edit-Token"),
		false,
	);
	store.set(themeAtom, "night");
	await store.set(saveScreenAtom);
	assert.equal(requests[1].path, "/api/screens/test-screen");
	assert.equal(requests[1].init?.method, "PUT");
	assert.equal(
		new Headers(requests[1].init?.headers).get("X-Edit-Token"),
		saved.editToken,
	);
	assert.equal(store.get(savedScreenAtom)?.theme, "night");
});

test("edits made while saving remain as an unsaved draft when the request finishes", async (t) => {
	const store = editor(t);
	let respond!: (response: Response) => void;
	const pending = new Promise<Response>((resolve) => {
		respond = resolve;
	});
	t.mock.method(globalThis, "fetch", () => pending);
	store.set(urlAtom, saved.url);
	const saving = store.set(saveScreenAtom);
	assert.equal(store.get(savingScreenAtom), true);
	store.set(titleAtom, "保存中の編集");
	respond(Response.json(saved));
	await saving;
	assert.equal(store.get(titleAtom), "保存中の編集");
	assert.equal(store.get(savedScreenAtom)?.title, saved.title);
	assert.equal(store.get(savingScreenAtom), false);
	assert.equal(
		JSON.parse(storage.get("qrpop.editor") ?? "{}").config.title,
		"保存中の編集",
	);
});

test("a rejected save keeps the draft and propagates the server error", async (t) => {
	const store = editor(t);
	t.mock.method(globalThis, "fetch", async () =>
		Response.json({ error: "保存に失敗しました" }, { status: 503 }),
	);
	store.set(urlAtom, saved.url);
	store.set(titleAtom, "残しておく下書き");
	await assert.rejects(store.set(saveScreenAtom), {
		message: "保存に失敗しました",
	});
	assert.equal(store.get(savedScreenAtom), undefined);
	assert.equal(store.get(titleAtom), "残しておく下書き");
	assert.equal(store.get(savingScreenAtom), false);
});
