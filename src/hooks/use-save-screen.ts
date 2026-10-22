import { useStore } from "jotai";
import { useRef } from "react";
import { confettiPalettes } from "@/features/signage/confetti";
import {
  editorIdentityAtom,
  requestedScreenConfigAtom,
  savedScreenAtom,
  screenConfigAtom,
} from "@/jotai/atoms";
import {
  defaultScreen,
  normalizeUrl,
  type SavedScreen,
  screenSchema,
} from "@/schemas/screen";

export function useSaveScreen() {
  const store = useStore();
  const pending = useRef<Promise<SavedScreen> | null>(null);

  return async function saveScreen(): Promise<SavedScreen> {
    const config = store.get(screenConfigAtom);
    store.set(requestedScreenConfigAtom, config);
    if (pending.current) return pending.current;

    const saved = store.get(savedScreenAtom);
    if (
      saved &&
      saved.url === normalizeUrl(config.url) &&
      saved.title === config.title.trim() &&
      saved.message === config.message.trim() &&
      saved.background.color === config.background.color &&
      saved.background.theme === config.background.theme &&
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
          url: store.get(savedScreenAtom)
            ? config.url
            : config.url || defaultScreen.url,
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
    pending.current = saving;
    try {
      return await saving;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      pending.current = null;
    }
  };
}
