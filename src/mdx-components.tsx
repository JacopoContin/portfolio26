import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { MediaContainer, MediaGrid } from "@/components/mdx/media-container";
import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";

type CodeProps = ComponentProps<"code"> & {
  "data-language"?: string;
};

/** True when a node tree holds no text, e.g. the `| | |` header of a key/value table. */
function isBlank(node: ReactNode): boolean {
  return Children.toArray(node).every((child) => {
    if (typeof child === "string") return child.trim() === "";
    if (isValidElement<{ children?: ReactNode }>(child)) return isBlank(child.props.children);
    return false;
  });
}

export const mdxComponents = {
  Callout,
  MediaContainer,
  MediaGrid,
  pre: (props: ComponentProps<"pre">) => <CodeBlock {...props} />,
  hr: (props: ComponentProps<"hr">) => (
    <div className="my-10 flex w-full items-center" {...props}>
      <div
        className="flex-1 h-px bg-border"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      />
    </div>
  ),
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 border border-border rounded-xl overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table
          className="m-0! w-full min-w-full border-separate border-spacing-0"
          {...props}
        />
      </div>
    </div>
  ),
  thead: (props: ComponentProps<"thead">) =>
    isBlank(props.children) ? null : <thead {...props} />,
  code: ({ children, ...props }: CodeProps) => {
    if (props["data-language"]) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 text-sm font-mono text-foreground/90"
        {...props}
      >
        {children}
      </code>
    );
  },
} as const;

