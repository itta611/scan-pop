import { screenIdentitySchema, screenSchema } from "@/schemas/screen";
import { handleApi } from "@/server/http.server";
import { saveScreen } from "@/server/screens.server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;

    const identity = screenIdentitySchema.parse({
      id,
      editToken: request.headers.get("X-Edit-Token"),
    });
    const config = screenSchema.parse(await request.json());
    return Response.json(
      await saveScreen(identity.id, identity.editToken, config),
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
