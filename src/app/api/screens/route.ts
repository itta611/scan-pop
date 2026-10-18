import { screenSchema } from "@/schemas/screen";
import { handleApi } from "@/server/http.server";
import { createScreen } from "@/server/screens.server";

export async function POST(request: Request) {
  return handleApi(async () => {
    const config = screenSchema.parse(await request.json());
    return Response.json(await createScreen(config), {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  });
}
