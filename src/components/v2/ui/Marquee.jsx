/**
 * A single line of words travelling slowly across a full-bleed band.
 *
 * The track holds the same list twice and translates by exactly -50%, which is
 * what makes the loop seamless: at the end of the cycle copy two sits exactly
 * where copy one started. Duplicating in markup rather than measuring in JS
 * keeps this a server component — the whole effect is one CSS animation on a
 * transform, so it never touches the main thread after paint.
 *
 * The duplicate is hidden from assistive tech, and the strip stops entirely
 * under `prefers-reduced-motion` (see `.v2-marquee` in v2.css), where it reads
 * as a static row of words rather than a stalled animation.
 */
export default function Marquee({ items, className = "", duration = 40 }) {
  const line = (hidden) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-[0.6em]">{item}</span>
          <span aria-hidden="true" className="opacity-40">
            &#8226;
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`v2-marquee ${className}`}>
      <div
        className="v2-marquee-track flex w-max"
        style={{ "--v2-marquee-duration": `${duration}s` }}
      >
        {line(false)}
        {line(true)}
      </div>
    </div>
  );
}
