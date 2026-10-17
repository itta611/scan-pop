import { createFileRoute } from "@tanstack/react-router";
import { screenSchema } from "../features/screens/schema";
import { handleApi } from "../server/http.server";
import { createScreen } from "../server/screens.server";

export const Route = createFileRoute("/api/screens")({
	server: {
		handlers: {
			POST: ({ request }) =>
				handleApi(async () => {
					const config = screenSchema.parse(await request.json());
					return Response.json(await createScreen(config), {
						status: 201,
						headers: { "Cache-Control": "no-store" },
					});
				}),
		},
	},
});
