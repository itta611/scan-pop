import confetti from "canvas-confetti";
import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import type { ScreenConfig } from "@/schemas/screen";

export const confettiPalettes: ScreenConfig["confetti"][] = [
  // カラフル — HSL: H 10/45/225/155, S 65%, L 62%.
  ["#dd745f", "#ddbe5f", "#5f7fdd", "#5fdda9"],
  // パステル — HSL: H 345/220/40/145, S 55%, L 80%.
  ["#e8b0be", "#b0c3e8", "#e8d5b0", "#b0e8c7"],
  // シルバー — HSL: H 0/0/0/0, S 0%, L 72/78/84/90%.
  ["#b8b8b8", "#c7c7c7", "#d6d6d6", "#e6e6e6"],
  // ゴールド — HSL: H 36/42/48/54, S 58%, L 58%.
  ["#d2a056", "#d2ad56", "#d2b956", "#d2c656"],
  // ブルー — HSL: H 185/205/225/245, S 65%, L 62%.
  ["#5fd3dd", "#5fa9dd", "#5f7fdd", "#6a5fdd"],
  // ベリー — HSL: H 285/305/325/345, S 60%, L 65%.
  ["#c170db", "#db70d2", "#db70af", "#db708b"],
];

export type ConfettiHandle = {
  celebrate: (palette?: ScreenConfig["confetti"]) => void;
};

export function Confetti({
  colors,
  ref,
}: {
  colors: ScreenConfig["confetti"];
  ref?: Ref<ConfettiHandle>;
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
    celebrate(palette = colors) {
      const options = {
        particleCount: 200,
        spread: 65,
        startVelocity: 55,
        gravity: 0.95,
        ticks: 240,
        scalar: 2.2,
        colors: palette,
        disableForReducedMotion: true,
      };
      party.current?.({ ...options, angle: 58, origin: { x: 0, y: 1 } });
      party.current?.({ ...options, angle: 122, origin: { x: 1, y: 1 } });
    },
  }));

  return (
    <canvas
      className="pointer-events-none absolute inset-0 z-5 size-full"
      aria-hidden="true"
      tabIndex={-1}
      ref={canvas}
    />
  );
}
