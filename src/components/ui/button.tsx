import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants = {
	primary: "bg-primary text-white not-disabled:hover:bg-primary",
	secondary:
		"bg-white text-accent-foreground not-disabled:hover:bg-background border",
	ghost: "bg-transparent text-accent-foreground not-disabled:hover:bg-accent",
};

export function buttonClassName(
	variant: ButtonVariant = "secondary",
	className?: string,
) {
	return cn(
		"inline-flex min-h-10.5 touch-manipulation items-center justify-center gap-2 whitespace-nowrap border-0 px-4 py-2.5 text-[13px] font-semibold leading-[1.4] transition-[background-color,color,box-shadow,transform] duration-160 not-disabled:active:pt-3 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.65]",
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
