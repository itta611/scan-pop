import assert from "node:assert/strict";
import { test } from "node:test";
import { Provider } from "jotai";
import { createStore } from "jotai/vanilla";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorHeader } from "../src/features/editor-header/index.tsx";
import {
  requestedScreenConfigAtom,
  screenConfigAtom,
  titleAtom,
  urlAtom,
} from "../src/jotai/atoms.ts";
import { defaultScreen, screenSchema } from "../src/schemas/screen.ts";

for (const title of ["", "   "]) {
  test(`an invalid title ${JSON.stringify(title)} stops save feedback until corrected`, (t) => {
    const store = createStore();
    t.after(store.sub(screenConfigAtom, () => {}));
    store.set(urlAtom, "https://example.com");
    function openButton() {
      const markup = renderToStaticMarkup(
        createElement(Provider, { store }, createElement(EditorHeader)),
      );
      const button = markup.match(
        /<button[^>]*form="screen-editor"[^>]*>/,
      )?.[0];
      assert.ok(button);
      return {
        disabled: /\sdisabled(?:=|\s|>)/.test(button),
        label: button.match(/aria-label="([^"]*)"/)?.[1],
      };
    }

    store.set(titleAtom, "編集中");
    assert.deepEqual(openButton(), {
      disabled: false,
      label: "保存しています...",
    });

    store.set(titleAtom, title);
    assert.equal(
      screenSchema.safeParse({ ...defaultScreen, title }).success,
      false,
    );
    assert.equal(store.get(titleAtom), title);
    assert.deepEqual(openButton(), {
      disabled: true,
      label: "表示ページを開く",
    });

    store.set(titleAtom, "入力再開");
    assert.deepEqual(openButton(), {
      disabled: false,
      label: "保存しています...",
    });
    store.set(requestedScreenConfigAtom, store.get(screenConfigAtom));
    assert.deepEqual(openButton(), {
      disabled: false,
      label: "表示ページを開く",
    });
  });
}
