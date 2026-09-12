import Button from "@/components/v2/ui/Button";
import PageHero from "@/components/v2/sections/PageHero";
import ChooseAStyle from "@/components/v2/sections/ChooseAStyle";
import ServiceMenu from "@/components/v2/sections/ServiceMenu";
import BookingTerms from "@/components/v2/sections/BookingTerms";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { whatsapp, HOURS_SUMMARY } from "@/components/v2/salon";
import { LOOKS } from "@/lib/booking/catalogue";
import { naira } from "@/lib/booking/schedule";

const LOWEST = Math.min(...LOOKS.map((look) => look.minPrice));

export const metadata = {
  title: "Services and prices — Flourish Roots Hair",
  description:
    "Twists, braids, African threading, locs, everyday styles, treatments and take-down for 4C hair in Isolo, Lagos. Every price listed, from ₦500.",
};

const ASK = whatsapp(
  "Hi — I'm looking at the services page and I'm not sure which style suits my hair. Can you advise?",
);

export default function ServicesPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow="Salon services · Isolo, Lagos"
        title="Every style here is chosen for what it does for your hair"
        lede="Twists, braids, threading, locs, treatments and take-down — priced in full below, done at a tension you can sleep in, and finished with a plan for keeping the results."
        actions={
          <>
            <Button variant="book" withArrow href="/v2/booking">
              Book a salon visit
            </Button>
            <Button variant="secondary" href={ASK} target="_blank" rel="noreferrer">
              Ask which style suits you
            </Button>
          </>
        }
        meta={[
          `${LOOKS.length} styles, from ${naira(LOWEST)}`,
          HOURS_SUMMARY,
          "Deposit only on the longest styles",
        ]}
      />

      <ChooseAStyle />
      <ServiceMenu />
      <BookingTerms />
      <ClosingCta />
    </main>
  );
}
