import Link from "next/link";
import Arrow from "@/components/v2/ui/Arrow";
import SectionHeader from "@/components/v2/sections/SectionHeader";

/**
 * Sixty prices do not tell anyone what to book. This does the sorting the menu
 * cannot: the reader's situation on the left, the styles that suit it on the
 * right, each one an anchor into the category below.
 *
 * Same ruled index and same pointer behaviour as the homepage service list and
 * the coaching chooser, so the third time a reader meets this pattern on the
 * site they already know it reads top to bottom and each row goes somewhere.
 */
const ROUTES = [
  {
    situation: "My hair is fragile right now",
    answer: "Threading, flat twists, or a treatment before anything else",
    href: "#treatments",
  },
  {
    situation: "I want six weeks off my hair",
    answer: "Mini twists, mini braids or micro twists",
    href: "#twists",
  },
  {
    situation: "I want length stretched without heat",
    answer: "African threading, also called KiKo",
    href: "#threading",
  },
  {
    situation: "I am trying to grow my edges back",
    answer: "Nothing that pulls the hairline — and a coaching session",
    href: "/v2/consultation",
  },
];

export default function ChooseAStyle() {
  return (
    <section aria-labelledby="choose-a-style-heading">
      <SectionHeader
        id="choose-a-style-heading"
        eyebrow="Choosing, honestly"
        title="Three things decide what suits you"
        lede="The condition your hair is in today, how long you want the style to last, and how much time you can give a wash day. Tell us at booking what your hair has been through recently — it changes what we recommend."
      />

      <ol className="v2-index mt-12 border-t border-ink/15 md:mt-16">
        {ROUTES.map(({ situation, answer, href }, i) => (
          <li key={situation} className="border-b border-ink/15">
            <Link
              href={href}
              className="group relative grid items-baseline py-7 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.1fr)_2rem] md:gap-x-10 md:py-9"
            >
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

              <p className="max-w-[24ch] font-display text-[clamp(1.25rem,1.05rem+1vw,1.875rem)] uppercase leading-[1.08] text-ink transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                &ldquo;{situation}&rdquo;
              </p>

              <div className="mt-3 flex items-end justify-between gap-6 md:mt-0 md:items-baseline">
                <p className="max-w-[38ch] text-v2-body text-ink-soft">
                  {answer}
                </p>
                <Arrow className="h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5 md:hidden" />
              </div>

              <Arrow className="col-start-4 mt-1 hidden h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5 md:block" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
