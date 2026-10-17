import { Check, Link2, PartyPopper } from "lucide-react";
import { cn } from "../../lib/utils";
import {
	SettingField,
	SettingInput,
	SettingLabel,
	SettingTextarea,
} from "./SettingField";
import { type ScreenConfig, themes } from "./schema";

type SettingProps = {
	config: ScreenConfig;
	onChange: (patch: Partial<ScreenConfig>) => void;
};

const paletteSwatches = {
	colorful: ["bg-[#ff795d]", "bg-[#f4c95d]", "bg-[#6d9d87]", "bg-[#8d9acc]"],
	pastel: ["bg-[#f3b9c8]", "bg-[#b7c8ed]", "bg-[#a8d5bf]", "bg-[#f4d9a6]"],
	gold: ["bg-[#b58a38]", "bg-[#d5b46b]", "bg-[#f1db9d]", "bg-[#e8c373]"],
};

export function LinkSetting({ config, onChange }: SettingProps) {
	return (
		<SettingField title="リンク先" icon={<Link2 />}>
			<SettingLabel htmlFor="destination">開くURL</SettingLabel>
			<SettingInput
				id="destination"
				type="url"
				value={config.url}
				placeholder="https://example.com"
				onChange={(e) => onChange({ url: e.target.value })}
				autoComplete="url"
				maxLength={2048}
			/>
		</SettingField>
	);
}

export function TextSetting({ config, onChange }: SettingProps) {
	return (
		<SettingField title="画面のテキスト">
			<SettingLabel htmlFor="screen-title">
				見出し
				<span className="ml-auto text-[9px] text-[#a0aa9d]">
					{config.title.length}/60
				</span>
			</SettingLabel>
			<SettingInput
				id="screen-title"
				value={config.title}
				onChange={(e) => onChange({ title: e.target.value })}
				maxLength={60}
			/>
			<SettingLabel htmlFor="screen-message">ひとことメッセージ</SettingLabel>
			<SettingTextarea
				id="screen-message"
				value={config.message}
				onChange={(e) => onChange({ message: e.target.value })}
				maxLength={120}
				rows={2}
			/>
		</SettingField>
	);
}

export function ThemeSetting({ config, onChange }: SettingProps) {
	return (
		<SettingField title="背景テーマ">
			<div className="grid clear-both grid-cols-3 gap-2.5">
				{themes.map((theme) => (
					<button
						type="button"
						key={theme.value}
						aria-pressed={config.theme === theme.value}
						className="group border-0 bg-transparent p-0 text-[9px] text-[#8a9684] aria-pressed:text-[#385c42] max-[760px]:text-[10px]"
						onClick={() => onChange({ theme: theme.value })}
					>
						<span
							className={cn(
								"relative mb-2 flex h-[54px] items-center justify-center rounded-md shadow-[0_0_0_1px_#00000006] transition-shadow duration-160 group-hover:shadow-[0_0_0_2px_#c1cebb] group-aria-pressed:shadow-[0_0_0_2px_#577d5b] max-[760px]:h-[70px]",
								theme.className,
							)}
						>
							<span
								className={cn(
									"-rotate-6 rounded-[1px] bg-white px-0.5 py-px text-[24px] leading-none text-[#647160]",
									theme.value === "night" && "text-[#404640]",
								)}
							>
								▦
							</span>
							{config.theme === theme.value && (
								<span className="absolute right-[3px] bottom-[3px] rounded-full bg-[#577d5b] p-0.5 text-white [&_svg]:block [&_svg]:size-[9px]">
									<Check />
								</span>
							)}
						</span>
						<span>{theme.label}</span>
					</button>
				))}
			</div>
		</SettingField>
	);
}

export function ConfettiSetting({ config, onChange }: SettingProps) {
	return (
		<SettingField title="クラッカー" icon={<PartyPopper />}>
			<SettingLabel htmlFor="confetti-palette">紙吹雪のカラー</SettingLabel>
			<div id="confetti-palette" className="flex gap-2.5">
				{(["colorful", "pastel", "gold"] as const).map((palette) => (
					<button
						key={palette}
						type="button"
						aria-pressed={config.confetti === palette}
						aria-label={
							{
								colorful: "カラフル",
								pastel: "パステル",
								gold: "ゴールド",
							}[palette]
						}
						className="flex min-h-10 flex-1 items-center justify-center gap-[3px] rounded-md border border-[#e7ece2] bg-[#fafbf8] px-[7px] py-[11px] transition-[border-color,background-color] duration-160 hover:border-[#a7b8a0] aria-pressed:border-[#759574] aria-pressed:bg-[#f2f6ee]"
						onClick={() => onChange({ confetti: palette })}
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
					{config.amount < 90
						? "ひかえめ"
						: config.amount > 150
							? "たっぷり"
							: "ほどよく"}
				</span>
			</SettingLabel>
			<input
				className="m-0 block h-6 w-full cursor-pointer accent-[#577d5b]"
				id="confetti-amount"
				type="range"
				min={40}
				max={200}
				step={10}
				value={config.amount}
				onChange={(e) => onChange({ amount: Number(e.target.value) })}
			/>
		</SettingField>
	);
}
