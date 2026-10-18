import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { type FormEvent, type Ref, useRef } from "react";
import {
	savedScreenAtom,
	saveScreenAtom,
	screenConfigAtom,
} from "../features/screens/atoms";
import { EditorHeader } from "../features/screens/editor-header";
import { QrStage, type StageHandle } from "../features/screens/qr-stage";
import {
	ConfettiSetting,
	LinkSetting,
	TextSetting,
	ThemeSetting,
} from "../features/screens/screen-settings";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/")({ component: HomeRoute });

function HomeRoute() {
	return (
		<ClientOnly
			fallback={
				<div className="flex min-h-svh items-center justify-center gap-5 p-[25px] text-center text-[36px] font-bold">
					QR Pop<span>✳</span>
				</div>
			}
		>
			<Home />
		</ClientOnly>
	);
}

function Home() {
	const stage = useRef<StageHandle>(null);
	const saveScreen = useSetAtom(saveScreenAtom);

	async function submit(event: FormEvent) {
		event.preventDefault();
		const displayWindow = window.open("about:blank", "_blank");
		if (!displayWindow) return;
		displayWindow.opener = null;
		try {
			const saved = await saveScreen();
			displayWindow.location.replace(`/screen/${saved.id}`);
		} catch (error) {
			displayWindow.close();
			throw error;
		}
	}

	return (
		<div className={cn("min-h-svh pt-6 px-5 bg-accent")}>
			<EditorHeader />
			<main className="mx-auto max-w-300 mt-8">
				<div className="flex items-start gap-9">
					<EditorPreview ref={stage} />
					<form
						id="screen-editor"
						className="bg-background px-5"
						onSubmit={submit}
						noValidate
					>
						<LinkSetting />
						<TextSetting />
						<ThemeSetting />
						<ConfettiSetting
							onPreview={(palette) => stage.current?.celebrate(palette)}
						/>
					</form>
				</div>
			</main>
		</div>
	);
}

function EditorPreview({ ref }: { ref: Ref<StageHandle> }) {
	const config = useAtomValue(screenConfigAtom);
	const saved = useAtomValue(savedScreenAtom);
	const scanUrl = saved
		? `${location.origin}/go/${saved.id}`
		: config.url || "https://example.com";
	return (
		<div className="grow min-w-0">
			<div className="rounded-2xl bg-white p-2 shadow-[0_0_0_1px_#293d3514,0_10px_28px_-16px_#293d3528] max-[760px]:rounded-[13px] max-[760px]:p-1.5">
				<QrStage ref={ref} config={config} value={scanUrl} preview />
			</div>
		</div>
	);
}
