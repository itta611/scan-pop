import assert from "node:assert/strict";
import { afterEach, beforeEach, type TestContext, test } from "node:test";
import { Provider, type WritableAtom } from "jotai";
import { createStore } from "jotai/vanilla";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { confettiPalettes } from "../src/constants/confetti.ts";
import { ConfettiSetting } from "../src/features/settings/index.tsx";
import { useSaveScreen } from "../src/hooks/use-save-screen.ts";
import { useScreenSetting } from "../src/hooks/use-screen-setting.ts";
import {
  confettiAtom,
  savedScreenAtom,
  saveErrorAtom,
  savingScreenAtom,
  screenConfigAtom,
  themeAtom,
  titleAtom,
  urlAtom,
} from "../src/jotai/atoms.ts";
import {
  defaultScreen,
  type SavedScreen,
  type ScreenConfig,
  screenSchema,
} from "../src/schemas/screen.ts";

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

function renderHook<Result>(
  store: ReturnType<typeof createStore>,
  useHook: () => Result,
) {
  let result!: Result;
  function Component() {
    result = useHook();
    return null;
  }
  renderToStaticMarkup(
    createElement(Provider, { store }, createElement(Component)),
  );
  return result;
}

function saveScreen(store: ReturnType<typeof createStore>) {
  return renderHook(store, useSaveScreen)();
}

function update<Value>(
  store: ReturnType<typeof createStore>,
  setting: WritableAtom<Value, [Value], void>,
  value: Value,
) {
  return renderHook(store, () => useScreenSetting(setting))[1](value);
}

const saved: SavedScreen = {
  ...defaultScreen,
  url: "https://example.com/",
  id: "test-screen",
  editToken: "test-owner-token",
};

test("existing drafts retain settings and owner credentials in the same storage record", async (t) => {
  storage.set(
    "qrpop.editor",
    JSON.stringify({ config: screenConfig(saved), saved }),
  );
  const store = editor(t);
  assert.deepEqual(store.get(screenConfigAtom), screenConfig(saved));
  assert.equal(store.get(savedScreenAtom)?.editToken, saved.editToken);
  t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  await update(store, titleAtom, "新しい見出し");
  const persisted = JSON.parse(storage.get("qrpop.editor") ?? "{}");
  assert.equal(persisted.config.title, "新しい見出し");
  assert.equal(persisted.saved.editToken, saved.editToken);
});

function screenConfig(screen: SavedScreen) {
  const { id: _id, editToken: _token, ...config } = screen;
  return { ...config, confetti: 1 };
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
  await assert.rejects(saveScreen(store), /http/);
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
  update(store, titleAtom, "  ようこそ  ");
  const saving = update(store, urlAtom, saved.url);
  assert.equal(requests.length, 1);
  assert.equal(store.get(savingScreenAtom), true);
  await saving;
  const created = store.get(savedScreenAtom);
  assert.equal(created?.id, saved.id);
  assert.equal(created?.title, "ようこそ");
  assert.equal(store.get(titleAtom), "  ようこそ  ");
  assert.equal(requests[0].path, "/api/screens");
  assert.equal(requests[0].init?.method, "POST");
  assert.equal(
    new Headers(requests[0].init?.headers).has("X-Edit-Token"),
    false,
  );
  await update(store, themeAtom, "night");
  assert.equal(requests[1].path, "/api/screens/test-screen");
  assert.equal(requests[1].init?.method, "PUT");
  assert.equal(
    new Headers(requests[1].init?.headers).get("X-Edit-Token"),
    saved.editToken,
  );
  assert.equal(store.get(savedScreenAtom)?.theme, "night");
});

test("edits made while creating save the latest draft next with the same screen and owner token", async (t) => {
  const store = editor(t);
  const requests: {
    path: unknown;
    init?: RequestInit;
    respond: (response: Response) => void;
  }[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    (path: unknown, init?: RequestInit) =>
      new Promise<Response>((respond) =>
        requests.push({ path, init, respond }),
      ),
  );
  const firstSave = update(store, urlAtom, saved.url);
  assert.equal(store.get(savingScreenAtom), true);
  const latestSave = update(store, titleAtom, "保存中の編集 ");
  update(store, themeAtom, "night");
  assert.equal(requests.length, 1);
  const nextRequest = new Promise<void>((resolve) => {
    const unsubscribe = store.sub(savedScreenAtom, () => {
      unsubscribe();
      resolve();
    });
  });
  requests[0].respond(Response.json(saved));
  await nextRequest;
  assert.equal(requests.length, 2);
  assert.equal(store.get(savingScreenAtom), true);
  assert.equal(requests[1].path, "/api/screens/test-screen");
  assert.equal(requests[1].init?.method, "PUT");
  assert.equal(
    new Headers(requests[1].init?.headers).get("X-Edit-Token"),
    saved.editToken,
  );
  const latest = JSON.parse(String(requests[1].init?.body));
  assert.equal(latest.title, "保存中の編集");
  assert.equal(latest.theme, "night");
  requests[1].respond(Response.json({ ...saved, ...latest }));
  await Promise.all([firstSave, latestSave]);
  assert.equal(store.get(titleAtom), "保存中の編集 ");
  assert.equal(store.get(savedScreenAtom)?.title, "保存中の編集");
  assert.equal(store.get(savedScreenAtom)?.theme, "night");
  assert.equal(store.get(savingScreenAtom), false);
  assert.equal(
    JSON.parse(storage.get("qrpop.editor") ?? "{}").config.title,
    "保存中の編集 ",
  );
});

