import { useAtomValue, useStore } from "jotai";
import { ArrowUpRight, Check, Copy, LoaderCircle, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "#/components/logo";
import { Button } from "@/components/ui/button";
import {
  hasDestinationAtom,
  requestedScreenConfigAtom,
  savedScreenAtom,
  waitingToSaveAtom,
} from "@/jotai/atoms";
import { cn } from "@/lib/utils";

export function EditorHeader() {
  return (
    <header className="bg-background w-full flex h-17 items-center gap-2 md:px-5 px-4 md:gap-8 max-w-300 mx-auto">
      <Logo className="md:ml-1" />
      <div className="ml-auto flex items-center gap-1 md:gap-3">
        <CopyDisplayLinkButton />
        <OpenDisplayButton />
      </div>
    </header>
  );
}

function OpenDisplayButton() {
  const store = useStore();
  const [justSaved, setJustSaved] = useState(false);
  const hasDestination = useAtomValue(hasDestinationAtom);
  const waitingToSave = useAtomValue(waitingToSaveAtom);
  const status = waitingToSave ? "saving" : justSaved ? "saved" : "idle";
  const labels = {
    idle: "表示ページを開く",
    saving: "保存しています...",
    saved: "保存しました",
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = store.sub(requestedScreenConfigAtom, () => {
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
      disabled={!hasDestination}
    >
      <span aria-hidden="true" className="grid *:col-start-1 *:row-start-1">
        {(["idle", "saving", "saved"] as const).map((state) => (
          <span
            key={state}
            className="inline-flex items-center justify-center gap-2"
          >
            <span
              className={cn(
                "max-md:hidden transition-[opacity,filter,scale] duration-100 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                status === state
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-25 opacity-0 blur-[4px]",
              )}
            >
              {state === "saved" ? (
                <Check />
              ) : state === "saving" ? (
                <LoaderCircle className="motion-safe:animate-spin" />
              ) : (
                <Monitor />
              )}
            </span>
            <span className={status === state ? "opacity-100" : "opacity-0"}>
              {state === "idle" ? (
                <>
                  <span className="md:hidden">開く</span>
                  <span className="hidden md:inline">{labels[state]}</span>
                </>
              ) : (
                labels[state]
              )}
            </span>
            {state === "idle" && (
              <span
                className={cn(
                  "transition-[opacity,filter,scale] duration-100 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                  status === state
                    ? "scale-100 opacity-100 blur-0"
                    : "scale-25 opacity-0 blur-[4px]",
                )}
              >
                <ArrowUpRight />
              </span>
            )}
          </span>
        ))}
      </span>
    </Button>
  );
}

function CopyDisplayLinkButton() {
  const saved = useAtomValue(savedScreenAtom);
  const [copied, setCopied] = useState(false);
  async function copyDisplayLink(screenId: string) {
    await navigator.clipboard.writeText(
      `${location.origin}/screen/${screenId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button
      variant="ghost"
      aria-label={copied ? "表示URLをコピーしました" : "表示URLをコピー"}
      disabled={!saved}
      onClick={saved ? () => copyDisplayLink(saved.id) : undefined}
    >
      <span aria-hidden="true" className="grid *:col-start-1 *:row-start-1">
        {[false, true].map((isCopied) => (
          <span
            key={isCopied ? "copied" : "idle"}
            className="inline-flex items-center justify-center gap-2"
          >
            <span
              className={cn(
                "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                copied === isCopied
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-25 opacity-0 blur-[4px]",
              )}
            >
              {isCopied ? <Check /> : <Copy />}
            </span>
            <span
              className={cn(
                "max-md:hidden",
                copied === isCopied ? "opacity-100" : "opacity-0",
              )}
            >
              {isCopied ? "コピーしました" : "表示URLをコピー"}
            </span>
          </span>
        ))}
      </span>
    </Button>
  );
}
