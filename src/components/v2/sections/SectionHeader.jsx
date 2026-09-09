/**
 * The one masthead every section below the hero is built from: kicker, display
 * headline, optional lede, optional action.
 *
 * Sections used to each invent their own heading rhythm — some had an eyebrow,
 * some did not, the sizes drifted — which read as a page assembled from parts.
 * Routing them all through here means the vertical rhythm above the fold of
 * each section is identical, so the page scans as one document and a new
 * section is a data change rather than a layout decision.
 *
 * `align="split"` is the editorial default: statement left, lede and action in
 * a narrower right column. `align="center"` is for the moments that should
 * land as a statement on their own — the dark band, the closing call.
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

  return (
    <div
      className={`${
        centered
          ? "flex flex-col items-center text-center"
          : "grid gap-x-8 gap-y-8 md:grid-cols-12"
      } ${className}`}
    >
      <div className={centered ? "flex flex-col items-center" : "md:col-span-7"}>
        {eyebrow && (
          <p className={`type-eyebrow ${dark ? "!text-white/50" : ""}`}>
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={`mt-5 font-display uppercase leading-[0.95] ${
            centered
              ? "max-w-[18ch] text-[clamp(2.25rem,1.5rem+3vw,4.25rem)]"
              : "max-w-[16ch] text-display-fluid"
          } ${dark ? "text-white" : "text-ink"}`}
        >
          {title}
        </h2>
      </div>

      {(lede || action) && (
        <div
          className={
            centered
              ? "mt-6 flex flex-col items-center"
              : "md:col-span-4 md:col-start-9 md:self-end"
          }
        >
          {lede && (
            <p
              className={`max-w-[42ch] text-v2-body ${
                centered ? "text-center" : ""
              } ${dark ? "text-white/70" : "text-ink-soft"}`}
            >
              {lede}
            </p>
          )}
          {action && <div className={lede ? "mt-6" : ""}>{action}</div>}
        </div>
      )}
    </div>
  );
}
