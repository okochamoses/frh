import Button from "@/components/v2/ui/Button";
import PageHero from "@/components/v2/sections/PageHero";
import OriginStory from "@/components/v2/sections/OriginStory";
import Beliefs from "@/components/v2/sections/Beliefs";
import ThreeCardSplit from "@/components/v2/sections/ThreeCardSplit";
import NewsletterSection from "@/components/v2/sections/NewsletterSection";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { ADDRESS_ONE_LINE } from "@/components/v2/salon";

export const metadata = {
  title: "Our story — Flourish Roots Hair, Isolo Lagos",
  description:
    "Meet Mariam Okocha Ijeoma, founder and hair coach at Flourish Roots — a 4C natural hair salon in Isolo, Lagos built on gentle hands and honest advice.",
};

/**
 * The story, the method, then the three ways in.
 *
 * Nothing on this page states a year, a headcount or a certification. The copy
 * brief marks all of those as facts only Mariam can confirm, and a founder
 * page that invents them about a real person is worse than one that leaves
 * them out — so the page argues from what the salon actually does instead.
 */
export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow="Our story"
        title="We started because too many women were losing hair in salon chairs"
        lede="Flourish Roots Hair Co. is a natural hair salon in Isolo, Lagos, built around one stubborn idea: a style is only good if the hair underneath it is still healthy when the style comes down."
        actions={
          <>
            <Button variant="book" withArrow href="/v2/booking">
              Book a salon visit
            </Button>
            <Button variant="secondary" href="/v2/consultation">
              Talk to Mariam
            </Button>
          </>
        }
        meta={[ADDRESS_ONE_LINE, "4C natural hair specialists", "Salon and coaching"]}
      />

      <OriginStory />
      <Beliefs />
      <ThreeCardSplit />
      <NewsletterSection />
      <ClosingCta />
    </main>
  );
}
