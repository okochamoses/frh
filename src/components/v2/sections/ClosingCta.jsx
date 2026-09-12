import Button from "@/components/v2/ui/Button";
import Marquee from "@/components/v2/ui/Marquee";
import Reveal from "@/components/v2/ui/Reveal";

/* Read as one sentence with the headline: where, when, and on whose terms. */
const CLOSING_RULES = [
  "Book a salon visit",
  "Isolo, Lagos",
  "Tue to Sun",
  "By appointment",
];

/**
 * The page's last word, and its bookend: the one mustard band on the page, grained like the hero
 * opens on, full width and flush to the footer, so the reader arrives back
 * where they started with only one thing left to do.
 *
 * The headline is set at hero scale rather than at section scale, because this
 * is the second half of a pair — anything smaller reads as a summary of the
 * page instead of the other end of it. A marquee runs along the band's foot,
 * answering the one on the dark band above and carrying the offer past the
 * moment the reader stops reading.
 *
 * The phone number sits under the buttons because the readers who get this far
 * without booking are usually the ones who would rather ask a person first, and
 * making them hunt for the number in the footer loses them.
 */
export default function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="v2-hero-bg relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-mustard"
    >
      <div className="relative z-10 px-4 pb-16 pt-24 text-center md:px-8 md:pb-20 md:pt-32">
        <div className="mx-auto flex max-w-[var(--v2-container)] flex-col items-center">
          <Reveal>
            <p className="type-eyebrow !text-ink">
              Isolo, Lagos &middot; By appointment
            </p>

            <h2
              id="closing-cta-heading"
              className="mt-6 max-w-[14ch] font-display text-[clamp(2.75rem,1.6rem+4.6vw,6.5rem)] uppercase leading-[0.9] text-ink"
            >
              Your hair has been through enough
            </h2>
          </Reveal>

          <Reveal delay={120} className="flex flex-col items-center">
            <p className="mt-7 max-w-[38ch] text-v2-body text-ink/70 md:text-[1.125rem]">
              Book a slot in Isolo and let us get it back.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button href="/v2/booking" withArrow>
                Book a salon visit
              </Button>
              <Button
                variant="secondary"
                href="/v2/consultation"
                className="border-ink/30 hover:bg-ink/5"
              >
                Not sure what you need? Talk to Mariam
              </Button>
            </div>

            <p className="mt-8 text-v2-body-sm text-ink/70">
              Or call{" "}
              <a
                href="tel:+2348110215014"
                className="font-semibold tabular-nums text-ink underline decoration-ink/30 underline-offset-4 transition-colors duration-200 ease-out hover:decoration-ink"
              >
                0811 021 5014
              </a>
            </p>
          </Reveal>
        </div>
      </div>

      <Marquee
        items={CLOSING_RULES}
        duration={50}
        className="relative z-10 border-t border-ink/20 py-5 font-display text-[clamp(0.9rem,0.8rem+0.4vw,1.125rem)] uppercase tracking-[0.16em] text-ink"
      />
    </section>
  );
}
