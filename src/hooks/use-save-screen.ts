import { useStore } from "jotai";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  editorIdentityAtom,
  pendingSaveAtom,
  requestedScreenConfigAtom,
  savedScreenAtom,
  savingScreenAtom,
  screenConfigAtom,
} from "@/jotai/atoms";
import {
  defaultScreen,
  type SavedScreen,
  screenSchema,
} from "@/schemas/screen";

export function useSaveScreen() {
  const store = useStore();

  return async function saveScreen({
    initial = false,
  } = {}): Promise<SavedScreen> {
    const config = store.get(screenConfigAtom);
    const requested = store.get(requestedScreenConfigAtom);
    store.set(requestedScreenConfigAtom, config);
    const pending = store.get(pendingSaveAtom);
    if (pending) {
      if (!initial && config !== requested) store.set(savingScreenAtom, true);
      return pending;
    }

    const saved = store.get(savedScreenAtom);
    if (
      saved &&
      saved.url === (config.url || defaultScreen.url) &&
      saved.title === config.title.trim() &&
      saved.message === config.message.trim() &&
      saved.background === config.background &&
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
          url: config.url || defaultScreen.url,
          confetti: confettiPalettes[config.confetti],
        });
        const { id, editToken } = store.get(editorIdentityAtom);
        const response = await fetch(`/api/screens/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Edit-Token": editToken,
          },
          body: JSON.stringify(parsed),
        });
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
    store.set(savingScreenAtom, !initial);
    try {
      return await saving;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      store.set(pendingSaveAtom, null);
      store.set(savingScreenAtom, false);
    }
  };
}
