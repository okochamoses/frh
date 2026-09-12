"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A look's photo at any size — grid card, list thumbnail, summary line, sheet.
 *
 * Most of the catalogue has no photo yet, and the ones it has are hot-linked,
 * so a failed load falls back to the same lettered tile as a missing photo
 * rather than a broken-image icon.
 *
 * That fallback carries no "No photo yet" caption. It used to, and with 42 of
 * 70 services lacking a photo the booking grid read as a wall of apologies for
 * something the customer can see for themselves — while inside the sheet it
 * also repeated the sentence printed directly beneath it. The mark alone is
 * quieter and says the same thing.
 */
const ServicePhoto = forwardRef(function ServicePhoto(
  { look, as: Tag = "div", className, alt = "", children, ...props },
  ref
) {
  const [failed, setFailed] = useState(false);
  const src = !failed ? look.image : null;

  return (
    <Tag ref={ref} className={cn("relative overflow-hidden bg-latte", className)} {...props}>
      {src ? (
        // Plain <img>: the site is a static export, so next/image cannot optimise
        // these remote photos anyway.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
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
