"use client";
import { Provider, useAtomValue } from "jotai";
import { type FormEvent, type Ref, useEffect, useRef, useState } from "react";
import { EditorFooter } from "@/features/editor-footer";
import { EditorHeader } from "@/features/editor-header";
import { BackgroundSetting } from "@/features/settings/background-setting";
import { ConfettiSetting } from "@/features/settings/confetti-setting";
import { LinkSetting } from "@/features/settings/link-setting";
import { TextSetting } from "@/features/settings/text-setting";
import { Signage, type SignageHandle } from "@/features/signage";
import { confettiPalettes } from "@/features/signage/confetti";
import { useAutosaveScreen } from "@/hooks/use-autosave-screen";
import { useSaveScreen } from "@/hooks/use-save-screen";
import {
  editorIdentityAtom,
  savedScreenAtom,
  screenConfigAtom,
} from "@/jotai/atoms";

export default function Editor() {
  return (
    <Provider>
      <EditorSession />
    </Provider>
  );
}

function EditorSession() {
  useAutosaveScreen();
  const stage = useRef<SignageHandle>(null);
  const saveScreen = useSaveScreen();
  const { id: screenId } = useAtomValue(editorIdentityAtom);
  const created = useAtomValue(savedScreenAtom) !== undefined;
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!created) return;
    const source = new EventSource(`/api/events/${screenId}`);
    source.addEventListener("ready", () => setQrReady(true));
    source.addEventListener("scan", () => stage.current?.celebrate());
    return () => source.close();
  }, [created, screenId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const displayWindow = window.open("about:blank", "_blank");
    if (!displayWindow) return;
    displayWindow.opener = null;
    try {
      const saved = await saveScreen();
      displayWindow.location.replace(`/screen/${saved.id}`);
    } catch {
      displayWindow.close();
    }
  }

  return (
    <div className="min-h-svh pt-3 px-3 bg-accent flex flex-col md:h-svh md:pt-6 md:px-5">
      <EditorHeader />
      <main className="mx-auto w-full flex shrink flex-col gap-5 max-w-300 mt-5 grow md:flex-1 md:min-h-0 md:flex-row md:gap-9 md:mt-8">
        <EditorPreview ref={stage} screenId={screenId} qrReady={qrReady} />
        <form
          id="screen-editor"
          className="bg-background px-5 w-full shrink-0 md:w-80 md:overflow-y-auto"
          onSubmit={submit}
          noValidate
        >
          <LinkSetting />
          <TextSetting />
          <BackgroundSetting />
          <ConfettiSetting
            onPreview={(palette) => stage.current?.celebrate(palette)}
          />
        </form>
      </main>
      <EditorFooter />
    </div>
  );
}

function EditorPreview({
  ref,
  screenId,
  qrReady,
}: {
  ref: Ref<SignageHandle>;
  screenId: string;
  qrReady: boolean;
}) {
  const config = useAtomValue(screenConfigAtom);
  return (
    <div className="h-[60svh] min-h-80 w-full min-w-0 md:h-auto md:min-h-0 md:w-auto md:grow">
      <Signage
        ref={ref}
        config={{ ...config, confetti: confettiPalettes[config.confetti] }}
        value={qrReady ? `${location.origin}/go/${screenId}` : undefined}
      />
    </div>
  );
}
