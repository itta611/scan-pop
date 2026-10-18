import { useAtom } from "jotai";
import { CheckIcon } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";
import {
	confettiAtom,
	messageAtom,
	themeAtom,
	titleAtom,
	urlAtom,
} from "./atoms";
import { type ScreenConfig, themes } from "./schema";
import { SettingField, SettingLabel } from "./setting-field";

const paletteSwatches = {
	colorful: ["bg-[#ff795d]", "bg-[#f4c95d]", "bg-[#6d9d87]", "bg-[#8d9acc]"],
	pastel: ["bg-[#f3b9c8]", "bg-[#b7c8ed]", "bg-[#a8d5bf]", "bg-[#f4d9a6]"],
	gold: ["bg-[#b58a38]", "bg-[#d5b46b]", "bg-[#f1db9d]", "bg-[#e8c373]"],
};

export function LinkSetting() {
	const [url, setUrl] = useAtom(urlAtom);
	return (
		<SettingField title="リンク先">
			<Input
				type="url"
				value={url}
				placeholder="https://example.com"
				onChange={(e) => setUrl(e.target.value)}
				autoComplete="url"
				maxLength={2048}
			/>
		</SettingField>
	);
}

export function TextSetting() {
	const [title, setTitle] = useAtom(titleAtom);
	const [message, setMessage] = useAtom(messageAtom);
	return (
		<SettingField title="画面のテキスト">
			<SettingLabel htmlFor="screen-title">見出し</SettingLabel>
			<Input
				id="screen-title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
			<SettingLabel htmlFor="screen-message">ひとことメッセージ</SettingLabel>
			<Textarea
				id="screen-message"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				maxLength={120}
				rows={2}
			/>
		</SettingField>
	);
}

export function ThemeSetting() {
	const [theme, setTheme] = useAtom(themeAtom);
	return (
		<SettingField title="背景テーマ">
			<div className="grid clear-both grid-cols-3 gap-3">
				{themes.map((option) => (
					<button
						type="button"
						key={option.value}
						aria-pressed={theme === option.value}
						className="group text-xs text-accent-foreground"
						onClick={() => setTheme(option.value)}
					>
						<span
							className={cn(
								"relative mb-1.5 flex h-14 group-aria-pressed:border-2 border-primary",
								option.className,
							)}
						>
							{theme === option.value && (
								<span className="absolute right-1 bottom-1 rounded-full bg-primary p-0.75 text-white">
									<CheckIcon size={11} />
								</span>
							)}
						</span>
						<span>{option.label}</span>
					</button>
				))}
			</div>
		</SettingField>
	);
}

export function ConfettiSetting({
	onPreview,
}: {
	onPreview: (palette: ScreenConfig["confetti"]) => void;
}) {
	const [confetti, setConfetti] = useAtom(confettiAtom);
	return (
		<SettingField title="クラッカー">
			<SettingLabel htmlFor="confetti-palette">紙吹雪のカラー</SettingLabel>
			<div id="confetti-palette" className="flex gap-2.5">
				{(["colorful", "pastel", "gold"] as const).map((palette) => (
					<button
						key={palette}
						type="button"
						aria-pressed={confetti === palette}
						aria-label={
							{
								colorful: "カラフル",
								pastel: "パステル",
								gold: "ゴールド",
							}[palette]
						}
						className="flex min-h-10 flex-1 items-center justify-center gap-[3px] rounded-md border bg-[#fafbf8] px-[7px] py-[11px] transition-[border-color,background-color] duration-160 hover:border-[#a7b8a0] aria-pressed:border-[#759574] aria-pressed:bg-[#f2f6ee]"
						onClick={() => {
							setConfetti(palette);
							onPreview(palette);
						}}
					>
						{paletteSwatches[palette].map((colorClassName) => (
							<span
								key={colorClassName}
								className={cn("size-2.5 rounded-full", colorClassName)}
							/>
						))}
					</button>
				))}
			</div>
		</SettingField>
	);
}
