import { useStore } from "jotai";
import { useEffect, useEffectEvent } from "react";
import { hasDestinationAtom, screenConfigAtom } from "@/jotai/atoms";
import { useSaveScreen } from "./use-save-screen";

export function useAutosaveScreen() {
  const store = useStore();
  const saveScreen = useSaveScreen();
  const save = useEffectEvent(() => {
    if (store.get(hasDestinationAtom)) {
      saveScreen();
    }
  });

  useEffect(() => {
    save();
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = store.sub(screenConfigAtom, () => {
      clearTimeout(timer);
      timer = setTimeout(() => save(), 1000);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [store]);
}
