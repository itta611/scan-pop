import assert from "node:assert/strict";
import { type TestContext, test } from "node:test";
import { Provider } from "jotai";
import { createStore } from "jotai/vanilla";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfettiSetting } from "../src/features/settings/confetti-setting.tsx";
import { LinkSetting } from "../src/features/settings/link-setting.tsx";
import { confettiPalettes } from "../src/features/signage/confetti.tsx";
import { useSaveScreen } from "../src/hooks/use-save-screen.ts";
import {
  backgroundAtom,
  confettiAtom,
  editorIdentityAtom,
  savedScreenAtom,
  screenConfigAtom,
  titleAtom,
  urlAtom,
} from "../src/jotai/atoms.ts";
import {
  defaultScreen,
  type SavedScreen,
  type ScreenConfig,
  screenIdentitySchema,
  screenSchema,
} from "../src/schemas/screen.ts";

const saveHooks = new WeakMap<
  ReturnType<typeof createStore>,
  ReturnType<typeof useSaveScreen>
>();

function editor(t: TestContext) {
  const store = createStore();
  store.set(editorIdentityAtom, { id: saved.id, editToken: saved.editToken });
  t.after(store.sub(screenConfigAtom, () => {}));
  saveHooks.set(store, renderHook(store, useSaveScreen));
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
  const save = saveHooks.get(store);
  assert.ok(save);
  return save();
}

const saved: SavedScreen = {
  ...defaultScreen,
  url: "https://example.com/",
  id: "9f2e2633-d8ab-4c2a-a724-39c335fe04e4",
  editToken: "4e245455-61a2-4467-a75d-9b08d53e5c0b",
};

test("a fresh editor starts with default settings and no saved screen", async (t) => {
  const first = editor(t);
  t.mock.method(globalThis, "fetch", async () => Response.json(saved));
  first.set(titleAtom, "リロード前の見出し");
  first.set(urlAtom, saved.url);
  await saveScreen(first);
  assert.equal(first.get(savedScreenAtom)?.id, saved.id);
  const reloaded = editor(t);
  assert.deepEqual(reloaded.get(screenConfigAtom), {
    ...defaultScreen,
    url: "",
    confetti: 0,
  });
  assert.equal(reloaded.get(savedScreenAtom), undefined);
});

test("editing text does not notify a background subscriber or change another store", (t) => {
  const first = editor(t);
  const second = editor(t);
  let backgroundUpdates = 0;
  t.after(
    first.sub(backgroundAtom, () => {
      backgroundUpdates += 1;
    }),
  );
  const previous = first.get(screenConfigAtom);
  first.set(titleAtom, "独立した編集");
  assert.equal(backgroundUpdates, 0);
  assert.equal(first.get(titleAtom), "独立した編集");
  assert.equal(second.get(titleAtom), defaultScreen.title);
  assert.equal(previous.title, defaultScreen.title);
});

test("invalid settings reject without calling the API", async (t) => {
  const store = editor(t);
  t.mock.method(console, "error", () => {});
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not fetch");
  });
  store.set(urlAtom, "https://");
  await assert.rejects(saveScreen(store), /http/);
  assert.equal(fetchMock.mock.callCount(), 0);
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
  store.set(titleAtom, "  ようこそ  ");
  store.set(urlAtom, saved.url);
  const saving = saveScreen(store);
  assert.equal(requests.length, 1);
  await saving;
  const created = store.get(savedScreenAtom);
  assert.equal(created?.id, saved.id);
  assert.equal(created?.title, "ようこそ");
  assert.equal(store.get(titleAtom), "  ようこそ  ");
  assert.equal(requests[0].path, `/api/screens/${saved.id}`);
  assert.equal(requests[0].init?.method, "PUT");
  assert.equal(
    new Headers(requests[0].init?.headers).get("X-Edit-Token"),
    saved.editToken,
  );
  store.set(backgroundAtom, { color: "gray", theme: "dark" });
  await saveScreen(store);
  assert.equal(requests[1].path, `/api/screens/${saved.id}`);
  assert.equal(requests[1].init?.method, "PUT");
  assert.equal(
    new Headers(requests[1].init?.headers).get("X-Edit-Token"),
    saved.editToken,
  );
  assert.deepEqual(store.get(savedScreenAtom)?.background, {
    color: "gray",
    theme: "dark",
  });
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
  store.set(urlAtom, saved.url);
  const firstSave = saveScreen(store);
  store.set(titleAtom, "保存中の編集 ");
  const latestSave = saveScreen(store);
  store.set(backgroundAtom, { color: "gray", theme: "dark" });
  void saveScreen(store);
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
  assert.equal(requests[1].path, `/api/screens/${saved.id}`);
  assert.equal(requests[1].init?.method, "PUT");
  assert.equal(
    new Headers(requests[1].init?.headers).get("X-Edit-Token"),
    saved.editToken,
  );
  const latest = JSON.parse(String(requests[1].init?.body));
  assert.equal(latest.title, "保存中の編集");
  assert.deepEqual(latest.background, { color: "gray", theme: "dark" });
  requests[1].respond(Response.json({ ...saved, ...latest }));
  await Promise.all([firstSave, latestSave]);
  assert.equal(store.get(titleAtom), "保存中の編集 ");
  assert.equal(store.get(savedScreenAtom)?.title, "保存中の編集");
  assert.deepEqual(store.get(savedScreenAtom)?.background, {
    color: "gray",
    theme: "dark",
  });
});

