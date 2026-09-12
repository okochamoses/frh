"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { useLeadMagnet } from "@/hooks/useLeadMagnet";
import { BookingFAB } from "@/components/BookingFAB";
import { GlobalBookingBar } from "@/components/GlobalBookingBar";
import { BookingBarSpacer } from "@/components/BookingBarSpacer";

/**
 * The V1 page chrome, lifted out of `app/structure.js` so it can be code-split.
 *
 * Nothing here changed when it moved; the point is the module boundary. V2
 * routes render none of this, and while it was imported statically from the
 * shared root they still paid for it — the header pulls `SplitMenu`, which
 * pulls framer-motion, so a V2 marketing page downloaded an animation runtime
 * for a menu it does not have.
 */
const LeadMagnetModal = dynamic(
  () => import("@/components/LeadMagnetModal").then((m) => ({ default: m.LeadMagnetModal })),
  { ssr: false }
);

const LEAD_MAGNET_DISABLED = process.env.NEXT_PUBLIC_DISABLE_LEAD_MAGNET !== "false";

function LeadMagnetGate({ children }) {
  const { isOpen, close, markSubscribed } = useLeadMagnet();
  return (
    <>
      {children}
      <LeadMagnetModal isOpen={isOpen} onClose={close} onSuccess={markSubscribed} />
    </>
  );
}

function Chrome({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BookingBarSpacer />
      <GlobalBookingBar />
      <BookingFAB />
    </>
  );
}

export default function V1Shell({ children }) {
  if (LEAD_MAGNET_DISABLED) return <Chrome>{children}</Chrome>;

  return (
    <LeadMagnetGate>
      <Chrome>{children}</Chrome>
    </LeadMagnetGate>
  );
}
