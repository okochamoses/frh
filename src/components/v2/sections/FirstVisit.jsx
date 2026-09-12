import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * What to do before you turn up, for the reader who has booked and is now
 * quietly worried about getting it wrong.
 *
 * Written as things to do rather than rules to follow — a first-time client
 * who reads a list of rules arrives braced for a telling-off, which is the
 * opposite of the point.
 */
const PREP = [
  {
    title: "Come with your hair out, if you can",
    body: "Detangled and out of its last style saves us both an hour. If you cannot manage it, say so when you book and we will add take-down to the slot rather than rushing it on the day.",
  },
  {
    title: "Bring your extensions if they are yours",
    body: "Clean and pre-stretched, please. If you would rather we supplied them, tell us at booking so we have the right length and colour waiting.",
  },
  {
    title: "Eat something first",
    body: "Mini and micro styles run for hours. There is water here and you are welcome to bring food — nobody is expected to sit through a five-hour appointment on an empty stomach.",
  },
  {
    title: "Tell us what your hair has been through",
    body: "Postpartum shedding, a tender scalp, a relaxer you are growing out, a style that was too tight last time. None of it is news to us, and all of it changes what we recommend.",
  },
];

export default function FirstVisit() {
  return (
    <section aria-labelledby="first-visit-heading" id="first-visit" className="scroll-mt-32">
      <SectionHeader
        id="first-visit-heading"
        eyebrow="Your first visit"
        title="How to arrive ready"
        lede="None of this is required. It just buys your hair more of the appointment and less of the prep."
      />

      <ol className="mt-12 grid gap-x-10 border-t border-ink/15 md:mt-16 md:grid-cols-2">
        {PREP.map(({ title, body }, i) => (
          <Reveal key={title} as="li" delay={i * 70}>
            <div className="flex gap-5 border-b border-ink/15 py-8 sm:gap-7">
              <span
                aria-hidden="true"
                className="type-eyebrow shrink-0 tabular-nums text-ash"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="max-w-[22ch] font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                  {title}
                </h3>
                <p className="mt-3 max-w-[44ch] text-v2-body text-ink-soft">
                  {body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
