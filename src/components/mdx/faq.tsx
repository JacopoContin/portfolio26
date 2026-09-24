"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/** Collapsible questions and answers at the end of a case study. */
export function Faq({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6">
      <Accordion type="multiple">{children}</Accordion>
    </div>
  );
}

export function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger>
        <span className="text-base text-foreground">{question}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden />
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-3 text-base leading-relaxed text-muted-foreground">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
