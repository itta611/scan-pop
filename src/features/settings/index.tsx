import { useAtom } from "jotai";
import { CheckIcon } from "lucide-react";
import { Fragment } from "react";
import {
	confettiAtom,
	messageAtom,
	themeAtom,
	titleAtom,
	urlAtom,
} from "@/jotai/atoms";
import { type ScreenConfig, themes } from "@/schemas/screen";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";
import { SettingField, SettingLabel } from "./setting-field";

const paletteSwatches = {
	colorful: ["#ff795d", "#f4c95d", "#8d9acc", "#6d9d87"],
	pastel: ["#f3b9c8", "#b7c8ed", "#f4d9a6", "#a8d5bf"],
	gold: ["#b58a38", "#d5b46b", "#e8c373", "#f1db9d"],
};

export function LinkSetting() {
	const [url, setUrl] = useAtom(urlAtom);
	return (
		<SettingField title="リンク先">
			<Input
				type="url"
				defaultValue={url}
				placeholder="https://example.com"
				onBlur={(e) => setUrl(e.currentTarget.value)}
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
				defaultValue={title}
				onBlur={(e) => setTitle(e.currentTarget.value)}
			/>
			<SettingLabel htmlFor="screen-message">ひとことメッセージ</SettingLabel>
			<Textarea
				id="screen-message"
				defaultValue={message}
				onBlur={(e) => setMessage(e.currentTarget.value)}
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
								"relative mb-1.5 flex h-14 group-aria-pressed:ring-2 border-primary",
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
			<div className="flex gap-3">
				{(["colorful", "pastel", "gold"] as const).map((palette) => (
					<button
						key={palette}
						type="button"
						aria-pressed={confetti === palette}
						className="flex flex-1 items-center justify-center gap-0 transition-[border-color,background-color] aria-pressed:border-primary border-2 border-transparent"
						onClick={() => {
							setConfetti(palette);
							onPreview(palette);
						}}
					>
						{paletteSwatches[palette].map((color, index) => (
							<Fragment key={color}>
								{index > 0 && (
									<div
										className="size-0 border-r-10 border-t-40"
										style={{
											borderTopColor: paletteSwatches[palette][index - 1],
											borderRightColor: color,
										}}
									/>
								)}
								<div
									className="h-full grow first:pl-1 last:pr-1"
									style={{ backgroundColor: color }}
								/>
							</Fragment>
						))}
					</button>
				))}
			</div>
		</SettingField>
	);
}
