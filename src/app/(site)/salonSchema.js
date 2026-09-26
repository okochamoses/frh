import {
  ADDRESS_LINES,
  EMAIL,
  PHONE_TEL,
  WHATSAPP_NUMBER,
} from "@/components/v2/salon";
import {
  CLOSE_MINUTES,
  OFF_DAYS,
  OPEN_HOUR,
  SUNDAY_OPEN_HOUR,
} from "@/lib/booking/schedule";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/*
 * Structured data for the salon, so search engines can show the address, the
 * phone number and the real opening hours rather than guessing at them.
 *
 * The hours come from the same booking constants the site and the booking
 * engine read, for the reason given in `salon.js`: the marketing copy once
 * said "Monday to Saturday" while the booking engine refused Mondays. A second
 * hand-written copy of the hours — in the one place a search engine believes
 * literally — is the last thing this needs.
 */

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const hhmm = (hour) => `${String(hour).padStart(2, "0")}:00`;

const openingHoursSpecification = SCHEMA_DAYS.map((day, weekday) => {
  if (OFF_DAYS.has(weekday)) return null;
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${day}`,
    opens: hhmm(weekday === 0 ? SUNDAY_OPEN_HOUR : OPEN_HOUR),
    closes: hhmm(CLOSE_MINUTES / 60),
  };
}).filter(Boolean);

const [street, area, region] = ADDRESS_LINES;

/** `HairSalon` rather than plain `LocalBusiness` — the more specific, the better. */
const salonSchema = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/og-image.jpg`,
  email: EMAIL,
  telephone: PHONE_TEL,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${street}, ${area}`,
    addressLocality: "Isolo",
    addressRegion: "Lagos",
    addressCountry: "NG",
  },
  areaServed: region,
  currenciesAccepted: "NGN",
  sameAs: [`https://wa.me/${WHATSAPP_NUMBER}`],
  openingHoursSpecification,
};

export default salonSchema;
