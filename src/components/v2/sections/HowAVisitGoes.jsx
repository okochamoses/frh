import SectionHeader from "@/components/v2/sections/SectionHeader";
import Button from "@/components/v2/ui/Button";

const STEPS = [
  {
    title: "We look before we touch",
    body: "Scalp, edges, ends, density. If your hair is not ready for the style you booked, we say so and offer you something that works today.",
  },
  {
    title: "We detangle with patience",
    body: "Damp hair, in sections, worked from the ends up. This is the part most salons rush, and it is the part that decides how much hair you keep.",
  },
  {
    title: "We style at a tension you can live with",
    body: "If it stings, tell us. We take it down and redo it. A style should not need painkillers, and tightness is not a sign of good work.",
  },
  {
    title: "You leave knowing what to do next",
    body: "How to wash it, how to sleep in it, when to take it down and what to watch for. Written down, not called after you at the door.",
  },
];

/**
 * The four steps of an appointment, set as a measured walk across the page
 * rather than a stack of paragraphs: a continuous rule with four numbers
 * hanging off it, one per column.
 *
 * On a phone the four columns become a snap rail. Four full-height steps would
 * be a long scroll to get past for a reader who only wants to know whether we
 * are worth booking, whereas a rail costs one screen and still shows there are
 * four of them — the peek of the next card is the affordance.
 */
export default function HowAVisitGoes() {
  return (
    <section aria-labelledby="how-a-visit-goes-heading">
      <SectionHeader
        id="how-a-visit-goes-heading"
        eyebrow="A visit, start to finish"
        title="What happens when you come in"
        lede="No surprises, no upselling, no five hour mystery."
        action={
          <Button variant="tertiary" withArrow href="/v2/booking">
            Book a salon visit
          </Button>
        }
      />

      {/* Negative margins let the rail bleed to the screen edge on a phone, so
          the peeking next step is not clipped by the page gutter. */}
      <ol className="mt-14 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-20 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:px-0">
        {STEPS.map(({ title, body }, i) => (
          <li
            key={title}
            className="w-[78vw] shrink-0 snap-start border-t border-ink pt-5 sm:w-[52vw] md:w-auto"
          >
            <p className="type-eyebrow tabular-nums text-ink">
              {String(i + 1).padStart(2, "0")}
              <span className="text-ash"> / 04</span>
            </p>
            <h3 className="mt-6 max-w-[18ch] font-display text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] uppercase leading-[1] text-ink">
              {title}
            </h3>
            <p className="mt-4 text-v2-body text-ink-soft">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
