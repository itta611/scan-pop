import { handleApi } from "@/server/http.server";
import { recordScan } from "@/server/screens.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;
    const url = await recordScan(id);
    return new Response(null, {
      status: 302,
      headers: { Location: url, "Cache-Control": "no-store" },
    });
  });
}
