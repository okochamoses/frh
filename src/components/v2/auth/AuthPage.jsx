"use client";

/**
 * The standalone auth routes: `/v2/login`, `/v2/signup`, `/v2/reset-password`.
 *
 * The modal is the primary surface — see `AuthDialog`. These exist for the
 * cases a modal cannot serve: a link in an email or a text message, a client
 * who bookmarked "log in", the return leg of a blocked-popup Google redirect,
 * and anywhere we need a URL to point at rather than a button to press. They
 * render exactly the same `AuthPanel`, so the two can't drift.
 *
 * `?next=` carries where to go afterwards, and is refused unless it is a path
 * on this site — a sign-in screen that will forward to any URL handed to it is
 * a phishing hop, and this one is linked from emails.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES } from "@/lib/auth/constants";
import AuthPanel from "./AuthPanel";

const ROUTE_FOR = {
  [AUTH_MODES.SIGN_IN]: "/v2/login",
  [AUTH_MODES.SIGN_UP]: "/v2/signup",
  [AUTH_MODES.RESET]: "/v2/reset-password",
};

const DEFAULT_NEXT = "/v2";

/**
 * A same-site path, or the default.
 *
 * "//evil.example" is a protocol-relative URL that browsers treat as another
 * origin, so one leading slash is not enough of a test on its own.
 */
export function safeNext(value) {
  if (typeof value !== "string") return DEFAULT_NEXT;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_NEXT;
  }
  return value;
}

export default function AuthPage({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { authEmail, setAuthEmail, login, isAuthenticated, hydrated } = useAuth();

  const next = safeNext(params.get("next"));

  // Someone who is already signed in has no business on a sign-in screen —
  // most often a stale tab, or a bookmark followed out of habit.
  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace(next);
  }, [hydrated, isAuthenticated, next, router]);

  const goToMode = (target) => {
    const query = next === DEFAULT_NEXT ? "" : `?next=${encodeURIComponent(next)}`;
    router.push(`${ROUTE_FOR[target]}${query}`);
  };

  const handleDone = (profile) => {
    login(profile);
    router.replace(next);
  };

  return (
    <main className="mx-auto flex w-full max-w-[var(--v2-container)] flex-1 flex-col items-center px-4 py-14 md:px-8 md:py-20">
      <div className="w-full max-w-[460px]">
        <div className="rounded-v2-4xl bg-white p-6 pt-8 sm:p-10">
          <AuthPanel
            mode={mode}
            onModeChange={goToMode}
            email={authEmail}
            onEmailChange={setAuthEmail}
            onDone={handleDone}
          />
        </div>

        {/* The point worth making on a page a client may have landed on cold:
            they can book without any of this. */}
        <p className="mt-6 text-center text-v2-body-sm text-ink-soft">
          You don&apos;t need an account to book.{" "}
          <Link
            href="/v2/booking"
            className="font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
          >
            Book a visit
          </Link>
        </p>
      </div>
    </main>
  );
}
