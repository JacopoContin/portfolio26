import type { ReactNode } from "react";
import { Info, Lightbulb, type LucideIcon, MessageCircleQuestion, Zap } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "TL;DR": Zap,
  Question: MessageCircleQuestion,
  Principle: Lightbulb,
};

/** A boxed summary block for case studies, e.g. a TL;DR above the fold. */
export function Callout({ label, children }: { label: string; children: ReactNode }) {
  const Icon = icons[label] ?? Info;

  return (
    <aside className="my-8 flex flex-col gap-4 rounded-xl bg-muted p-6">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </span>
      <div className="flex flex-col gap-6 *:m-0">{children}</div>
    </aside>
  );
}
