import Link from "next/link";
import Arrow from "@/components/v2/ui/Arrow";
import Button from "@/components/v2/ui/Button";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import { PATHS, WHATSAPP_ASK_GENERAL } from "@/components/v2/coaching";

/**
 * The same ruled index the homepage uses for its service families, turned the
 * other way round: the reader's own words on the left, the session that
 * answers them on the right.
 *
 * Four priced cards is a decision a first-time reader has to make on our terms
 * — comparing feature lists they cannot yet judge. This asks the only question
 * they can answer without help, and then makes the choice for them. Each row
 * jumps back up to its card, so nothing is bought from here blind.
 *
 * It borrows the index's pointer behaviour wholesale (`.v2-index` in v2.css):
 * hovering or focusing one row steps the other three back, so the list gets
 * quieter under the cursor rather than louder.
 */
export default function CoachingChooser() {
  return (
    <section aria-labelledby="coaching-chooser-heading">
      <SectionHeader
        id="coaching-chooser-heading"
        eyebrow="Still deciding"
        title="Start from what is bothering you"
        lede="Find the line that sounds most like your hair this month. It points at the session built for it."
        action={
          <Button
            variant="tertiary"
            withArrow
            href={WHATSAPP_ASK_GENERAL}
            target="_blank"
            rel="noreferrer"
          >
            Or ask Mariam which one
          </Button>
        }
      />

      <ol className="v2-index mt-12 border-t border-ink/15 md:mt-16">
        {PATHS.map(({ id, symptom, title, price }, i) => (
          <li key={id} className="border-b border-ink/15">
            <Link
              href={`#${id}`}
              className="group relative grid items-baseline py-7 md:grid-cols-[4rem_minmax(0,1.3fr)_minmax(0,1fr)] md:gap-x-10 md:py-9 lg:gap-x-14"
            >
              {/* The row's own rule, drawn left to right over the static
                  divider, so the row under the cursor is underlined by the
                  movement of the cursor rather than by a colour change. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px hidden h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100 md:block"
              />

              <span
                aria-hidden="true"
                className="type-eyebrow mb-3 block tabular-nums text-ash transition-colors duration-300 ease-out group-hover:text-ink md:mb-0"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <p className="max-w-[26ch] font-display text-[clamp(1.375rem,1.1rem+1.2vw,2.125rem)] uppercase leading-[1.05] text-ink transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                &ldquo;{symptom}&rdquo;
              </p>

              {/* The label sits above the session on a phone, where there is
                  no room to run it inline without the name wrapping under it. */}
              <div className="mt-4 flex items-end justify-between gap-6 md:col-start-3 md:mt-0 md:items-center md:justify-end">
                <span className="text-v2-body text-ink-soft">
                  <span className="type-eyebrow block text-ash md:mr-2 md:inline md:align-middle">
                    Start with
                  </span>{" "}
                  <span className="mt-1.5 block md:mt-0 md:inline">
                    {title} &middot;{" "}
                    <span className="tabular-nums">{price}</span>
                  </span>
                </span>
                <Arrow className="h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
