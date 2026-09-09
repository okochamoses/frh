/**
 * Centered statement that introduces the section below it: display headline
 * over a short line of body copy. Kept generic so other pages can reuse it.
 */
export default function SectionIntro({ title, body, className }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-[var(--v2-container)] text-center">
        <h2 className="mx-auto max-w-[15ch] font-display text-display-fluid text-ink md:max-w-[22ch] md:text-balance">
          {title}
        </h2>

        {body && (
          <p className="mx-auto mt-9 max-w-[34ch] text-pretty text-v2-body leading-[1.3] text-ink-soft md:mt-7 md:text-[1.25rem]">
            {body}
          </p>
        )}
      </div>
    </section>
  );
}
