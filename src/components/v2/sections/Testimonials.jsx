import Image from "next/image";
import SectionHeader from "@/components/v2/sections/SectionHeader";

/**
 * PLACEHOLDER CONTENT. Only real, attributable client reviews should ship here.
 * When collecting them, prioritise quotes that mention one of:
 *   1. no pain during or after the appointment,
 *   2. length kept over several months,
 *   3. a specific problem solved (edges, postpartum shedding, scalp).
 * First name and area of Lagos only.
 */
const REVIEWS = [
  {
    quote:
      "I've never felt my hair this healthy and full of life. The care, the products, everything is amazing.",
    name: "Adaeze, Client",
    portrait: "/gallery/IMG_6327.webp",
  },
  {
    quote: "[Replace with a real review about tension or comfort.]",
    name: "[First name, area]",
    portrait: "/gallery/IMG_6324.webp",
  },
  {
    quote: "[Replace with a real review about length kept over time.]",
    name: "[First name, area]",
    portrait: "/gallery/IMG_6938.webp",
  },
];

/**
 * Three clients, in their own words.
 *
 * The quote is set large and the star rating is gone: five gold stars is the
 * furniture of a review widget, and on a page with no verified rating source it
 * decorates a claim we cannot stand behind. A named woman saying a specific
 * thing carries the weight instead — which is also why the placeholders here
 * are conspicuous rather than plausible-sounding filler.
 */
export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading">
      <SectionHeader
        id="testimonials-heading"
        eyebrow="From our chairs"
        title="In their words"
        lede="Written by clients after their appointments, not collected by us."
      />

      <ul className="mt-14 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-20 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
        {REVIEWS.map(({ quote, name, portrait }) => (
          <li
            key={portrait}
            className="w-[82vw] shrink-0 snap-start sm:w-[56vw] md:w-auto"
          >
            <figure className="flex h-full flex-col justify-between rounded-v2-3xl bg-cream-100 p-8 md:p-10">
              <blockquote className="font-display text-[clamp(1.375rem,1.2rem+0.8vw,1.75rem)] uppercase leading-[1.1] text-ink">
                {quote}
              </blockquote>

              <figcaption className="mt-10 flex items-center gap-4 border-t border-ink/12 pt-6">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-latte">
                  <Image
                    src={portrait}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <span className="text-v2-body-sm text-ink-soft">{name}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
