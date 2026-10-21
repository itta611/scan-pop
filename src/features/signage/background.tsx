import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ScreenConfig } from "@/schemas/screen";

export const themeClasses = cva("bg-white text-black", {
  variants: {
    theme: {
      paper:
        "[--stage-pattern:var(--color-stone-200)] [--stage-accent:var(--color-stone-100)]",
      mint: "[--stage-pattern:var(--color-emerald-100)] [--stage-accent:var(--color-emerald-50)]",
      sky: "[--stage-pattern:var(--color-sky-100)] [--stage-accent:var(--color-sky-50)]",
      rose: "[--stage-pattern:var(--color-rose-100)] [--stage-accent:var(--color-rose-50)]",
      night:
        "bg-zinc-800 text-white [--stage-pattern:var(--color-zinc-700)] [--stage-accent:var(--color-zinc-800)]",
    },
  },
});

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
        themeClasses({ theme }),
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="560 0 440 295"
        className={cn(
          "absolute top-0 right-0 h-auto origin-top-right scale-y-120",
          sizeBasis === "long" ? "w-[44cqmax]" : "w-[44cqmin]",
        )}
      >
        <path
          d="M560 0H1000V295C907 260 914 178 795 136C669 92 626 68 560 0Z"
          fill="var(--stage-pattern)"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 786 330 214"
        className={cn(
          "absolute bottom-0 left-0 h-auto origin-bottom-left scale-y-120",
          sizeBasis === "long" ? "w-[33cqmax]" : "w-[33cqmin]",
        )}
      >
        <path
          d="M0 786C125 819 238 891 330 1000H0Z"
          fill="var(--stage-pattern)"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="660 820 340 180"
        className={cn(
          "absolute right-0 bottom-0 h-auto origin-bottom-right scale-y-120",
          sizeBasis === "long" ? "w-[34cqmax]" : "w-[34cqmin]",
        )}
      >
        <path
          d="M680 1000C663 881 807 813 1000 824V1000Z"
          fill="var(--stage-accent)"
        />
      </svg>
    </div>
  );
}
