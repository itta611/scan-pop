import {
  ClientOnly,
  createFileRoute,
  Link,
  notFound,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { buttonClassName } from "@/components/ui/button";
import { Signage, type SignageHandle } from "@/features/signage";
import type { PublishedScreen } from "@/schemas/screen";
import { getScreen } from "../server/screens";

export const Route = createFileRoute("/screen/$id")({
  loader: async ({ params }) => {
    try {
      return await getScreen({ data: params.id });
    } catch (error) {
      if (error instanceof Error && error.message.includes("見つかりません"))
        throw notFound();
      throw error;
    }
  },
  component: DisplayPage,
  errorComponent: () => (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 p-[25px] text-center [&>h1]:text-[23px] [&>p]:text-[13px]">
      <h1>表示ページを読み込めませんでした。</h1>
      <p>接続を確認して、もう一度お試しください。</p>
      <Link to="/" className={buttonClassName("primary")}>
        編集ページに戻る
      </Link>
    </div>
  ),
});

function DisplayPage() {
  const screen = Route.useLoaderData();
  return (
    <ClientOnly fallback={<div className="fixed inset-0 bg-white" />}>
      <Display initialScreen={screen} />
    </ClientOnly>
  );
}

function Display({ initialScreen }: { initialScreen: PublishedScreen }) {
  const [screen, setScreen] = useState(initialScreen);
  const stage = useRef<SignageHandle>(null);

  useEffect(() => {
    const source = new EventSource(`/api/events/${initialScreen.id}`);
    source.addEventListener("ready", (event) =>
      setScreen(JSON.parse(event.data).screen),
    );
    source.addEventListener("scan", () => stage.current?.celebrate());
    source.addEventListener("config", (event) =>
      setScreen(JSON.parse(event.data)),
    );
    return () => source.close();
  }, [initialScreen.id]);

  return (
    <main className="fixed inset-0">
      <Signage
        ref={stage}
        config={screen}
        value={`${location.origin}/go/${screen.id}`}
      />
    </main>
  );
}
