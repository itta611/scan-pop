import { QRCodeSVG } from "qrcode.react";
import type { Ref } from "react";
import type { ScreenConfig } from "@/schemas/screen";
import { cn } from "../../lib/utils";
import { SignageBackground, themeClasses } from "./background";
import { Confetti, type ConfettiHandle } from "./confetti";

export type SignageHandle = ConfettiHandle;

export function Signage({
  config,
  value,
  ref,
}: {
  config: ScreenConfig;
  value: string;
  ref?: Ref<SignageHandle>;
}) {
  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[color:var(--stage-bg)] text-[color:var(--stage-text)] [container-type:size]",
        themeClasses[config.theme],
      )}
    >
      <SignageBackground theme={config.theme} />
      <div className="relative flex flex-1 flex-col items-center justify-center px-[10cqw] py-[9cqh] text-center">
        <h2 className="w-full max-w-[76cqw] whitespace-pre-line text-center font-semibold tracking-[-.055em] wrap-anywhere text-[clamp(28px,min(14cqw,9cqh),120px)]/[1.06]">
          {config.title || "つながる、その瞬間を。"}
        </h2>
        <div className="relative z-4 mt-[4.5cqh] mb-[3.5cqh] w-[min(68cqw,40cqh)] max-w-[480px] shrink-0">
          <QRCodeSVG
            className="block h-auto w-full"
            bgColor="#ffffff"
            fgColor={config.theme === "night" ? "#242b29" : "var(--stage-text)"}
            value={value}
            size={400}
            level="M"
            marginSize={4}
          />
        </div>
        <p className="max-w-[76cqw] whitespace-pre-line text-[color:var(--stage-muted)] wrap-anywhere text-[clamp(14px,min(5cqw,3cqh),34px)]/[1.45]">
          {config.message}
        </p>
      </div>
      <Confetti colors={config.confetti} ref={ref} />
    </section>
  );
}
