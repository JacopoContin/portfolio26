"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type AskMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Passage the visitor highlighted when asking; shown above their message. */
  quote?: string;
  error?: boolean;
};

type AskContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Highlighted text waiting to be attached to the next question. */
  quote: string | null;
  setQuote: (quote: string | null) => void;
  askAbout: (quote: string) => void;
  messages: AskMessage[];
  streaming: boolean;
  send: (content: string) => void;
  stop: () => void;
  reset: () => void;
};

const AskContext = createContext<AskContextValue | null>(null);

export function useAsk() {
  const context = useContext(AskContext);
  if (!context) throw new Error("useAsk must be used within AskProvider");
  return context;
}

const newId = () => Math.random().toString(36).slice(2);

export function AskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // The page makes room for the panel through CSS keyed on this attribute (see globals.css).
  useEffect(() => {
    document.documentElement.toggleAttribute("data-ask-open", open);
  }, [open]);

  const askAbout = useCallback((text: string) => {
    setQuote(text);
    setOpen(true);
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setQuote(null);
  }, []);

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || streaming) return;

      const userMessage: AskMessage = { id: newId(), role: "user", content: text, quote: quote ?? undefined };
      const assistantId = newId();
      const history = [...messages.filter((m) => !m.error), userMessage];

      setMessages([...messages, userMessage, { id: assistantId, role: "assistant", content: "" }]);
      setQuote(null);
      setStreaming(true);

      const update = (patch: Partial<AskMessage> | ((m: AskMessage) => Partial<AskMessage>)) =>
        setMessages((current) =>
          current.map((m) => (m.id === assistantId ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m))
        );

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            quote: userMessage.quote,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const reason = await response.text().catch(() => "");
          update({ content: reason || "Something went wrong. Try again in a moment.", error: true });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const delta = decoder.decode(value, { stream: true });
          update((m) => ({ content: m.content + delta }));
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          update({ content: "Couldn't reach the assistant. Check your connection and try again.", error: true });
        }
      } finally {
        // A stopped answer with no text yet leaves nothing to show; an empty finished one gets a retry hint.
        setMessages((current) =>
          controller.signal.aborted
            ? current.filter((m) => m.id !== assistantId || m.content)
            : current.map((m) =>
                m.id === assistantId && !m.content ? { ...m, content: "No answer came back. Try asking again.", error: true } : m
              )
        );
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, quote, streaming]
  );

  const value = useMemo(
    () => ({ open, setOpen, quote, setQuote, askAbout, messages, streaming, send, stop, reset }),
    [open, quote, askAbout, messages, streaming, send, stop, reset]
  );

  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}
