"use client";

import { useEffect, useState } from "react";

/**
 * Where v2's dialogs and sheets mount.
 *
 * Radix portals to <body> by default, which is outside `.v2-root` — so the v2
 * fonts, eyebrow style and paragraph face would all be lost inside a sheet.
 * Mounting into the v2 wrapper keeps them. Fixed positioning still resolves
 * against the viewport, and the wrapper sets no transform that would change it.
 *
 * It lived in `booking/ui.jsx` until the auth dialog needed it too; auth
 * depending on the booking flow for a layout primitive was backwards.
 */
export function useV2PortalContainer() {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    setContainer(document.querySelector(".v2-root"));
  }, []);
  return container ?? undefined;
}

export default useV2PortalContainer;
