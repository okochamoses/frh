import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import { WHATSAPP_ASK_GENERAL } from "@/components/v2/coaching";

const FAQS = [
  {
    q: "Is this the same as booking a salon appointment?",
    a: "No. A salon appointment is a style — twists, braids, locs, a treatment. Coaching is the sitting down: we look at your scalp and your hair, and you leave with a routine to run at home. Plenty of people do both, and the coaching is what makes the styling hold.",
  },
  {
    q: "Can I book if I am not in Lagos?",
    a: "Yes. Every session runs by video call as well as in the salon, and the scalp consultation asks for a few photographs beforehand so there is something to look at. The written plan reaches you either way.",
  },
  {
    q: "What happens right after I pay?",
    a: "Paystack confirms the payment and we message you on WhatsApp to agree a date and a format. If you have not heard from us, message the salon on 0811 021 5014 with the name you paid under and we will pick it straight up.",
  },
  {
    q: "I have just come off relaxer. Where do I start?",
    a: "The Build-Your-Routine Session or the 1-on-1. Both start with what your hair is actually doing now rather than what it used to do, and neither one will tell you to cut it off before we have looked at it.",
  },
  {
    q: "Will you tell me to buy expensive foreign products?",
    a: "No. The product list is built from what is sold in Lagos and priced for the budget you give us — including our own hair mask range, which is made here. If something on your shelf already works, it stays.",
  },
  {
    q: "How long before I see a difference?",
    a: "It depends on what your hair is dealing with, and we would rather say that than give you a number. A routine that fits usually feels different within a few wash days. Length that stays is a longer conversation, and anyone promising you inches by a date is guessing.",
  },
  {
    q: "What if the session was not what I expected?",
    a: "Tell us within 48 hours, on WhatsApp or on the phone, and we will arrange a follow-up call with Mariam to put it right. We would rather fix the plan than have you quietly stop using it.",
  },
];

/**
 * Same native `<details>` accordion the homepage FAQ uses, with a WhatsApp
 * escape hatch pinned beside it, so the two FAQ moments on the site behave
 * identically and a reader never has to relearn the interaction.
 */
export default function CoachingFaq() {
  return (
    <section aria-labelledby="coaching-faq-heading">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4 lg:self-start lg:sticky lg:top-32">
          <p className="type-eyebrow">Before you book</p>
          <h2
            id="coaching-faq-heading"
            className="mt-5 max-w-[12ch] font-display text-display-fluid uppercase leading-[0.95] text-ink"
          >
            Your questions, answered
          </h2>
          <p className="mt-7 max-w-[34ch] text-v2-body text-ink-soft">
            Anything here not covered? Ask on WhatsApp — it goes to the
            salon, and Mariam answers the coaching ones herself.
          </p>
          <Button
            variant="tertiary"
            withArrow
            href={WHATSAPP_ASK_GENERAL}
            target="_blank"
            rel="noreferrer"
            className="mt-6"
          >
            Ask on WhatsApp
          </Button>
        </Reveal>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="border-t border-ink/15">
            {FAQS.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 60}>
                <details className="group border-b border-ink/15">
                  <summary className="flex cursor-pointer list-none items-start gap-6 py-7 [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="type-eyebrow mt-2 shrink-0 tabular-nums text-ash transition-colors duration-300 ease-out group-open:text-ink"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <h3 className="flex-1 max-w-[30ch] font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.75rem)] uppercase leading-[1.1] text-ink">
                      {q}
                    </h3>

                    <span
                      aria-hidden="true"
                      className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 ease-out group-open:border-ink group-hover:border-ink"
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-px bg-current transition-transform duration-300 ease-out group-open:rotate-90 group-open:scale-y-0" />
                    </span>
                  </summary>

                  <div className="v2-faq-panel">
                    <div>
                      <p className="max-w-[58ch] pb-8 pl-0 pr-14 text-v2-body text-ink-soft sm:pl-12">
                        {a}
                      </p>
                    </div>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
