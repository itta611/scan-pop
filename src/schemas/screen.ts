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
  theme: z.enum(["none", "gray", "mint", "sky", "rose"]),
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
  theme: "gray",
  confetti: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
};

export const themes = [
  { color: "none" },
  { color: "gray" },
  { color: "mint" },
  { color: "sky" },
  { color: "rose" },
] as const;
