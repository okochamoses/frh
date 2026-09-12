import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";
import { GOOGLE_REVIEWS_URL } from "@/components/v2/location";

/**
 * Real reviews, left on the salon's Google listing by the people who wrote
 * them. Nothing here is written in-house.
 *
 * Chosen against the three things a reader is actually weighing before a first
 * appointment: whether it will hurt, whether the work holds, and whether their
 * own hair is understood. So: one on care and how the hair felt afterwards,
 * one on tension while detangling, one on a specific loc retie.
 *
 * Quotes are contiguous excerpts — trimmed at sentence boundaries to fit
 * display type, never spliced from separate parts of a review. Every card
 * links back to the listing so the full text is one tap away, which is the
 * only thing that makes a trimmed quote honest.
 *
 * Names are as the reviewers published them on Google. No portraits: we do not
 * have photographs of these clients, and a stock face captioned with a real
 * woman's name is a small lie. They run with an initial instead.
 */
const REVIEWS = [
  {
    quote:
      "They handled my hair with such care, I had zero complaints. My hair felt so good and healthy after.",
    name: "Adaugo Ugochukwu",
    detail: "Shampoo, blowout and styling",
  },
  {
    quote: "They were very gentle with my hair even while detangling.",
    name: "Fapohunda Adedamola",
    detail: "Ayurvedic treatment and flat twists",
  },
  {
    quote:
      "They understood exactly what I wanted, handled my locs with so much care, and the retie came out neat and flawless.",
    name: "Mmesoma Anaka",
    detail: "Loc retie",
  },
];

const [LEAD, ...SUPPORTING] = REVIEWS;

/** Opening quote mark, drawn rather than typed so it does not depend on
    which glyphs the display face happens to carry. */
function QuoteMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 41 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="M0 32V19.6C0 8.9 5.6 2.4 16.2 0l1.9 4.3C12 6.2 9.1 9.8 8.7 15H17v17H0Zm22.9 0V19.6C22.9 8.9 28.5 2.4 39.1 0L41 4.3c-6.1 1.9-9 5.5-9.4 10.7h8.3v17H22.9Z"
      />
    </svg>
  );
}

function initial(name) {
  return name.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase();
}

/** The attribution that makes the quote checkable. Named per review so the
    accessible name says whose review it opens, not five identical "Google". */
function SourceLink({ name, tone = "ink" }) {
  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`Read ${name}'s review on Google`}
      className={`group/src inline-flex items-center gap-1 text-v2-body-sm underline-offset-4 transition-colors duration-200 ease-out hover:underline ${
        tone === "muted" ? "text-ink-soft hover:text-ink" : "text-ink/65 hover:text-ink"
      }`}
    >
      Google review
      <ArrowUpRight
        aria-hidden
        className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover/src:-translate-y-0.5 group-hover/src:translate-x-0.5"
      />
    </a>
  );
}

/**
 * Clients, in their own words.
 *
 * A bento of three: the lead quote on the warm glow, and the two supporting
 * voices stacked on cream at its side. The glow is the same colour the hero
 * opens on, so the one surface on the page that belongs to clients is the one
 * that looks most like the brand.
 */
export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading">
      <SectionHeader
        id="testimonials-heading"
        eyebrow="From our chairs"
        title="Testimonials"
        lede="Left on Google by clients after their appointments, not collected by us."
        action={
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="group/all inline-flex items-center gap-1.5 text-v2-body-sm font-semibold text-ink underline underline-offset-4 transition-colors duration-200 ease-out hover:text-ink/70"
          >
            Read every review on Google
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-200 ease-out group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5"
            />
          </a>
        }
      />

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <figure className="flex h-full flex-col gap-10 rounded-v2-4xl bg-gold p-8 text-ink md:p-12 lg:min-h-[26rem]">
            <QuoteMark className="h-8 w-10 text-ink" />

            <blockquote className="max-w-[20ch] font-display text-[clamp(1.75rem,1.3rem+1.5vw,2.625rem)] uppercase leading-[1.02] text-ink">
              {LEAD.quote}
            </blockquote>

            <figcaption className="mt-auto flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-ink/20 pt-5">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                  {LEAD.name}
                </span>
                <span className="type-eyebrow !text-ink/65">{LEAD.detail}</span>
              </span>
              <SourceLink name={LEAD.name} />
            </figcaption>
          </figure>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {SUPPORTING.map(({ quote, name, detail }, i) => (
            <li key={quote}>
              <Reveal delay={(i + 1) * 90} className="h-full">
                <figure className="flex h-full flex-col gap-8 rounded-v2-4xl bg-cream-100 p-8 md:p-10">
                  <QuoteMark className="h-6 w-7 text-ink/25" />

                  <blockquote className="max-w-[30ch] font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] uppercase leading-[1.12] text-ink">
                    {quote}
                  </blockquote>

                  <figcaption className="mt-auto flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-v2-h3 uppercase text-white"
                    >
                      {initial(name)}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-display text-v2-h3 uppercase leading-[1.05] text-ink">
                        {name}
                      </span>
                      <span className="type-eyebrow mt-1.5">{detail}</span>
                      <span className="mt-2">
                        <SourceLink name={name} tone="muted" />
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
