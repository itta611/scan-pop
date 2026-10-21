import { useStore } from "jotai";
import { useEffect, useEffectEvent } from "react";
import { isScreenConfigValidAtom, screenConfigAtom } from "@/jotai/atoms";
import type { useSaveScreen } from "./use-save-screen";

export function useAutosaveScreen(
  saveScreen: ReturnType<typeof useSaveScreen>,
) {
  const store = useStore();
  const save = useEffectEvent(() => {
    if (store.get(isScreenConfigValidAtom)) {
      saveScreen();
    }
  });

  useEffect(() => {
    save();
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = store.sub(screenConfigAtom, () => {
      clearTimeout(timer);
      timer = setTimeout(() => save(), 2000);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [store]);
}
