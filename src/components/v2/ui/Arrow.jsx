/**
 * Line arrow used for directional affordances across V2 — a single stroked
 * rule with an open chevron head, rather than a filled glyph.
 *
 * Inherits `currentColor`, so set the color on the parent.
 */
export default function Arrow({ className, ...props }) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className={className}
      {...props}
    >
      <path
        d="M19.4269 7.93748L19.4345 7.93782C19.4345 7.93782 12.0037 8.22109 12.0037 15.8754M19.4269 7.93748C19.1589 7.92463 12.0034 7.51104 12.0034 0M19.4269 7.93748H0M19.4269 7.93748H19.7211"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}
