import { useAtom } from "jotai";
import { Check, Link2, PartyPopper } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";
import {
	amountAtom,
	confettiAtom,
	messageAtom,
	themeAtom,
	titleAtom,
	urlAtom,
} from "./atoms";
import { SettingField, SettingLabel } from "./SettingField";
import { themes } from "./schema";

const paletteSwatches = {
	colorful: ["bg-[#ff795d]", "bg-[#f4c95d]", "bg-[#6d9d87]", "bg-[#8d9acc]"],
	pastel: ["bg-[#f3b9c8]", "bg-[#b7c8ed]", "bg-[#a8d5bf]", "bg-[#f4d9a6]"],
	gold: ["bg-[#b58a38]", "bg-[#d5b46b]", "bg-[#f1db9d]", "bg-[#e8c373]"],
};

export function LinkSetting() {
	const [url, setUrl] = useAtom(urlAtom);
	return (
		<SettingField title="リンク先" icon={<Link2 />}>
			<SettingLabel htmlFor="destination">開くURL</SettingLabel>
			<Input
				id="destination"
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
			<SettingLabel htmlFor="screen-title">
				見出し
				<span className="ml-auto text-[9px] text-[#a0aa9d]">
					{title.length}/60
				</span>
			</SettingLabel>
			<Input
				id="screen-title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				maxLength={60}
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
			<div className="grid clear-both grid-cols-3 gap-2.5">
				{themes.map((option) => (
					<button
						type="button"
						key={option.value}
						aria-pressed={theme === option.value}
						className="group border-0 bg-transparent p-0 text-[9px] text-[#8a9684] aria-pressed:text-[#385c42] max-[760px]:text-[10px]"
						onClick={() => setTheme(option.value)}
					>
						<span
							className={cn(
								"relative mb-2 flex h-[54px] items-center justify-center rounded-md shadow-[0_0_0_1px_#00000006] transition-shadow duration-160 group-hover:shadow-[0_0_0_2px_#c1cebb] group-aria-pressed:shadow-[0_0_0_2px_#577d5b] max-[760px]:h-[70px]",
								option.className,
							)}
						>
							<span
								className={cn(
									"-rotate-6 rounded-[1px] bg-white px-0.5 py-px text-[24px] leading-none text-[#647160]",
									option.value === "night" && "text-[#404640]",
								)}
							>
								▦
							</span>
							{theme === option.value && (
								<span className="absolute right-[3px] bottom-[3px] rounded-full bg-[#577d5b] p-0.5 text-white [&_svg]:block [&_svg]:size-[9px]">
									<Check />
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

export function ConfettiSetting({ onPreview }: { onPreview: () => void }) {
	const [confetti, setConfetti] = useAtom(confettiAtom);
	const [amount, setAmount] = useAtom(amountAtom);
	return (
		<SettingField title="クラッカー" icon={<PartyPopper />}>
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
						className="flex min-h-10 flex-1 items-center justify-center gap-[3px] rounded-md border border-[#e7ece2] bg-[#fafbf8] px-[7px] py-[11px] transition-[border-color,background-color] duration-160 hover:border-[#a7b8a0] aria-pressed:border-[#759574] aria-pressed:bg-[#f2f6ee]"
						onClick={() => setConfetti(palette)}
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
			<SettingLabel htmlFor="confetti-amount">
				紙吹雪の量
				<span className="ml-auto text-[9px] text-[#a0aa9d]">
					{amount < 90 ? "ひかえめ" : amount > 150 ? "たっぷり" : "ほどよく"}
				</span>
			</SettingLabel>
			<input
				className="m-0 block h-6 w-full cursor-pointer accent-[#577d5b]"
				id="confetti-amount"
				type="range"
				min={40}
				max={200}
				step={10}
				value={amount}
				onChange={(e) => setAmount(Number(e.target.value))}
			/>
			<Button
				className="mt-3 min-h-[38px] px-[13px] py-2 text-[11px] leading-[1.4]"
				onClick={onPreview}
			>
				<PartyPopper />
				演出を試す
			</Button>
		</SettingField>
	);
}
