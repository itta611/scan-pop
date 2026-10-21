import { useAtomValue, useStore } from "jotai";
import { ArrowUpRight, Check, Copy, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "#/components/logo";
import { Button } from "@/components/ui/button";
import {
  hasDestinationAtom,
  savedScreenAtom,
  savingScreenAtom,
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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = store.sub(savingScreenAtom, () => {
      if (!store.get(savingScreenAtom)) return;
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
      disabled={!hasDestination}
    >
      {justSaved ? (
        <Check className="max-md:hidden" />
      ) : (
        <Monitor className="max-md:hidden" />
      )}
      <span className="md:hidden">{justSaved ? "保存しました" : "開く"}</span>
      <span className="hidden md:inline">
        {justSaved ? "保存しました" : "表示ページを開く"}
      </span>
      {!justSaved && <ArrowUpRight />}
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
        <span
          className={cn(
            "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
            copied
              ? "scale-25 opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-0",
          )}
        >
          <Copy />
        </span>
        <span
          className={cn(
            "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
            copied
              ? "scale-100 opacity-100 blur-0"
              : "scale-25 opacity-0 blur-[4px]",
          )}
        >
          <Check />
        </span>
      </span>
      <span
        aria-hidden="true"
        className="hidden text-center md:grid *:col-start-1 *:row-start-1"
      >
        <span
          className={cn(
            "transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-none",
            copied ? "opacity-0 blur-[4px]" : "opacity-100 blur-0",
          )}
        >
          表示URLをコピー
        </span>
        <span
          className={cn(
            "transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-none",
            copied ? "opacity-100 blur-0" : "opacity-0 blur-[4px]",
          )}
        >
          コピーしました
        </span>
      </span>
    </Button>
  );
}
