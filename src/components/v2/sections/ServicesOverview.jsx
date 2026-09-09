"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/v2/ui/Button";
import Arrow from "@/components/v2/ui/Arrow";

/**
 * Homepage summary of the four service families, set as a price index rather
 * than a card grid: four rules, four numbers, four prices, read top to bottom
 * the way a menu is read. Prices are the lowest current price in each family,
 * taken from the salon's service list.
 *
 * The section carries the page's one piece of pointer choreography. On a mouse,
 * hovering a row dims the other three (see `.v2-index` in v2.css) and lifts a
 * photograph that trails the cursor — the list stays typographic, and the
 * imagery is something you go and find rather than something that shouts first.
 * Touch and keyboard never see that card, so each row carries its own
 * photograph inline below the copy on small screens, and focus gets the same
 * dimming treatment hover does.
 */
const FAMILIES = [
  {
    title: "Twists",
    price: "₦5,000",
    body: "Barrel, mini, micro, flat and finger coils, on their own or combined with weaving. Sectioned by hand at a tension you can sleep in.",
    href: "/v2/services#twists",
    image: "/no-scalp-issues.webp",
    alt: "Client with a soft twist-out, smiling, in the salon",
  },
  {
    title: "Braids",
    price: "₦7,000",
    body: "Natural hair braids and mini braids, with or without extensions, sized to your density rather than to the clock.",
    href: "/v2/services#braids",
    image: "/story.webp",
    alt: "Sculpted braided updo photographed in hard afternoon light",
  },
  {
    title: "African threading and KiKo",
    price: "₦7,000",
    body: "Stretches your hair without a single degree of heat. The gentlest full rest we offer, and lovely on children's hair.",
    href: "/v2/services#threading",
    image: "/long-hair.webp",
    alt: "Natural hair stretched out full and loose, without heat",
  },
  {
    title: "Treatments and loosening",
    price: "₦1,500",
    body: "Deep conditioning, scalp care and careful take-down, because most breakage happens on the way out of a style rather than in it.",
    href: "/v2/services#treatments",
    image: "/hair-wash.webp",
    alt: "Locs being lathered by hand during a wash",
  },
];

/** How far behind the cursor the card trails, per frame. Lower drags more. */
const FOLLOW = 0.14;

