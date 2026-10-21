import { atom } from "jotai/vanilla";
import { atomWithLazy } from "jotai/vanilla/utils";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  defaultScreen,
  type SavedScreen,
  type ScreenConfig,
  screenSchema,
} from "@/schemas/screen";

type EditorConfig = Omit<ScreenConfig, "confetti"> & { confetti: number };

const defaultEditorConfig: EditorConfig = {
  ...defaultScreen,
  url: "",
  confetti: 0,
};

// crypto.randomUUID requires HTTPS; LAN development also uses HTTP.
function createUuid() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

export const editorIdentityAtom = atomWithLazy(() => ({
  id: createUuid(),
  editToken: createUuid(),
}));

export const requestedScreenConfigAtom = atom(defaultEditorConfig);
export const pendingSaveAtom = atom<Promise<SavedScreen> | null>(null);

export const savingScreenAtom = atom(false);
export const screenConfigAtom = atom(defaultEditorConfig);
export const savedScreenAtom = atom<SavedScreen | undefined>(undefined);

function settingAtom<Key extends keyof EditorConfig>(key: Key) {
  return atom(
    (get) => get(screenConfigAtom)[key],
    (_get, set, value: EditorConfig[Key]) => {
      set(screenConfigAtom, (config) =>
        config[key] === value ? config : { ...config, [key]: value },
      );
    },
  );
}

export const urlAtom = settingAtom("url");
export const titleAtom = settingAtom("title");
export const messageAtom = settingAtom("message");
export const backgroundAtom = settingAtom("background");
export const confettiAtom = settingAtom("confetti");

export const hasDestinationAtom = atom((get) => {
  const config = get(screenConfigAtom);
  return screenSchema.safeParse({
    ...config,
    url: config.url || defaultScreen.url,
    confetti: confettiPalettes[config.confetti],
  }).success;
});
