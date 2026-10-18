import { useAtomValue, useSetAtom } from "jotai";
import {
	ArrowUpRight,
	Check,
	Copy,
	LoaderCircle,
	Monitor,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/Button";
import {
	editorErrorAtom,
	hasDestinationAtom,
	savedScreenAtom,
	savingScreenAtom,
} from "./atoms";

export function EditorHeader() {
	return (
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
