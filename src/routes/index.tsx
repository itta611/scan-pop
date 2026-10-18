import {
	ClientOnly,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import {
	ArrowUpRight,
	Check,
	Copy,
	LoaderCircle,
	Monitor,
	PartyPopper,
	Sparkles,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "../components/Button";
import {
	editorErrorAtom,
	hasDestinationAtom,
	isScreenDirtyAtom,
	savedScreenAtom,
	saveScreenAtom,
	savingScreenAtom,
	screenConfigAtom,
} from "../features/screens/atoms";
import { QrStage, type StageHandle } from "../features/screens/QrStage";
import {
	ConfettiSetting,
	LinkSetting,
	TextSetting,
	ThemeSetting,
} from "../features/screens/ScreenSettings";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/")({ component: HomeRoute });

function HomeRoute() {
	return (
		<ClientOnly
			fallback={
				<div className="flex min-h-svh items-center justify-center gap-5 p-[25px] text-center text-[36px] font-bold [&>span]:text-[#cc805c]">
					QR Pop<span>✳</span>
				</div>
			}
		>
			<Home />
		</ClientOnly>
	);
}

function Home() {
	const navigate = useNavigate();
	const saveScreen = useSetAtom(saveScreenAtom);

	async function submit(event: FormEvent) {
		event.preventDefault();
		const saved = await saveScreen();
		if (saved)
			await navigate({
				to: "/screen/$screenId",
				params: { screenId: saved.id },
			});
	}

	return (
		<div className="mx-auto min-h-svh max-w-[1600px] bg-white">
			<header className="flex h-17 items-center gap-8 border px-3 rounded-xl w-[1060px] mx-auto">
				<span
					className="grid size-9 place-items-center rounded-[10px] bg-[#e5ecdf] max-[760px]:size-6 [&_svg]:size-5.5"
					aria-hidden="true"
				>
					<Sparkles />
				</span>
				<span>QR Pop</span>
				<div className="ml-auto flex items-center gap-3 max-[760px]:gap-1">
					<CopyDisplayLinkButton />
					<OpenDisplayButton />
				</div>
			</header>
			<main className="mx-auto max-w-[1320px] px-[5%] pt-[46px] min-[1500px]:px-10 max-[760px]:px-[22px] max-[760px]:pt-[30px]">
				<div className="grid grid-cols-[minmax(0,1fr)_326px] items-start gap-9 max-[1050px]:grid-cols-[minmax(0,1fr)_295px] max-[1050px]:gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-[30px]">
					<EditorPreview />
					<form
						id="screen-editor"
						className="rounded-[13px] bg-white p-[23px] shadow-[0_0_0_1px_#2e463414,0_5px_20px_-12px_#2e463414] max-[1050px]:p-5 max-[760px]:p-[23px]"
						onSubmit={submit}
						noValidate
					>
						<div className="mb-[23px] flex items-center justify-between gap-[5px] [&>h2]:text-[13px] [&>h2]:font-[650]">
							<h2>表示をカスタマイズ</h2>
							<SaveStatus />
						</div>
						<LinkSetting />
						<TextSetting />
						<ThemeSetting />
						<ConfettiSetting />
						<EditorError />
					</form>
				</div>
			</main>
		</div>
	);
}

function EditorPreview() {
	const config = useAtomValue(screenConfigAtom);
	const saved = useAtomValue(savedScreenAtom);
	const stage = useRef<StageHandle>(null);
	const scanUrl = saved
		? `${location.origin}/go/${saved.id}`
		: config.url || "https://example.com";
	return (
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
	);
}

function OpenDisplayButton() {
	const saving = useAtomValue(savingScreenAtom);
	const hasDestination = useAtomValue(hasDestinationAtom);
	return (
		<Button
			variant="primary"
			className="max-[760px]:gap-1.5 max-[760px]:p-2.5 max-[760px]:text-[10px] max-[760px]:[&>svg:last-child:not(:first-child)]:hidden"
			type="submit"
			form="screen-editor"
			disabled={saving || !hasDestination}
		>
			{saving ? (
				<LoaderCircle className="animate-spin motion-reduce:[animation-duration:2s]" />
			) : (
				<Monitor />
			)}
			<span>{saving ? "保存しています" : "表示ページを開く"}</span>
			<ArrowUpRight />
		</Button>
	);
}

function CopyDisplayLinkButton() {
	const saved = useAtomValue(savedScreenAtom);
	const setError = useSetAtom(editorErrorAtom);
	const [copied, setCopied] = useState(false);
	async function copyDisplayLink(screenId: string) {
		try {
			await navigator.clipboard.writeText(
				`${location.origin}/screen/${screenId}`,
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setError(
				"リンクをコピーできませんでした。ブラウザの設定を確認してください。",
			);
		}
	}
	return (
		<Button
			variant="ghost"
			className="max-[760px]:gap-1.5 max-[760px]:p-2.5 max-[760px]:text-[10px] max-[760px]:[&>svg:last-child:not(:first-child)]:hidden"
			aria-label={copied ? "表示リンクをコピーしました" : "表示リンクをコピー"}
			disabled={!saved}
			onClick={saved ? () => copyDisplayLink(saved.id) : undefined}
		>
			{copied ? <Check /> : <Copy />}
			<span className="max-[760px]:hidden">
				{copied ? "コピーしました" : "表示リンク"}
			</span>
		</Button>
	);
}

function SaveStatus() {
	const saved = useAtomValue(savedScreenAtom);
	const isDirty = useAtomValue(isScreenDirtyAtom);
	return (
		<span
			className={cn("text-[9px] text-[#7e917d]", isDirty && "text-[#a58b5c]")}
		>
			{saved ? (isDirty ? "未保存の変更" : "保存済み") : ""}
		</span>
	);
}

function EditorError() {
	const error = useAtomValue(editorErrorAtom);
	return error ? (
		<p role="alert" className="mt-4 text-[12px] text-red-700">
			{error}
		</p>
	) : null;
}
