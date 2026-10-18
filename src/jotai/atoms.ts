import { atom } from "jotai/vanilla";
import { atomWithStorage } from "jotai/vanilla/utils";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  defaultScreen,
  type SavedScreen,
  type ScreenConfig,
  screenSchema,
} from "@/schemas/screen";

type EditorConfig = Omit<ScreenConfig, "confetti"> & { confetti: number };
type Draft = { config: EditorConfig; saved?: SavedScreen };

const draftAtom = atomWithStorage<Draft>(
  "qrpop.editor",
  { config: { ...defaultScreen, confetti: 1 } },
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

function settingAtom<Key extends keyof EditorConfig>(key: Key) {
  return atom(
    (get) => get(screenConfigAtom)[key],
    (_get, set, value: EditorConfig[Key]) => {
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

export const hasDestinationAtom = atom((get) => {
  const config = get(screenConfigAtom);
  return screenSchema.safeParse({
    ...config,
    confetti: confettiPalettes[config.confetti],
  }).success;
});
