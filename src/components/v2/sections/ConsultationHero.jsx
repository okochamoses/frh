import Image from "next/image";
import Button from "@/components/v2/ui/Button";
import Marquee from "@/components/v2/ui/Marquee";
import Reveal from "@/components/v2/ui/Reveal";
import { WHATSAPP_ASK_GENERAL } from "@/components/v2/coaching";

/**
 * The page's opening statement, on the same dark surface the homepage uses
 * for its one coaching mention — so a reader arriving from that card lands
 * on a surface they already recognise as "the coaching part of the site".
 * Grained like the homepage's own two full-bleed bands, so every band on the
 * site shares one texture.
 *
 * Laid out as an asymmetric editorial split rather than a centred stack: the
 * claim reads down the left at display scale, the person making it stands on
 * the right. Coaching is sold on a face and a sentence, and a centred column
 * gives neither of them any weight.
 *
 * The headline is set line by line so "never" can carry the one mustard note
 * on the band and "problem" can sit as an outline, which puts the emphasis on
 * the turn in the sentence rather than on its volume. Lines are separate
 * elements only for that reason — the h1 still reads as one sentence.
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

const TICKER = [
  "Scalp read",
  "Porosity",
  "Density",
  "Wash day",
  "Written routine",
  "Your budget",
];

export default function ConsultationHero() {
  return (
    <section
      aria-labelledby="consultation-hero-heading"
      className="v2-hero-bg relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-obsidian text-white"
    >
      <div className="relative z-10 mx-auto w-full max-w-[var(--v2-container)] px-4 pb-14 pt-12 md:px-8 md:pb-16 md:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          {/* The claim. */}
          <div className="lg:col-span-7">
            <Reveal className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="h-px w-10 shrink-0 bg-white/30"
              />
              <p className="type-eyebrow !text-white/55">
                Hair coaching with Mariam
              </p>
            </Reveal>

            <h1
              id="consultation-hero-heading"
              className="mt-7 font-display text-[clamp(3rem,1.6rem+6.4vw,7.5rem)] uppercase leading-[0.86] tracking-[-0.02em]"
            >
              {/* Each line staggers in on its own beat, the way a sentence
                  lands when it is spoken rather than read. */}
              <Reveal as="span" className="block">
                Your hair
              </Reveal>
              <Reveal as="span" delay={90} className="block text-mustard">
                was never
              </Reveal>
              <Reveal
                as="span"
                delay={180}
                className="block text-transparent"
                // Reveal spreads `style` after its own, so the stagger delay
                // has to be restated here or this line arrives with the first.
                style={{
                  transitionDelay: "180ms",
                  WebkitTextStroke: "1px rgba(255,255,255,0.55)",
                }}
              >
                the problem
              </Reveal>
            </h1>

            <Reveal delay={240}>
              <p className="mt-8 max-w-[46ch] text-v2-body text-white/70 md:text-[1.125rem] md:leading-[1.55]">
                It is the routine. A coaching session is a proper read of your
                scalp, porosity and density, and then a wash day built around
                your real budget and the time you actually have — not someone
                else&apos;s hair, and not a list of products to go and buy.
              </p>
            </Reveal>

            <Reveal
              delay={310}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button
                href="#paths"
                withArrow
                className="bg-white text-ink hover:bg-white/90"
              >
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
          </div>

          {/* The person making it. Hidden below lg: at phone widths the
              portrait would cost a full screen before the reader reaches the
              buttons, and MeetMariam shows the same face further down. */}
          <Reveal delay={160} className="hidden lg:col-span-5 lg:block">
            <figure className="group relative aspect-[4/5] w-full overflow-hidden rounded-v2-4xl bg-white/5">
              <Image
                src="/founder-portrait.webp"
                alt="Mariam Okocha Ijeoma, founder of Flourish Roots Hair"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 0px"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
              <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-v2-2xl bg-obsidian/70 px-5 py-4 backdrop-blur-sm">
                <span className="type-eyebrow !text-white/70">
                  Mariam Okocha Ijeoma
                  <span className="mt-1 block !text-white/45">
                    Trichology-trained, Isolo
                  </span>
                </span>
                <span className="shrink-0 font-display text-[1.5rem] uppercase leading-none tabular-nums text-mustard">
                  ₦20,000
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Facts, not figures. Each one is checkable on this page. */}
        <Reveal
          delay={380}
          as="ul"
          className="mt-14 flex w-full flex-col gap-3 border-t border-white/15 pt-7 sm:flex-row sm:gap-0"
        >
          {FACTS.map((fact) => (
            <li
              key={fact}
              className="type-eyebrow !text-white/55 sm:flex-1 sm:px-6 sm:first:pl-0 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-white/20"
            >
              {fact}
            </li>
          ))}
        </Reveal>
      </div>

      {/* What a session actually covers, travelling along the foot of the band
          — the same device the homepage and the closing call use. */}
      <Marquee
        items={TICKER}
        duration={55}
        className="relative z-10 border-t border-white/15 py-4 font-display text-[clamp(0.85rem,0.78rem+0.35vw,1rem)] uppercase tracking-[0.18em] text-white/45"
      />
    </section>
  );
}
