import { cn } from "@/lib/utils";
import type { ScreenConfig } from "@/schemas/screen";

export const themeClasses = {
  paper:
    "[--stage-bg:#ffffff] [--stage-text:#252823] [--stage-pattern:#e6e0d4] [--stage-accent:#efeae1]",
  mint: "[--stage-bg:#ffffff] [--stage-text:#263d34] [--stage-pattern:#d7e3d9] [--stage-accent:#e5ede5]",
  sky: "[--stage-bg:#ffffff] [--stage-text:#293b49] [--stage-pattern:#d8e4ec] [--stage-accent:#e6edf2]",
  rose: "[--stage-bg:#ffffff] [--stage-text:#493431] [--stage-pattern:#ecdad7] [--stage-accent:#f2e7e3]",
  night:
    "[--stage-bg:#242b29] [--stage-text:#f1f0e9] [--stage-pattern:#3a4b43] [--stage-accent:#303d36]",
};

export function SignageBackground({ theme }: { theme: ScreenConfig["theme"] }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-0 size-full bg-[color:var(--stage-bg)]",
        themeClasses[theme],
      )}
    >
      <path
        d="M560 0H1000V295C907 260 914 178 795 136C669 92 626 68 560 0Z"
        fill="var(--stage-pattern)"
      />
      <path
        d="M0 786C125 819 238 891 330 1000H0Z"
        fill="var(--stage-pattern)"
      />
      <path
        d="M680 1000C663 881 807 813 1000 824V1000Z"
        fill="var(--stage-accent)"
      />
    </svg>
  );
}
