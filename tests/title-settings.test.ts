import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "jotai/vanilla";
import {
  hasDestinationAtom,
  requestedScreenConfigAtom,
  screenConfigAtom,
  titleAtom,
  waitingToSaveAtom,
} from "../src/jotai/atoms.ts";
import { defaultScreen, screenSchema } from "../src/schemas/screen.ts";

for (const title of ["", "   "]) {
  test(`an invalid title ${JSON.stringify(title)} stops save feedback until corrected`, (t) => {
    const store = createStore();
    t.after(store.sub(waitingToSaveAtom, () => {}));
    store.set(titleAtom, "編集中");
    assert.equal(store.get(hasDestinationAtom), true);
    assert.equal(store.get(waitingToSaveAtom), true);

    store.set(titleAtom, title);
    assert.equal(
      screenSchema.safeParse({ ...defaultScreen, title }).success,
      false,
    );
    assert.equal(store.get(titleAtom), title);
    assert.equal(store.get(hasDestinationAtom), false);
    assert.equal(store.get(waitingToSaveAtom), false);

    store.set(titleAtom, "入力再開");
    assert.equal(store.get(hasDestinationAtom), true);
    assert.equal(store.get(waitingToSaveAtom), true);
    store.set(requestedScreenConfigAtom, store.get(screenConfigAtom));
    assert.equal(store.get(waitingToSaveAtom), false);
  });
}
