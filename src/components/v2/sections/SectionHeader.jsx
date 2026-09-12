import Reveal from "@/components/v2/ui/Reveal";

/**
 * The one masthead every section below the hero is built from: kicker, display
 * headline, optional lede, optional action.
 *
 * Routing every section through here keeps the rhythm above each one
 * identical, so the page scans as one document and a new section is a data
 * change rather than a layout decision.
 *
 * `align="split"` is the editorial default: statement left, lede and action in
 * a narrower right column, both hung off a hairline that runs the full width.
 * The rule is what holds the two columns together — without it the lede floats
 * in the right-hand space as an afterthought. `align="center"` is for the
 * moments that should land as a statement on their own.
 */
export default function SectionHeader({
  eyebrow,
  title,
  lede,
  action,
  id,
  align = "split",
  tone = "ink",
  className = "",
}) {
  const dark = tone === "inverse";
  const centered = align === "center";

  if (centered) {
    return (
      <Reveal className={`flex flex-col items-center text-center ${className}`}>
        {eyebrow && (
          <p className={`type-eyebrow ${dark ? "!text-white/55" : ""}`}>
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={`mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,1.5rem+3vw,4.25rem)] uppercase leading-[0.95] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {lede && (
          <p
            className={`mt-6 max-w-[42ch] text-v2-body md:text-[1.125rem] ${
              dark ? "text-white/70" : "text-ink-soft"
            }`}
          >
            {lede}
          </p>
        )}
        {action && <div className="mt-7">{action}</div>}
      </Reveal>
    );
  }

  return (
    <div
      className={`border-t pt-6 md:pt-8 ${
        dark ? "border-white/15" : "border-ink/15"
      } ${className}`}
    >
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-12 md:items-end">
        <Reveal className="md:col-span-7">
          {eyebrow && (
            <p className={`type-eyebrow ${dark ? "!text-white/55" : ""}`}>
              {eyebrow}
            </p>
          )}
          <h2
            id={id}
            className={`mt-5 max-w-[16ch] font-display text-display-fluid uppercase leading-[0.95] ${
              dark ? "text-white" : "text-ink"
            }`}
          >
            {title}
          </h2>
        </Reveal>

        {(lede || action) && (
          <Reveal delay={120} className="md:col-span-4 md:col-start-9">
            {lede && (
              <p
                className={`max-w-[40ch] text-v2-body md:text-[1.125rem] md:leading-[1.5] ${
                  dark ? "text-white/70" : "text-ink-soft"
                }`}
              >
                {lede}
              </p>
            )}
            {action && <div className={lede ? "mt-6" : ""}>{action}</div>}
          </Reveal>
        )}
      </div>
    </div>
  );
}
