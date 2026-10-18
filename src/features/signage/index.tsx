import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import type { ScreenConfig } from "@/schemas/screen";
import { palettes } from "@/schemas/screen";
import { cn } from "../../lib/utils";

const themeClasses = {
	paper: "[--stage-bg:#f4f0e8] [--stage-text:#394c3f] [--stage-muted:#898c78]",
	mint: "[--stage-bg:#dce9df] [--stage-text:#284e3d] [--stage-muted:#6b8674]",
	night: "[--stage-bg:#242b29] [--stage-text:#f1f0df] [--stage-muted:#a3b3a6]",
};

export type SignageHandle = {
	celebrate: (palette?: ScreenConfig["confetti"]) => void;
};

export function Signage({
	config,
	value,
	preview = false,
	ref,
}: {
	config: ScreenConfig;
	value: string;
	preview?: boolean;
	ref?: Ref<SignageHandle>;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const party = useRef<ReturnType<typeof confetti.create> | null>(null);

	useEffect(() => {
		const instance = confetti.create(canvas.current!, { resize: true });
		party.current = instance;
		return () => {
			instance.reset();
			party.current = null;
		};
	}, []);

	useImperativeHandle(ref, () => ({
		celebrate(palette = config.confetti) {
			const options = {
				particleCount: 100,
				spread: 65,
				startVelocity: preview ? 32 : 55,
				gravity: 0.95,
				ticks: 240,
				scalar: preview ? 0.75 : 1.1,
				colors: palettes[palette],
				disableForReducedMotion: true,
			};
			party.current?.({ ...options, angle: 58, origin: { x: 0, y: 1 } });
			party.current?.({ ...options, angle: 122, origin: { x: 1, y: 1 } });
		},
	}));

	return (
		<section
			className={cn(
				"relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[color:var(--stage-bg)] text-[color:var(--stage-text)] [container-type:size]",
				themeClasses[config.theme],
				preview &&
					"aspect-[16/10] h-auto rounded-[9px] max-[760px]:rounded-[7px]",
			)}
			aria-label="QRコード表示"
		>
			<div className="flex flex-1 flex-col items-center justify-center px-[6cqw] py-[8cqh] text-center">
				<h2
					className={cn(
						"max-w-[90%] font-semibold tracking-[-.06em] wrap-anywhere",
						preview
							? "text-[clamp(16px,3.6cqw,60px)]/[1.5]"
							: "text-[clamp(24px,3.5cqw,60px)]/[1.5]",
					)}
				>
					{config.title || "つながる、その瞬間を。"}
				</h2>
				<div
					className={cn(
						"mt-[3.5cqh] mb-[3cqh]",
						preview
							? "w-[30cqw] max-w-[37cqh]"
							: "w-[min(29cqw,42cqh)] max-w-[420px] max-[760px]:my-[5cqh] max-[760px]:w-[57cqw] max-[760px]:max-w-[40cqh]",
					)}
				>
					<QRCodeSVG
						className="block h-auto w-full bg-white"
						value={value}
						size={400}
						level="M"
						marginSize={4}
						title="スマートフォンのカメラで読み取ってください"
					/>
				</div>
				<p
					className={cn(
						"max-w-[85%] whitespace-pre-line text-[color:var(--stage-muted)] wrap-anywhere",
						preview
							? "text-[1.55cqw]/[1.9]"
							: "text-[clamp(12px,1.4cqw,20px)]/[1.9] max-[760px]:text-[12px]/[1.9]",
					)}
				>
					{config.message}
				</p>
			</div>
			<canvas
				className="pointer-events-none absolute inset-0 z-3 size-full"
				aria-hidden="true"
				ref={canvas}
			/>
		</section>
	);
}
