import { atom } from "jotai/vanilla";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  defaultScreen,
  type SavedScreen,
  type ScreenConfig,
  screenSchema,
} from "@/schemas/screen";

type EditorConfig = Omit<ScreenConfig, "confetti"> & { confetti: number };

const defaultEditorConfig: EditorConfig = { ...defaultScreen, confetti: 0 };

export const requestedScreenConfigAtom = atom(defaultEditorConfig);
export const pendingSaveAtom = atom<Promise<SavedScreen> | null>(null);

export const savingScreenAtom = atom((get) => get(pendingSaveAtom) !== null);
export const screenConfigAtom = atom(defaultEditorConfig);
export const savedScreenAtom = atom<SavedScreen | undefined>(undefined);

function settingAtom<Key extends keyof EditorConfig>(key: Key) {
  return atom(
    (get) => get(screenConfigAtom)[key],
    (_get, set, value: EditorConfig[Key]) => {
      set(screenConfigAtom, (config) => ({ ...config, [key]: value }));
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
