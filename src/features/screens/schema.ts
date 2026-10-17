import { z } from "zod";

export const screenSchema = z.object({
	url: z
		.url({
			protocol: /^https?$/,
			error: "http:// または https:// から始まるURLを入力してください。",
		})
		.max(2048),
	title: z.string().trim().min(1, "見出しを入力してください。").max(60),
	message: z.string().trim().max(120),
	theme: z.enum(["paper", "mint", "night"]),
	confetti: z.enum(["colorful", "pastel", "gold"]),
	amount: z.number().int().min(40).max(200),
});

export type ScreenConfig = z.infer<typeof screenSchema>;
export type PublishedScreen = ScreenConfig & { id: string };
export type SavedScreen = PublishedScreen & { editToken: string };

export const defaultScreen: ScreenConfig = {
	url: "",
	title: "つながる、その瞬間を。",
	message: "カメラをかざして、アクセスしてください",
	theme: "paper",
	confetti: "colorful",
	amount: 120,
};

export const themes = [
	{ value: "paper", label: "ペーパー", className: "bg-[#f4f0e8]" },
	{ value: "mint", label: "ミント", className: "bg-[#dce9df]" },
	{ value: "night", label: "ナイト", className: "bg-[#242b29]" },
] as const;

export const palettes = {
	colorful: ["#ff795d", "#f4c95d", "#6d9d87", "#8d9acc", "#e9a4b5"],
	pastel: ["#f3b9c8", "#b7c8ed", "#a8d5bf", "#f4d9a6", "#d2b9e8"],
	gold: ["#b58a38", "#d5b46b", "#f1db9d", "#e8c373", "#fff1c3"],
};
