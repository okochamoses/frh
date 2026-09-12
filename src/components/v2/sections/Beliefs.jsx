import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * Five working rules, set as a ruled list rather than five cards: they are a
 * manifesto, and a manifesto reads as a document, not as a product grid.
 *
 * Each one is a thing the salon does that a client could hold us to on the
 * day — not a value, which nobody can check.
 */
const BELIEFS = [
  {
    title: "The hair comes first, then the style",
    body: "Every appointment starts with a look at your scalp, edges and ends. If your hair is not ready for what you booked, we say so, and offer you something that works today.",
  },
  {
    title: "Gentle is a technique, not a mood",
    body: "Damp detangling. Clean sectioning. Working from the ends up. Tension you can sleep in. These are repeatable methods, which is why every stylist here learns them the same way.",
  },
  {
    title: "Honesty over upselling",
    body: "We will tell you when you do not need a treatment, and when a style you saw online will not sit on your density. We would rather keep you for years than maximise one visit.",
  },
  {
    title: "You should leave able to look after it",
    body: "Advice at the door is not enough. You get the routine written down — wash day, night care, when to take it out — because the six weeks after matter more than the six hours in the chair.",
  },
  {
    title: "Nobody gets shamed here",
    body: "Relaxed, transitioning, matted, or neglected while you were surviving something else. We have seen all of it. You will get help, not a lecture.",
  },
];

export default function Beliefs() {
  return (
    <section aria-labelledby="beliefs-heading" id="beliefs" className="scroll-mt-32">
      <SectionHeader
        id="beliefs-heading"
        eyebrow="How we work"
        title="Five rules, and why they exist"
        lede="Every one of these is something you can hold us to while you are in the chair. That is the test we set them."
      />

      <ol className="mt-12 border-t border-ink/15 md:mt-16">
        {BELIEFS.map(({ title, body }, i) => (
          <Reveal key={title} as="li" delay={i * 60}>
            <div className="grid gap-x-10 border-b border-ink/15 py-8 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.1fr)] md:py-10">
              <span
                aria-hidden="true"
                className="type-eyebrow mb-3 block tabular-nums text-ash md:mb-0"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="max-w-[20ch] font-display text-[clamp(1.375rem,1.1rem+1.1vw,2rem)] uppercase leading-[1.05] text-ink">
                {title}
              </h3>
              <p className="mt-3 max-w-[46ch] text-v2-body text-ink-soft md:mt-1">
                {body}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
