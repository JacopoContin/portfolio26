/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, ReactNode } from "react";

/** A numbered dot over an image, positioned in percent of its width and height. */
interface Marker {
  x: number;
  y: number;
  label: string;
}

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
  /** Videos only: frame shown before playback starts. */
  poster?: string;
  /** Images only: numbered dots over the image, explained in a legend below it. */
  markers?: Marker[];
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
  poster,
  markers = [],
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
      className={`${frame} relative ${Frame === "a" ? "cursor-zoom-in" : ""} ${className}`}
      {...(Frame === "a" && {
        href: src,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Open full size: ${alt}`,
      })}
    >
      {type === "image" ? (
        <>
          <img src={src} alt={alt} className={media} />
          {markers.map((marker, i) => (
            <span
              key={marker.label}
              aria-hidden
              className="absolute left-(--x) top-(--y) flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-md ring-2 ring-background"
              style={
                {
                  "--x": `${marker.x}%`,
                  "--y": `${marker.y}%`,
                } as CSSProperties
              }
            >
              {i + 1}
            </span>
          ))}
        </>
      ) : (
        <video
          src={src}
          poster={poster}
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

  if (!caption && markers.length === 0) {
    return content;
  }

  return (
    <figure
      className={
        isThumb ? "m-0 flex flex-col gap-3" : "my-6 flex flex-col gap-3"
      }
    >
      {content}
      {markers.length > 0 && (
        <ol className="not-prose m-0 flex list-none flex-col gap-2 p-0 text-sm text-muted-foreground">
          {markers.map((marker, i) => (
            <li key={marker.label} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              {marker.label}
            </li>
          ))}
        </ol>
      )}
      {caption && (
        <figcaption className="text-xs text-muted-foreground text-center text-balance m-0">
          {caption}
        </figcaption>
      )}
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
  return (
    <div className={`not-prose my-6 grid gap-4 ${gridCols[cols]}`}>
      {children}
    </div>
  );
}
