import { createFileRoute } from "@tanstack/react-router";
import { handleApi } from "../server/http.server";
import { publicScreen, recordScan } from "../server/screens.server";

export const Route = createFileRoute("/go/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        handleApi(async () => {
          const screen = await publicScreen(params.id);
          if (
            request.headers.get("purpose") !== "prefetch" &&
            request.headers.get("sec-purpose") !== "prefetch"
          ) {
            await recordScan(params.id);
          }
          return new Response(null, {
            status: 302,
            headers: { Location: screen.url, "Cache-Control": "no-store" },
          });
        }),
    },
  },
});
