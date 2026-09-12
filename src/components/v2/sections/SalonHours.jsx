import { Fragment } from "react";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import SalonMap from "@/components/v2/ui/SalonMap";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import { MAPS_URL } from "@/components/v2/location";
import {
  ADDRESS_LINES,
  OPENING_HOURS,
  PHONE_DISPLAY,
  PHONE_TEL,
  EMAIL,
  whatsapp,
} from "@/components/v2/salon";

/**
 * Hours and directions, as two anchored blocks the header's mega-menu links
 * straight into (#hours, #directions).
 *
 * The hours are rendered from the booking engine's own schedule rather than
 * typed out, so the page cannot tell a client the salon is open on a day the
 * booking form will refuse. Monday is the closed day, and Sunday opens late —
 * both easy to get wrong from memory, which is exactly what had happened.
 */
export default function SalonHours() {
  return (
    <section aria-labelledby="salon-hours-heading">
      <SectionHeader
        id="salon-hours-heading"
        eyebrow="Hours and directions"
        title="When we are open, and how to find us"
        lede="Closed Mondays. Sundays we open in the afternoon. Nothing is booked to finish after 7pm, so the last slot depends on how long your style takes."
        action={
          <Button variant="tertiary" withArrow href={MAPS_URL} target="_blank" rel="noreferrer">
            Open in Google Maps
          </Button>
        }
      />

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-12">
        <Reveal id="hours" className="scroll-mt-32 lg:col-span-5">
          <div className="flex h-full flex-col rounded-v2-4xl bg-cream-100 p-8 md:p-10">
            <p className="type-eyebrow">Opening hours</p>

            <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-3">
              {OPENING_HOURS.map(({ day, hours, closed }) => (
                <Fragment key={day}>
                  <dt
                    className={`border-b border-ink/10 pb-3 text-v2-body ${
                      closed ? "text-ash" : "text-ink"
                    }`}
                  >
                    {day}
                  </dt>
                  <dd
                    className={`border-b border-ink/10 pb-3 text-right text-v2-body tabular-nums ${
                      closed ? "text-ash" : "text-ink-soft"
                    }`}
                  >
                    {hours}
                  </dd>
                </Fragment>
              ))}
            </dl>

            <p className="mt-6 text-v2-body-sm text-ink-soft">
              Micro twists are weekdays only — they take most of a day, and the
              chair has to be yours from opening.
            </p>

            <div className="mt-auto grid gap-3 border-t border-ink/10 pt-8">
              <a
                href={`tel:${PHONE_TEL}`}
                className="font-display text-v2-h2 uppercase leading-none tabular-nums text-ink transition-opacity duration-200 ease-out hover:opacity-70"
              >
                {PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="break-all text-v2-body-sm text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink hover:decoration-ink"
              >
                {EMAIL}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal
          id="directions"
          delay={120}
          className="scroll-mt-32 lg:col-span-7"
        >
          <div className="flex h-full flex-col gap-4">
            <SalonMap className="h-[18rem] md:h-[24rem]" />

            <div className="flex flex-1 flex-col justify-between gap-6 rounded-v2-4xl bg-cream-100 p-8 md:flex-row md:items-end md:p-10">
              <div>
                <p className="type-eyebrow">The address</p>
                <address className="mt-3 not-italic font-display text-v2-h3 uppercase leading-[1.25] text-ink">
                  {ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <p className="mt-4 max-w-[40ch] text-v2-body-sm text-ink-soft">
                  Destiny Plaza sits on Ago Palace Way. We are Shop 303 —
                  message us when you arrive at the plaza and somebody will
                  bring you up.
                </p>
              </div>

              <Button
                variant="secondary"
                href={whatsapp("Hi — I'm on my way to the salon and I need help finding Shop 303.")}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                Message on arrival
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
