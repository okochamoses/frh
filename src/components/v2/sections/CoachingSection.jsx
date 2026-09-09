import Image from "next/image";
import Button from "@/components/v2/ui/Button";

const HELPS_WITH = [
  "Postpartum shedding",
  "Thinning edges",
  "Relaxer or heat damage",
  "An itchy, flaky scalp",
  "Hair that stalls at the same length",
  "Never having been shown how to handle 4C hair",
];

/**
 * The second offer: a routine rather than a style.
 *
 * Built as one card with the photograph bleeding to its edge rather than an
 * image beside a column of text — the offer reads as a single object you could
 * pick up, which is what a second product needs on a page whose first product
 * is the whole salon. The ground is `cream-100`, so it lifts off the white page
 * by surface alone, with no shadow.
 */
export default function CoachingSection() {
  return (
    <section aria-labelledby="coaching-heading">
      <div className="overflow-hidden rounded-v2-4xl bg-cream-100 lg:grid lg:grid-cols-2 lg:items-stretch">
        {/* Fixed ratio on small screens, full card height from `lg` up, so the
            photograph always meets the card's edges cleanly. */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[36rem]">
          <Image
            src="/coaching.webp"
            alt="Mariam Okocha Ijeoma coaching a client through a hair routine"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="p-8 md:p-12 lg:flex lg:flex-col lg:justify-center lg:p-14">
          <p className="type-eyebrow">For when you want more than a style</p>
          <h2
            id="coaching-heading"
            className="mt-5 max-w-[14ch] font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] uppercase leading-[0.95] text-ink"
          >
            Hair coaching with Mariam
          </h2>

          <p className="mt-6 max-w-[46ch] text-v2-body text-ink-soft">
            Most breakage does not happen in our chair. It happens in the six
            weeks after: the wrong products, dry detangling, no night routine, a
            scalp condition nobody has named.
          </p>
          <p className="mt-4 max-w-[46ch] text-v2-body text-ink-soft">
            Book a one on one and Mariam reads your hair and scalp properly,
            then builds a routine around your life, your budget and products you
            can actually buy in Lagos. You get it in writing, plus a check in so
            it does not gather dust.
          </p>

          <h3 className="type-eyebrow mt-10">Useful if you are dealing with</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {HELPS_WITH.map((item) => (
              <li
                key={item}
                className="rounded-full border border-ink/12 px-4 py-2 text-v2-body-sm text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button withArrow href="/v2/consultation">
              Book a consultation with Mariam
            </Button>
            {/* TODO: confirm duration and price with Mariam before launch. */}
            <p className="text-v2-body-sm text-ink-soft">
              30 to 45 minutes. In the salon or by phone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
