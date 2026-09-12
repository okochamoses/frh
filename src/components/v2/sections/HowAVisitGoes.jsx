"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";

const STEPS = [
  {
    title: "We look before we touch",
    body: "Scalp, edges, ends, density. If your hair is not ready for the style you booked, we say so and offer you something that works today.",
  },
  {
    title: "We detangle with patience",
    body: "Damp hair, in sections, worked from the ends up. This is the part most salons rush, and it is the part that decides how much hair you keep.",
  },
  {
    title: "We style at a tension you can live with",
    body: "If it stings, tell us. We take it down and redo it. A style should not need painkillers, and tightness is not a sign of good work.",
  },
  {
    title: "You leave knowing what to do next",
    body: "How to wash it, how to sleep in it, when to take it down and what to watch for. Written down, not called after you at the door.",
  },
];

/**
 * The four steps of an appointment, as four cards on the page's quiet cream
 * surface. The service index above and the FAQ below are both ruled lists, so
 * a third list of hairlines here made the page read as one long table; cards
 * give the middle of the page a change of shape.
 *
 * On a phone the four columns become a snap rail. Four full-height steps would
 * be a long scroll to get past for a reader who only wants to know whether we
 * are worth booking, whereas a rail costs one screen and still shows there are
 * four of them — the peek of the next card is the affordance.
 */
export default function HowAVisitGoes() {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEnds = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEnds();
    window.addEventListener("resize", updateEnds);
    return () => window.removeEventListener("resize", updateEnds);
  }, [updateEnds]);

  const scrollByCard = (dir) => {
    const rail = railRef.current;
    const card = rail?.querySelector("li");
    if (!rail || !card) return;
    rail.scrollBy({ left: dir * (card.offsetWidth + 12), behavior: "smooth" });
  };

  return (
    <section aria-labelledby="how-a-visit-goes-heading">
      <SectionHeader
        id="how-a-visit-goes-heading"
        eyebrow="A visit, start to finish"
        title="What happens when you come in"
        lede="No surprises, no upselling, no five hour mystery."
        action={
          <Button variant="tertiary" withArrow href="/v2/booking">
            Book a salon visit
          </Button>
        }
      />

      {/* Negative margins let the rail bleed to the screen edge on a phone, so
          the peeking next step is not clipped by the page gutter.

          The entrance is on the rail rather than on each card: a card parked
          off the right edge of a scroll container is clipped to zero area, so
          a per-card observer never fires for steps three and four and they sit
          invisible — including the peek that is the swipe affordance. */}
      <Reveal className="mt-12 md:mt-16">
        <ol
          ref={railRef}
          onScroll={updateEnds}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4"
        >
          {STEPS.map(({ title, body }, i) => (
            <li
              key={title}
              className="w-[80vw] shrink-0 snap-start sm:w-[52vw] md:w-auto"
            >
              <div className="flex h-full min-h-[21rem] flex-col rounded-v2-3xl bg-cream-100 p-7 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[3.5rem] font-bold leading-none tabular-nums text-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="type-eyebrow tabular-nums">
                    Step {i + 1} of {STEPS.length}
                  </span>
                </div>

                <h3 className="mt-auto max-w-[18ch] pt-10 font-display text-[clamp(1.5rem,1.3rem+0.6vw,1.875rem)] uppercase leading-[1] text-ink">
                  {title}
                </h3>
                <p className="mt-4 text-v2-body text-ink-soft">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Phone only: the peek alone is easy to miss, so spell out that the
          rail moves and give tap targets for readers who don't swipe. */}
      <div className="mt-5 flex items-center justify-between md:hidden">
        <span className="type-eyebrow text-ink-soft">
          Swipe to see all steps
        </span>
        <div className="flex gap-2">
          {[
            { dir: -1, label: "Previous step", disabled: atStart },
            { dir: 1, label: "Next step", disabled: atEnd },
          ].map(({ dir, label, disabled }) => (
            <button
              key={dir}
              type="button"
              aria-label={label}
              disabled={disabled}
              onClick={() => scrollByCard(dir)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-opacity disabled:opacity-30"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`h-5 w-5 ${dir < 0 ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