test("a rejected autosave keeps the draft, logs the error, and can be retried", async (t) => {
  const store = editor(t);
  const log = t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "保存に失敗しました" }, { status: 503 }),
  );
  store.set(titleAtom, "残しておく下書き");
  store.set(urlAtom, saved.url);
  await saveScreen(store).catch(() => undefined);
  assert.equal(log.mock.callCount(), 1);
  assert.equal(
    (log.mock.calls[0].arguments[0] as Error).message,
    "保存に失敗しました",
  );
  await assert.rejects(saveScreen(store), {
    message: "保存に失敗しました",
  });
  assert.equal(store.get(savedScreenAtom), undefined);
  assert.equal(store.get(titleAtom), "残しておく下書き");
  t.mock.method(globalThis, "fetch", async () => Response.json(saved));
  await saveScreen(store);
  assert.equal(log.mock.callCount(), 2);
  assert.equal(store.get(savedScreenAtom)?.id, saved.id);
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
  store.set(urlAtom, saved.url);
  const saving = saveScreen(store);
  store.set(titleAtom, "");
  respond(Response.json(saved));
  await saving;
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(store.get(titleAtom), "");
  t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  store.set(titleAtom, "入力再開");
  await saveScreen(store);
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
  store.set(urlAtom, saved.url);
  await saveScreen(store);
  const colors = confettiPalettes[2];
  store.set(confettiAtom, 2);
  await saveScreen(store);
  assert.equal(store.get(confettiAtom), 2);
  assert.equal(store.get(screenConfigAtom).confetti, 2);
  assert.deepEqual(requests[1].confetti, colors);
  assert.deepEqual(store.get(savedScreenAtom)?.confetti, colors);
});

test("the chosen palette is selected in the current editor", (t) => {
  const store = editor(t);
  store.set(confettiAtom, 2);
  const markup = renderToStaticMarkup(
    createElement(
      Provider,
      { store },
      createElement(ConfettiSetting, { onPreview: () => {} }),
    ),
  );
  assert.equal((markup.match(/aria-pressed="true"/g) ?? []).length, 1);
});

