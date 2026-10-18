import { z } from "zod";
import { confettiPalettes } from "@/features/signage/confetti";

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);

export const screenSchema = z.object({
  url: z
    .url({
      protocol: /^https?$/,
      error: "http:// または https:// から始まるURLを入力してください。",
    })
    .max(2048),
  title: z.string().trim().min(1, "見出しを入力してください。"),
  message: z.string().trim().max(120),
  theme: z.enum(["paper", "mint", "night"]),
  confetti: z.tuple([hexColor, hexColor, hexColor, hexColor]),
});

export type ScreenConfig = z.infer<typeof screenSchema>;
export type PublishedScreen = ScreenConfig & { id: string };
export type SavedScreen = PublishedScreen & { editToken: string };

export const defaultScreen: ScreenConfig = {
  url: "",
  title: "つながる、その瞬間を。",
  message: "カメラをかざして、アクセスしてください",
  theme: "paper",
  confetti: confettiPalettes[1],
};

export const themes = [
  { value: "paper", label: "ペーパー", className: "bg-[#f4f0e8]" },
  { value: "mint", label: "ミント", className: "bg-[#dce9df]" },
  { value: "night", label: "ナイト", className: "bg-[#242b29]" },
] as const;
