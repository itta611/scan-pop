import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { type FormEvent, type Ref, useRef } from "react";
import { confettiPalettes } from "@/constants/confetti";
import { EditorHeader } from "@/features/editor-header";
import {
  ConfettiSetting,
  LinkSetting,
  TextSetting,
  ThemeSetting,
} from "@/features/settings";
import { Signage, type SignageHandle } from "@/features/signage";
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
          <EditorPreview ref={stage} />
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

function EditorPreview({ ref }: { ref: Ref<SignageHandle> }) {
  const config = useAtomValue(screenConfigAtom);
  const saved = useAtomValue(savedScreenAtom);
  const scanUrl = saved
    ? `${location.origin}/go/${saved.id}`
    : config.url || "https://example.com";
  return (
    <div className="grow min-w-0">
      <div className="rounded-2xl bg-white p-2 shadow-[0_0_0_1px_#293d3514,0_10px_28px_-16px_#293d3528] max-[760px]:rounded-[13px] max-[760px]:p-1.5">
        <Signage
          ref={ref}
          config={{ ...config, confetti: confettiPalettes[config.confetti] }}
          value={scanUrl}
          preview
        />
      </div>
    </div>
  );
}
