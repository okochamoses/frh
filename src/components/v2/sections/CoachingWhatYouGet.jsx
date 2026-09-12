import Reveal from "@/components/v2/ui/Reveal";

const DELIVERABLES = [
  {
    title: "A proper read of your hair",
    body: "Scalp, porosity, density, and the damage that is already there. Named plainly, so you know what you are working with.",
  },
  {
    title: "A routine built around your week",
    body: "A wash day and a night routine that fit the time you actually have and the money you actually want to spend.",
  },
  {
    title: "A product list you can buy in Lagos",
    body: "What to use, in what order, and what to stop buying. No imports you have to chase and no brand you cannot find.",
  },
  {
    title: "The plan, written down",
    body: "You leave with it in your hand rather than in your memory, so week three looks like week one.",
  },
];

/**
 * What is actually being sold, set before the prices rather than after them.
 *
 * The gold panel keeps the page's colour order intact — obsidian at the top,
 * cream through the middle, mustard at the close — now that the lead
 * testimonial that used to carry gold is held back until there are real
 * reviews to put in it.
 */
export default function CoachingWhatYouGet() {
  return (
    <section aria-labelledby="what-you-get-heading">
      <Reveal className="rounded-v2-4xl bg-gold p-8 md:p-12 lg:p-16">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="type-eyebrow !text-ink/60">Every session, whichever you pick</p>
            <h2
              id="what-you-get-heading"
              className="mt-5 max-w-[14ch] font-display text-display-fluid uppercase leading-[0.95] text-ink"
            >
              What you leave with
            </h2>
            <p className="mt-7 max-w-[34ch] text-v2-body text-ink/70">
              Not a pep talk and not a product haul. Four things you can hold
              up against your hair next wash day.
            </p>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {DELIVERABLES.map(({ title, body }, i) => (
              <Reveal
                key={title}
                as="li"
                delay={i * 70}
                className="flex items-baseline gap-5 border-t border-ink/20 py-6 first:border-t-0 first:pt-0 last:pb-0 sm:gap-7"
              >
                <span
                  aria-hidden="true"
                  className="type-eyebrow shrink-0 tabular-nums !text-ink/45"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-v2-body text-ink/70">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
