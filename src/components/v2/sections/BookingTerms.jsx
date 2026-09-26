import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * The things that catch people out, said before they book rather than after.
 * The voice guide's line — "say the price, say the deposit; clarity is a
 * kindness" — is the whole brief for this section.
 *
 * Shared by the services page and the salon page, which both need it and were
 * never going to keep two copies in step.
 *
 * There are no penalties left to state. The salon charges no late fee and
 * takes nothing back when a booking moves or is cancelled, so the only two
 * numbers here are the deposit that holds a long style and the extras that
 * change what a service itself costs — both quoted before any money moves.
 */
const TERMS = [
  {
    title: "Deposits hold the long styles",
    body: "50% on mini twists, mini braids, natural hair braids, Bantu knots and mini or micro twist loosening. 70% on micro twists and sister locs. Everything else is settled on the day.",
    note: "Transfer to the salon account shown at checkout and send the proof to the office line. Until it lands, the slot is still open to somebody else.",
  },
  {
    title: "Changing a booking costs nothing",
    body: "Move it or cancel it, as late as you like, and there is no charge for doing either. A deposit you have already paid goes to whichever day you move to.",
    note: "Plans change, hair does not care, and a client who has to cancel should not be deciding between losing money and sitting in a chair they no longer want.",
  },
  {
    title: "The only things that cost more",
    body: "Attaching beads you bring is ₦500, styling twists once they are in is ₦1,000, and badly matted hair takes longer to detangle than the menu allows for.",
    note: "Every one of them is quoted to you before we start, never added at the end. Nothing else is added to your price for any reason.",
  },
];

export default function BookingTerms() {
  return (
    <section aria-labelledby="booking-terms-heading">
      <SectionHeader
        id="booking-terms-heading"
        eyebrow="Before you book"
        title="Three things, said plainly"
        lede="None of this is buried in a policy page. If a style needs a deposit, or if something about your hair will cost more than the menu price, you are told the number before you pay anything."
      />

      <ol className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
        {TERMS.map(({ title, body, note }, i) => (
          <li key={title}>
            <Reveal
              delay={i * 80}
              className="flex h-full flex-col rounded-v2-3xl bg-cream-100 p-7 md:p-8"
            >
              <span className="font-display text-[3.5rem] font-bold leading-none tabular-nums text-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 max-w-[18ch] font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                {title}
              </h3>
              <p className="mt-4 text-v2-body-sm leading-[1.55] text-ink-soft">
                {body}
              </p>
              <p className="mt-4 border-t border-ink/10 pt-4 text-v2-body-sm leading-[1.55] text-ash">
                {note}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
