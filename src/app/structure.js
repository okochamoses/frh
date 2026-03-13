"use client"

// import "./globals.css";
import Footer from "../components/footer";
import {Header} from "@/components/header";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {AuthProvider} from "@/app/contexts/AuthContext";
import { LeadMagnetModal } from "@/components/LeadMagnetModal";
import { useLeadMagnet } from "@/hooks/useLeadMagnet";

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
      <GoogleOAuthProvider clientId={"423725763850-g9h03ff01rrmu7akn9ks5hl0a13nmajs.apps.googleusercontent.com"}>
        <AuthProvider>
          <LeadMagnetGate>
            <Header />
            {children}
            <Footer />
          </LeadMagnetGate>
        </AuthProvider>
      </GoogleOAuthProvider>
  );
}
