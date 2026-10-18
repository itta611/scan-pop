import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants = {
	primary:
		"bg-[#294c3d] text-white shadow-[0_2px_3px_#183d2112] not-disabled:hover:bg-[#38644f] not-disabled:hover:shadow-[0_4px_10px_#183d211c]",
	secondary:
		"bg-white text-[#344c40] shadow-[0_0_0_1px_#2d46321c,0_2px_3px_#2d463207] not-disabled:hover:bg-[#f1f5ef]",
	ghost: "bg-transparent text-[#6b7a70] not-disabled:hover:bg-[#edf1e9]",
};

export function buttonClassName(
	variant: ButtonVariant = "secondary",
	className?: string,
) {
	return cn(
		"inline-flex min-h-[42px] touch-manipulation items-center justify-center gap-[9px] whitespace-nowrap border-0 px-4 py-2.5 text-[12px] font-semibold leading-[1.4] transition-[background-color,color,box-shadow,transform] duration-160 not-disabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.65]",
		variants[variant],
		className,
	);
}

export function Button({
	variant = "secondary",
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
	return (
		<button
			type="button"
			className={buttonClassName(variant, className)}
			{...props}
		/>
	);
}
