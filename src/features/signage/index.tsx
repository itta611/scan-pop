import { QRCodeSVG } from "qrcode.react";
import type { Ref } from "react";
import type { ScreenConfig } from "@/schemas/screen";
import { cn } from "../../lib/utils";
import { Confetti, type ConfettiHandle } from "./confetti";

const themeClasses = {
  paper: "[--stage-bg:#f4f0e8] [--stage-text:#394c3f] [--stage-muted:#898c78]",
  mint: "[--stage-bg:#dce9df] [--stage-text:#284e3d] [--stage-muted:#6b8674]",
  night: "[--stage-bg:#242b29] [--stage-text:#f1f0df] [--stage-muted:#a3b3a6]",
};

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
      aria-label="QRコード表示"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-[6cqw] py-[8cqh] text-center">
        <h2 className="max-w-[90%] font-semibold tracking-[-.06em] wrap-anywhere text-[clamp(24px,3.5cqw,60px)]/[1.5]">
          {config.title || "つながる、その瞬間を。"}
        </h2>
        <div className="mt-[3.5cqh] mb-[3cqh] w-[min(29cqw,42cqh)] max-w-[420px] max-[760px]:my-[5cqh] max-[760px]:w-[57cqw] max-[760px]:max-w-[40cqh]">
          <QRCodeSVG
            className="block h-auto w-full bg-white"
            value={value}
            size={400}
            level="M"
            marginSize={4}
          />
        </div>
        <p className="max-w-[85%] whitespace-pre-line text-[color:var(--stage-muted)] wrap-anywhere text-[clamp(12px,1.4cqw,20px)]/[1.9] max-[760px]:text-[12px]/[1.9]">
          {config.message}
        </p>
      </div>
      <Confetti colors={config.confetti} ref={ref} />
    </section>
  );
}
