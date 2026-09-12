import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * The things that catch people out, said before they book rather than after.
 * The voice guide's line — "say the price, say the deposit; clarity is a
 * kindness" — is the whole brief for this section.
 *
 * Shared by the services page and the salon page, which both need it and were
 * never going to keep two copies in step.
 */
const TERMS = [
  {
    title: "Deposits hold the long styles",
    body: "50% on mini twists, mini braids, natural hair braids, Bantu knots and mini or micro twist loosening. 70% on micro twists and sister locs. Everything else is settled on the day.",
    note: "Transfer to the salon account shown at checkout and send the proof to the office line. Until it lands, the slot is still open to somebody else.",
  },
  {
    title: "Changing a booking costs half",
    body: "Cancelling or moving an appointment after paying forfeits 50% of what you paid, whether you paid a deposit or in full.",
    note: "That is firm, and we know it. It is what lets us hold a whole day open for one head.",
  },
];

export default function BookingTerms() {
  return (
    <section aria-labelledby="booking-terms-heading">
      <SectionHeader
        id="booking-terms-heading"
        eyebrow="Before you book"
        title="Two things, said plainly"
        lede="None of this is buried in a policy page. If a style needs a deposit, you will be told the number before you pay anything."
      />

      <ol className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
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
