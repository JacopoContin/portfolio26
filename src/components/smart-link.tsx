import Link from "next/link";
import type { ComponentProps } from "react";

type SmartLinkProps = Omit<ComponentProps<"a">, "href"> & { href?: string };

/**
 * Internal paths go through next/link, so navigation stays client-side and
 * anything mounted in the root layout (the vinyl player) keeps running.
 * External URLs open in a new tab.
 */
export function SmartLink({ href = "", ...props }: SmartLinkProps) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href} {...props} />;
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}
