import { createFileRoute } from "@tanstack/react-router";
import { handleApi } from "../server/http.server";
import { publicScreen, recordScan } from "../server/screens.server";

export const Route = createFileRoute("/go/$screenId")({
	server: {
		handlers: {
			GET: ({ request, params }) =>
				handleApi(async () => {
					const screen = await publicScreen(params.screenId);
					if (
						request.headers.get("purpose") !== "prefetch" &&
						request.headers.get("sec-purpose") !== "prefetch"
					) {
						await recordScan(params.screenId);
					}
					return new Response(null, {
						status: 302,
						headers: { Location: screen.url, "Cache-Control": "no-store" },
					});
				}),
		},
	},
});
