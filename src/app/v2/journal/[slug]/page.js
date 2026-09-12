import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Arrow from "@/components/v2/ui/Arrow";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import NewsletterSection from "@/components/v2/sections/NewsletterSection";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import {
  ARTICLES,
  ARTICLE_BY_SLUG,
  ARTICLES_NEWEST_FIRST,
  formatPublished,
} from "@/content/journal";
import { whatsapp } from "@/components/v2/salon";

export function generateStaticParams() {
  return ARTICLES.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }) {
  const article = ARTICLE_BY_SLUG.get(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} — Flourish Roots Hair`,
    description: article.summary,
  };
}

/**
 * One article.
 *
 * Set as a single measured column rather than the site's usual twelve-column
 * split: this is the one page on the site whose whole job is being read
 * straight through, and a reading column wants one edge to return to, not two.
 * The measure is capped near 64 characters, which is where long-form stops
 * costing the reader their place on each line return.
 */
export default function JournalArticlePage({ params }) {
  const article = ARTICLE_BY_SLUG.get(params.slug);
  if (!article) notFound();

  const others = ARTICLES_NEWEST_FIRST.filter((a) => a.slug !== article.slug);

  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <article>
        <header className="pt-12 md:pt-16">
          <Reveal className="mx-auto max-w-[46rem]">
            <Link
              href="/v2/journal"
              className="type-eyebrow inline-flex items-center gap-2 text-ash transition-colors duration-200 ease-out hover:text-ink"
            >
              <Arrow className="h-3 w-4 rotate-180" />
              The hair journal
            </Link>

            <h1 className="mt-7 font-display text-[clamp(2.25rem,1.6rem+2.8vw,4rem)] uppercase leading-[0.96] text-ink">
              {article.title}
            </h1>

            <p className="mt-7 text-v2-body text-ink-soft md:text-[1.25rem] md:leading-[1.5]">
              {article.intro}
            </p>

            <p className="mt-8 type-eyebrow tabular-nums">
              {article.kicker} &middot; {formatPublished(article.published)}{" "}
              &middot; {article.readingMinutes} min read
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <figure className="relative aspect-[16/9] overflow-hidden rounded-v2-4xl bg-cream-100">
              <Image
                src={article.image}
                alt={article.imageAlt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </figure>
          </Reveal>
        </header>

        <div className="mx-auto mt-16 max-w-[46rem] md:mt-20">
          {article.sections.map(({ heading, paragraphs }, i) => (
            <Reveal key={heading} delay={i * 50} className="mt-14 first:mt-0">
              <h2 className="max-w-[24ch] font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.125rem)] uppercase leading-[1.08] text-ink">
                {heading}
              </h2>
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-5 text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.65]"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>
          ))}

          {article.footnote && (
            <Reveal className="mt-14">
              <p className="border-l-2 border-slat pl-6 text-v2-body italic text-ink">
                {article.footnote}
              </p>
            </Reveal>
          )}

          <Reveal className="mt-16 rounded-v2-3xl bg-cream-100 p-8 md:p-10">
            <p className="type-eyebrow">Still not sure</p>
            <p className="mt-4 max-w-[40ch] font-display text-v2-h3 uppercase leading-[1.15] text-ink">
              Send us a photograph and we will tell you what we see
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                href={whatsapp(`Hi — I've just read "${article.title}" on your journal and I have a question about my hair.`)}
                target="_blank"
                rel="noreferrer"
              >
                Ask on WhatsApp
              </Button>
              <Button variant="tertiary" withArrow href="/v2/consultation">
                Or book a coaching session
              </Button>
            </div>
          </Reveal>
        </div>
      </article>

      {others.length > 0 && (
        <section aria-labelledby="more-reading-heading">
          <h2
            id="more-reading-heading"
            className="border-t border-ink/15 pt-6 type-eyebrow md:pt-8"
          >
            More from the journal
          </h2>

          <ol className="v2-index mt-8 border-t border-ink/15">
            {others.map(({ slug, title, kicker, summary }) => (
              <li key={slug} className="border-b border-ink/15">
                <Link
                  href={`/v2/journal/${slug}`}
                  className="group relative grid items-baseline gap-x-10 py-8 md:grid-cols-[9rem_minmax(0,1.1fr)_minmax(0,1fr)_2rem]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px hidden h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100 md:block"
                  />
                  <span className="type-eyebrow mb-3 block text-ash transition-colors duration-300 ease-out group-hover:text-ink md:mb-0">
                    {kicker}
                  </span>
                  <h3 className="max-w-[24ch] font-display text-[clamp(1.25rem,1.05rem+1vw,1.75rem)] uppercase leading-[1.08] text-ink transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-[42ch] text-v2-body text-ink-soft md:mt-0">
                    {summary}
                  </p>
                  <Arrow className="col-start-4 mt-1 hidden h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5 md:block" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <NewsletterSection />
      <ClosingCta />
    </main>
  );
}
