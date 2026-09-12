import SectionHeader from "@/components/v2/sections/SectionHeader";
import Reveal from "@/components/v2/ui/Reveal";

const STEPS = [
  {
    title: "Pick your session",
    body: "Four of them, four prices, all on this page. If none is obviously yours, message us and we will tell you which one we would book you into.",
  },
  {
    title: "Pay to hold the time",
    body: "Paystack opens in a new tab — card or bank transfer. Paying is what holds the slot; nothing is charged anywhere on this page.",
  },
  {
    title: "We agree a date",
    body: "We message you to fix a time that works, and whether you are coming to the salon at Isolo or joining by video call.",
  },
  {
    title: "You leave with the plan",
    body: "The routine, the products and the order they go on in — written down and handed over, not called after you at the door.",
  },
];

/**
 * Four steps, laid out flat rather than in the homepage's swipe rail — a
 * first-time reader here is deciding whether to trust the process at all, so
 * every step should be visible at once rather than costing a swipe to find.
 *
 * The steps describe the booking as it actually runs: the card buttons above
 * go straight to payment, so payment is step two and the conversation about
 * dates is step three. An earlier version put WhatsApp first while the buttons
 * went to Paystack, which left a reader who pressed one wondering what they
 * had just done.
 */
export default function CoachingHowItWorks() {
  return (
    <section aria-labelledby="coaching-how-it-works-heading">
      <SectionHeader
        id="coaching-how-it-works-heading"
        eyebrow="Getting started"
        title="How a booking actually goes"
        lede="Four steps, and you can stop at any of them. Nobody is added to a list for asking a question."
      />

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
        {STEPS.map(({ title, body }, i) => (
          <li key={title}>
            <Reveal
              delay={i * 80}
              className="flex h-full flex-col rounded-v2-3xl bg-cream-100 p-7 md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[3.5rem] font-bold leading-none tabular-nums text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="type-eyebrow tabular-nums">
                  Step {i + 1} of {STEPS.length}
                </span>
              </div>
              <h3 className="mt-8 font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                {title}
              </h3>
              <p className="mt-3 text-v2-body-sm text-ink-soft">{body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
