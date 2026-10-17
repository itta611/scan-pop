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
import { Button } from "../../components/Button";
import { QrStage, type StageHandle } from "./QrStage";
import {
	defaultScreen,
	palettes,
	screenSchema,
	themes,
	type SavedScreen,
	type ScreenConfig,
} from "./schema";

type Draft = { config: ScreenConfig; saved?: SavedScreen };
const STORAGE_KEY = "qrpop.editor";

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
		<div className="editor-shell">
			<header className="app-header">
				<a href="/" className="brand" aria-label="QR Pop 編集ページ">
					<span className="brand-symbol" aria-hidden="true">
						<Sparkles />
					</span>
					<span>
						QR Pop<span className="brand-dot">.</span>
					</span>
				</a>
				<span className="header-caption">スキャンに、小さなお祝いを。</span>
				<div className="header-actions">
					{saved && (
						<Button
							variant="ghost"
							aria-label={
								copied ? "表示リンクをコピーしました" : "表示リンクをコピー"
							}
							onClick={copyDisplayLink}
						>
							{copied ? <Check /> : <Copy />}
							<span className="copy-label">
								{copied ? "コピーしました" : "表示リンク"}
							</span>
						</Button>
					)}
					<Button
						variant="primary"
						type="submit"
						form="screen-editor"
						disabled={saving || !config.url.trim()}
					>
						{saving ? <LoaderCircle className="spin" /> : <Monitor />}
						<span>{saving ? "保存しています" : "表示ページを開く"}</span>
						<ArrowUpRight />
					</Button>
				</div>
			</header>
			<main className="editor-main">
				<div className="editor-heading">
					<div>
						<div className="eyebrow">
							<span /> YOUR LITTLE CELEBRATION
						</div>
						<h1>
							いつものQRに、
							<br className="mobile-break" />
							ちょっとしたサプライズ。
						</h1>
						<p>読み取られるたび、画面いっぱいにクラッカーが弾けます。</p>
					</div>
					<span className="editor-page-number">01 — EDITOR</span>
				</div>
				<div className="editor-grid">
					<div className="preview-column">
						<div className="panel-heading">
							<span>
								<Monitor /> ライブプレビュー
							</span>
							<span className="preview-ratio">DISPLAY / 16:10</span>
						</div>
						<div className="preview-frame">
							<QrStage ref={stage} config={config} value={scanUrl} preview />
						</div>
						<div className="preview-toolbar">
							<span>
								<span className="preview-dot" />
								変更はプレビューにすぐ反映されます
							</span>
							<Button onClick={() => stage.current?.celebrate()}>
								<PartyPopper />
								演出を試す
							</Button>
						</div>
						<div className="how-it-works">
							<div>
								<span className="step-number">01</span>
								<p>
									URLを設定<span>届けたいページのリンクを入力</span>
								</p>
							</div>
							<ArrowUpRight aria-hidden="true" />
							<div>
								<span className="step-number">02</span>
								<p>
									画面を開く<span>モニターやスクリーンに表示</span>
								</p>
							</div>
							<ArrowUpRight aria-hidden="true" />
							<div>
								<span className="step-number">03</span>
								<p>
									スキャンでお祝い<span>スマホで開くと、紙吹雪が舞う</span>
								</p>
							</div>
						</div>
						<div className="editor-note">
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
						className="settings-panel"
						onSubmit={submit}
						noValidate
					>
						<div className="settings-heading">
							<h2>表示をカスタマイズ</h2>
							<span className={"save-state" + (isDirty ? " is-dirty" : "")}>
								{saved
									? isDirty
										? "未保存の変更"
										: "保存済み"
									: "はじめましょう"}
							</span>
						</div>
						<fieldset className="settings-section">
							<legend>
								<Link2 />
								リンク先
							</legend>
							<label htmlFor="destination">
								開くURL <span className="required-mark">必須</span>
							</label>
							<input
								id="destination"
								type="url"
								value={config.url}
								placeholder="https://example.com"
								onChange={(e) => change({ url: e.target.value })}
								autoComplete="url"
								maxLength={2048}
								aria-describedby="url-hint"
							/>
							<p id="url-hint" className="field-hint">
								スキャンしたスマホで、このURLが開きます。
							</p>
						</fieldset>
						<fieldset className="settings-section">
							<legend>画面のテキスト</legend>
							<label htmlFor="screen-title">
								見出し
								<span className="field-count">{config.title.length}/60</span>
							</label>
							<input
								id="screen-title"
								value={config.title}
								onChange={(e) => change({ title: e.target.value })}
								maxLength={60}
							/>
							<label htmlFor="screen-message">ひとことメッセージ</label>
							<textarea
								id="screen-message"
								value={config.message}
								onChange={(e) => change({ message: e.target.value })}
								maxLength={120}
								rows={2}
							/>
						</fieldset>
						<fieldset className="settings-section">
							<legend>背景テーマ</legend>
							<div className="theme-options">
								{themes.map((theme) => (
									<button
										type="button"
										key={theme.value}
										aria-pressed={config.theme === theme.value}
										className={
											"theme-option" +
											(config.theme === theme.value ? " selected" : "")
										}
										onClick={() => change({ theme: theme.value })}
									>
										<span
											className="theme-swatch"
											style={{ background: theme.color }}
										>
											<span className={"mini-qr " + theme.value}>▦</span>
											{config.theme === theme.value && (
												<span className="theme-check">
													<Check />
												</span>
											)}
										</span>
										<span>{theme.label}</span>
									</button>
								))}
							</div>
						</fieldset>
						<fieldset className="settings-section confetti-settings">
							<legend>
								<PartyPopper />
								クラッカー
							</legend>
							<label htmlFor="confetti-palette">紙吹雪のカラー</label>
							<div id="confetti-palette" className="palette-options">
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
										className={
											"palette-option" +
											(config.confetti === palette ? " selected" : "")
										}
										onClick={() => change({ confetti: palette })}
									>
										{palettes[palette].slice(0, 4).map((color) => (
											<span key={color} style={{ background: color }} />
										))}
									</button>
								))}
							</div>
							<label htmlFor="confetti-amount">
								紙吹雪の量
								<span className="field-count">
									{config.amount < 90
										? "ひかえめ"
										: config.amount > 150
											? "たっぷり"
											: "ほどよく"}
								</span>
							</label>
							<input
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
							<p className="form-error" role="alert">
								{error}
							</p>
						)}
						<div className="settings-footer">
							{saved ? (
								<Button
									className="save-button"
									disabled={saving || !isDirty}
									onClick={() => void save(false)}
								>
									{saving ? <LoaderCircle className="spin" /> : <Check />}
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
								className="reset-button"
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
			<footer className="app-footer">
				<span>SMALL INTERACTIONS, HAPPY CONNECTIONS.</span>
				<span>
					Made to make you smile <span aria-hidden="true">✳</span>
				</span>
			</footer>
		</div>
	);
}
