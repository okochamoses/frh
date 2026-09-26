"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import imageLoader from "@/lib/imageLoader";
import variants from "@/lib/imageVariants.json";

/** A `srcSet` over the pre-rendered widths of a local photo; remote ones get none. */
function srcSetFor(src) {
  const widths = variants[src];
  if (!widths) return undefined;
  return widths.map((w) => `${imageLoader({ src, width: w })} ${w}w`).join(", ");
}

/**
 * A look's photo at any size — grid card, list thumbnail, summary line, sheet.
 *
 * Most of the catalogue has no photo yet. The ones it has live in
 * `public/services`, with resized copies from `npm run images:variants`, so
 * `sizes` — the rendered width of this slot — picks the smallest that will
 * do. A failed load still falls back to the same lettered tile as a missing
 * photo rather than a broken-image icon.
 *
 * That fallback carries no "No photo yet" caption. It used to, and with 42 of
 * 70 services lacking a photo the booking grid read as a wall of apologies for
 * something the customer can see for themselves — while inside the sheet it
 * also repeated the sentence printed directly beneath it. The mark alone is
 * quieter and says the same thing.
 */
const ServicePhoto = forwardRef(function ServicePhoto(
  { look, as: Tag = "div", className, alt = "", sizes = "64px", fit = "cover", children, ...props },
  ref
) {
  const [failed, setFailed] = useState(false);
  const src = !failed ? look.image : null;

  return (
    <Tag ref={ref} className={cn("relative overflow-hidden bg-latte", className)} {...props}>
      {src ? (
        <>
          {/* `contain` shows the whole photo — the sheet, where someone is
              studying the style — and fills the letterbox with a blurred copy
              of itself rather than a flat band. */}
          {fit === "contain" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              srcSet={srcSetFor(src)}
              sizes="64px"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75"
            />
          )}
          {/* Plain <img> with a hand-built srcSet: next/image's wrapper fights
              the `as="button"` and the lettered fallback for no gain on a
              static export. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            srcSet={srcSetFor(src)}
            sizes={sizes}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className={cn(
              "absolute inset-0 h-full w-full",
              fit === "contain" ? "object-contain" : "object-cover object-[center_30%]"
            )}
          />
        </>
      ) : (
        /* Sand to cream-100 rather than cream-100 to latte: latte is too dark a
           ground for the tertiary ink of the letter mark to clear AA on. */
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sand to-cream-100"
        >
          <span className="font-display text-[2.2em] font-bold uppercase leading-none text-ash">
            {look.name.charAt(0)}
          </span>
        </span>
      )}
      {children}
    </Tag>
  );
});

export default ServicePhoto;
