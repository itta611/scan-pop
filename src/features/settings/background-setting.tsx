import { useAtom } from "jotai";
import { CheckIcon } from "lucide-react";
import { SignageBackground } from "@/features/signage/background";
import { backgroundAtom } from "@/jotai/atoms";
import { cn } from "@/lib/utils";
import { backgrounds } from "@/schemas/screen";
import { SettingField } from "./setting-field";

export function BackgroundSetting() {
  const [background, setBackground] = useAtom(backgroundAtom);
  return (
    <SettingField title="背景テーマ">
      <div className="grid clear-both grid-cols-3 gap-3">
        {backgrounds.map((option) => (
          <button
            type="button"
            key={option.color + option.theme}
            aria-pressed={background === option}
            className="group text-xs text-accent-foreground outline-none!"
            onClick={() => setBackground(option)}
          >
            <span
              className={cn(
                "relative mb-1.5 flex aspect-video overflow-hidden transition-all ring-0 ring-border group-aria-pressed:ring-2 group-focus-visible:ring-2 group-aria-pressed:ring-primary",
                { "ring-1": option.theme === "light" },
              )}
            >
              <SignageBackground background={option} sizeBasis="long" />
              {background === option && (
                <span className="absolute right-1 bottom-1 bg-primary p-0.75 text-white">
                  <CheckIcon size={11} />
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </SettingField>
  );
}
