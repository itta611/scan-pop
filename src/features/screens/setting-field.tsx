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
		<fieldset className="mb-[21px] min-w-0 border-0 border-b border-[#eff1eb] p-0 pb-[22px] last-of-type:mb-0 last-of-type:border-b-0 last-of-type:pb-4 max-[760px]:last-of-type:pb-[22px]">
			<legend className="float-left mb-[15px] flex w-full items-center gap-[7px] text-[11px] font-semibold max-[760px]:text-[12px] [&_svg]:size-[13px] [&_svg]:text-[#7f917e]">
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
