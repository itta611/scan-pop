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

export function EditorHeader() {
  return (
    <header className="bg-background w-full flex h-17 items-center gap-8 px-5 max-w-300 mx-auto">
      <Logo className="ml-1" />
      <div className="ml-auto flex items-center gap-3 max-[760px]:gap-1">
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
      {justSaved ? <Check /> : <Monitor />}
      <span>{justSaved ? "保存しました" : "表示ページを開く"}</span>
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
      {copied ? <Check /> : <Copy />}
      <span className="max-[760px]:hidden">
        {copied ? "コピーしました" : "表示URLをコピー"}
      </span>
    </Button>
  );
}
