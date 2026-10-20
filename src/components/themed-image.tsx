import { darkVariant } from "@/lib/dark-image";
import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";

/** next/image that swaps to its generated dark twin under the `.dark` class. */
export function ThemedImage({ src, className, ...props }: ImageProps & { src: string }) {
  const darkSrc = darkVariant(src);
  if (!darkSrc) return <Image src={src} className={className} {...props} />;
  return (
    <>
      <Image src={src} className={cn(className, "dark:hidden")} {...props} />
      <Image src={darkSrc} className={cn(className, "hidden dark:block")} {...props} />
    </>
  );
}
