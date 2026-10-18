import { atom } from "jotai/vanilla";
import { atomWithStorage } from "jotai/vanilla/utils";
import {
  defaultScreen,
  type SavedScreen,
  type ScreenConfig,
  screenSchema,
} from "@/schemas/screen";

type Draft = { config: ScreenConfig; saved?: SavedScreen };

const draftAtom = atomWithStorage<Draft>(
  "qrpop.editor",
  { config: defaultScreen },
  undefined,
  { getOnInit: true },
);
export const pendingSaveAtom = atom<Promise<SavedScreen> | null>(null);

export const savingScreenAtom = atom((get) => get(pendingSaveAtom) !== null);
export const saveErrorAtom = atom<string | null>(null);
export const screenConfigAtom = atom((get) => get(draftAtom).config);
export const savedScreenAtom = atom(
  (get) => get(draftAtom).saved,
  (_get, set, saved: SavedScreen) => {
    set(draftAtom, (draft) => ({ ...draft, saved }));
  },
);

function settingAtom<Key extends keyof ScreenConfig>(key: Key) {
  return atom(
    (get) => get(screenConfigAtom)[key],
    (_get, set, value: ScreenConfig[Key]) => {
      set(draftAtom, (draft) => ({
        ...draft,
        config: { ...draft.config, [key]: value },
      }));
    },
  );
}

export const urlAtom = settingAtom("url");
export const titleAtom = settingAtom("title");
export const messageAtom = settingAtom("message");
export const themeAtom = settingAtom("theme");
export const confettiAtom = settingAtom("confetti");

export const hasDestinationAtom = atom(
  (get) => screenSchema.safeParse(get(screenConfigAtom)).success,
);
