import type { LabelHTMLAttributes, ReactNode } from "react";

export function SettingField({
	title,
	icon,
	children,
}: {
	title: string;
	icon?: ReactNode;
	children: ReactNode;
}) {
	return (
		<fieldset className="mb-4 min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-5 last-of-type:mb-0 last-of-type:border-b-0 last-of-type:pb-4">
			<legend className="float-left mb-3.5 flex w-full items-center gap-2 text-xs font-semibold max-[760px]:text-[12px] [&_svg]:size-4 [&_svg]:text-[#7f917e]">
				{icon}
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
