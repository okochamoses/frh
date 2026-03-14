"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "423725763850-g9h03ff01rrmu7akn9ks5hl0a13nmajs.apps.googleusercontent.com";

export default function SalonLayout({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
