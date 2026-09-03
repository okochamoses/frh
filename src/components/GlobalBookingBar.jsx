"use client";

import { usePathname, useRouter } from "next/navigation";
import { ExpandableBookingBar } from "@/components/ExpandableBookingBar";

export function GlobalBookingBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/services") return null;

  return (
    <ExpandableBookingBar
      actionLabel="Continue Booking"
      onAction={() => router.push("/services")}
    />
  );
}
