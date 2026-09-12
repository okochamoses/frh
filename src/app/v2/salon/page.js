import Button from "@/components/v2/ui/Button";
import PageHero from "@/components/v2/sections/PageHero";
import SpaceGallery from "@/components/v2/sections/SpaceGallery";
import HowAVisitGoes from "@/components/v2/sections/HowAVisitGoes";
import SalonHours from "@/components/v2/sections/SalonHours";
import FirstVisit from "@/components/v2/sections/FirstVisit";
import BookingTerms from "@/components/v2/sections/BookingTerms";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { ADDRESS_ONE_LINE, HOURS_SUMMARY } from "@/components/v2/salon";

export const metadata = {
  title: "The salon — Flourish Roots Hair, Isolo Lagos",
  description:
    "Shop 303, Destiny Plaza, Ago Palace Way, Isolo. Opening hours, directions, how a visit goes and what to know before your first appointment.",
};

/**
 * The practical page: what the room is like, what happens in it, when it is
 * open and what is expected of you. Ordered so a reader deciding whether to
 * come sees the room and the appointment first, and the logistics once they
 * have decided.
 *
 * `#policy` sits on the booking terms and `#first-visit`, `#hours` and
 * `#directions` on their own sections — all four are linked from the header.
 */
export default function SalonPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow="The salon · Isolo, Lagos"
        title="A small room, run properly"
        lede="Shop 303 is not a big salon, and that is deliberate. We take a limited number of clients a day so nobody is rushed, nobody sits with a half-finished head, and no detangling gets hurried because somebody else is waiting."
        actions={
          <>
            <Button variant="book" withArrow href="/v2/booking">
              Book a salon visit
            </Button>
            <Button variant="secondary" href="#directions">
              Hours and directions
            </Button>
          </>
        }
        meta={[ADDRESS_ONE_LINE, HOURS_SUMMARY, "Walk-ins when there is space"]}
      />

      <SpaceGallery />
      <HowAVisitGoes />
      <SalonHours />
      <FirstVisit />

      <div id="policy" className="scroll-mt-32">
        <BookingTerms />
      </div>

      <ClosingCta />
    </main>
  );
}
