import { notFound } from "next/navigation";
import type { PublishedScreen } from "@/schemas/screen";
import { HttpError } from "@/server/http.server";
import { publicScreen } from "@/server/screens.server";
import { Display } from "./display";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let screen: PublishedScreen;
  try {
    screen = await publicScreen(id);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
  return <Display initialScreen={screen} />;
}
