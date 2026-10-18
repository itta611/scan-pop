import { useAtom, useStore, type WritableAtom } from "jotai";
import { useRef } from "react";
import { hasDestinationAtom } from "@/jotai/atoms";
import { useSaveScreen } from "./use-save-screen";

export function useScreenSetting<Value>(
  setting: WritableAtom<Value, [Value], void>,
) {
  const [value, setValue] = useAtom(setting);
  const store = useStore();
  const committed = useRef<Value>(store.get(setting));
  const saveScreen = useSaveScreen();

  function update(next: Value) {
    if (committed.current === next) return;
    committed.current = next;
    setValue(next);
    if (!store.get(hasDestinationAtom)) return;
    return saveScreen().catch(() => undefined);
  }

  return [value, update, setValue] as const;
}
