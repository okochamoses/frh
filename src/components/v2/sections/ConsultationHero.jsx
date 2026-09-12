import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import { WHATSAPP_ASK_GENERAL } from "@/components/v2/coaching";

/**
 * The page's opening statement, on the same dark surface the homepage uses
 * for its one coaching mention — so a reader arriving from that card lands
 * on a surface they already recognise as "the coaching part of the site".
 * Grained like the homepage's own two full-bleed bands, so every band on the
 * site shares one texture.
 *
 * No counted claims here. A round number a first-time reader cannot check
 * ("200+ women coached") buys less trust than three plain facts, each of
 * which is answered again further down the page.
 */
const FACTS = [
  "In salon at Isolo, or by video call",
  "Sessions from ₦20,000",
  "You leave with the plan written down",
];

export default function ConsultationHero() {
  return (
    <section
      aria-labelledby="consultation-hero-heading"
      className="v2-hero-bg relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-obsidian px-4 pb-16 pt-16 text-center text-white md:px-8 md:pb-20 md:pt-20"
    >
      <div className="relative z-10 mx-auto flex max-w-[calc(var(--v2-container)-4rem)] flex-col items-center">
        <Reveal>
          <p className="type-eyebrow !text-white/55">Hair coaching with Mariam</p>
          <h1
            id="consultation-hero-heading"
            className="mt-6 max-w-[16ch] font-display text-[clamp(2.75rem,1.8rem+4vw,5.5rem)] uppercase leading-[0.92] text-white"
          >
            Your hair was never the problem
          </h1>
        </Reveal>

        <Reveal delay={100}>
          <p className="mt-7 max-w-[52ch] text-v2-body text-white/70 md:text-[1.125rem] md:leading-[1.55]">
            It is the routine. A coaching session is a proper read of your
            scalp, porosity and density, and then a wash day built around your
            real budget and the time you actually have — not someone
            else&apos;s hair, and not a list of products to go and buy.
          </p>
        </Reveal>

        <Reveal
          delay={180}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button href="#paths" withArrow className="bg-white text-ink hover:bg-white/90">
            See the four sessions
          </Button>
          <Button
            variant="secondary"
            href={WHATSAPP_ASK_GENERAL}
            target="_blank"
            rel="noreferrer"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Ask which one suits you
          </Button>
        </Reveal>

        {/* Facts, not figures. Each one is checkable on this page. */}
        <Reveal
          delay={260}
          as="ul"
          className="mt-12 flex w-full max-w-3xl flex-col items-center gap-3 border-t border-white/15 pt-7 sm:flex-row sm:justify-center sm:gap-0"
        >
          {FACTS.map((fact) => (
            <li
              key={fact}
              className="type-eyebrow !text-white/55 sm:flex-1 sm:px-6 sm:text-center sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-white/20"
            >
              {fact}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
