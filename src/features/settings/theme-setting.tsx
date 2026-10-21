import { useAtom } from "jotai";
import { CheckIcon } from "lucide-react";
import { SignageBackground } from "@/features/signage/background";
import { themeAtom } from "@/jotai/atoms";
import { themes } from "@/schemas/screen";
import { SettingField } from "./setting-field";

export function ThemeSetting() {
  const [theme, setTheme] = useAtom(themeAtom);
  return (
    <SettingField title="背景テーマ">
      <div className="grid clear-both grid-cols-3 gap-3">
        {themes.map((option) => (
          <button
            type="button"
            key={option.value}
            aria-pressed={theme === option.value}
            className="group text-xs text-accent-foreground outline-none!"
            onClick={() => setTheme(option.value)}
          >
            <span className="relative mb-1.5 flex h-14 overflow-hidden group-aria-pressed:ring-2 group-focus-visible:ring-2 ring-primary">
              <SignageBackground theme={option.value} sizeBasis="long" />
              {theme === option.value && (
                <span className="absolute right-1 bottom-1 bg-primary p-0.75 text-white">
                  <CheckIcon size={11} />
                </span>
              )}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </SettingField>
  );
}
