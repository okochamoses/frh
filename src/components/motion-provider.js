"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MotionProvider({ children }) {
  const pathname = usePathname();

  return (
      <LayoutGroup>
        <AnimatePresence mode="wait">
          <div key={pathname}>{children}</div>
        </AnimatePresence>
      </LayoutGroup>
  );
}