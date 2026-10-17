import { Link } from "@tanstack/react-router";
import { ArrowLeft, Expand, Minimize, PartyPopper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, buttonClassName } from "../../components/Button";
import { cn } from "../../lib/utils";
import { QrStage, type StageHandle } from "./QrStage";
import type { PublishedScreen } from "./schema";

const displayButtonClassName =
	"min-h-10 bg-[#ffffffed] text-[11px] leading-[1.4] shadow-[0_0_0_1px_#0000000c,0_3px_10px_#00000006] max-[760px]:px-3 max-[760px]:py-2.5 max-[760px]:text-[10px]";

export function Display({ initialScreen }: { initialScreen: PublishedScreen }) {
	const [screen, setScreen] = useState(initialScreen);
	const [status, setStatus] = useState<"connecting" | "live" | "reconnecting">(
		"connecting",
	);
	const [count, setCount] = useState(0);
	const [fullscreen, setFullscreen] = useState(false);
	const [error, setError] = useState("");
	const stage = useRef<StageHandle>(null);

	useEffect(() => {
		const source = new EventSource("/api/events/" + initialScreen.id);
		source.addEventListener("ready", (event) => {
			const data = JSON.parse(event.data);
			setCount(data.count);
			setScreen(data.screen);
			setStatus("live");
		});
		source.addEventListener("scan", (event) => {
			const data = JSON.parse(event.data);
			setCount((count) => Math.max(count, data.count));
			stage.current?.celebrate();
		});
		source.addEventListener("config", (event) =>
			setScreen(JSON.parse(event.data)),
		);
		source.onerror = () => setStatus("reconnecting");
		return () => source.close();
	}, [initialScreen.id]);

	useEffect(() => {
		const update = () => setFullscreen(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", update);
		return () => document.removeEventListener("fullscreenchange", update);
	}, []);

	async function toggleFullscreen() {
		setError("");
		try {
			if (document.fullscreenElement) await document.exitFullscreen();
			else await document.documentElement.requestFullscreen();
		} catch {
			setError("このブラウザでは全画面表示を開始できませんでした。");
		}
	}

	return (
		<main className="fixed inset-0 bg-[#f4f0e8]">
			<QrStage
				ref={stage}
				config={screen}
				value={location.origin + "/go/" + screen.id}
			/>
			<div className="absolute inset-x-[25px] bottom-[18px] z-5 flex items-center justify-between gap-3 max-[760px]:inset-x-[15px] max-[760px]:bottom-[15px] max-[760px]:flex-wrap [:fullscreen_&]:opacity-0 [:fullscreen_&]:transition-opacity [:fullscreen_&]:duration-180 [:fullscreen_&]:hover:opacity-100 [:fullscreen_&]:focus-within:opacity-100">
				<Link
					className={buttonClassName("secondary", displayButtonClassName)}
					to="/"
				>
					<ArrowLeft />
					編集に戻る
				</Link>
				<div
					className="flex items-center gap-2 rounded-full bg-[#ffffffed] px-3.5 py-2.5 text-[10px] text-[#647061] shadow-[0_0_0_1px_#00000005] max-[760px]:order-first max-[760px]:basis-full max-[760px]:justify-center max-[760px]:bg-transparent max-[760px]:shadow-none"
					role="status"
				>
					<span
						className={cn(
							"size-1.5 rounded-full bg-[#c4a069]",
							status === "live" && "bg-[#6e9e79]",
						)}
					/>
					<span>
						{status === "live"
							? "スキャンを待っています"
							: status === "connecting"
								? "接続しています"
								: "再接続しています"}
					</span>
					<span className="border-l border-[#dde3d6] pl-[9px] text-[#a2aa9a]">
						{count} scans
					</span>
				</div>
				<div className="flex gap-[9px]">
					<Button
						className={displayButtonClassName}
						aria-label="クラッカーを試す"
						title="クラッカーを試す"
						onClick={() => stage.current?.celebrate()}
					>
						<PartyPopper />
					</Button>
					<Button className={displayButtonClassName} onClick={toggleFullscreen}>
						{fullscreen ? <Minimize /> : <Expand />}
						{fullscreen ? "全画面を終了" : "全画面表示"}
					</Button>
				</div>
			</div>
			{error && (
				<p
					className="absolute bottom-[75px] left-1/2 z-5 -translate-x-1/2 rounded-lg bg-white px-5 py-3.5 text-[12px] text-[#a74e3e]"
					role="alert"
				>
					{error}
				</p>
			)}
		</main>
	);
}
