import Image from "next/image";
import Reveal from "@/components/v2/ui/Reveal";
import LeadMagnetForm from "@/components/v2/ui/LeadMagnetForm";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import ClosingCta from "@/components/v2/sections/ClosingCta";

export const metadata = {
  title: "The free 4C hair guide — Flourish Roots Hair",
  description:
    "The routine we hand our own clients: wash days, detangling, night care, protective styling and how to read a product label. Free, by email.",
};

/* The chapters, as they actually are. No claim here about what the guide will
   do to anyone's hair — the voice guide rules out growth promises, and a lead
   magnet that over-promises is the fastest way to lose the inbox it just won. */
const CHAPTERS = [
  {
    title: "Moisture, made simple",
    body: "Why 4C hair reads as dry no matter what you put on it, and the order that actually keeps water in.",
  },
  {
    title: "The detangling method",
    body: "Damp, in sections, from the ends up. The part most salons rush, written out so you can do it at home without losing half your hair to the comb.",
  },
  {
    title: "Night care",
    body: "What to do in the ten minutes before bed, which is where most of the breakage you see in the morning is decided.",
  },
  {
    title: "How long a style should stay in",
    body: "Protective styles stop protecting at a point. Here is how to tell when yours has reached it.",
  },
  {
    title: "Reading a product label",
    body: "Which ingredients matter for your porosity and which are there to make the bottle sound expensive.",
  },
  {
    title: "What to buy in Lagos",
    body: "Products you can find here, at prices that are not an import markup.",
  },
];

export default function FreeGuidePage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      {/* The form is the page, so it sits in the first screen rather than
          under a scroll — the reader who came here from an ad already knows
          what they want. */}
      <section
        aria-labelledby="free-guide-heading"
        className="v2-hero-bg v2-topband relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20"
      >
        <div className="relative z-10 mx-auto grid max-w-[var(--v2-container)] items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="type-eyebrow">Free · By email</p>
              <h1
                id="free-guide-heading"
                className="mt-6 max-w-[15ch] font-display text-[clamp(2.5rem,1.7rem+3.4vw,4.75rem)] uppercase leading-[0.94] text-ink"
              >
                The routine we hand our own clients
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="mt-7 max-w-[46ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.55]">
                Six short chapters on looking after 4C hair between
                appointments — written for hair like yours, and for products you
                can actually buy in Lagos. It is the same routine we write out
                for people sitting in our chairs.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <figure className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-v2-3xl bg-cream-100 lg:block">
                <Image
                  src="/newsletter-large.webp"
                  alt="The Flourish Roots 4C hair guide"
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </figure>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-v2-4xl bg-sand p-7 md:p-10">
              <p className="type-eyebrow">Where should we send it?</p>
              <p className="mt-4 mb-7 max-w-[34ch] text-v2-body text-ink-soft">
                It arrives in a couple of minutes. No payment, and nothing to
                download twice.
              </p>
              <LeadMagnetForm />
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="chapters-heading">
        <SectionHeader
          id="chapters-heading"
          eyebrow="What is in it"
          title="Six chapters, no filler"
          lede="Short enough to read on a bus, specific enough to use on your next wash day."
        />

        <ol className="mt-12 grid gap-x-10 border-t border-ink/15 md:mt-16 md:grid-cols-2">
          {CHAPTERS.map(({ title, body }, i) => (
            <Reveal key={title} as="li" delay={i * 60}>
              <div className="flex gap-5 border-b border-ink/15 py-7 sm:gap-7">
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
                  <p className="mt-2 max-w-[44ch] text-v2-body-sm leading-[1.55] text-ink-soft">
                    {body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <ClosingCta />
    </main>
  );
}
