import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);

export function normalizeUrl(url: string) {
  const value = url.trim();
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value.replace(/[\t\n\r]/g, ""));
  const hasHostPort = /^[\w-]+(?:\.[\w-]+)+:\d+(?:[/?#]|$)/i.test(value);
  return value && (!hasScheme || hasHostPort) ? `https://${value}` : value;
}

export const screenSchema = z.object({
  url: z
    .string()
    .regex(/\./, "ドットを含むURLを入力してください。")
    .transform(normalizeUrl)
    .pipe(
      z
        .url({
          protocol: /^https?$/,
          hostname: /\./,
          error:
            "http:// または https:// でアクセスできるURLを入力してください。",
        })
        .max(2048),
    ),
  title: z.string().trim().min(1, "タイトルを入力してください。"),
  message: z.string().trim().max(120),
  background: z.object({
    color: z.enum(["gray", "mint", "sky", "purple", "rose", "none"]),
    theme: z.enum(["light", "dark"]),
  }),
  confetti: z.tuple([hexColor, hexColor, hexColor, hexColor]),
});

export const screenIdentitySchema = z.object({
  id: z.uuid(),
  editToken: z.uuid(),
});

export type ScreenConfig = z.infer<typeof screenSchema>;
export type PublishedScreen = ScreenConfig & { id: string };
export type SavedScreen = PublishedScreen & { editToken: string };

export const backgrounds = [
  { color: "gray", theme: "light" },
  { color: "mint", theme: "light" },
  { color: "sky", theme: "light" },
  { color: "purple", theme: "light" },
  { color: "rose", theme: "light" },
  { color: "none", theme: "light" },
  { color: "gray", theme: "dark" },
  { color: "mint", theme: "dark" },
  { color: "sky", theme: "dark" },
  { color: "purple", theme: "dark" },
  { color: "rose", theme: "dark" },
  { color: "none", theme: "dark" },
] as const;

export const defaultScreen: ScreenConfig = {
  url: "https://scan.itta.dev",
  title: "タイトル",
  message: "ひとことメッセージ",
  background: backgrounds[0],
  confetti: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
};
