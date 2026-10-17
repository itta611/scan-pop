import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Editor } from "../features/screens/Editor";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<ClientOnly
			fallback={
				<div className="flex min-h-svh items-center justify-center gap-5 p-[25px] text-center text-[36px] font-bold [&>span]:text-[#cc805c]">
					QR Pop<span>✳</span>
				</div>
			}
		>
			<Editor />
		</ClientOnly>
	);
}
