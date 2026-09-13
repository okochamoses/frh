"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { merriweather } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import {
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeAdminSession,
} from "@/lib/firebase/adminService";

const NAV = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/customers", label: "Customers" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [session, setSession] = useState({ status: "checking", user: null });
  const [signInError, setSignInError] = useState(null);

  useEffect(() => subscribeAdminSession(setSession), []);

  const handleSignIn = async () => {
    setSignInError(null);
    try {
      await signInAdminWithGoogle();
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setSignInError("Sign-in failed. Please try again.");
      }
    }
  };

  if (session.status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <p className="text-sm text-stone-500">Loading…</p>
      </div>
    );
  }

  if (session.status === "signed-out" || session.status === "not-admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
        <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className={`${merriweather.className} text-lg font-bold text-stone-900`}>
            Flourish Roots Admin
          </p>

          {session.status === "not-admin" && (
            <p className="mt-4 text-sm text-red-600">
              {session.user?.email} isn&apos;t authorised for the admin dashboard.
            </p>
          )}
          {signInError && <p className="mt-4 text-sm text-red-600">{signInError}</p>}

          <Button type="button" className="mt-6 w-full" onClick={handleSignIn}>
            Sign in with Google
          </Button>

          {session.status === "not-admin" && (
            <button
              type="button"
              onClick={() => signOutAdmin()}
              className="mt-4 text-xs text-stone-400 underline underline-offset-4"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <p className={`${merriweather.className} font-bold text-stone-900`}>
            Flourish Roots Admin
          </p>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith(item.href)
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{session.user?.email}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => signOutAdmin()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
