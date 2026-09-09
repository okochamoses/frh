import Button from "@/components/v2/ui/Button";

/**
 * The page's last word, and its bookend: the same grained mustard the hero
 * opens on, full width and flush to the footer, so the reader arrives back
 * where they started with only one thing left to do.
 *
 * The phone number sits under the buttons because the readers who get this far
 * without booking are usually the ones who would rather ask a person first, and
 * making them hunt for the number in the footer loses them.
 */
export default function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="v2-hero-bg relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-mustard px-4 py-24 text-center md:px-8 md:py-32"
    >
      <div className="relative z-10 mx-auto flex max-w-[var(--v2-container)] flex-col items-center">
        <p className="type-eyebrow !text-ink/60">Isolo, Lagos · By appointment</p>

        <h2
          id="closing-cta-heading"
          className="mt-6 max-w-[16ch] font-display text-[clamp(2.5rem,1.6rem+3.6vw,5rem)] uppercase leading-[0.92] text-ink"
        >
          Your hair has been through enough
        </h2>

        <p className="mt-6 max-w-[40ch] text-v2-body text-ink/70">
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
      </div>
    </section>
  );
}
