import { useAtom, useStore, type WritableAtom } from "jotai";
import { hasDestinationAtom } from "@/jotai/atoms";
import { useSaveScreen } from "./use-save-screen";

export function useScreenSetting<Value>(
  setting: WritableAtom<Value, [Value], void>,
) {
  const [value, setValue] = useAtom(setting);
  const store = useStore();
  const saveScreen = useSaveScreen();

  function update(next: Value) {
    if (store.get(setting) === next) return;
    setValue(next);
    if (!store.get(hasDestinationAtom)) return;
    return saveScreen().catch(() => undefined);
  }

  return [value, update] as const;
}
