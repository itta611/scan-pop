import { cn } from "@/lib/utils";
import type { ScreenConfig } from "@/schemas/screen";

export const themeClasses = {
  paper:
    "[--stage-bg:#ffffff] [--stage-text:#252823] [--stage-pattern:#ded6c6] [--stage-accent:#eae3d7]",
  mint: "[--stage-bg:#ffffff] [--stage-text:#263d34] [--stage-pattern:#cad9cc] [--stage-accent:#dce7dc]",
  sky: "[--stage-bg:#ffffff] [--stage-text:#293b49] [--stage-pattern:#cbdbe5] [--stage-accent:#dde7ed]",
  rose: "[--stage-bg:#ffffff] [--stage-text:#493431] [--stage-pattern:#e5ceca] [--stage-accent:#eedfda]",
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
