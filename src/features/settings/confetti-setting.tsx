import { CheckIcon } from "lucide-react";
import { Fragment } from "react";
import { confettiPalettes } from "@/features/signage/confetti";
import { useScreenSetting } from "@/hooks/use-screen-setting";
import { confettiAtom } from "@/jotai/atoms";
import type { ScreenConfig } from "@/schemas/screen";
import { SettingField } from "./setting-field";

export function ConfettiSetting({
  onPreview,
}: {
  onPreview: (palette: ScreenConfig["confetti"]) => void;
}) {
  const [confetti, setConfetti] = useScreenSetting(confettiAtom);
  return (
    <SettingField title="クラッカー">
      <div className="flex gap-3">
        {confettiPalettes.map((palette, paletteIndex) => (
          <button
            key={palette[0]}
            type="button"
            aria-pressed={confetti === paletteIndex}
            className="relative flex flex-1 items-center justify-center gap-0 transition-[border-color,background-color] aria-pressed:border-primary border-2 border-transparent"
            onClick={() => {
              setConfetti(paletteIndex);
              onPreview(palette);
            }}
          >
            {palette.map((color, index) => (
              <Fragment key={color}>
                {index > 0 && (
                  <div
                    className="size-0 border-r-10 border-t-40"
                    style={{
                      borderTopColor: palette[index - 1],
                      borderRightColor: color,
                    }}
                  />
                )}
                <div
                  className="h-full grow first:pl-1 last:pr-1"
                  style={{ backgroundColor: color }}
                >
                  {index === palette.length - 1 &&
                    confetti === paletteIndex && (
                      <span className="absolute right-1 bottom-1 rounded-full bg-primary p-0.75 text-white">
                        <CheckIcon size={11} />
                      </span>
                    )}
                </div>
              </Fragment>
            ))}
          </button>
        ))}
      </div>
    </SettingField>
  );
}
