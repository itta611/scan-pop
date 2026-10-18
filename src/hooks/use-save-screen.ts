import { useStore } from "jotai";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  hasDestinationAtom,
  pendingSaveAtom,
  savedScreenAtom,
  saveErrorAtom,
  screenConfigAtom,
} from "@/jotai/atoms";
import { type SavedScreen, screenSchema } from "@/schemas/screen";

export function useSaveScreen() {
  const store = useStore();

  return async function saveScreen(): Promise<SavedScreen> {
    const pending = store.get(pendingSaveAtom);
    if (pending) return pending;

    store.set(saveErrorAtom, null);
    const saving = (async () => {
      while (true) {
        const config = store.get(screenConfigAtom);
        const parsed = screenSchema.parse({
          ...config,
          confetti: confettiPalettes[config.confetti],
        });
        const saved = store.get(savedScreenAtom);
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
        store.set(savedScreenAtom, screen);
        if (
          store.get(screenConfigAtom) === config ||
          !store.get(hasDestinationAtom)
        ) {
          return screen;
        }
      }
    })();
    store.set(pendingSaveAtom, saving);
    try {
      return await saving;
    } catch (error) {
      store.set(
        saveErrorAtom,
        error instanceof Error ? error.message : "保存に失敗しました",
      );
      throw error;
    } finally {
      store.set(pendingSaveAtom, null);
    }
  };
}
