import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);

export const screenSchema = z.object({
  url: z
    .url({
      protocol: /^https?$/,
      error: "http:// または https:// から始まるURLを入力してください。",
    })
    .max(2048),
  title: z.string().trim().min(1, "タイトルを入力してください。"),
  message: z.string().trim().max(120),
  theme: z.enum(["paper", "mint", "sky", "rose", "night"]),
  confetti: z.tuple([hexColor, hexColor, hexColor, hexColor]),
});

export const screenIdentitySchema = z.object({
  id: z.uuid(),
  editToken: z.uuid(),
});

export type ScreenConfig = z.infer<typeof screenSchema>;
export type PublishedScreen = ScreenConfig & { id: string };
export type SavedScreen = PublishedScreen & { editToken: string };

export const defaultScreen: ScreenConfig = {
  url: "https://scan.itta.dev",
  title: "タイトル",
  message: "ひとことメッセージ",
  theme: "paper",
  confetti: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
};

export const themes = [
  { value: "paper", label: "ペーパー" },
  { value: "mint", label: "ミント" },
  { value: "sky", label: "ミスト" },
  { value: "rose", label: "ローズ" },
  { value: "night", label: "ナイト" },
] as const;
