"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/** Heading face for the booking flow: Barlow Condensed, set bold and tight. */
export const HEADING = "font-display font-bold uppercase leading-[0.95] tracking-[-0.01em] text-balance";

export const CHECK_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.2l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Tag({ tone = "bone", children }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-bold tracking-[0.02em]",
        tone === "due" ? "bg-gold text-ink" : "bg-latte text-ink"
      )}
    >
      {children}
    </span>
  );
}

export function PillButton({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-9 px-3.5 text-[13px]" : "h-12 px-6 text-sm",
        variant === "primary" && "bg-mustard text-ink hover:bg-mustard-deep",
        variant === "ghost" && "border border-ink bg-transparent text-ink hover:bg-ink/5",
        variant === "quiet" && "bg-cream-100 text-ink hover:bg-latte",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Where the booking page's sheets mount.
 *
 * Radix portals to <body> by default, which is outside `.v2-root` — so the v2
 * fonts, eyebrow style and paragraph face would all be lost inside a sheet.
 * Mounting into the v2 wrapper keeps them. Fixed positioning still resolves
 * against the viewport, and the wrapper sets no transform that would change it.
 */
export function useV2PortalContainer() {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    setContainer(document.querySelector(".v2-root"));
  }, []);
  return container ?? undefined;
}

/** A transient message with an optional Undo, announced politely. */
export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, undo = null) => {
    setToast({ message, undo, id: Date.now() });
  }, []);

  const hide = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, show, hide };
}

const TOAST_DURATION = 4500;

/**
 * The auto-dismiss timer lives here rather than in `useToast`, and is paused
 * for as long as the toast has mouse hover or focus anywhere inside it — a
 * keyboard or screen-reader user who is still on the way to Undo should never
 * lose it to a fixed clock (WCAG 2.2.1). Losing hover/focus restarts the full
 * 4500ms window rather than resuming the remainder, which is simpler and
 * still generous: whoever is still around when it's simplest to reason about
 * gets a fresh, full look at Undo.
 */
export function Toast({ toast, onHide }) {
  const timer = useRef(null);
  const paused = useRef({ hover: false, focus: false });
  const toastId = toast?.id;

  const clear = useCallback(() => clearTimeout(timer.current), []);

  const arm = useCallback(() => {
    clear();
    timer.current = setTimeout(onHide, TOAST_DURATION);
  }, [clear, onHide]);

  useEffect(() => {
    paused.current = { hover: false, focus: false };
    if (!toastId) return undefined;
    arm();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastId]);

  const pause = (key) => {
    paused.current[key] = true;
    clear();
  };
  const resume = (key) => {
    paused.current[key] = false;
    if (!paused.current.hover && !paused.current.focus) arm();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="booking-toast"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 transition-all duration-300 lg:bottom-8",
        toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {toast && (
        <div
          onMouseEnter={() => pause("hover")}
          onMouseLeave={() => resume("hover")}
          onFocus={() => pause("focus")}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) resume("focus");
          }}
          className="pointer-events-auto flex max-w-full items-center gap-4 rounded-full bg-obsidian py-3 pl-5 pr-4 text-sm font-semibold text-white ring-1 ring-white/20"
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                toast.undo();
                onHide();
              }}
              className="font-bold text-gold underline underline-offset-4"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
