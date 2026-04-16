"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { merriweather, Bagelan } from "@/app/layout";
import { useAuth } from "@/app/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validatePhone(phone) {
  if (!phone || !String(phone).trim()) return "";
  if (!/^(?:\+234|0)/.test(phone)) {
    return "Number must start with +234 or 0";
  }
  return "";
}

export default function SettingsPage() {
  const { user, hydrated, isAuthenticated, openAuthModal, updateUser, logout } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setMobileNumber(user.mobileNumber ?? "");
    setPhoneError("");
    setFormError("");
    setSuccess(false);
  }, [user]);

  const handlePhoneChange = useCallback((e) => {
    const val = e.target.value.trim();
    if (/^\+?[0-9]*$/.test(val)) {
      setMobileNumber(val);
      setPhoneError("");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess(false);

    const phoneErr = validatePhone(mobileNumber);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }

    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        firstName,
        lastName,
        mobileNumber: mobileNumber.trim() === "" ? null : mobileNumber.trim(),
      });
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: mobileNumber.trim() === "" ? null : mobileNumber.trim(),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setFormError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-[#120D07] px-6 pb-16 pt-36 text-center">
        <p
          className={`${merriweather.className} mb-4 text-xs uppercase tracking-[0.3em] text-[#DDA15E]`}
        >
          Flourish Roots Hair Co.
        </p>
        <h1 className={`${Bagelan.className} text-[clamp(2.5rem,10vw,5rem)] leading-none text-white`}>
          ACCOUNT
        </h1>
      </div>

      <section className="min-h-[50vh] bg-[#faf9f7] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-lg">
          {!hydrated && (
            <p className={`${merriweather.className} text-center text-sm text-stone-500`}>Loading…</p>
          )}

          {hydrated && !isAuthenticated && (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
              <p className={`${merriweather.className} text-stone-700`}>
                Sign in to manage your account details.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button type="button" onClick={openAuthModal}>
                  Sign in
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href="/services">Salon services</Link>
                </Button>
              </div>
            </div>
          )}

          {hydrated && isAuthenticated && user && (
            <div className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm md:p-8">
              <h2 className={`${merriweather.className} text-lg font-bold text-stone-900`}>
                Profile
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Update how we address you and reach you for appointments.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      className="h-12"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      className="h-12"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    className="h-12 bg-stone-50 text-stone-600"
                    value={user.email ?? ""}
                    disabled
                    readOnly
                    autoComplete="email"
                  />
                  <p className="text-xs text-stone-400">Email cannot be changed here.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile number</Label>
                  <Input
                    id="mobile"
                    className="h-12"
                    value={mobileNumber}
                    onChange={handlePhoneChange}
                    placeholder="+234 or 0…"
                    autoComplete="tel"
                  />
                  {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
                </div>

                {formError && <p className="text-sm text-red-600">{formError}</p>}
                {success && (
                  <p className={`${merriweather.className} text-sm text-emerald-700`}>
                    Changes saved.
                  </p>
                )}

                <Button type="submit" className="w-full sm:w-auto" isLoading={saving}>
                  Save changes
                </Button>
              </form>

              <div className="mt-10 border-t border-stone-100 pt-8">
                <p
                  className={`${merriweather.className} text-[10px] uppercase tracking-[0.2em] text-stone-400`}
                >
                  Quick links
                </p>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <Link
                    href="/bookings"
                    className={`${merriweather.className} font-semibold text-[#BD2E2E] hover:underline`}
                  >
                    My bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className={`${merriweather.className} w-fit text-left text-red-600 hover:underline`}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
