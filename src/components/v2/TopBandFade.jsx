"use client";

import { useEffect, useRef } from "react";

/**
 * Washes the page, the hero and the sticky nav bar from mustard to white once
 * the reader scrolls past the hero collage.
 *
 * Renders a zero-height sentinel wherever it is placed — at the bottom edge of
 * the collage — and watches it with an IntersectionObserver cropped 200px up
 * from the bottom, so the turn happens 200px after that edge clears the foot
 * of the screen: the flag goes onto `.v2-root` and CSS
 * crossfades every surface painting `--v2-topband` (see v2.css). Reversible —
 * scrolling back up past it returns the mustard.
 *
 * The sentinel also carries `data-topband-sentinel`, which is what tells the
 * stylesheet this route has a hero at all — that is what extends the mustard
 * to the page ground here and leaves the other v2 routes on `bg-sand`.
 *
 * An observer rather than a scroll listener because this is a single
 * threshold, not a scrubbed value: no per-frame work, and nothing to throttle.
 */
export default function TopBandFade() {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root = sentinel.closest(".v2-root");
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Either the sentinel is inside the cropped band (it has crossed the
        // trigger line) or it has already left through the top. Both mean
        // "past the collage".
        const past = entry.isIntersecting || entry.boundingClientRect.top < 0;
        root.dataset.pastHero = past ? "true" : "false";
      },
      // Trigger line: the bottom of the screen, less 200px, so the collage is
      // fully on screen and a beat of scrolling has followed before the
      // colour turns over.
      { rootMargin: "0px 0px -200px 0px" },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      delete root.dataset.pastHero;
    };
  }, []);

  return (
    <div
      ref={sentinelRef}
      data-topband-sentinel=""
      aria-hidden="true"
      className="h-px w-full"
    />
  );
}
