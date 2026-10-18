import { HttpError, handleApi } from "@/server/http.server";
import { scanStream } from "@/server/scan-stream.server";
import { publicScreen } from "@/server/screens.server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApi(async () => {
    const { id } = await params;

    const lastId = request.headers.get("Last-Event-ID");
    if (lastId && !/^\d{1,20}-\d{1,20}$/.test(lastId))
      throw new HttpError(400, "Invalid event ID");
    const screen = await publicScreen(id);
    return scanStream(screen, lastId, request.signal);
  });
}
