import { cn } from "@/lib/utils";
import type { ScreenConfig } from "@/schemas/screen";

export const themeClasses = {
  paper:
    "[--stage-bg:#ffffff] [--stage-text:#000000] [--stage-pattern:#e6e0d4] [--stage-accent:#efeae1]",
  mint: "[--stage-bg:#ffffff] [--stage-text:#000000] [--stage-pattern:#d7e3d9] [--stage-accent:#e5ede5]",
  sky: "[--stage-bg:#ffffff] [--stage-text:#000000] [--stage-pattern:#d8e4ec] [--stage-accent:#e6edf2]",
  rose: "[--stage-bg:#ffffff] [--stage-text:#000000] [--stage-pattern:#ecdad7] [--stage-accent:#f2e7e3]",
  night:
    "[--stage-bg:#242b29] [--stage-text:#ffffff] [--stage-pattern:#3a4b43] [--stage-accent:#303d36]",
};

export function SignageBackground({ theme }: { theme: ScreenConfig["theme"] }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[color:var(--stage-bg)] [container-type:size]",
        themeClasses[theme],
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="560 0 440 295"
        className="absolute top-0 right-0 h-auto w-[44cqw] origin-top-right scale-y-120"
      >
        <path
          d="M560 0H1000V295C907 260 914 178 795 136C669 92 626 68 560 0Z"
          fill="var(--stage-pattern)"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 786 330 214"
        className="absolute bottom-0 left-0 h-auto w-[33cqw] origin-bottom-left scale-y-120"
      >
        <path
          d="M0 786C125 819 238 891 330 1000H0Z"
          fill="var(--stage-pattern)"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="660 820 340 180"
        className="absolute right-0 bottom-0 h-auto w-[34cqw] origin-bottom-right scale-y-120"
      >
        <path
          d="M680 1000C663 881 807 813 1000 824V1000Z"
          fill="var(--stage-accent)"
        />
      </svg>
    </div>
  );
}
