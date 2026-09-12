"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-entrance primitive: content starts a little low and transparent and
 * settles as it comes into view.
 *
 * Deliberately not framer-motion. The whole effect is one opacity and one
 * transform, so it costs a class swap and a compositor-only transition rather
 * than a JS animation loop and ~30kB of runtime on a marketing page. The
 * observer disconnects the moment an element has arrived, so a long page never
 * accumulates live observers.
 *
 * `delay` staggers siblings — pass the index times 60–90ms. Anyone who has
 * asked for reduced motion is opted out entirely: `.v2-reveal` only hides its
 * content inside the no-preference media query (see v2.css), so with the
 * preference set the markup renders exactly as it would with JS turned off.
 */
export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        node.dataset.revealed = "true";
        obs.disconnect();
      },
      // A little before the element's top edge clears the fold, so the motion
      // reads as the element settling into place rather than starting late.
      //
      // Note for callers: an element inside a horizontal scroll container is
      // clipped to zero area by that container while it is parked off-screen,
      // so it never intersects and never reveals. Reveal the rail itself, not
      // the cards inside it.
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`v2-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
