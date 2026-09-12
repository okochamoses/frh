import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import { PATHS, whatsappLink } from "@/components/v2/coaching";

/**
 * Four ways in, as cards rather than an index: unlike the homepage's service
 * families, the price alone does not tell a first-time reader which of these
 * is theirs, so every card carries what it is for, what it includes and how it
 * is held, in that order.
 *
 * Read cheapest first. Four unsorted prices read as an accident; sorted, they
 * read as a scale, and a reader can stop at the first one that covers them.
 *
 * The `id`s are the anchors the header's mega-menu links to (#builder,
 * #single, #scalp, #plan) and the ones the chooser below points back at, so
 * every path needs one.
 */
export default function CoachingPaths() {
  return (
    <section aria-labelledby="coaching-paths-heading" id="paths" className="scroll-mt-28">
      <SectionHeader
        id="coaching-paths-heading"
        eyebrow="The four sessions"
        title="Pick the one that covers you"
        lede="Listed cheapest first. Every one of them ends with a plan you keep — they differ in how much of your hair we look at, and for how long."
      />

      <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
        {PATHS.map((path, i) => (
          <li key={path.id} id={path.id} className="scroll-mt-28">
            <Reveal delay={i * 70} className="h-full">
              {/* The hover treatment sits on this inner surface rather than on
                  the Reveal, whose own transition drives the scroll entrance. */}
              <div
                className={`group flex h-full flex-col rounded-v2-3xl p-7 transition-colors duration-300 ease-out md:p-8 ${
                  path.featured
                    ? "bg-ink text-white"
                    : "bg-cream-100 text-ink hover:bg-latte"
                }`}
              >
                {path.badge ? (
                  <span className="mb-5 inline-flex w-fit items-center whitespace-nowrap rounded-full bg-mustard px-3 py-1.5 text-v2-body-sm font-semibold uppercase tracking-[0.08em] text-ink">
                    {path.badge}
                  </span>
                ) : (
                  /* Holds the badge's height on the other three, so all the
                     prices in a row sit on one line. */
                  <span aria-hidden="true" className="mb-5 hidden h-[2.125rem] md:block" />
                )}

                <div className="font-display text-v2-h1 uppercase leading-none tabular-nums">
                  {path.price}
                </div>
                <p
                  className={`mt-2 type-eyebrow ${
                    path.featured ? "!text-white/55" : ""
                  }`}
                >
                  {path.priceLabel} &middot; {path.format}
                </p>

                <h3 className="mt-6 font-display text-v2-h3 uppercase leading-[1.05]">
                  {path.title}
                </h3>
                <p
                  className={`mt-3 text-v2-body-sm leading-[1.5] ${
                    path.featured ? "text-white/70" : "text-ink-soft"
                  }`}
                >
                  {path.body}
                </p>

                <p
                  className={`mt-6 type-eyebrow ${
                    path.featured ? "!text-white/45" : ""
                  }`}
                >
                  What you get
                </p>
                <ul className="mt-3 grid gap-2.5">
                  {path.items.map((item) => (
                    <li
                      key={item}
                      className={`flex items-start gap-2.5 text-v2-body-sm ${
                        path.featured ? "text-white/85" : "text-ink"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                          path.featured ? "bg-mustard" : "bg-slat"
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <p
                  className={`mt-6 text-v2-body-sm ${
                    path.featured ? "text-white/55" : "text-ash"
                  }`}
                >
                  {path.fit}
                </p>

                <div className="mt-auto pt-7">
                  <Button
                    href={path.link}
                    target="_blank"
                    rel="noreferrer"
                    className={
                      path.featured
                        ? "w-full bg-white text-ink hover:bg-white/90"
                        : "w-full bg-ink text-white hover:bg-ink/85"
                    }
                  >
                    Book this session
                    <span className="sr-only"> — {path.title}, {path.price}</span>
                  </Button>

                  {/* The way out for a reader who is not ready to pay. Without
                      it the only thing a card can do is take money. */}
                  <a
                    href={whatsappLink(path.ask)}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 block text-center text-v2-body-sm underline underline-offset-4 transition-colors duration-200 ease-out ${
                      path.featured
                        ? "text-white/60 decoration-white/30 hover:text-white hover:decoration-white"
                        : "text-ink-soft decoration-ink/25 hover:text-ink hover:decoration-ink"
                    }`}
                  >
                    Ask about this one first
                    <span className="sr-only"> on WhatsApp</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* What actually happens when the button is pressed. A price and a
          payment link with nothing between them is the part that makes a
          reader hesitate, so it is spelled out rather than implied. */}
      <Reveal
        delay={280}
        className="mt-6 rounded-v2-2xl border border-ink/15 px-6 py-5 text-v2-body-sm text-ink-soft md:mt-8"
      >
        <span className="font-semibold text-ink">Booking is two steps.</span>{" "}
        Payment opens in Paystack in a new tab — card or bank transfer, and
        nothing is charged on this page. Once it goes through we message you to
        agree a date and whether you are coming to Isolo or joining by video
        call.
      </Reveal>
    </section>
  );
}
