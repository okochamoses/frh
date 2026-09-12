import Image from "next/image";
import Reveal from "@/components/v2/ui/Reveal";

const CREDENTIALS = [
  "Certified hair coach",
  "Salon owner",
  "4C hair specialist",
  "Ayurvedic hair care",
  "Lagos based",
];

/**
 * The coach behind the coaching — a face and a credential list before any
 * price, so the reader is trusting a specific person rather than a service
 * line item.
 */
export default function MeetMariam() {
  return (
    <section aria-labelledby="meet-mariam-heading">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <Reveal className="lg:col-span-5">
          <figure className="relative aspect-[4/5] overflow-hidden rounded-v2-4xl bg-cream-100 sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src="/founder-portrait.webp"
              alt="Mariam Okocha Ijeoma, founder and hair coach at Flourish Roots Hair Co."
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </figure>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="type-eyebrow">Meet your hair coach</p>
            <h2
              id="meet-mariam-heading"
              className="mt-5 max-w-[16ch] font-display text-display-fluid uppercase leading-[0.95] text-ink"
            >
              I&apos;ve sat exactly where you&apos;re sitting
            </h2>
          </Reveal>

          <Reveal delay={90}>
            <p className="mt-8 max-w-[48ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.55]">
              I&apos;m a certified hair coach, salon owner, and a Nigerian
              woman who has personally lived through hair loss, dryness and
              postpartum shedding.
            </p>
            <p className="mt-4 max-w-[48ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.55]">
              I built Flourish Roots because Nigerian women deserve expert,
              culturally rooted care — not generic tutorials or expensive
              imports.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-8 flex flex-wrap gap-2">
            {CREDENTIALS.map((credential) => (
              <span
                key={credential}
                className="rounded-full border border-ink/20 px-4 py-2 text-v2-body-sm text-ink-soft"
              >
                {credential}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
