import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Editor } from "../features/screens/Editor";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<ClientOnly
			fallback={
				<div className="loading-screen">
					QR Pop<span>✳</span>
				</div>
			}
		>
			<Editor />
		</ClientOnly>
	);
}
