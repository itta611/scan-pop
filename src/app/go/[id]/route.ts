import { handleApi } from "@/server/http.server";
import { publicScreen, recordScan } from "@/server/screens.server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;

    const screen = await publicScreen(id);
    if (
      request.headers.get("purpose") !== "prefetch" &&
      request.headers.get("sec-purpose") !== "prefetch"
    ) {
      await recordScan(id);
    }
    return new Response(null, {
      status: 302,
      headers: { Location: screen.url, "Cache-Control": "no-store" },
    });
  });
}
