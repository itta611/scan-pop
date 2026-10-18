import { buttonClassName } from "../components/Button";
import {
	ClientOnly,
	createFileRoute,
	Link,
	notFound,
} from "@tanstack/react-router";
import { Display } from "../features/screens/Display";
import { getScreen } from "../server/screens";

export const Route = createFileRoute("/screen/$screenId")({
	loader: async ({ params }) => {
		try {
			return await getScreen({ data: params.screenId });
		} catch (error) {
			if (error instanceof Error && error.message.includes("見つかりません"))
				throw notFound();
			throw error;
		}
	},
	component: DisplayPage,
	errorComponent: () => (
		<div className="flex min-h-svh flex-col items-center justify-center gap-5 p-[25px] text-center [&>h1]:text-[23px] [&>p]:text-[13px] [&>p]:text-[#7a8778]">
			<h1>表示ページを読み込めませんでした。</h1>
			<p>接続を確認して、もう一度お試しください。</p>
			<Link to="/" className={buttonClassName("primary")}>
				編集ページに戻る
			</Link>
		</div>
	),
});

function DisplayPage() {
	const screen = Route.useLoaderData();
	return (
		<ClientOnly fallback={<div className="fixed inset-0 bg-white" />}>
			<Display initialScreen={screen} />
		</ClientOnly>
	);
}
