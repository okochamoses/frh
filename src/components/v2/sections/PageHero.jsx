import Reveal from "@/components/v2/ui/Reveal";

/**
 * The masthead every v2 page below the homepage opens on.
 *
 * The homepage hero is a full-screen wordmark and the coaching hero is a dark
 * band; both are arrival moments. An interior page is not arrived at so much
 * as navigated to, so this is deliberately shorter: a kicker, the statement,
 * a lede, and whatever the page wants you to do — set on the same glow the
 * nav carries, so the band and the bar read as one block of colour the way
 * they do on the homepage.
 *
 * `meta` is a row of plain facts under the actions. Facts, never figures we
 * cannot show the reader.
 */
export default function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  meta,
  align = "left",
}) {
  const centered = align === "center";

  return (
    <section
      className={`v2-hero-bg v2-topband relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 pb-14 pt-14 md:px-8 md:pb-20 md:pt-20 ${
        centered ? "text-center" : ""
      }`}
    >
      <div
        className={`relative z-10 mx-auto flex max-w-[var(--v2-container)] flex-col ${
          centered ? "items-center" : ""
        }`}
      >
        <Reveal className={centered ? "flex flex-col items-center" : ""}>
          <p className="type-eyebrow">{eyebrow}</p>
          <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(2.5rem,1.7rem+3.4vw,4.75rem)] uppercase leading-[0.94] text-ink">
            {title}
          </h1>
        </Reveal>

        {lede && (
          <Reveal delay={100}>
            <p
              className={`mt-7 max-w-[52ch] text-v2-body text-ink-soft md:text-[1.125rem] md:leading-[1.55] ${
                centered ? "mx-auto" : ""
              }`}
            >
              {lede}
            </p>
          </Reveal>
        )}

        {actions && (
          <Reveal
            delay={170}
            className={`mt-9 flex flex-wrap items-center gap-3 ${
              centered ? "justify-center" : ""
            }`}
          >
            {actions}
          </Reveal>
        )}

        {meta && meta.length > 0 && (
          <Reveal
            delay={240}
            as="ul"
            className={`mt-12 flex w-full flex-col gap-3 border-t border-ink/15 pt-7 sm:flex-row sm:gap-0 ${
              centered ? "max-w-3xl justify-center" : ""
            }`}
          >
            {meta.map((fact) => (
              <li
                key={fact}
                className={`type-eyebrow sm:px-6 sm:first:pl-0 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-ink/20 ${
                  centered ? "sm:flex-1 sm:text-center sm:first:pl-6" : ""
                }`}
              >
                {fact}
              </li>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
