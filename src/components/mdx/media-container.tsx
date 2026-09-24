/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";

interface MediaContainerProps {
  src: string;
  alt?: string;
  type?: "image" | "video";
  /**
   * "cover" crops to a fixed band, good for decorative media.
   * "natural" keeps the source aspect ratio, which is what UI screenshots need.
   * "thumb" crops to a small 4:3 tile, for supporting images inside a MediaGrid.
   * "portrait" keeps the aspect ratio at a narrow centred width, for phone footage.
   */
  fit?: "cover" | "natural" | "thumb" | "portrait";
  /** Thumbs only: false fits the whole image in the tile instead of cropping it. */
  crop?: boolean;
  /** Opens the full-size image in a new tab on click. On by default for images. */
  zoomable?: boolean;
  /** Silent looping playback, for product shots that should just run. */
  autoPlay?: boolean;
  caption?: string;
  className?: string;
}

export function MediaContainer({
  src,
  alt = "",
  type = "image",
  fit = "cover",
  crop = true,
  zoomable = true,
  autoPlay = false,
  caption,
  className = "",
}: MediaContainerProps) {
  const isPortrait = fit === "portrait";
  const isNatural = fit === "natural" || isPortrait;
  const isThumb = fit === "thumb";
  const frame = isPortrait
    ? "not-prose ring-4 ring-muted w-full max-w-xs mx-auto rounded-lg overflow-hidden"
    : isNatural
    ? "not-prose ring-4 ring-muted w-full rounded-lg overflow-hidden"
    : isThumb
      ? "not-prose ring-4 ring-muted w-full aspect-4/3 rounded-lg overflow-hidden bg-card"
      : "not-prose ring-4 ring-muted w-full h-75 rounded-lg overflow-hidden flex items-center justify-center";
  const media = isNatural
    ? "w-full h-auto block"
    : isThumb && !crop
      ? "w-full h-full object-contain object-center p-2"
      : "w-full h-full object-cover object-center max-w-full max-h-full";

  const Frame = zoomable && type === "image" ? "a" : "div";
  const content = (
    <Frame
      className={`${frame} ${Frame === "a" ? "cursor-zoom-in" : ""} ${className}`}
      {...(Frame === "a" && {
        href: src,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Open full size: ${alt}`,
      })}
    >
      {type === "image" ? (
        <img src={src} alt={alt} className={media} />
      ) : (
        <video
          src={src}
          className={media}
          controls
          {...(autoPlay && {
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
          })}
        />
      )}
    </Frame>
  );

  if (!caption) {
    return content;
  }

  return (
    <figure className={isThumb ? "m-0 flex flex-col gap-3" : "my-6 flex flex-col gap-3"}>
      {content}
      <figcaption className="text-xs text-muted-foreground text-center text-balance m-0">
        {caption}
      </figcaption>
    </figure>
  );
}

const gridCols = {
  auto: "auto-cols-fr grid-flow-col",
  2: "grid-cols-2",
  3: "grid-cols-3",
} as const;

/**
 * Lays out supporting media as small tiles. Pair with fit="thumb".
 * Defaults to one row; pass cols to wrap longer sets.
 */
export function MediaGrid({
  children,
  cols = "auto",
}: {
  children: ReactNode;
  cols?: keyof typeof gridCols;
}) {
  return <div className={`not-prose my-6 grid gap-4 ${gridCols[cols]}`}>{children}</div>;
}
