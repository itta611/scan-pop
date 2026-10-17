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
import { useRef, useState, type FormEvent } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/Button";
import { QrStage, type StageHandle } from "./QrStage";
import {
	defaultScreen,
	screenSchema,
	themes,
	type SavedScreen,
	type ScreenConfig,
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
			<header className="flex h-[88px] items-center gap-8 border-b border-[#e8ece4] px-[5%] max-[760px]:h-[76px] max-[760px]:gap-2.5 max-[760px]:px-[22px]">
				<a
					href="/"
					className="flex items-center gap-2.5 text-[26px] font-[750] tracking-[-1.5px] max-[760px]:text-[24px]"
					aria-label="QR Pop 編集ページ"
				>
					<span
						className="grid size-[35px] place-items-center rounded-[10px] bg-[#e5ecdf] max-[760px]:size-[31px] [&_svg]:size-[22px]"
						aria-hidden="true"
					>
						<Sparkles />
					</span>
					<span>
						QR Pop<span className="text-[#db8b61]">.</span>
					</span>
				</a>
				<span className="text-[11px] tracking-[.06em] text-[#7c877d] max-[1050px]:hidden">
					スキャンに、小さなお祝いを。
				</span>
				<div className="ml-auto flex items-center gap-3 max-[760px]:gap-1">
					{saved && (
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
					)}
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
				<div className="mb-[33px] flex items-end justify-between max-[760px]:mb-[26px]">
					<div>
						<div className="mb-[15px] flex items-center gap-2 text-[9px] font-[650] tracking-[.17em] text-[#7a8b7a] [&>span]:size-[5px] [&>span]:rounded-full [&>span]:bg-[#d7956c]">
							<span /> YOUR LITTLE CELEBRATION
						</div>
						<h1 className="text-[clamp(22px,2.2vw,30px)] font-semibold leading-[1.5] tracking-[-.045em] max-[760px]:text-[24px]">
							いつものQRに、
							<br className="hidden max-[760px]:block" />
							ちょっとしたサプライズ。
						</h1>
						<p className="mt-2.5 text-[12px] leading-[1.8] text-[#7b877f] max-[760px]:max-w-[260px] max-[760px]:text-[11px]">
							読み取られるたび、画面いっぱいにクラッカーが弾けます。
						</p>
					</div>
					<span className="pb-1.5 text-[9px] tracking-[.1em] text-[#9aa398] max-[760px]:hidden">
						01 — EDITOR
					</span>
				</div>
				<div className="grid grid-cols-[minmax(0,1fr)_326px] items-start gap-9 max-[1050px]:grid-cols-[minmax(0,1fr)_295px] max-[1050px]:gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-[30px]">
					<div className="min-w-0">
						<div className="flex h-[30px] items-start justify-between text-[11px] text-[#738176] [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:gap-[7px] [&_svg]:size-3.5">
							<span>
								<Monitor /> ライブプレビュー
							</span>
							<span className="text-[8px] tracking-[.12em] text-[#939c91]">
								DISPLAY / 16:10
							</span>
						</div>
						<div className="rounded-2xl bg-white p-2 shadow-[0_0_0_1px_#293d3514,0_10px_28px_-16px_#293d3528] max-[760px]:rounded-[13px] max-[760px]:p-1.5">
							<QrStage ref={stage} config={config} value={scanUrl} preview />
						</div>
						<div className="mt-[17px] flex items-center justify-between gap-2.5 max-[760px]:mt-[15px] [&>span]:flex [&>span]:items-center [&>span]:gap-[7px] [&>span]:text-[10px] [&>span]:text-[#859180] max-[1050px]:[&>span]:max-w-[150px] max-[1050px]:[&>span]:leading-[1.7] max-[760px]:[&>span]:max-w-none max-[760px]:[&>span]:text-[9px]">
							<span>
								<span className="inline-block size-[5px] rounded-full bg-[#91aa84]" />
								変更はプレビューにすぐ反映されます
							</span>
							<Button
								className="min-h-[38px] px-[13px] py-2 text-[11px] leading-[1.4]"
								onClick={() => stage.current?.celebrate()}
							>
								<PartyPopper />
								演出を試す
							</Button>
						</div>
						<div className="mt-10 flex items-center justify-between gap-3 border-t border-[#e7ebe1] pt-[27px] max-[1050px]:flex-wrap max-[1050px]:gap-[15px] max-[760px]:mt-[25px] max-[760px]:gap-3 [&>svg]:size-[13px] [&>svg]:text-[#aeb7a5] max-[1050px]:[&>svg]:hidden">
							<div className="flex items-start gap-2.5 max-[1050px]:basis-[42%] max-[760px]:basis-auto max-[760px]:gap-[5px]">
								<span className="text-[9px] leading-[22px] text-[#a2ac98]">
									01
								</span>
								<p className="text-[11px] font-semibold leading-[22px] max-[760px]:text-[9px]">
									URLを設定
									<span className="block text-[9px] font-normal leading-[1.8] text-[#8b9688] max-[760px]:max-w-[100px] max-[760px]:text-[8px]">
										届けたいページのリンクを入力
									</span>
								</p>
							</div>
							<ArrowUpRight aria-hidden="true" />
							<div className="flex items-start gap-2.5 max-[1050px]:basis-[42%] max-[760px]:basis-auto max-[760px]:gap-[5px]">
								<span className="text-[9px] leading-[22px] text-[#a2ac98]">
									02
								</span>
								<p className="text-[11px] font-semibold leading-[22px] max-[760px]:text-[9px]">
									画面を開く
									<span className="block text-[9px] font-normal leading-[1.8] text-[#8b9688] max-[760px]:max-w-[100px] max-[760px]:text-[8px]">
										モニターやスクリーンに表示
									</span>
								</p>
							</div>
							<ArrowUpRight aria-hidden="true" />
							<div className="flex items-start gap-2.5 max-[1050px]:basis-[42%] max-[760px]:basis-auto max-[760px]:gap-[5px]">
								<span className="text-[9px] leading-[22px] text-[#a2ac98]">
									03
								</span>
								<p className="text-[11px] font-semibold leading-[22px] max-[760px]:text-[9px]">
									スキャンでお祝い
									<span className="block text-[9px] font-normal leading-[1.8] text-[#8b9688] max-[760px]:max-w-[100px] max-[760px]:text-[8px]">
										スマホで開くと、紙吹雪が舞う
									</span>
								</p>
							</div>
						</div>
						<div className="flex items-center justify-center gap-[13px] pt-[37px] pb-[15px] text-[#94a08e] max-[760px]:hidden [&_svg]:size-[21px] [&_svg]:stroke-[1.2] [&_svg]:text-[#b8b99b] [&_p]:text-[10px] [&_p]:leading-[1.9]">
							<Sparkles />
							<p>
								プレゼンの最後に。イベントの入口に。
								<br />
								リンクを渡す瞬間を、少しだけ特別に。
							</p>
						</div>
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
								{saved
									? isDirty
										? "未保存の変更"
										: "保存済み"
									: "はじめましょう"}
							</span>
						</div>
						<fieldset className="mb-[21px] min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-[22px]">
							<legend className={legendClassName}>
								<Link2 />
								リンク先
							</legend>
							<label className={labelClassName} htmlFor="destination">
								開くURL <span className="text-[8px] text-[#a28d72]">必須</span>
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
							<p
								id="url-hint"
								className="mt-2 text-[9px] leading-[1.7] text-[#97a090] max-[760px]:text-[10px]"
							>
								スキャンしたスマホで、このURLが開きます。
							</p>
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
						<fieldset className="mb-0 min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-4 max-[760px]:pb-[22px]">
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
						{error && (
							<p
								className="pt-3 text-[11px] leading-[1.8] text-[#a74e3e]"
								role="alert"
							>
								{error}
							</p>
						)}
						<div className="flex items-center justify-between gap-3 pt-[17px] [&_p]:text-[9px] [&_p]:leading-[1.9] [&_p]:text-[#98a28f] [&_strong]:font-medium [&_strong]:text-[#74876d]">
							{saved ? (
								<Button
									className="flex-1"
									disabled={saving || !isDirty}
									onClick={() => void save(false)}
								>
									{saving ? (
										<LoaderCircle className="animate-spin motion-reduce:[animation-duration:2s]" />
									) : (
										<Check />
									)}
									{saving ? "保存しています" : "変更を保存"}
								</Button>
							) : (
								<p>
									設定できたら、右上の
									<br />
									<strong>「表示ページを開く」</strong>へ。
								</p>
							)}
							<Button
								variant="ghost"
								className="min-w-10 p-[9px]"
								aria-label="見た目を初期設定に戻す"
								title="見た目を初期設定に戻す"
								onClick={() => change({ ...defaultScreen, url: config.url })}
							>
								<RotateCcw />
							</Button>
						</div>
					</form>
				</div>
			</main>
			<footer className="mx-[5%] mt-11 flex justify-between gap-4 border-t border-[#e8ece4] pt-[22px] pb-6 text-[8px] tracking-[.1em] text-[#a0a997] max-[760px]:mx-[22px] max-[760px]:mt-[35px] max-[760px]:text-[7px] max-[760px]:leading-[1.8] max-[760px]:[&>span:first-child]:max-w-[150px] [&>span:last-child]:tracking-[.02em] [&>span:last-child_span]:pl-2 [&>span:last-child_span]:text-[#cc9977]">
				<span>SMALL INTERACTIONS, HAPPY CONNECTIONS.</span>
				<span>
					Made to make you smile <span aria-hidden="true">✳</span>
				</span>
			</footer>
		</div>
	);
}
