import { useAtomValue, useStore } from "jotai";
import { ArrowUpRight, Check, Copy, LoaderCircle, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "#/components/logo";
import { Button } from "@/components/ui/button";
import {
  isScreenConfigValidAtom,
  requestedScreenConfigAtom,
  savedScreenAtom,
  screenConfigAtom,
} from "@/jotai/atoms";
import { cn } from "@/lib/utils";

export function EditorHeader() {
  const isConfigValid = useAtomValue(isScreenConfigValidAtom);
  return (
    <header className="bg-background w-full flex h-17 items-center gap-2 md:px-5 px-4 md:gap-8 max-w-300 mx-auto">
      <Logo className="md:ml-1" />
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <CopyDisplayLinkButton isConfigValid={isConfigValid} />
        <OpenDisplayButton isConfigValid={isConfigValid} />
      </div>
    </header>
  );
}

function OpenDisplayButton({ isConfigValid }: { isConfigValid: boolean }) {
  const store = useStore();
  const [justSaved, setJustSaved] = useState(false);
  const config = useAtomValue(screenConfigAtom);
  const requestedConfig = useAtomValue(requestedScreenConfigAtom);
  const waitingToSave = isConfigValid && config !== requestedConfig;
  const status = waitingToSave
    ? "saving"
    : justSaved && isConfigValid
      ? "saved"
      : "idle";
  const labels = {
    idle: "表示ページを開く",
    saving: "保存しています...",
    saved: "保存しました",
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let initialized = store.get(savedScreenAtom) !== undefined;
    const unsubscribe = store.sub(savedScreenAtom, () => {
      if (!initialized) {
        initialized = true;
        return;
      }
      setJustSaved(true);
      clearTimeout(timer);
      timer = setTimeout(() => setJustSaved(false), 1000);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [store]);
  return (
    <Button
      variant="primary"
      type="submit"
      form="screen-editor"
      aria-label={labels[status]}
      disabled={!isConfigValid}
    >
      <span aria-hidden="true" className="grid *:col-start-1 *:row-start-1">
        {(["idle", "saving", "saved"] as const).map((state) => (
          <span
            key={state}
            className={cn(
              "inline-flex items-center justify-center gap-2 transition-[opacity,filter,scale] duration-100 motion-reduce:transition-none",
              status === state
                ? "ease-[cubic-bezier(0.2,0,0,1)]"
                : "scale-70 ease-in",
              status !== state
                ? "opacity-0"
                : state === "idle"
                  ? "opacity-100"
                  : "opacity-70",
            )}
          >
            {state === "saved" ? (
              <Check className="max-md:hidden" />
            ) : state === "saving" ? (
              <LoaderCircle className="max-md:hidden motion-safe:animate-spin" />
            ) : (
              <Monitor className="max-md:hidden" />
            )}
            <span>{labels[state]}</span>
            {state === "idle" && <ArrowUpRight />}
          </span>
        ))}
      </span>
    </Button>
  );
}

function CopyDisplayLinkButton({ isConfigValid }: { isConfigValid: boolean }) {
  const saved = useAtomValue(savedScreenAtom);
  const [copied, setCopied] = useState(false);
  async function copyDisplayLink(screenId: string) {
    await navigator.clipboard.writeText(
      `${location.origin}/screen/${screenId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }
  return (
    <Button
      variant="ghost"
      aria-label={copied ? "表示URLをコピーしました" : "表示URLをコピー"}
      disabled={!saved || !isConfigValid}
      onClick={saved ? () => copyDisplayLink(saved.id) : undefined}
    >
      <span aria-hidden="true" className="grid *:col-start-1 *:row-start-1">
        {[false, true].map((isCopied) => (
          <span
            key={isCopied ? "copied" : "idle"}
            className={cn(
              "inline-flex items-center justify-center gap-2 transition-[opacity,filter,scale] duration-100 motion-reduce:transition-none",
              copied === isCopied
                ? "scale-100 ease-[cubic-bezier(0.2,0,0,1)]"
                : "scale-70 ease-in",
              copied !== isCopied
                ? "opacity-0"
                : isCopied
                  ? "opacity-70"
                  : "opacity-100",
            )}
          >
            {isCopied ? <Check /> : <Copy />}
            <span className="max-md:hidden">
              {isCopied ? "コピーしました" : "表示URLをコピー"}
            </span>
          </span>
        ))}
      </span>
    </Button>
  );
}
