"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { BookingProvider } from "@/app/contexts/BookingContext";

/*
 * The V1 chrome — header, footer, booking bar, FAB, lead-magnet gate — in its
 * own chunk.
 *
 * It used to be imported statically here. V2 routes never render any of it,
 * but a static import puts it in the shared client bundle all the same, so
 * every V2 page downloaded and parsed the V1 header, and through its
 * `SplitMenu` the whole of framer-motion: ~60 KB gzipped of JavaScript for
 * markup that is not on the page.
 *
 * `ssr` stays on (the default), so V1 pages still ship their chrome in the
 * prerendered HTML exactly as before — only the client chunk is split out.
 */
const V1Shell = dynamic(() => import("@/components/V1Shell"));

export default function Root({ children }) {
  const pathname = usePathname();
  // V2 routes bring their own chrome — share the providers, skip the V1 shell.
  // The admin dashboard isn't part of the salon site at all, so it skips the
  // shell the same way.
  const isV2 = pathname?.startsWith("/v2");
  const isAdmin = pathname?.startsWith("/admin");

  if (isV2 || isAdmin) {
    return (
      <AuthProvider>
        <BookingProvider>{children}</BookingProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <BookingProvider>
        <V1Shell>{children}</V1Shell>
      </BookingProvider>
    </AuthProvider>
  );
}
