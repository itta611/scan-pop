import { useAtomValue } from "jotai";
import { ArrowUpRight, Check, Copy, LoaderCircle, Monitor } from "lucide-react";
import { useState } from "react";
import Logo from "#/components/logo";
import { Button } from "@/components/button";
import { hasDestinationAtom, savedScreenAtom, savingScreenAtom } from "./atoms";

export function EditorHeader() {
	return (
		<header className="bg-background flex h-17 items-center gap-8 px-5 max-w-300 mx-auto">
			<Logo className="mt-1" />
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
	const [copied, setCopied] = useState(false);
	async function copyDisplayLink(screenId: string) {
		await navigator.clipboard.writeText(
			`${location.origin}/screen/${screenId}`,
		);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}
	return (
		<Button
			variant="ghost"
			aria-label={copied ? "表示URLをコピーしました" : "表示URLをコピー"}
			disabled={!saved}
			onClick={saved ? () => copyDisplayLink(saved.id) : undefined}
		>
			{copied ? <Check /> : <Copy />}
			<span className="max-[760px]:hidden">
				{copied ? "コピーしました" : "表示URLをコピー"}
			</span>
		</Button>
	);
}
