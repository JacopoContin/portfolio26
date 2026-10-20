"use client";

import { useAsk } from "@/components/ask/ask-provider";
import { DockIcon } from "@/components/magicui/dock";
import { Asterisk } from "lucide-react";
import type { ComponentProps } from "react";

/** Dock entry point to the chat panel, for visitors who don't highlight text. */
export function AskDockButton(props: ComponentProps<typeof DockIcon>) {
  const { open, setOpen } = useAsk();
  return (
    <DockIcon
      {...props}
      role="button"
      tabIndex={0}
      aria-label="Ask AI"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(!open);
        }
      }}
      className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors"
    >
      <Asterisk className="size-full" />
    </DockIcon>
  );
}
