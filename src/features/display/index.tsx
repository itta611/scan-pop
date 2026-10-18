"use client";
import { useEffect, useRef, useState } from "react";
import { Signage, type SignageHandle } from "@/features/signage";
import type { PublishedScreen } from "@/schemas/screen";
export default function Display({
  initialScreen,
}: {
  initialScreen: PublishedScreen;
}) {
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
