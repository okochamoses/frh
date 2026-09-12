import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

const PAIN_POINTS = [
  "My hair breaks every time I touch it",
  "I've been natural for years and it still won't grow",
  "My scalp is always itchy, flaky or inflamed",
  "I transitioned from relaxer and don't know how to care for it",
  "I've spent serious money on products that did nothing",
  "Postpartum shedding has taken so much from me",
];

/**
 * The reader recognises themselves before they see a single price — the same
 * ruled, numbered treatment the homepage uses for "useful if you are dealing
 * with", so the two coaching mentions on the site read as one voice.
 */
export default function PainPoints() {
  return (
    <section aria-labelledby="pain-points-heading">
      <SectionHeader
        id="pain-points-heading"
        eyebrow="Sound familiar?"
        title="You're not the problem — your routine is"
        lede="You don't need more products. You need a plan built for your hair."
      />

      <ol className="mt-12 grid gap-x-10 border-t border-ink/15 md:mt-16 sm:grid-cols-2">
        {PAIN_POINTS.map((item, i) => (
          <Reveal key={item} delay={i * 60} as="li">
            <div className="flex items-baseline gap-4 border-b border-ink/15 py-6 text-v2-body text-ink">
              <span
                aria-hidden="true"
                className="w-6 shrink-0 font-display text-v2-body-sm tabular-nums text-ash"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug">{item}</span>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
