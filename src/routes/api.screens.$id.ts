import { createFileRoute } from "@tanstack/react-router";
import { screenSchema } from "../features/screens/schema";
import { handleApi } from "../server/http.server";
import { updateScreen } from "../server/screens.server";

export const Route = createFileRoute("/api/screens/$id")({
	server: {
		handlers: {
			PUT: ({ request, params }) =>
				handleApi(async () => {
					const config = screenSchema.parse(await request.json());
					return Response.json(
						await updateScreen(
							params.id,
							request.headers.get("X-Edit-Token"),
							config,
						),
						{ headers: { "Cache-Control": "no-store" } },
					);
				}),
		},
	},
});
