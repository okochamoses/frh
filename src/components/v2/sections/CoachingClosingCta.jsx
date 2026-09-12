import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import { WHATSAPP_ASK_GENERAL } from "@/components/v2/coaching";

/**
 * The page's last word — the same grained mustard band the homepage closes
 * on, so leaving this page for a booking feels like the same site rather than
 * a different one.
 *
 * No countdown and no last call. The reader has just been through four prices
 * and a booking process; the close restates the offer and gets out of the way.
 */
export default function CoachingClosingCta() {
  return (
    <section
      aria-labelledby="coaching-closing-cta-heading"
      className="v2-hero-bg relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-mustard"
    >
      <div className="relative z-10 px-4 py-20 text-center md:px-8 md:py-28">
        <div className="mx-auto flex max-w-[var(--v2-container)] flex-col items-center">
          <Reveal>
            <p className="type-eyebrow !text-ink">
              Isolo, Lagos &middot; Video calls anywhere
            </p>
            <h2
              id="coaching-closing-cta-heading"
              className="mt-6 max-w-[16ch] font-display text-[clamp(2.5rem,1.6rem+4vw,5.5rem)] uppercase leading-[0.92] text-ink"
            >
              Start with your hair as it is
            </h2>
          </Reveal>

          <Reveal delay={120} className="flex flex-col items-center">
            <p className="mt-7 max-w-[44ch] text-v2-body text-ink/70 md:text-[1.125rem]">
              Bring what you have tried, what it cost you and what went wrong.
              None of it is news to us, and all of it is where the plan starts.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button href="#paths" withArrow>
                See the four sessions
              </Button>
              <Button
                variant="secondary"
                href={WHATSAPP_ASK_GENERAL}
                target="_blank"
                rel="noreferrer"
                className="border-ink/30 hover:bg-ink/5"
              >
                Ask a question first
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
              . Looking for a style rather than a plan?{" "}
              <a
                href="/v2/booking"
                className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition-colors duration-200 ease-out hover:decoration-ink"
              >
                Book a salon visit
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
