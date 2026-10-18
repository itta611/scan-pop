import type { LabelHTMLAttributes, ReactNode } from "react";

export function SettingField({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="pt-4 min-w-0 border-b pb-5 last:border-b-0">
			<div className="mb-3.5 flex w-full items-center text-xs font-semibold max-[760px]:text-[12px]">
				{title}
			</div>
			{children}
		</div>
	);
}

export function SettingLabel({
	htmlFor,
	children,
	...props
}: LabelHTMLAttributes<HTMLLabelElement> & { htmlFor: string }) {
	return (
		<label
			htmlFor={htmlFor}
			className="mt-3 mb-2 flex text-[11px] text-accent-foreground"
			{...props}
		>
			{children}
		</label>
	);
}
