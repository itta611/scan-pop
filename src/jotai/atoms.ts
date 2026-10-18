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
const pendingSaveAtom = atom<Promise<SavedScreen> | null>(null);

export const savingScreenAtom = atom((get) => get(pendingSaveAtom) !== null);
export const saveErrorAtom = atom<string | null>(null);
export const screenConfigAtom = atom((get) => get(draftAtom).config);
export const savedScreenAtom = atom((get) => get(draftAtom).saved);

export const saveScreenAtom = atom(
  null,
  async (get, set): Promise<SavedScreen> => {
    const pending = get(pendingSaveAtom);
    if (pending) return pending;

    screenSchema.parse(get(screenConfigAtom));
    set(saveErrorAtom, null);
    const saving = (async () => {
      while (true) {
        const config = get(screenConfigAtom);
        const parsed = screenSchema.parse(config);
        const saved = get(savedScreenAtom);
        const response = await fetch(
          saved ? `/api/screens/${saved.id}` : "/api/screens",
          {
            method: saved ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              ...(saved ? { "X-Edit-Token": saved.editToken } : {}),
            },
            body: JSON.stringify(parsed),
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        const screen = data as SavedScreen;
        set(draftAtom, (current) => ({ ...current, saved: screen }));
        if (
          get(screenConfigAtom) === config ||
          !screenSchema.safeParse(get(screenConfigAtom)).success
        ) {
          return screen;
        }
      }
    })();
    set(pendingSaveAtom, saving);
    try {
      return await saving;
    } catch (error) {
      set(
        saveErrorAtom,
        error instanceof Error ? error.message : "保存に失敗しました",
      );
      throw error;
    } finally {
      set(pendingSaveAtom, null);
    }
  },
);

function settingAtom<Key extends keyof ScreenConfig>(key: Key) {
  return atom(
    (get) => get(screenConfigAtom)[key],
    (get, set, value: ScreenConfig[Key]) => {
      if (get(screenConfigAtom)[key] === value) return;
      set(draftAtom, (draft) => ({
        ...draft,
        config: { ...draft.config, [key]: value },
      }));
      if (!screenSchema.safeParse(get(screenConfigAtom)).success) return;
      return set(saveScreenAtom).catch(() => undefined);
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
