import { cn } from "@/lib/utils";
import type { ScreenConfig } from "@/schemas/screen";

const patternClasses = {
  none: "fill-transparent",
  gray: "fill-stone-100",
  mint: "fill-green-600/10",
  sky: "fill-sky-500/10",
  rose: "fill-rose-400/10",
};

export function SignageBackground({
  theme,
  sizeBasis = "short",
}: {
  theme: ScreenConfig["theme"];
  sizeBasis?: "short" | "long";
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [container-type:size]",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="560 0 440 295"
        className={cn(
          "absolute top-0 right-0 h-auto origin-top-right scale-y-120",
          sizeBasis === "long" ? "w-[44cqmax]" : "w-[44cqmin]",
          patternClasses[theme],
        )}
      >
        <path d="M560 0H1000V295C907 260 914 178 795 136C669 92 626 68 560 0Z" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 786 330 214"
        className={cn(
          "absolute bottom-0 left-0 h-auto origin-bottom-left scale-y-120",
          sizeBasis === "long" ? "w-[33cqmax]" : "w-[33cqmin]",
          patternClasses[theme],
        )}
      >
        <path d="M0 786C125 819 238 891 330 1000H0Z" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="660 820 340 180"
        className={cn(
          "absolute right-0 bottom-0 h-auto origin-bottom-right scale-y-120 opacity-50",
          sizeBasis === "long" ? "w-[34cqmax]" : "w-[34cqmin]",
          patternClasses[theme],
        )}
      >
        <path d="M680 1000C663 881 807 813 1000 824V1000Z" />
      </svg>
    </div>
  );
}
