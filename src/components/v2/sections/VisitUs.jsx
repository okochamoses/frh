import { Fragment } from "react";
import { Clock, MapPin, Phone } from "lucide-react";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import { MAPS_URL } from "@/components/v2/location";
import SalonMap from "@/components/v2/ui/SalonMap";
import { OPENING_HOURS } from "@/components/v2/salon";

/**
 * The practical close: where we are, when we are open, and how to reach us.
 *
 * Two panels of equal height inside the page column — the details on cream,
 * the map beside them — rather than a panel floated over a full-bleed map,
 * which on wide screens grew taller than the map it sat on and broke out of
 * the top of it.
 *
 * The map itself is the directions link — on a phone it opens the maps app
 * already pointed at Isolo — so the largest target on the section does the
 * useful thing. The printed address opens the same pin.
 */
export default function VisitUs() {
  return (
    <section aria-labelledby="visit-us-heading">
      <SectionHeader
        id="visit-us-heading"
        eyebrow="Isolo, Lagos"
        title="Come and see us"
        lede="Walk-ins are welcome when we have space, but clients who booked come first. Longer styles almost always need booking ahead."
      />

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-v2-4xl bg-cream-100 p-8 md:p-10">
            <ul className="grid gap-7">
              <li className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-ink"
                >
                  <MapPin className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <div>
                  <p className="type-eyebrow">Address</p>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-v2-body leading-[1.55] text-ink underline decoration-ink/20 underline-offset-4 transition-colors duration-200 ease-out hover:decoration-ink"
                  >
                    <address className="not-italic">
                      Flourish Roots Hair Co.
                      <br />
                      Shop 303, Destiny Plaza
                      <br />
                      Ago Palace Way, Isolo, Lagos
                    </address>
                    <span className="sr-only"> (opens Google Maps)</span>
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-ink"
                >
                  <Clock className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <div>
                  <p className="type-eyebrow">Opening hours</p>
                  {/* Derived from the booking engine's own schedule, which is
                      what actually decides whether a slot can be booked. */}
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                    {OPENING_HOURS.map(({ day, hours, closed }) => (
                      <Fragment key={day}>
                        <dt
                          className={`text-v2-body-sm ${
                            closed ? "text-ash" : "text-ink"
                          }`}
                        >
                          {day}
                        </dt>
                        <dd
                          className={`text-v2-body-sm tabular-nums ${
                            closed ? "text-ash" : "text-ink-soft"
                          }`}
                        >
                          {hours}
                        </dd>
                      </Fragment>
                    ))}
                  </dl>
                </div>
              </li>

              <li className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-ink"
                >
                  <Phone className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <div>
                  <p className="type-eyebrow">Phone and WhatsApp</p>
                  <a
                    href="tel:+2348110215014"
                    className="mt-2 inline-block font-display text-v2-h2 uppercase leading-none tabular-nums text-ink transition-opacity duration-200 ease-out hover:opacity-70"
                  >
                    0811 021 5014
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-10 flex flex-wrap gap-3 border-t border-ink/10 pt-8 lg:mt-auto">
              <Button variant="book" withArrow href="/v2/booking">
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
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <SalonMap className="h-[22rem] md:h-[28rem] lg:h-full lg:min-h-[32rem]" />
        </Reveal>
      </div>
    </section>
  );
}
