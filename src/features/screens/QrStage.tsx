import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import {
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type Ref,
} from "react";
import { cn } from "../../lib/utils";
import type { ScreenConfig } from "./schema";
import { palettes } from "./schema";

const themeClasses = {
	paper:
		"[--stage-bg:#f4f0e8] [--stage-text:#394c3f] [--stage-muted:#898c78] [--stage-accent:#cc805c] [--stage-line:#394c3f20]",
	mint: "[--stage-bg:#dce9df] [--stage-text:#284e3d] [--stage-muted:#6b8674] [--stage-accent:#b27452] [--stage-line:#284e3d22]",
	night:
		"[--stage-bg:#242b29] [--stage-text:#f1f0df] [--stage-muted:#a3b3a6] [--stage-accent:#e7aa77] [--stage-line:#f1f0df26]",
};

export type StageHandle = { celebrate: () => void };

export function QrStage({
	config,
	value,
	preview = false,
	ref,
}: {
	config: ScreenConfig;
	value: string;
	preview?: boolean;
	ref?: Ref<StageHandle>;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const party = useRef<ReturnType<typeof confetti.create> | null>(null);
	const [celebration, setCelebration] = useState(0);

	useEffect(() => {
		const instance = confetti.create(canvas.current!, { resize: true });
		party.current = instance;
		return () => {
			instance.reset();
			party.current = null;
		};
	}, []);

	useImperativeHandle(ref, () => ({
		celebrate() {
			const options = {
				particleCount: config.amount,
				spread: 65,
				startVelocity: preview ? 32 : 55,
				gravity: 0.95,
				ticks: 240,
				scalar: preview ? 0.75 : 1.1,
				colors: palettes[config.confetti],
				disableForReducedMotion: true,
			};
			party.current?.({ ...options, angle: 58, origin: { x: 0, y: 1 } });
			party.current?.({ ...options, angle: 122, origin: { x: 1, y: 1 } });
			setCelebration((count) => count + 1);
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
			<div
				className={cn(
					"absolute inset-x-[4.7%] top-[5%] z-1 flex items-center justify-between tracking-[.16em] text-[color:var(--stage-muted)]",
					preview
						? "text-[1.25cqw]"
						: "text-[min(13px,1.3cqw)] max-[760px]:top-[4%] max-[760px]:text-[8px]",
				)}
			>
				<span
					className={cn(
						"font-[650] tracking-[-.06em] text-[color:var(--stage-text)]",
						preview ? "text-[2.3cqw]" : "text-[clamp(19px,2.3cqw,28px)]",
					)}
				>
					QR Pop
					<span className="ml-[.3em] inline-block text-[1.1em] text-[color:var(--stage-accent)]">
						✳
					</span>
				</span>
				<span>SCAN & CELEBRATE</span>
			</div>
			<div
				className={cn(
					"flex flex-1 flex-col items-center justify-center px-[6cqw] py-[8cqh] text-center",
					!preview && "pb-[10cqh] max-[760px]:pt-[9cqh] max-[760px]:pb-[17cqh]",
				)}
			>
				<span
					className={cn(
						"mb-[1.8cqh] tracking-[.22em] text-[color:var(--stage-muted)]",
						preview
							? "text-[1cqw]"
							: "text-[min(12px,1.5cqw)] max-[760px]:text-[9px]",
					)}
				>
					A LITTLE SCAN. A LITTLE JOY.
				</span>
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
						"relative mt-[3.5cqh] mb-[3cqh]",
						preview
							? "w-[30cqw] max-w-[37cqh]"
							: "w-[min(29cqw,42cqh)] max-w-[420px] max-[760px]:my-[5cqh] max-[760px]:w-[57cqw] max-[760px]:max-w-[40cqh]",
					)}
				>
					<span
						className={cn(
							"absolute top-[6%] left-[-30%] rotate-12 text-[6cqw] font-normal leading-none text-[color:var(--stage-accent)]",
							!preview && "max-[760px]:left-[-24%] max-[760px]:text-[12cqw]",
						)}
						aria-hidden="true"
					>
						✳
					</span>
					<span
						className={cn(
							"absolute top-[36%] right-[-29%] text-[4cqw] font-normal leading-none text-[#8e9d79]",
							!preview && "max-[760px]:right-[-20%] max-[760px]:text-[8cqw]",
						)}
						aria-hidden="true"
					>
						✦
					</span>
					<span
						className={cn(
							"absolute bottom-[2%] left-[-19%] text-[2.6cqw] font-normal leading-none text-[#c6ad6c]",
							!preview && "max-[760px]:left-[-17%] max-[760px]:text-[6cqw]",
						)}
						aria-hidden="true"
					>
						✺
					</span>
					<div
						className={cn(
							"relative -rotate-3 bg-white shadow-[0_1px_2px_#00000005,0_7px_20px_-7px_#0000001c]",
							preview
								? "rounded-[1cqw] p-[1.2cqw]"
								: "rounded-xl p-[min(12px,1.2cqw)]",
						)}
					>
						<QRCodeSVG
							className="block h-auto w-full rotate-3"
							value={value}
							size={400}
							level="M"
							marginSize={4}
							title="スマートフォンのカメラで読み取ってください"
						/>
					</div>
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
			<div
				className={cn(
					"absolute inset-x-[4.7%] z-1 flex items-center justify-between border-t border-[color:var(--stage-line)] pt-[1.8cqh] tracking-[.05em] text-[color:var(--stage-muted)]",
					preview
						? "bottom-[4.3%] text-[1.05cqw]"
						: "bottom-[10%] text-[min(12px,1.5cqw)] max-[760px]:hidden [:fullscreen_&]:bottom-[4%]",
				)}
			>
				<span>スマートフォンのカメラでスキャン</span>
				<span className="text-[2.3cqw] leading-none" aria-hidden="true">
					↗
				</span>
			</div>
			{celebration > 0 && (
				<span
					key={celebration}
					className={cn(
						"absolute top-[4.7cqh] left-1/2 z-4 block w-max animate-thanks rounded-full bg-white px-[1.2em] py-[.7em] font-[650] text-[#315340] shadow-[0_4px_16px_#00000012] motion-reduce:-translate-x-1/2 motion-reduce:animate-none motion-reduce:opacity-100",
						preview ? "text-[2cqw]" : "text-[clamp(15px,2cqw,26px)]",
					)}
					role="status"
				>
					ありがとう！<span aria-hidden="true"> ✨</span>
				</span>
			)}
			<canvas
				className="pointer-events-none absolute inset-0 z-3 size-full"
				aria-hidden="true"
				ref={canvas}
			/>
		</section>
	);
}
