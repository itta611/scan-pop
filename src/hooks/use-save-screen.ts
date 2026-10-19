import { useStore } from "jotai";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  pendingSaveAtom,
  requestedScreenConfigAtom,
  savedScreenAtom,
  screenConfigAtom,
} from "@/jotai/atoms";
import { type SavedScreen, screenSchema } from "@/schemas/screen";

export function useSaveScreen() {
  const store = useStore();

  return async function saveScreen(): Promise<SavedScreen> {
    const config = store.get(screenConfigAtom);
    store.set(requestedScreenConfigAtom, config);
    const pending = store.get(pendingSaveAtom);
    if (pending) return pending;

    const saved = store.get(savedScreenAtom);
    if (
      saved &&
      saved.url === config.url &&
      saved.title === config.title.trim() &&
      saved.message === config.message.trim() &&
      saved.theme === config.theme &&
      confettiPalettes[config.confetti].every(
        (color, index) => color === saved.confetti[index],
      )
    ) {
      return saved;
    }

    const saving = (async () => {
      while (true) {
        const config = store.get(requestedScreenConfigAtom);
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
        if (store.get(requestedScreenConfigAtom) === config) {
          return screen;
        }
      }
    })();
    store.set(pendingSaveAtom, saving);
    try {
      return await saving;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      store.set(pendingSaveAtom, null);
    }
  };
}
