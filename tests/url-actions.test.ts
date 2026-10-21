import assert from "node:assert/strict";
import { test } from "node:test";
import { Provider } from "jotai";
import { createStore } from "jotai/vanilla";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorHeader } from "../src/features/editor-header/index.tsx";
import {
  isScreenConfigValidAtom,
  savedScreenAtom,
  urlAtom,
} from "../src/jotai/atoms.ts";
import { defaultScreen } from "../src/schemas/screen.ts";

test("display actions require URL input even after a screen is created", (t) => {
  const store = createStore();
  t.after(store.sub(urlAtom, () => {}));
  function buttons() {
    const markup = renderToStaticMarkup(
      createElement(Provider, { store }, createElement(EditorHeader)),
    );
    return [...markup.matchAll(/<button\b[^>]*>/g)].map(([tag]) => ({
      action: tag.includes('form="screen-editor"') ? "open" : "copy",
      disabled: /\sdisabled(?:=|\s|>)/.test(tag),
    }));
  }
  const disabled = [
    { action: "copy", disabled: true },
    { action: "open", disabled: true },
  ];
  assert.deepEqual(buttons(), disabled);
  store.set(savedScreenAtom, {
    ...defaultScreen,
    id: "9f2e2633-d8ab-4c2a-a724-39c335fe04e4",
    editToken: "4e245455-61a2-4467-a75d-9b08d53e5c0b",
  });
  assert.deepEqual(buttons(), disabled);
  store.set(urlAtom, "https://example.com");
  assert.deepEqual(
    buttons(),
    disabled.map((button) => ({ ...button, disabled: false })),
  );
  for (const value of ["", "   "]) {
    store.set(urlAtom, value);
    assert.deepEqual(buttons(), disabled);
  }
  store.set(urlAtom, "");
  assert.equal(store.get(isScreenConfigValidAtom), true);
});
