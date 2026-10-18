import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { type FormEvent, type Ref, useEffect, useRef } from "react";
import { EditorHeader } from "@/features/editor-header";
import { ConfettiSetting } from "@/features/settings/confetti-setting";
import { LinkSetting } from "@/features/settings/link-setting";
import { TextSetting } from "@/features/settings/text-setting";
import { ThemeSetting } from "@/features/settings/theme-setting";
import { Signage, type SignageHandle } from "@/features/signage";
import { confettiPalettes } from "@/features/signage/confetti";
import { useSaveScreen } from "@/hooks/use-save-screen";
import {
  savedScreenAtom,
  saveErrorAtom,
  screenConfigAtom,
} from "@/jotai/atoms";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/")({ component: HomeRoute });

function HomeRoute() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-svh items-center justify-center gap-5 p-[25px] text-center text-[36px] font-bold">
          QR Pop<span>✳</span>
        </div>
      }
    >
      <Home />
    </ClientOnly>
  );
}

function Home() {
  const stage = useRef<SignageHandle>(null);
  const saveScreen = useSaveScreen();
  const saveError = useAtomValue(saveErrorAtom);
  const screenId = useAtomValue(savedScreenAtom)?.id;

  useEffect(() => {
    if (!screenId) return;
    const source = new EventSource(`/api/events/${screenId}`);
    source.addEventListener("scan", () => stage.current?.celebrate());
    return () => source.close();
  }, [screenId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const displayWindow = window.open("about:blank", "_blank");
    if (!displayWindow) return;
    displayWindow.opener = null;
    try {
      const saved = await saveScreen();
      displayWindow.location.replace(`/screen/${saved.id}`);
    } catch (error) {
      displayWindow.close();
      throw error;
    }
  }

  return (
    <div className={cn("min-h-svh pt-6 px-5 bg-accent")}>
      <EditorHeader />
      {saveError && (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-300 px-5 text-sm text-destructive"
        >
          {saveError}
        </p>
      )}
      <main className="mx-auto max-w-300 mt-8">
        <div className="flex items-start gap-9">
          <EditorPreview ref={stage} screenId={screenId} />
          <form
            id="screen-editor"
            className="bg-background px-5 w-80"
            onSubmit={submit}
            noValidate
          >
            <LinkSetting />
            <TextSetting />
            <ThemeSetting />
            <ConfettiSetting
              onPreview={(palette) => stage.current?.celebrate(palette)}
            />
          </form>
        </div>
      </main>
    </div>
  );
}

function EditorPreview({
  ref,
  screenId,
}: {
  ref: Ref<SignageHandle>;
  screenId?: string;
}) {
  const config = useAtomValue(screenConfigAtom);
  return (
    <div className="grow min-w-0 aspect-[16/10]">
      <Signage
        ref={ref}
        config={{ ...config, confetti: confettiPalettes[config.confetti] }}
        value={
          screenId
            ? `${location.origin}/go/${screenId}`
            : config.url || "https://example.com"
        }
      />
    </div>
  );
}
