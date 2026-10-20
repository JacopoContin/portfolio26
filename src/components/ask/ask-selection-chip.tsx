"use client";

import { useAsk } from "@/components/ask/ask-provider";
import { cn } from "@/lib/utils";
import { Asterisk } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MIN_CHARS = 3;
const CHIP_GAP = 8;
/** Roughly the chip's width, so it never hangs off the right edge on narrow screens. */
const CHIP_WIDTH = 132;

/** Below the selection on touch screens, where the browser's own copy menu takes the space above it. */
type Anchor = { text: string; top: number; left: number; below: boolean };

/** Selections inside these never offer the chip: the panel itself and form fields. */
const IGNORE_SELECTOR = "[data-ask-panel], input, textarea, [contenteditable='true']";

function readSelection(): Anchor | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const text = selection.toString().replace(/\s+/g, " ").trim();
  if (text.length < MIN_CHARS) return null;

  const node = selection.anchorNode;
  const element = node instanceof Element ? node : node?.parentElement;
  if (element?.closest(IGNORE_SELECTOR)) return null;

  // Above the first line of the selection, so the chip sits where reading started; below the last line on touch screens.
  const range = selection.getRangeAt(0);
  const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
  const rect = rects[0] ?? range.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;

  const below = window.matchMedia("(pointer: coarse)").matches;
  // Extra clearance clears the selection handles touch browsers draw under the last line.
  const top = below ? (rects.at(-1) ?? rect).bottom + window.scrollY + CHIP_GAP * 3 : rect.top + window.scrollY - CHIP_GAP;

  return { text, below, top, left: window.scrollX + Math.max(8, Math.min(rect.left, window.innerWidth - CHIP_WIDTH - 8)) };
}

/** Floating "Ask about this" button that follows any text the visitor highlights. */
export function AskSelectionChip() {
  const { askAbout } = useAsk();
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  useEffect(() => {
    let frame = 0;
    // Wait for the pointer to be released so the chip doesn't chase a drag in progress.
    let pointerDown = false;

    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setAnchor(pointerDown ? null : readSelection()));
    };
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element | null)?.closest?.("[data-ask-chip]")) return;
      pointerDown = true;
    };
    const onPointerUp = () => {
      pointerDown = false;
      refresh();
    };

    document.addEventListener("selectionchange", refresh);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", refresh);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", refresh);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {anchor && (
        <motion.div
          key="ask-chip"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ top: anchor.top, left: anchor.left, transformOrigin: anchor.below ? "top left" : "bottom left" }}
          className="absolute z-40"
        >
          <button
            type="button"
            data-ask-chip
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md bg-ask px-2.5 py-1.5 text-xs font-medium text-ask-foreground shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-ask/90 cursor-pointer",
              !anchor.below && "-translate-y-full"
            )}
            // Keep the highlight alive: a normal mousedown would clear the selection first.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              askAbout(anchor.text);
              window.getSelection()?.removeAllRanges();
              setAnchor(null);
            }}
          >
            <Asterisk className="size-3.5" aria-hidden />
            Ask about this
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
