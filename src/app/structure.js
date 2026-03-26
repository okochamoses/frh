"use client"

import dynamic from "next/dynamic";
import Footer from "../components/footer";
import { Header } from "@/components/header";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { useLeadMagnet } from "@/hooks/useLeadMagnet";

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

export default function Root({ children }) {
  return (
    <AuthProvider>
      {LEAD_MAGNET_DISABLED ? (
        <>
          <Header />
          {children}
          <Footer />
        </>
      ) : (
        <LeadMagnetGate>
          <Header />
          {children}
          <Footer />
        </LeadMagnetGate>
      )}
    </AuthProvider>
  );
}