test("a rejected autosave keeps the draft, exposes the error, and can be retried", async (t) => {
  const store = editor(t);
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "保存に失敗しました" }, { status: 503 }),
  );
  update(store, titleAtom, "残しておく下書き");
  await update(store, urlAtom, saved.url);
  assert.equal(store.get(saveErrorAtom), "保存に失敗しました");
  await assert.rejects(saveScreen(store), {
    message: "保存に失敗しました",
  });
  assert.equal(store.get(savedScreenAtom), undefined);
  assert.equal(store.get(titleAtom), "残しておく下書き");
  assert.equal(store.get(savingScreenAtom), false);
  t.mock.method(globalThis, "fetch", async () => Response.json(saved));
  await saveScreen(store);
  assert.equal(store.get(saveErrorAtom), null);
  assert.equal(store.get(savedScreenAtom)?.id, saved.id);
});

test("incomplete input stays local and saves as soon as it becomes valid", async (t) => {
  const store = editor(t);
  const fetchMock = t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  await update(store, urlAtom, "https://");
  await update(store, titleAtom, "");
  await update(store, urlAtom, saved.url);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal(store.get(savingScreenAtom), false);
  await update(store, titleAtom, "有効な見出し");
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(store.get(savedScreenAtom)?.title, "有効な見出し");
  await update(store, titleAtom, "有効な見出し");
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("invalid edits during a save remain local until corrected", async (t) => {
  const store = editor(t);
  let respond!: (response: Response) => void;
  const fetchMock = t.mock.method(
    globalThis,
    "fetch",
    () =>
      new Promise<Response>((resolve) => {
        respond = resolve;
      }),
  );
  const saving = update(store, urlAtom, saved.url);
  update(store, titleAtom, "");
  respond(Response.json(saved));
  await saving;
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(store.get(titleAtom), "");
  assert.equal(store.get(savingScreenAtom), false);
  t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  await update(store, titleAtom, "入力再開");
  assert.equal(store.get(savedScreenAtom)?.title, "入力再開");
});

test("confetti accepts exactly four six-digit HEX colors", () => {
  const colors = ["#123456", "#ABCDEF", "#789abc", "#def012"];
  assert.deepEqual(
    screenSchema.parse({ ...saved, confetti: colors }).confetti,
    colors,
  );
  for (const confetti of [
    "colorful",
    2,
    colors.slice(0, 3),
    [...colors, "#ffffff"],
    ["#12345g", ...colors.slice(1)],
  ]) {
    assert.equal(screenSchema.safeParse({ ...saved, confetti }).success, false);
  }
});

test("a client palette ID is sent as four HEX colors", async (t) => {
  const store = editor(t);
  const requests: ScreenConfig[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) => {
      const config = screenSchema.parse(JSON.parse(String(init?.body)));
      requests.push(config);
      return Response.json({ ...saved, ...config });
    },
  );
  await update(store, urlAtom, saved.url);
  const colors = confettiPalettes[2];
  await update(store, confettiAtom, 2);
  assert.equal(store.get(confettiAtom), 2);
  assert.equal(store.get(screenConfigAtom).confetti, 2);
  assert.deepEqual(requests[1].confetti, colors);
  assert.deepEqual(store.get(savedScreenAtom)?.confetti, colors);
  const persisted = JSON.parse(storage.get("qrpop.editor") ?? "{}");
  assert.equal(persisted.config.confetti, 2);
  assert.deepEqual(persisted.saved.confetti, colors);
});

test("a restored palette ID stays selected after JSON serialization", (t) => {
  storage.set(
    "qrpop.editor",
    JSON.stringify({ config: screenConfig(saved), saved }),
  );
  const store = editor(t);
  const markup = renderToStaticMarkup(
    createElement(
      Provider,
      { store },
      createElement(ConfettiSetting, { onPreview: () => {} }),
    ),
  );
  assert.equal((markup.match(/aria-pressed="true"/g) ?? []).length, 1);
});
