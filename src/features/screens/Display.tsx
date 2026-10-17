import { Link } from "@tanstack/react-router";
import { ArrowLeft, Expand, Minimize, PartyPopper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { QrStage, type StageHandle } from "./QrStage";
import type { PublishedScreen } from "./schema";

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
		<main className="display-shell">
			<QrStage
				ref={stage}
				config={screen}
				value={location.origin + "/go/" + screen.id}
			/>
			<div className="display-controls">
				<Link className="button button-secondary" to="/">
					<ArrowLeft />
					編集に戻る
				</Link>
				<div className={"connection-status status-" + status} role="status">
					<span />
					<span>
						{status === "live"
							? "スキャンを待っています"
							: status === "connecting"
								? "接続しています"
								: "再接続しています"}
					</span>
					<span className="scan-count">{count} scans</span>
				</div>
				<div className="display-actions">
					<Button
						aria-label="クラッカーを試す"
						title="クラッカーを試す"
						onClick={() => stage.current?.celebrate()}
					>
						<PartyPopper />
					</Button>
					<Button onClick={toggleFullscreen}>
						{fullscreen ? <Minimize /> : <Expand />}
						{fullscreen ? "全画面を終了" : "全画面表示"}
					</Button>
				</div>
			</div>
			{error && (
				<p className="display-error" role="alert">
					{error}
				</p>
			)}
		</main>
	);
}
