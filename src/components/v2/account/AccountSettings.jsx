"use client";

/**
 * The account page, in v2's chrome.
 *
 * V2 already had `/settings` — v1's page, on v1's dark-and-serif masthead, with
 * v1's header and footer around it. Reaching it from the v2 account menu
 * dropped the client out of the site they were in, which is the one thing an
 * account page should not do. This is the same three fields against the same
 * Firestore document; what changes is that it belongs to the pages either side
 * of it. `/settings` stays where it is for as long as v1 does.
 *
 * The phone rules are deliberately the booking flow's, not v1's. V1 accepted
 * anything starting `+234` or `0`, so a profile could hold a number that
 * `createBooking` would then refuse — a client could save it here and be told
 * it was wrong at the till.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES } from "@/lib/auth/constants";
import { updateUserProfile } from "@/lib/firebase/userService";
import { MOBILE_HINT, isValidMobile, normaliseMobile } from "@/lib/phone";
import Button from "@/components/v2/ui/Button";
import Input from "@/components/v2/ui/Input";
import PageHero from "@/components/v2/sections/PageHero";

const EMPTY = { firstName: "", lastName: "", mobileNumber: "" };

function fieldsFor(user) {
  if (!user) return EMPTY;
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    mobileNumber: user.mobileNumber ?? "",
  };
}

export default function AccountSettings() {
  const { user, hydrated, isAuthenticated, openAuthModal, updateUser, logout } = useAuth();

  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  // Seeded when the client changes, not whenever the profile object does.
  //
  // A successful save calls `updateUser`, which replaces `user` — so keying
  // this on the whole object meant our own write re-seeded the form and cleared
  // "Saved." in the very next render, before anyone could read it. The uid is
  // what actually means "someone else's details belong in these fields".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setFields(fieldsFor(user));
    setErrors({});
    setFormError(null);
    setSaved(false);
  }, [user?.uid]);

  const change = useCallback((field) => (e) => {
    const { value } = e.target;
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(null);
    setSaved(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    const next = {};
    if (!fields.firstName.trim()) next.firstName = "Please tell us your name.";
    // Blank is allowed: a client may have signed up with Google and never given
    // a number. A number that is there has to be one we can actually call.
    if (fields.mobileNumber.trim() && !isValidMobile(fields.mobileNumber)) {
      next.mobileNumber = MOBILE_HINT;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => {
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    if (!user?.uid) return;

    // Stored in E.164 whatever was typed, so the profile and a guest booking
    // hold the same number in the same shape.
    const mobileNumber = fields.mobileNumber.trim()
      ? normaliseMobile(fields.mobileNumber)
      : null;
    const updates = {
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      mobileNumber,
    };

    setSaving(true);
    try {
      await updateUserProfile(user.uid, updates);
      updateUser(updates);
      setSaved(true);
    } catch {
      setFormError("Could not save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-14 px-4 pb-20 md:gap-20 md:px-8 md:pb-28">
      <PageHero
        eyebrow="Your account"
        title="Your details"
        lede="How we address you, and how we reach you about an appointment. Nothing here is shared with anyone outside the salon."
      />

      <div className="w-full max-w-[560px]">
        {!hydrated && (
          /* Reserve the card rather than showing a spinner: the auth check
             resolves in a few hundred ms and a flash of "please log in" for a
             client who is signed in is worse than a beat of nothing. */
          <div aria-hidden="true" className="h-[420px] rounded-v2-4xl bg-white" />
        )}

        {hydrated && !isAuthenticated && (
          <div className="flex flex-col gap-6 rounded-v2-4xl bg-white p-6 sm:p-10">
            <div className="flex flex-col gap-3">
              <p className="type-eyebrow">Not logged in</p>
              <h2 className="font-display text-[clamp(1.5rem,1.3rem+1vw,2rem)] uppercase leading-[0.98] text-ink">
                Log in to see your details
              </h2>
              <p className="max-w-[42ch] text-v2-body-sm text-ink-soft">
                You only need an account to change what is saved here. Booking a
                visit never asks for one.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => openAuthModal({ mode: AUTH_MODES.SIGN_IN })}
              >
                Log in
              </Button>
              <Button variant="secondary" href="/v2/booking">
                Book a visit
              </Button>
            </div>
          </div>
        )}

        {hydrated && isAuthenticated && user && (
          <div className="flex flex-col gap-8 rounded-v2-4xl bg-white p-6 sm:p-10">
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="First name"
                  autoComplete="given-name"
                  value={fields.firstName}
                  error={errors.firstName}
                  onChange={change("firstName")}
                />
                <Input
                  label="Surname"
                  autoComplete="family-name"
                  value={fields.lastName}
                  error={errors.lastName}
                  onChange={change("lastName")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={user.email ?? ""}
                  readOnly
                  disabled
                  aria-describedby="email-note"
                />
                <p id="email-note" className="text-v2-body-sm text-ash">
                  Your email is how you log in, so it cannot be changed here.
                  Message us and we&apos;ll move it for you.
                </p>
              </div>

              <Input
                label="Mobile number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="08031234567"
                value={fields.mobileNumber}
                error={errors.mobileNumber}
                onChange={change("mobileNumber")}
              />

              {formError && (
                <p
                  role="alert"
                  className="rounded-v2-lg bg-red-50 px-3.5 py-2.5 text-v2-body-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <div className="flex items-center gap-4">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
                {/* Announced, not just shown — the button it sits beside is the
                    only thing that moved, and a sighted client sees it there. */}
                <p role="status" className="text-v2-body-sm font-semibold text-ink">
                  {saved ? "Saved." : ""}
                </p>
              </div>
            </form>

            <div className="flex flex-col gap-4 border-t border-latte pt-7">
              <p className="type-eyebrow">Elsewhere</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/v2/bookings"
                  className="text-v2-body-sm font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
                >
                  Your appointments
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-v2-body-sm font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
