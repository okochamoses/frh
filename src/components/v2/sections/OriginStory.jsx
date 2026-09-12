import Image from "next/image";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * Why the salon exists, told through the complaint that kept repeating rather
 * than through a founding date.
 *
 * Deliberately carries no years, no counts and no training claims. The copy
 * brief for this page is explicit that anything about a real person's history
 * is Mariam's to confirm, so the story here is built only from what the salon
 * demonstrably does — and the pull quote is her stated rule, which the whole
 * site already runs on.
 */
export default function OriginStory() {
  return (
    <section aria-labelledby="origin-heading" id="beginning" className="scroll-mt-32">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <p className="type-eyebrow">The beginning</p>
          <h2
            id="origin-heading"
            className="mt-5 max-w-[14ch] font-display text-display-fluid uppercase leading-[0.95] text-ink"
          >
            The same sentence, over and over
          </h2>

          <figure className="mt-10">
            <div className="relative aspect-[4/5] overflow-hidden rounded-v2-4xl bg-cream-100">
              <Image
                src="/founder-portrait.webp"
                alt="Mariam Okocha Ijeoma, founder of Flourish Roots Hair Co., in the salon in Isolo, Lagos"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 type-eyebrow">
              Mariam Okocha Ijeoma, founder and hair coach
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="max-w-[52ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.6]">
              Women would sit down and say a version of the same thing. My edges
              are going. My hair does not grow past a point. The last salon
              braided me so tight I could not sleep. I have stopped bothering.
            </p>
          </Reveal>

          <Reveal delay={90}>
            <p className="mt-6 max-w-[52ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.6]">
              The hair itself was rarely the problem. 4C hair is dense and
              tightly coiled and it holds a shape beautifully — but it is dry by
              nature and it does not forgive rough handling. Combed dry, it
              snaps. Braided tight, it lets go at the hairline. Left in a style
              too long, it mats at the root.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-6 max-w-[52ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.6]">
              None of that is a flaw in the hair. It is a gap in how the hair is
              being handled. Flourish Roots exists to close that gap — at Shop
              303, Destiny Plaza on Ago Palace Way, and in the routines clients
              take home with them.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <figure className="mt-12 rounded-v2-4xl bg-gold p-8 md:p-12">
              <blockquote className="max-w-[20ch] font-display text-[clamp(1.625rem,1.25rem+1.4vw,2.5rem)] uppercase leading-[1.05] text-ink">
                I would rather you left with a simpler style and all your hair,
                than a perfect style and a thinning hairline.
              </blockquote>
              <figcaption className="mt-8 border-t border-ink/20 pt-5 type-eyebrow !text-ink/65">
                Mariam Okocha Ijeoma
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-12 max-w-[52ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.6]">
              That rule is the whole method, and it is why coaching sits beside
              the styling rather than behind it. Clients were coming back after
              six weeks with the same breakage, having done everything wrong for
              reasons nobody had ever explained to them. A salon chair is six
              hours. A routine is the other six weeks.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
