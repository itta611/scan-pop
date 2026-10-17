import type {
	InputHTMLAttributes,
	LabelHTMLAttributes,
	ReactNode,
	TextareaHTMLAttributes,
} from "react";

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

export function SettingInput(props: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className="w-full rounded-md border border-[#dfe5db] bg-[#fdfefc] px-[11px] py-2.5 text-[11px] leading-[1.6] text-[#364b3c] transition-[border-color,box-shadow] duration-160 placeholder:text-[#aab4a5] focus:border-[#8ba88c] focus:shadow-[0_0_0_3px_#cbdcc938] focus:outline-none max-[760px]:text-[16px]"
			{...props}
		/>
	);
}

export function SettingTextarea(
	props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
	return (
		<textarea
			className="w-full rounded-md border border-[#dfe5db] bg-[#fdfefc] px-[11px] py-2.5 text-[11px] leading-[1.6] text-[#364b3c] transition-[border-color,box-shadow] duration-160 placeholder:text-[#aab4a5] focus:border-[#8ba88c] focus:shadow-[0_0_0_3px_#cbdcc938] focus:outline-none max-[760px]:text-[16px] min-h-16 max-h-[170px] resize-y"
			{...props}
		/>
	);
}
