import confetti from "canvas-confetti";
import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import type { ScreenConfig } from "@/schemas/screen";

export const confettiPalettes: ScreenConfig["confetti"][] = [
  ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
  ["#ff795d", "#f4c95d", "#8d9acc", "#6d9d87"],
  ["#f3b9c8", "#b7c8ed", "#f4d9a6", "#a8d5bf"],
  ["#b58a38", "#d5b46b", "#e8c373", "#f1db9d"],
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
        particleCount: 100,
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
      className="pointer-events-none absolute inset-0 z-3 size-full"
      aria-hidden="true"
      tabIndex={-1}
      ref={canvas}
    />
  );
}
