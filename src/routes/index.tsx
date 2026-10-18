import {
	ClientOnly,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { type FormEvent, type Ref, useRef } from "react";
import {
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
	const stage = useRef<StageHandle>(null);
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
					<EditorPreview ref={stage} />
					<form
						id="screen-editor"
						className="rounded-[13px] bg-white p-[23px] shadow-[0_0_0_1px_#2e463414,0_5px_20px_-12px_#2e463414] max-[1050px]:p-5 max-[760px]:p-[23px]"
						onSubmit={submit}
						noValidate
					>
						<div className="mb-[23px] flex items-center justify-between gap-[5px] [&>h2]:text-[13px] [&>h2]:font-[650]">
							<h2>表示をカスタマイズ</h2>
						</div>
						<LinkSetting />
						<TextSetting />
						<ThemeSetting />
						<ConfettiSetting onPreview={() => stage.current?.celebrate()} />
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
