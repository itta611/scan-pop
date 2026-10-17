import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { buttonClassName } from "../components/Button";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "QR Pop — スキャンに、小さなお祝いを。",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: () => (
		<div className="flex min-h-svh flex-col items-center justify-center gap-5 p-[25px] text-center [&>h1]:text-[23px] [&>p]:text-[13px] [&>p]:text-[#7a8778]">
			<h1>このページは見つかりませんでした。</h1>
			<a href="/" className={buttonClassName("primary")}>
				編集ページに戻る
			</a>
		</div>
	),
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="ja"
			className="bg-white font-app text-[#293d35] antialiased tabular-nums [font-synthesis:none] [-webkit-tap-highlight-color:transparent] selection:bg-[#d5e8d8] selection:text-[#254331] [&_h1]:text-balance [&_h2]:text-balance [&_p]:text-pretty [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button]:touch-manipulation [&_a]:touch-manipulation [&_:focus-visible]:outline-3 [&_:focus-visible]:outline-solid [&_:focus-visible]:outline-[#9bc6ae] [&_:focus-visible]:outline-offset-4 motion-reduce:[&_*]:transition-none!"
		>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
