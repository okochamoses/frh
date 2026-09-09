import SectionHeader from "@/components/v2/sections/SectionHeader";
import Button from "@/components/v2/ui/Button";

const REASONS = [
  {
    title: "We only do 4C hair",
    body: "Not a texture we also handle. It is the hair the whole salon is built around.",
  },
  {
    title: "Nobody pulls your edges",
    body: "Low tension at the hairline is the rule here, not a favour. If it hurts, we redo it.",
  },
  {
    title: "We tell you the truth",
    body: "If a style will cost you your edges, we say so before we start, not after.",
  },
  {
    title: "Your slot is your slot",
    body: "Limited bookings a day, so nobody is rushed and nobody sits with a half finished head.",
  },
];

/**
 * The one dark band on the page, and the page's argument: four promises, made
 * plainly.
 *
 * These were circled icons before — a shield, a clock, a medal — which is the
 * visual language of a feature list, not of a promise. Stock glyphs also say
 * nothing a salon could not claim, so they added decoration and no credibility.
 * The claims now carry themselves in type, hung off hairlines, and the band
 * ends on the action they are meant to earn.
 */
export default function WhyChooseUs() {
  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-obsidian px-4 py-20 md:px-8 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[var(--v2-container)]">
        <SectionHeader
          id="why-choose-us-heading"
          eyebrow="Why they stay"
          title="Why women stop salon hopping"
          align="center"
          tone="inverse"
        />

        <ul className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {REASONS.map(({ title, body }) => (
            <li key={title} className="border-t border-white/20 pt-6">
              <h3 className="max-w-[16ch] font-display text-[clamp(1.5rem,1.3rem+0.7vw,1.875rem)] uppercase leading-[1.02] text-white">
                {title}
              </h3>
              <p className="mt-4 max-w-[30ch] text-v2-body text-white/60">
                {body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 md:mt-20">
          <Button
            withArrow
            href="/v2/booking"
            className="bg-white text-ink hover:bg-white/90"
          >
            Book a salon visit
          </Button>
          <Button
            variant="secondary"
            href="https://wa.me/2348110215014"
            target="_blank"
            rel="noreferrer"
            className="border-white/40 text-white hover:bg-white/10"
          >
            Ask a question on WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
