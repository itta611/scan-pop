import { useAtom, useStore, type WritableAtom } from "jotai";
import { screenConfigAtom } from "@/jotai/atoms";
import { screenSchema } from "@/schemas/screen";
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
    if (!screenSchema.safeParse(store.get(screenConfigAtom)).success) return;
    return saveScreen().catch(() => undefined);
  }

  return [value, update] as const;
}
