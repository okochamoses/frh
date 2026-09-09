import Image from "next/image";
import Button from "@/components/v2/ui/Button";

/* A maps search for the salon's own address — no place ID to go stale, and it
   resolves the same way on a phone as on a laptop. */
const DIRECTIONS =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    "Flourish Roots Hair Co, Shop 303 Destiny Plaza, Ago Palace Way, Isolo, Lagos",
  );

const DETAILS = [
  {
    term: "Opening hours",
    /* TODO: confirm exact opening and closing times. */
    detail: "Monday to Saturday. Closed on Sundays.",
  },
  {
    term: "Walk-ins",
    detail:
      "Welcome when we have space, but clients who booked come first. Longer styles almost always need booking ahead.",
  },
];

/**
 * The practical close: where we are, when we are open, and the three ways to
 * reach us.
 *
 * Everything a reader needs in order to actually turn up sits in one card — the
 * address, the hours, the phone number and the directions link — because this
 * is the point at which a decided reader is looking for a detail, not for more
 * persuasion. The map is a real link rather than a picture of a map: on a phone
 * it opens the maps app already pointed at Isolo.
 */
export default function VisitUs() {
  return (
    <section aria-labelledby="visit-us-heading">
      <div className="overflow-hidden rounded-v2-4xl bg-cream-100 lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="p-8 md:p-12 lg:flex lg:flex-col lg:justify-center lg:p-14">
          <p className="type-eyebrow">Isolo, Lagos</p>
          <h2
            id="visit-us-heading"
            className="mt-5 max-w-[12ch] font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] uppercase leading-[0.95] text-ink"
          >
            Come and see us
          </h2>

          <address className="mt-6 not-italic text-v2-body leading-[1.6] text-ink">
            Flourish Roots Hair Co.
            <br />
            Shop 303, Destiny Plaza
            <br />
            Ago Palace Way, Isolo, Lagos
          </address>

          <dl className="mt-8 grid gap-5">
            {DETAILS.map(({ term, detail }) => (
              <div key={term} className="border-t border-ink/12 pt-4">
                <dt className="type-eyebrow">{term}</dt>
                <dd className="mt-2 max-w-[42ch] text-v2-body text-ink-soft">
                  {detail}
                </dd>
              </div>
            ))}

            <div className="border-t border-ink/12 pt-4">
              <dt className="type-eyebrow">Phone and WhatsApp</dt>
              <dd className="mt-2">
                <a
                  href="tel:+2348110215014"
                  className="font-display text-v2-h3 uppercase tabular-nums text-ink underline decoration-ink/25 underline-offset-4 transition-colors duration-200 ease-out hover:decoration-ink"
                >
                  0811 021 5014
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button withArrow href="/v2/booking">
              Book a salon visit
            </Button>
            <Button
              variant="secondary"
              href="https://wa.me/2348110215014"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>

        {/* The map fills the other half of the card and is the directions link
            itself, so the largest, most obvious target does the useful thing. */}
        <a
          href={DIRECTIONS}
          target="_blank"
          rel="noreferrer"
          className="group relative block aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]"
        >
          <Image
            src="/map.webp"
            alt="Map showing Flourish Roots Hair Co. at Shop 303, Destiny Plaza, Ago Palace Way, Isolo, Lagos"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-deep px-5 py-3 text-v2-body-sm font-semibold text-white">
            Get directions
          </span>
        </a>
      </div>
    </section>
  );
}
