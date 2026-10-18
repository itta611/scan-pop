import type { LabelHTMLAttributes, ReactNode } from "react";

export function SettingField({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<fieldset className="pt-4 min-w-0 border-b pb-5 last:border-b-0">
			<legend className="float-left mb-3.5 flex w-full items-center gap-2 text-xs font-semibold max-[760px]:text-[12px] [&_svg]:size-4 [&_svg]:text-[#7f917e]">
				{title}
			</legend>
			{children}
		</fieldset>
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
			className="mt-[13px] mb-2 flex clear-both items-center gap-1.5 text-[10px] text-[#657466] max-[760px]:text-[12px]"
			{...props}
		>
			{children}
		</label>
	);
}
