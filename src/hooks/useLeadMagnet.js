"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEYS = {
  subscribed: "leadMagnet_subscribed",
  dismissed: "leadMagnet_dismissed",
};

const DELAY_MS = 25000; // 25 seconds before showing
const SCROLL_THRESHOLD = 0.5; // Show after 50% scroll depth

function getStored(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStored(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

export function useLeadMagnet() {
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
    setStored(STORAGE_KEYS.dismissed, "true");
  }, []);

  const markSubscribed = useCallback(() => {
    setIsOpen(false);
    setStored(STORAGE_KEYS.subscribed, "true");
  }, []);

  useEffect(() => {
    if (getStored(STORAGE_KEYS.subscribed) === "true" || getStored(STORAGE_KEYS.dismissed) === "true") {
      setReady(true);
      return;
    }

    let showTimer = null;
    let scrollListener = null;
    let hasShown = false;

    function show() {
      if (hasShown) return;
      hasShown = true;
      setIsOpen(true);
      if (showTimer) clearTimeout(showTimer);
      if (typeof window !== "undefined" && scrollListener) {
        window.removeEventListener("scroll", scrollListener, { passive: true });
      }
    }

    showTimer = setTimeout(show, DELAY_MS);

    scrollListener = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrolled = window.scrollY / scrollHeight;
      if (scrolled >= SCROLL_THRESHOLD) show();
    };
    window.addEventListener("scroll", scrollListener, { passive: true });

    setReady(true);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (typeof window !== "undefined" && scrollListener) {
        window.removeEventListener("scroll", scrollListener, { passive: true });
      }
    };
  }, []);

  return { isOpen, close, markSubscribed, ready };
}
