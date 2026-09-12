import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";

const FAQS = [
  {
    q: "Do I need to pay a deposit?",
    a: "For the longer styles, yes. Mini twists and mini braids need 50% upfront, micro twists need 70%. It holds your slot, and you will see the amount before you confirm.",
  },
  {
    q: "Can I bring my own extensions?",
    a: "Yes. Bring them clean and pre-stretched if you can. We do not sell beads, and attaching beads you bring is an extra ₦500.",
  },
  {
    q: "My hair is relaxed or transitioning. Can you still work on it?",
    a: "Yes. Tell us when you book so we plan the gentler approach and set aside the right amount of time.",
  },
  {
    q: "Do you do children's hair?",
    a: "Yes, threading and braids especially. Mention it in your booking notes so we allow for it.",
  },
];

/**
 * The last four objections, answered.
 *
 * Still native `<details>` — keyboard operable, findable by the browser's own
 * in-page search, and open to a reader before any JavaScript has run — but the
 * heading no longer scrolls away above the list. It sticks in a column of its
 * own, so the WhatsApp offer stays on screen for the whole time the reader is
 * working through questions, which is exactly when someone decides their
 * question is not on the list.
 *
 * Answers now animate open on a `0fr → 1fr` grid row (see `.v2-faq-panel`)
 * rather than snapping, and each row carries its number, so four questions
 * read as a short, finite list rather than an open-ended pile.
 */
export default function FaqSection() {
  return (
    <section aria-labelledby="faq-heading">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4 lg:self-start lg:sticky lg:top-32">
          <p className="type-eyebrow">Before you book</p>
          <h2
            id="faq-heading"
            className="mt-5 max-w-[12ch] font-display text-display-fluid uppercase leading-[0.95] text-ink"
          >
            The things people ask us
          </h2>
          <p className="mt-7 max-w-[34ch] text-v2-body text-ink-soft">
            Still unsure about something? Ask on WhatsApp and Mariam will
            answer.
          </p>
          <Button
            variant="tertiary"
            withArrow
            href="https://wa.me/2348110215014"
            target="_blank"
            rel="noreferrer"
            className="mt-6"
          >
            Ask on WhatsApp
          </Button>
        </Reveal>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="border-t border-ink/15">
            {FAQS.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 60}>
                <details className="group border-b border-ink/15">
                  <summary className="flex cursor-pointer list-none items-start gap-6 py-7 [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="type-eyebrow mt-2 shrink-0 tabular-nums text-ash transition-colors duration-300 ease-out group-open:text-ink"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <h3 className="flex-1 max-w-[30ch] font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.75rem)] uppercase leading-[1.1] text-ink">
                      {q}
                    </h3>

                    {/* A plus drawn from two rules rather than an icon: the
                        horizontal bar stays and the vertical one rotates away,
                        so opening a row reads as the question resolving into a
                        line rather than as a glyph swapping. */}
                    <span
                      aria-hidden="true"
                      className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 ease-out group-open:border-ink group-hover:border-ink"
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-px bg-current transition-transform duration-300 ease-out group-open:rotate-90 group-open:scale-y-0" />
                    </span>
                  </summary>

                  <div className="v2-faq-panel">
                    <div>
                      <p className="max-w-[58ch] pb-8 pl-0 pr-14 text-v2-body text-ink-soft sm:pl-12">
                        {a}
                      </p>
                    </div>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
