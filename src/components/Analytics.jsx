"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/**
 * Boots analytics once per page load.
 *
 * Renders nothing and is safe to mount unconditionally: with no vendor ids
 * configured `initAnalytics` returns immediately and no third-party script is
 * requested.
 */
export default function Analytics() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
