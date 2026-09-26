"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { BookingProvider } from "@/app/contexts/BookingContext";

export default function Root({ children }) {
  const pathname = usePathname();
  // The salon site brings its own auth modal; the admin dashboard keeps v1's.
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <AuthProvider surface={isAdmin ? "v1" : "v2"}>
      <BookingProvider>{children}</BookingProvider>
    </AuthProvider>
  );
}
