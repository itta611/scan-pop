import { useNavigate } from "@tanstack/react-router";
import {
	ArrowUpRight,
	Check,
	Copy,
	Link2,
	LoaderCircle,
	Monitor,
	PartyPopper,
	RotateCcw,
	Sparkles,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { cn } from "../../lib/utils";
import { QrStage, type StageHandle } from "./QrStage";
import {
	defaultScreen,
	type SavedScreen,
	type ScreenConfig,
	screenSchema,
	themes,
} from "./schema";

type Draft = { config: ScreenConfig; saved?: SavedScreen };
const STORAGE_KEY = "qrpop.editor";
const inputClassName =
	"w-full rounded-md border border-[#dfe5db] bg-[#fdfefc] px-[11px] py-2.5 text-[11px] leading-[1.6] text-[#364b3c] transition-[border-color,box-shadow] duration-160 placeholder:text-[#aab4a5] focus:border-[#8ba88c] focus:shadow-[0_0_0_3px_#cbdcc938] focus:outline-none max-[760px]:text-[16px]";
const labelClassName =
	"mt-[13px] mb-2 flex clear-both items-center gap-1.5 text-[10px] text-[#657466] max-[760px]:text-[12px]";
const legendClassName =
	"float-left mb-[15px] flex w-full items-center gap-[7px] text-[11px] font-semibold max-[760px]:text-[12px] [&_svg]:size-[13px] [&_svg]:text-[#7f917e]";
const headerButtonClassName =
	"max-[760px]:gap-1.5 max-[760px]:p-2.5 max-[760px]:text-[10px] max-[760px]:[&>svg:last-child:not(:first-child)]:hidden";
const paletteSwatches = {
	colorful: ["bg-[#ff795d]", "bg-[#f4c95d]", "bg-[#6d9d87]", "bg-[#8d9acc]"],
	pastel: ["bg-[#f3b9c8]", "bg-[#b7c8ed]", "bg-[#a8d5bf]", "bg-[#f4d9a6]"],
	gold: ["bg-[#b58a38]", "bg-[#d5b46b]", "bg-[#f1db9d]", "bg-[#e8c373]"],
};

export function Editor() {
	const navigate = useNavigate();
	const [draft, setDraft] = useState<Draft>(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : { config: defaultScreen };
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);
	const stage = useRef<StageHandle>(null);
	const { config, saved } = draft;
	const previous = saved && screenSchema.parse(saved);
	const isDirty =
		!previous || JSON.stringify(config) !== JSON.stringify(previous);
	const scanUrl = saved
		? location.origin + "/go/" + saved.id
		: config.url || "https://example.com";

	function change(patch: Partial<ScreenConfig>) {
		const next = { ...draft, config: { ...config, ...patch } };
		setDraft(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setError("");
	}

	async function save(openDisplay: boolean) {
		const result = screenSchema.safeParse(config);
		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}
		setSaving(true);
		setError("");
		try {
			const response = await fetch(
				saved ? "/api/screens/" + saved.id : "/api/screens",
				{
					method: saved ? "PUT" : "POST",
					headers: {
						"Content-Type": "application/json",
						...(saved ? { "X-Edit-Token": saved.editToken } : {}),
					},
					body: JSON.stringify(result.data),
				},
			);
			const data = await response.json();
			if (!response.ok) throw new Error(data.error);
			const next = { config: result.data, saved: data as SavedScreen };
			setDraft(next);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			if (openDisplay)
				await navigate({
					to: "/screen/$screenId",
					params: { screenId: data.id },
				});
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "保存できませんでした。もう一度お試しください。",
			);
		} finally {
			setSaving(false);
		}
	}

	async function copyDisplayLink() {
		try {
			await navigator.clipboard.writeText(
				location.origin + "/screen/" + saved!.id,
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setError(
				"リンクをコピーできませんでした。ブラウザの設定を確認してください。",
			);
		}
	}

	function submit(event: FormEvent) {
		event.preventDefault();
		void save(true);
	}

	return (
		<div className="mx-auto max-w-[1600px]">
			<header className="flex h-17 items-center gap-8 border px-3 rounded-xl w-[1060px] mx-auto">
				<span
					className="grid size-9 place-items-center rounded-[10px] bg-[#e5ecdf] max-[760px]:size-6 [&_svg]:size-5.5"
					aria-hidden="true"
				>
					<Sparkles />
				</span>
				<span>QR Pop</span>
				<div className="ml-auto flex items-center gap-3 max-[760px]:gap-1">
					<Button
						variant="ghost"
						className={headerButtonClassName}
						aria-label={
							copied ? "表示リンクをコピーしました" : "表示リンクをコピー"
						}
						onClick={copyDisplayLink}
					>
						{copied ? <Check /> : <Copy />}
						<span className="max-[760px]:hidden">
							{copied ? "コピーしました" : "表示リンク"}
						</span>
					</Button>
					<Button
						variant="primary"
						className={headerButtonClassName}
						type="submit"
						form="screen-editor"
						disabled={saving || !config.url.trim()}
					>
						{saving ? (
							<LoaderCircle className="animate-spin motion-reduce:[animation-duration:2s]" />
						) : (
							<Monitor />
						)}
						<span>{saving ? "保存しています" : "表示ページを開く"}</span>
						<ArrowUpRight />
					</Button>
				</div>
			</header>
			<main className="mx-auto max-w-[1320px] px-[5%] pt-[46px] min-[1500px]:px-10 max-[760px]:px-[22px] max-[760px]:pt-[30px]">
				<div className="grid grid-cols-[minmax(0,1fr)_326px] items-start gap-9 max-[1050px]:grid-cols-[minmax(0,1fr)_295px] max-[1050px]:gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-[30px]">
					<div className="min-w-0">
						<div className="rounded-2xl bg-white p-2 shadow-[0_0_0_1px_#293d3514,0_10px_28px_-16px_#293d3528] max-[760px]:rounded-[13px] max-[760px]:p-1.5">
							<QrStage ref={stage} config={config} value={scanUrl} preview />
						</div>
						<Button
							className="min-h-[38px] px-[13px] py-2 text-[11px] leading-[1.4]"
							onClick={() => stage.current?.celebrate()}
						>
							<PartyPopper />
							演出を試す
						</Button>
					</div>
					<form
						id="screen-editor"
						className="rounded-[13px] bg-white p-[23px] shadow-[0_0_0_1px_#2e463414,0_5px_20px_-12px_#2e463414] max-[1050px]:p-5 max-[760px]:p-[23px]"
						onSubmit={submit}
						noValidate
					>
						<div className="mb-[23px] flex items-center justify-between gap-[5px] [&>h2]:text-[13px] [&>h2]:font-[650]">
							<h2>表示をカスタマイズ</h2>
							<span
								className={cn(
									"text-[9px] text-[#7e917d]",
									isDirty && "text-[#a58b5c]",
								)}
							>
								{saved ? (isDirty ? "未保存の変更" : "保存済み") : ""}
							</span>
						</div>
						<fieldset className="mb-[21px] min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-[22px]">
							<legend className={legendClassName}>
								<Link2 />
								リンク先
							</legend>
							<label className={labelClassName} htmlFor="destination">
								開くURL
							</label>
							<input
								className={inputClassName}
								id="destination"
								type="url"
								value={config.url}
								placeholder="https://example.com"
								onChange={(e) => change({ url: e.target.value })}
								autoComplete="url"
								maxLength={2048}
								aria-describedby="url-hint"
							/>
						</fieldset>
						<fieldset className="mb-[21px] min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-[22px]">
							<legend className={legendClassName}>画面のテキスト</legend>
							<label className={labelClassName} htmlFor="screen-title">
								見出し
								<span className="ml-auto text-[9px] text-[#a0aa9d]">
									{config.title.length}/60
								</span>
							</label>
							<input
								className={inputClassName}
								id="screen-title"
								value={config.title}
								onChange={(e) => change({ title: e.target.value })}
								maxLength={60}
							/>
							<label className={labelClassName} htmlFor="screen-message">
								ひとことメッセージ
							</label>
							<textarea
								className={cn(
									inputClassName,
									"min-h-16 max-h-[170px] resize-y",
								)}
								id="screen-message"
								value={config.message}
								onChange={(e) => change({ message: e.target.value })}
								maxLength={120}
								rows={2}
							/>
						</fieldset>
						<fieldset className="mb-[21px] min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-[22px]">
							<legend className={legendClassName}>背景テーマ</legend>
							<div className="grid clear-both grid-cols-3 gap-2.5">
								{themes.map((theme) => (
									<button
										type="button"
										key={theme.value}
										aria-pressed={config.theme === theme.value}
										className="group border-0 bg-transparent p-0 text-[9px] text-[#8a9684] aria-pressed:text-[#385c42] max-[760px]:text-[10px]"
										onClick={() => change({ theme: theme.value })}
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
						</fieldset>
						<fieldset className="mb-0 min-w-0 p-0 pb-4 max-[760px]:pb-[22px]">
							<legend className={legendClassName}>
								<PartyPopper />
								クラッカー
							</legend>
							<label className={labelClassName} htmlFor="confetti-palette">
								紙吹雪のカラー
							</label>
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
										onClick={() => change({ confetti: palette })}
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
							<label className={labelClassName} htmlFor="confetti-amount">
								紙吹雪の量
								<span className="ml-auto text-[9px] text-[#a0aa9d]">
									{config.amount < 90
										? "ひかえめ"
										: config.amount > 150
											? "たっぷり"
											: "ほどよく"}
								</span>
							</label>
							<input
								className="m-0 block h-6 w-full cursor-pointer accent-[#577d5b]"
								id="confetti-amount"
								type="range"
								min={40}
								max={200}
								step={10}
								value={config.amount}
								onChange={(e) => change({ amount: Number(e.target.value) })}
							/>
						</fieldset>
					</form>
				</div>
			</main>
		</div>
	);
}
