import {
	ClientOnly,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { PartyPopper } from "lucide-react";
import { type FormEvent, useRef } from "react";
import { Button } from "../components/Button";
import {
	isScreenDirtyAtom,
	savedScreenAtom,
	saveScreenAtom,
	screenConfigAtom,
	themeAtom,
} from "../features/screens/atoms";
import { EditorHeader } from "../features/screens/EditorHeader";
import { QrStage, type StageHandle } from "../features/screens/QrStage";
import {
	ConfettiSetting,
	LinkSetting,
	TextSetting,
	ThemeSetting,
} from "../features/screens/ScreenSettings";
import { themes } from "../features/screens/schema";
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
	const theme = useAtomValue(themeAtom);
	const navigate = useNavigate();
	const saveScreen = useSetAtom(saveScreenAtom);

	async function submit(event: FormEvent) {
		event.preventDefault();
		const saved = await saveScreen();
		await navigate({
			to: "/screen/$screenId",
			params: { screenId: saved.id },
		});
	}

	return (
		<div
			className={cn(
				"min-h-svh pt-6",
				themes.find((option) => option.value === theme)?.className,
			)}
		>
			<EditorHeader />
			<main className="mx-auto max-w-[1200px] mt-8">
				<div className="flex items-start gap-9">
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
		<div className="grow min-w-0">
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
