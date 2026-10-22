import { useStore } from "jotai";
import { useEffect, useEffectEvent } from "react";
import { isScreenConfigValidAtom, screenConfigAtom } from "@/jotai/atoms";
import { useSaveScreen } from "./use-save-screen";

export function useAutosaveScreen() {
  const store = useStore();
  const saveScreen = useSaveScreen();
  const save = useEffectEvent((initial = false) => {
    if (initial || store.get(isScreenConfigValidAtom)) {
      saveScreen();
    }
  });

  useEffect(() => {
    save(true);
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
