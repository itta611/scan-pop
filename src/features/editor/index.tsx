"use client";
import { Provider, useAtomValue } from "jotai";
import { type FormEvent, type Ref, useEffect, useRef, useState } from "react";
import { EditorHeader } from "@/features/editor-header";
import { ConfettiSetting } from "@/features/settings/confetti-setting";
import { LinkSetting } from "@/features/settings/link-setting";
import { TextSetting } from "@/features/settings/text-setting";
import { ThemeSetting } from "@/features/settings/theme-setting";
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
    <div className="h-svh pt-6 px-5 bg-accent flex flex-col">
      <EditorHeader />
      <main className="mx-auto w-full flex gap-9 max-w-300 mt-8 grow pb-8">
        <EditorPreview ref={stage} screenId={screenId} qrReady={qrReady} />
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
      </main>
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
    <div className="grow min-w-0">
      <Signage
        ref={ref}
        config={{ ...config, confetti: confettiPalettes[config.confetti] }}
        value={qrReady ? `${location.origin}/go/${screenId}` : undefined}
      />
    </div>
  );
}
