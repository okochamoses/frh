import { Plus } from "lucide-react";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import Button from "@/components/v2/ui/Button";

const FAQS = [
  {
    q: "Do I need to pay a deposit?",
    a: "For the longer styles, yes. Mini twists and mini braids need 50% upfront, micro twists need 70%. It holds your slot, and you will see the amount before you confirm.",
  },
  {
    q: "What if I am running late?",
    a: "You have 20 minutes of grace. After that we may need to reschedule you, or a late fee applies, because another client is booked behind you.",
  },
  {
    q: "Can I bring my own extensions?",
    a: "Yes. Bring them clean and pre-stretched if you can. We do not sell beads, and attaching beads you bring is an extra ₦500.",
  },
  {
    q: "My hair is relaxed or transitioning. Can you still work on it?",
    a: "Yes. Tell us when you book so we plan the gentler approach and set aside the right amount of time.",
  },
  {
    q: "Do you do children's hair?",
    a: "Yes, threading and braids especially. Mention it in your booking notes so we allow for it.",
  },
];

/**
 * The last five objections, answered.
 *
 * An accordion rather than ten open paragraphs: a reader with one specific
 * worry — the deposit, usually — can find it in a glance down five lines
 * instead of reading past four answers that are not theirs. Built on native
 * `<details>`, so it is keyboard operable, findable by the browser's own
 * in-page search, and works before any JavaScript has run.
 */
export default function FaqSection() {
  return (
    <section aria-labelledby="faq-heading">
      <SectionHeader
        id="faq-heading"
        eyebrow="Before you book"
        title="The things people ask us"
        lede="Still unsure about something? Ask on WhatsApp and Mariam will answer."
        action={
          <Button
            variant="tertiary"
            withArrow
            href="https://wa.me/2348110215014"
            target="_blank"
            rel="noreferrer"
          >
            Ask on WhatsApp
          </Button>
        }
      />

      <div className="mt-14 border-t border-ink/15 md:mt-20">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group border-b border-ink/15">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
              <h3 className="max-w-[34ch] font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] uppercase leading-[1.1] text-ink">
                {q}
              </h3>
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-transform duration-300 ease-out group-open:rotate-45"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </summary>
            <p className="max-w-[62ch] pb-8 pr-16 text-v2-body text-ink-soft">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
