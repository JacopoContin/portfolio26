import type { ReactNode } from "react";

/** A boxed summary block for case studies, e.g. a TL;DR above the fold. */
export function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside className="my-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
        {label}
      </span>
      <div className="flex flex-col gap-6 *:m-0">{children}</div>
    </aside>
  );
}
