import { screenSchema } from "@/schemas/screen";
import { handleApi } from "@/server/http.server";
import { updateScreen } from "@/server/screens.server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;

    const config = screenSchema.parse(await request.json());
    return Response.json(
      await updateScreen(id, request.headers.get("X-Edit-Token"), config),
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
