"use client";

import { useAsk, type AskMessage } from "@/components/ask/ask-provider";
import { SmartLink } from "@/components/smart-link";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { ArrowUp, Asterisk, RotateCcw, Square, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const firstName = DATA.name.split(" ")[0];

const SUGGESTIONS = [
  `What does ${firstName} do best?`,
  "Which case study shows the most AI work?",
  `How does ${firstName} work with engineers?`,
];

function Quote({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-md border-l-2 border-foreground/30 bg-muted/60 py-1.5 pl-2.5 pr-1.5 text-xs text-muted-foreground">
      <p className="line-clamp-3 flex-1 italic">“{text}”</p>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove highlighted text"
          className="rounded p-0.5 hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function Message({ message, pending }: { message: AskMessage; pending: boolean }) {
  if (message.role === "user") {
    return (
      <div className="ml-8 flex flex-col items-end gap-1.5">
        {message.quote && <Quote text={message.quote} />}
        <p className="whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          {message.content}
        </p>
      </div>
    );
  }

  if (!message.content && pending) {
    return (
      <div className="flex gap-1 py-2" aria-label="Thinking">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-pretty leading-relaxed dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-a:underline-offset-2",
        message.error && "text-destructive"
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <SmartLink href={href}>{children}</SmartLink> }}>
        {message.content}
      </Markdown>
    </div>
  );
}

/** Right-hand chat panel. Stays open across navigation since it lives in the root layout. */
export function AskPanel() {
  const { open, setOpen, quote, setQuote, messages, streaming, send, stop, reset } = useAsk();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // On touch screens focusing pops the keyboard over the panel before the visitor has seen it, so only focus with a mouse.
  useEffect(() => {
    if (open && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, [open, quote]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  // iOS doesn't resize the layout viewport for the keyboard or zoom; it pans the page, pushing a full-screen panel's
  // header and left edge out of view. On phones the panel tracks the visible area instead (see the sm: overrides below).
  const [viewport, setViewport] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  useEffect(() => {
    const visual = window.visualViewport;
    if (!open || !visual) return;
    const sync = () =>
      setViewport({ top: visual.offsetTop, left: visual.offsetLeft, width: visual.width, height: visual.height });
    sync();
    visual.addEventListener("resize", sync);
    visual.addEventListener("scroll", sync);
    return () => {
      visual.removeEventListener("resize", sync);
      visual.removeEventListener("scroll", sync);
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, viewport?.height]);

  const submit = (text: string) => {
    if (!text.trim() || streaming) return;
    send(text);
    setDraft("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit(draft);
    }
  };

  const lastId = messages[messages.length - 1]?.id;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          data-ask-panel
          role="dialog"
          aria-label={`Ask about ${firstName}`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          style={
            viewport
              ? ({
                  "--ask-top": `${viewport.top}px`,
                  "--ask-left": `${viewport.left}px`,
                  "--ask-width": `${viewport.width}px`,
                  "--ask-height": `${viewport.height}px`,
                } as CSSProperties)
              : undefined
          }
          className="fixed top-[var(--ask-top,0px)] left-[var(--ask-left,0px)] z-50 flex h-[var(--ask-height,100%)] w-[var(--ask-width,100%)] flex-col border-l bg-card shadow-[0_0_40px_-10px_rgba(0,0,0,0.25)] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-100"
        >
          <header className="flex items-center gap-2 border-b px-4 py-3">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Asterisk className="size-4" aria-hidden />
            </span>
            <h2 className="flex-1 text-sm font-semibold">Ask about {firstName}</h2>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                aria-label="New conversation"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-end gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Hi! I know {firstName}&apos;s work and case studies.</p>
                  <p className="text-sm text-muted-foreground">
                    Highlight any text on the page to ask about it, or start with one of these.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => submit(suggestion)}
                      className="rounded-full border bg-background px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((message) => (
                  <Message key={message.id} message={message} pending={streaming && message.id === lastId} />
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t p-3">
            <div className="flex flex-col gap-2 rounded-xl border bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
              {quote && <Quote text={quote} onRemove={() => setQuote(null)} />}
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={2000}
                  placeholder={quote ? "What would you like to know about this?" : "Ask a question…"}
                  className="field-sizing-content max-h-40 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1 text-base outline-none sm:text-sm placeholder:text-muted-foreground"
                />
                {streaming ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop"
                    className="flex size-8 flex-none items-center justify-center rounded-lg bg-primary text-primary-foreground cursor-pointer"
                  >
                    <Square className="size-3 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Send"
                    className="flex size-8 flex-none items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 cursor-pointer disabled:cursor-default"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
