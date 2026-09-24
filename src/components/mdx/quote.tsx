import type { ReactNode } from "react";

/** A pull quote from research, with who said it. */
export function Quote({ by, children }: { by: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-8 flex flex-col gap-3">
      <blockquote className="text-lg leading-relaxed font-medium text-balance text-foreground">
        {children}
      </blockquote>
      <figcaption className="text-sm text-muted-foreground">{by}</figcaption>
    </figure>
  );
}