test("typing updates the draft immediately without saving on blur", (t) => {
  const store = editor(t);
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    Response.json(saved),
  );
  const input = renderHook(store, LinkSetting).props.children;
  input.props.onChange({ currentTarget: { value: saved.url } });
  assert.equal(store.get(screenConfigAtom).url, saved.url);
  assert.equal(
    renderHook(store, LinkSetting).props.children.props.value,
    saved.url,
  );
  assert.equal(input.props.onBlur, undefined);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("typing during an ongoing save stays local until the next save request", async (t) => {
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
  store.set(urlAtom, saved.url);
  const saving = saveScreen(store);
  store.set(titleAtom, "入力中の見出し");
  respond(Response.json(saved));
  await saving;
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(store.get(titleAtom), "入力中の見出し");
  assert.equal(store.get(savedScreenAtom)?.title, saved.title);
  t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  await saveScreen(store);
  assert.equal(store.get(savedScreenAtom)?.title, "入力中の見出し");
});

test("saving an unchanged screen does not call the API again", async (t) => {
  const store = editor(t);
  const fetchMock = t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  store.set(urlAtom, saved.url);
  store.set(titleAtom, "  見出し  ");
  await saveScreen(store);
  await saveScreen(store);
  assert.equal(fetchMock.mock.callCount(), 1);
  store.set(backgroundAtom, { color: "gray", theme: "dark" });
  await saveScreen(store);
  assert.equal(fetchMock.mock.callCount(), 2);
  assert.deepEqual(store.get(savedScreenAtom)?.background, {
    color: "gray",
    theme: "dark",
  });
});

test("selecting the current setting does not reset the save timer", (t) => {
  const store = editor(t);
  let changes = 0;
  t.after(
    store.sub(screenConfigAtom, () => {
      changes += 1;
    }),
  );
  store.set(backgroundAtom, store.get(backgroundAtom));
  assert.equal(changes, 0);
  store.set(backgroundAtom, { color: "gray", theme: "dark" });
  assert.equal(changes, 1);
});

test("an identity is generated once per editor store and is independent of edits", () => {
  const first = createStore();
  const second = createStore();
  const identity = first.get(editorIdentityAtom);
  assert.deepEqual(screenIdentitySchema.parse(identity), identity);
  assert.notEqual(identity.id, identity.editToken);
  first.set(urlAtom, "https://example.com/changed");
  assert.equal(first.get(editorIdentityAtom), identity);
  assert.notEqual(second.get(editorIdentityAtom).id, identity.id);
});

test("initial creation immediately saves the default URL", async (t) => {
  const store = editor(t);
  const fetchMock = t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({
        ...JSON.parse(String(init?.body)),
        ...store.get(editorIdentityAtom),
      }),
  );
  const initial = saveScreen(store);
  assert.equal(fetchMock.mock.callCount(), 1);
  const screen = await initial;
  assert.equal(screen.url, "https://scan.itta.dev");
  assert.equal(store.get(urlAtom), "");
  assert.equal(
    renderHook(store, LinkSetting).props.children.props.placeholder,
    "https://scan.itta.dev",
  );
  assert.equal(screen.id, store.get(editorIdentityAtom).id);
  await saveScreen(store);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("saving during initial creation shares the request", async (t) => {
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
  const initializing = saveScreen(store);
  const saving = saveScreen(store);
  assert.equal(fetchMock.mock.callCount(), 1);
  respond(
    Response.json({
      ...saved,
      ...defaultScreen,
      confetti: confettiPalettes[0],
    }),
  );
  const [initialized, result] = await Promise.all([initializing, saving]);
  assert.equal(initialized.id, result.id);
});

test("an empty URL uses the default destination without changing the input", async (t) => {
  const store = editor(t);
  const fetchMock = t.mock.method(
    globalThis,
    "fetch",
    async (_path: unknown, init?: RequestInit) =>
      Response.json({ ...saved, ...JSON.parse(String(init?.body)) }),
  );
  store.set(urlAtom, "https://example.com/custom");
  await saveScreen(store);
  store.set(urlAtom, "");
  store.set(titleAtom, "空欄でも設定を保存");
  await saveScreen(store);
  assert.equal(store.get(savedScreenAtom)?.url, "https://scan.itta.dev");
  assert.equal(store.get(savedScreenAtom)?.title, "空欄でも設定を保存");
  assert.equal(store.get(urlAtom), "");
  await saveScreen(store);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test("separate editors save independently while another editor has a pending request", async (t) => {
  const first = editor(t);
  const second = editor(t);
  const secondIdentity = {
    id: "ec7c7aa5-bc70-4379-a31a-8479dd744091",
    editToken: "f23c5903-a9d2-4258-846a-034ee400ab8f",
  };
  second.set(editorIdentityAtom, secondIdentity);
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
  first.set(titleAtom, "最初の画面");
  second.set(titleAtom, "別の画面");
  const firstSave = saveScreen(first);
  const secondSave = saveScreen(second);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].path, `/api/screens/${saved.id}`);
  assert.equal(requests[1].path, `/api/screens/${secondIdentity.id}`);
  requests[1].respond(
    Response.json({
      ...JSON.parse(String(requests[1].init?.body)),
      ...secondIdentity,
    }),
  );
  await secondSave;
  assert.equal(first.get(savedScreenAtom), undefined);
  assert.equal(second.get(savedScreenAtom)?.title, "別の画面");
  requests[0].respond(
    Response.json({
      ...JSON.parse(String(requests[0].init?.body)),
      id: saved.id,
      editToken: saved.editToken,
    }),
  );
  await firstSave;
  assert.equal(first.get(savedScreenAtom)?.title, "最初の画面");
});