export default function ServicesOverview() {
  const [active, setActive] = useState(null);
  const [tracking, setTracking] = useState(false);

  const frameRef = useRef(null);
  const cardRef = useRef(null);
  const rafRef = useRef(0);
  // Where the cursor is, and where the card has caught up to. Kept in refs and
  // written straight to the transform, so following the pointer never costs a
  // React render — only entering and leaving a row does.
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const settled = useRef(false);

  // The reveal is a mouse affordance. Anything else — touch, a pen, a reader
  // who has asked for less motion — gets the inline photographs instead.
  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setTracking(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!tracking || active === null) return undefined;

    const step = () => {
      const card = cardRef.current;
      if (card) {
        // Ease toward the cursor, except on the first frame after entering a
        // row: the card should appear where the pointer already is rather than
        // flying in from wherever it was left.
        const ease = settled.current ? FOLLOW : 1;
        current.current.x += (target.current.x - current.current.x) * ease;
        current.current.y += (target.current.y - current.current.y) * ease;
        settled.current = true;
        card.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tracking, active]);

  const handlePointerMove = useCallback(
    (event) => {
      if (!tracking) return;
      const frame = frameRef.current;
      if (!frame) return;
      const box = frame.getBoundingClientRect();
      target.current = {
        x: event.clientX - box.left,
        y: event.clientY - box.top,
      };
    },
    [tracking],
  );

  const enter = useCallback(
    (index) => (event) => {
      if (!tracking) return;
      handlePointerMove(event);
      settled.current = false;
      setActive(index);
    },
    [tracking, handlePointerMove],
  );

  const leave = useCallback(() => setActive(null), []);

  return (
    <section aria-labelledby="services-overview-heading">
      {/* Asymmetric masthead: the statement holds the left seven columns, the
          qualifier and the way through sit in the right three, so the eye
          drops into the index rather than reading straight across. */}
      <div className="grid gap-x-8 gap-y-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="type-eyebrow">Services — four families</p>
          <h2
            id="services-overview-heading"
            className="mt-5 max-w-[14ch] font-display text-display-fluid uppercase text-ink"
          >
            Protective styling, done properly
          </h2>
        </div>

        <div className="md:col-span-4 md:col-start-9 md:self-end">
          <p className="max-w-[38ch] text-v2-body text-ink-soft">
            Every service starts with a look at your scalp, edges and ends, and
            finishes with a plan for keeping the results.
          </p>
          <Button
            variant="tertiary"
            withArrow
            href="/v2/services"
            className="mt-6"
          >
            See all services and prices
          </Button>
        </div>
      </div>

      {/* The frame is the positioning context for the trailing card, and the
          surface the pointer is measured against. */}
      <div
        ref={frameRef}
        onPointerMove={handlePointerMove}
        className="relative mt-14 md:mt-20"
      >
        <ol className="v2-index border-t border-ink/15">
          {FAMILIES.map(({ title, price, body, href, image, alt }, i) => (
            <li key={title} className="border-b border-ink/15">
              <Link
                href={href}
                onPointerEnter={enter(i)}
                onPointerLeave={leave}
                className="group relative grid items-baseline py-8 md:grid-cols-[4rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] md:gap-x-10 md:py-11 lg:gap-x-14"
              >
                {/* The row's own rule, drawn left to right over the static
                    divider, so the hovered row is underlined by the movement
                    of the cursor rather than by a colour change. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px hidden h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100 md:block"
                />

                {/* The index number holds a column of its own on desktop. A
                    phone has no width to spare for one, so it sits above the
                    title as a kicker instead of squeezing the copy. */}
                <span
                  aria-hidden="true"
                  className="type-eyebrow mb-3 block tabular-nums text-ash transition-colors duration-300 ease-out group-hover:text-ink md:mb-0"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="font-display text-[clamp(1.75rem,1.15rem+2.4vw,3.25rem)] uppercase leading-[0.95] tracking-[-0.01em] text-ink transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                    {title}
                  </h3>

                  {/* Price rides under the title on small screens, where there
                      is no column of its own to hang it in, and takes the
                      arrow with it so the row still ends on a way through. */}
                  <p className="mt-3 flex items-center justify-between gap-4 font-display text-v2-h3 uppercase tabular-nums text-ink-soft md:hidden">
                    From {price}
                    <Arrow className="h-4 w-5 shrink-0 text-ink" />
                  </p>
                </div>

                <div className="mt-4 md:col-start-3 md:mt-0">
                  <p className="max-w-[42ch] text-v2-body text-ink-soft md:mt-1">
                    {body}
                  </p>

                  {/* No cursor to follow on a phone, so the photograph comes
                      to the row instead. */}
                  <div className="relative mt-6 aspect-[3/2] overflow-hidden rounded-v2-2xl bg-cream-100 md:hidden">
                    <Image
                      src={image}
                      alt={alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="col-start-4 mt-1 hidden items-center gap-6 md:flex md:justify-end">
                  <p className="font-display text-[1.75rem] uppercase leading-none tabular-nums text-ink">
                    <span className="type-eyebrow mr-2 align-middle text-ash">
                      From
                    </span>
                    {price}
                  </p>
                  <Arrow className="h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* One card, four stacked photographs — swapping opacity rather than
            the `src` keeps the reveal instant and never re-decodes an image
            mid-hover. Inert to the pointer so it can never eat a row's hover. */}
        {tracking && (
          <div
            ref={cardRef}
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 z-10 -ml-[9rem] -mt-[11rem] hidden h-[22rem] w-[18rem] will-change-transform md:block ${
              active === null ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300 ease-out`}
          >
            <div
              className={`relative h-full w-full origin-center overflow-hidden rounded-v2-3xl bg-cream-100 transition-transform duration-500 ease-out ${
                active === null ? "scale-90 rotate-0" : "scale-100 -rotate-3"
              }`}
            >
              {FAMILIES.map(({ title, image, alt }, i) => (
                <Image
                  key={title}
                  src={image}
                  alt={alt}
                  fill
                  sizes="288px"
                  className={`object-cover transition-opacity duration-300 ease-out ${
                    active === i ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
