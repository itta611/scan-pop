import { useAtomValue, useStore } from "jotai";
import { ArrowUpRight, Check, Copy, LoaderCircle, Monitor } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import Logo from "#/components/logo";
import { Button } from "@/components/ui/button";
import {
  isSavingScreenAtom,
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
  const isSaving = useAtomValue(isSavingScreenAtom);
  const saving = isConfigValid && (config !== requestedConfig || isSaving);
  const status = saving
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
      <span
        aria-hidden="true"
        className="grid overflow-hidden *:col-start-1 *:row-start-1"
      >
        {(["idle", "saving", "saved"] as const).map((state) => (
          <ButtonLabel
            key={state}
            active={status === state}
            dimmed={state !== "idle"}
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
          </ButtonLabel>
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
      <span
        aria-hidden="true"
        className="grid overflow-hidden *:col-start-1 *:row-start-1"
      >
        {[false, true].map((isCopied) => (
          <ButtonLabel
            key={isCopied ? "copied" : "idle"}
            active={copied === isCopied}
            dimmed={isCopied}
          >
            {isCopied ? <Check /> : <Copy />}
            <span className="max-md:hidden">
              {isCopied ? "コピーしました" : "表示URLをコピー"}
            </span>
          </ButtonLabel>
        ))}
      </span>
    </Button>
  );
}

function ButtonLabel({
  active,
  dimmed,
  children,
}: {
  active: boolean;
  dimmed: boolean;
  children: ReactNode;
}) {
  const [transition, setTransition] = useState({ active, exiting: false });
  if (transition.active !== active) {
    setTransition({ active, exiting: !active });
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-2",
        active || transition.exiting
          ? "transition-[opacity,translate] duration-100 motion-reduce:transition-none"
          : "transition-none",
        active
          ? "translate-y-0 ease-[cubic-bezier(0.2,0,0,1)]"
          : transition.exiting
            ? "-translate-y-2 opacity-0 ease-in"
            : "translate-y-2 opacity-0",
        active && (dimmed ? "opacity-70" : "opacity-100"),
      )}
      onTransitionEnd={() => {
        if (!active) setTransition({ active: false, exiting: false });
      }}
    >
      {children}
    </span>
  );
}
