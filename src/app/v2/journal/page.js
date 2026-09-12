import Image from "next/image";
import Link from "next/link";
import Arrow from "@/components/v2/ui/Arrow";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import PageHero from "@/components/v2/sections/PageHero";
import NewsletterSection from "@/components/v2/sections/NewsletterSection";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { ARTICLES_NEWEST_FIRST, formatPublished } from "@/content/journal";

export const metadata = {
  title: "The hair journal — Flourish Roots Hair",
  description:
    "Guides from the stylists at Flourish Roots: detangling 4C hair, tension and protective styling, and when to take a style out. Written for Lagos.",
};

const [LEAD, ...REST] = ARTICLES_NEWEST_FIRST;

/**
 * The journal index: one lead piece with its photograph, the rest as a ruled
 * index below it.
 *
 * Three articles do not need a card grid — a grid of three makes a thin
 * archive look thinner. A lead and a list reads like a publication that has
 * chosen what matters most this week, which is what it is.
 */
export default function JournalPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow="The hair journal"
        title="What we would tell you in the chair"
        lede="The things that come up in every appointment, written down so you have them at home. No miracle routines and no promises about inches — just the handling that decides how much hair you keep."
        actions={
          <Button variant="tertiary" withArrow href="/v2/free-guide">
            Get the full guide by email
          </Button>
        }
        meta={["Written by the stylists", "For 4C hair", "Products you can buy in Lagos"]}
      />

      <section aria-label="Latest from the journal">
        <Reveal>
          <Link
            href={`/v2/journal/${LEAD.slug}`}
            className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12"
          >
            <figure className="relative aspect-[4/3] overflow-hidden rounded-v2-4xl bg-cream-100 lg:col-span-7">
              <Image
                src={LEAD.image}
                alt={LEAD.imageAlt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
            </figure>

            <div className="lg:col-span-5">
              <p className="type-eyebrow">
                {LEAD.kicker} &middot; {LEAD.readingMinutes} min read
              </p>
              <h2 className="mt-5 max-w-[18ch] font-display text-display-fluid uppercase leading-[0.95] text-ink transition-transform duration-500 ease-out lg:group-hover:translate-x-2">
                {LEAD.title}
              </h2>
              <p className="mt-6 max-w-[44ch] text-v2-body text-ink-soft md:text-[1.125rem]">
                {LEAD.summary}
              </p>
              <span className="mt-8 inline-flex items-center gap-3 text-v2-body font-semibold text-ink">
                Read it
                <Arrow className="h-4 w-5 transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
              </span>
            </div>
          </Link>
        </Reveal>

        {REST.length > 0 && (
          <ol className="v2-index mt-16 border-t border-ink/15 md:mt-20">
            {REST.map(({ slug, title, kicker, summary, readingMinutes, published }, i) => (
              <li key={slug} className="border-b border-ink/15">
                <Link
                  href={`/v2/journal/${slug}`}
                  className="group relative grid items-baseline gap-x-10 py-8 md:grid-cols-[9rem_minmax(0,1.1fr)_minmax(0,1fr)_2rem] md:py-10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px hidden h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100 md:block"
                  />

                  <span className="type-eyebrow mb-3 block text-ash transition-colors duration-300 ease-out group-hover:text-ink md:mb-0">
                    {kicker}
                  </span>

                  <h3 className="max-w-[24ch] font-display text-[clamp(1.375rem,1.1rem+1.1vw,2rem)] uppercase leading-[1.05] text-ink transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                    {title}
                  </h3>

                  <div className="mt-3 md:mt-0">
                    <p className="max-w-[42ch] text-v2-body text-ink-soft">
                      {summary}
                    </p>
                    <p className="mt-2 type-eyebrow tabular-nums">
                      {formatPublished(published)} &middot; {readingMinutes} min read
                    </p>
                  </div>

                  <Arrow className="col-start-4 mt-1 hidden h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5 md:block" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <NewsletterSection />
      <ClosingCta />
    </main>
  );
}
