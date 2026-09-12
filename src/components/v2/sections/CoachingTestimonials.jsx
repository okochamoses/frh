import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * Coaching reviews. Empty until real ones exist.
 *
 * The salon's Google listing has plenty of reviews, but every one of them is
 * for salon work — locs, shampoo, detangling, treatments. None are from anyone
 * who sat a coaching session, and a salon review reprinted under a heading
 * that says "after coaching" is a claim about a service nobody reviewed. So
 * this stays empty rather than borrowing them.
 *
 * The section renders nothing while the list is empty, so the page ships
 * without inventing social proof. Add entries as
 * `{ quote, name, detail }` and it appears; the first becomes the lead quote,
 * so that slot wants the strongest and most specific one available.
 *
 * When collecting them, prioritise quotes that mention one of:
 *   1. a specific problem named and solved (edges, postpartum shedding, scalp),
 *   2. a routine that held once the session was over,
 *   3. being told something no one had told them before.
 *
 * First name and area of Lagos only. Never a number of inches and never a
 * timeframe for growth — the voice guide rules those out, and a review
 * promising them makes the page read like an advert rather than a salon.
 */
const REVIEWS = [];

function QuoteMark({ className = "" }) {
  return (
    <svg viewBox="0 0 41 32" aria-hidden="true" focusable="false" className={className}>
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

/**
 * Coaching-specific reviews, in the same bento shape the homepage uses for its
 * own testimonials — one lead quote on the warm gold surface, two supporting
 * voices beside it — so the two testimonial moments on the site read as one
 * design rather than two different templates.
 */
export default function CoachingTestimonials() {
  if (REVIEWS.length === 0) return null;

  const [lead, ...supporting] = REVIEWS;

  return (
    <section aria-labelledby="coaching-testimonials-heading">
      <SectionHeader
        id="coaching-testimonials-heading"
        eyebrow="From past sessions"
        title="What clients say after coaching"
        align="center"
      />

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-12">
        <Reveal className={supporting.length > 0 ? "lg:col-span-7" : "lg:col-span-12"}>
          <figure className="flex h-full flex-col gap-10 rounded-v2-4xl bg-cream-100 p-8 text-ink md:p-10">
            <QuoteMark className="h-8 w-10 text-ink/25" />
            <blockquote className="font-display text-[clamp(1.75rem,1.3rem+1.5vw,2.625rem)] uppercase leading-[1.02] text-ink">
              {lead.quote}
            </blockquote>
            <figcaption className="mt-auto flex items-baseline gap-3 border-t border-ink/20 pt-5">
              <span className="font-display text-v2-h3 uppercase text-ink">
                {lead.name}
              </span>
              <span className="type-eyebrow">{lead.detail}</span>
            </figcaption>
          </figure>
        </Reveal>

        {supporting.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {supporting.map(({ quote, name, detail }, i) => (
              <li key={quote}>
                <Reveal delay={(i + 1) * 90} className="h-full">
                  <figure className="flex h-full flex-col gap-8 rounded-v2-4xl bg-cream-100 p-8 md:p-10">
                    <QuoteMark className="h-6 w-7 text-ink/25" />
                    <blockquote className="max-w-[30ch] font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] uppercase leading-[1.12] text-ink">
                      {quote}
                    </blockquote>
                    <figcaption className="mt-auto flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-v2-h3 uppercase text-white">
                        {initial(name)}
                      </span>
                      <span className="flex flex-col">
                        <span className="font-display text-v2-h3 uppercase leading-none text-ink">
                          {name}
                        </span>
                        <span className="type-eyebrow mt-1.5">{detail}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
