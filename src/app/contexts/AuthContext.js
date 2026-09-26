"use client";

/**
 * AuthContext
 *
 * Provides the current user and auth actions to the entire app.
 *
 * Firebase Auth automatically persists the session in the browser —
 * we don't need localStorage or manual token management.
 * `onAuthStateChanged` fires once on mount (restoring any existing
 * session) and again whenever the user signs in or out.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/userService";
import { completeGoogleRedirect, isGoogleRedirectPending, logOut } from "@/lib/firebase/authService";
import { claimWalkInBookings } from "@/lib/firebase/guestClaim";
import { AUTH_MODES } from "@/lib/auth/constants";

/*
 * The two auth surfaces, each in its own chunk.
 *
 * V1 and V2 share this provider — the same session, the same actions, the same
 * `openAuthModal` — but not the same modal: V1's is shadcn on stone and blue,
 * V2's is the Wood & Glow sheet that matches the pages around it. Loading them
 * statically would put both in every bundle, so a V2 page downloaded V1's
 * dialog, forms and validation for markup it can never show.
 *
 * `ssr: false` because neither is ever open on first paint. Nothing is missing
 * from the prerendered HTML; the chunk arrives when someone asks to sign in.
 */
const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), { ssr: false });
const V2AuthDialog = dynamic(() => import("@/components/v2/auth/AuthDialog"), { ssr: false });

const SURFACES = { v1: AuthModal, v2: V2AuthDialog };

const AuthContext = createContext();

/**
 * @param {"v1"|"v2"} surface  Which auth modal this tree gets. The session and
 *   every action are identical either way; only the chrome differs.
 */
export function AuthProvider({ children, surface = "v1" }) {
  // The merged user object: Firebase Auth UID + Firestore profile fields
  const [user, setUser]               = useState(null);
  const [hydrated, setHydrated]       = useState(false); // true once the initial auth check completes
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // A guest who booked without an account holds an anonymous session. They are
  // not "signed in" as far as the UI is concerned, but their id still owns the
  // bookings they made on this device.
  const [guestUid, setGuestUid]       = useState(null);
  const [authMode, setAuthMode]       = useState(AUTH_MODES.SIGN_IN);

  // Shared across the sign-in / sign-up / reset views so switching between
  // them does not throw away what the user already typed.
  const [authEmail, setAuthEmail]     = useState("");

  // Set when a signed-out user tries to do something that needs an account.
  // Run once they successfully sign in, so the interrupted action continues.
  const pendingActionRef = useRef(null);

  // Guards the auth-state listener against clobbering a full profile with the
  // bare { uid, email } fallback. See the comment in the listener below.
  const hasProfileRef = useRef(false);

  // Someone can sign up, leave, click the verification link in their email
  // days later, and come straight back to a session restored by
  // `onAuthStateChanged` — a path that never touches sign-in, so the
  // `claimWalkInBookings` calls in `authService.js` never run for them. This
  // guards the once-per-session call below so a session that fires the
  // listener more than once does not repeat a query that will keep coming
  // back empty anyway.
  const walkInsClaimedRef = useRef(false);

  // Derived — recomputed on every render so it's never stale
  const isAuthenticated = hydrated && user !== null;

  const Surface = SURFACES[surface] ?? AuthModal;

  // ── Session restoration ───────────────────────────────────────────────────
  useEffect(() => {
    // Firebase calls this immediately with the current session (or null),
    // then on every subsequent sign-in / sign-out.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.isAnonymous) {
        hasProfileRef.current = false;
        setUser(null);
        setGuestUid(firebaseUser.uid);
        setHydrated(true);
        return;
      }
      setGuestUid(null);

      if (firebaseUser) {
        // A cheap, idempotent equality query — worth firing on every restored
        // session rather than trying to detect "just verified".
        if (!walkInsClaimedRef.current && firebaseUser.emailVerified) {
          walkInsClaimedRef.current = true;
          claimWalkInBookings();
        }

        // Merge the Firestore profile (name, phone, etc.) with the UID
        const profile = await getUserProfile(firebaseUser.uid);

        if (profile) {
          hasProfileRef.current = true;
          setUser(profile);
        } else if (!hasProfileRef.current) {
          // No profile document yet. During sign-up this listener can run
          // before createUserProfile's write lands, so only fall back to the
          // bare record when we have not already stored a real profile —
          // otherwise a slow network would wipe the user's name from the UI.
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        hasProfileRef.current = false;
        setUser(null);
      }
      setHydrated(true);
    });

    return unsubscribe; // remove listener on unmount
  }, []);

  // ── Google, when the popup was blocked ────────────────────────────────────
  // `signInWithGoogle` falls back to a full-page redirect on mobile Safari and
  // in in-app browsers. Coming back, `onAuthStateChanged` alone is not enough:
  // it hands us a Firebase user, but the Firestore profile for a first-time
  // Google client is created by `completeGoogleRedirect`, and so is the claim
  // of any bookings they made as a guest. Without this the client returned
  // signed in, nameless and with their bookings left behind on the anonymous
  // id — which is what happened, because nothing called it.
  //
  // Guarded on the pending flag rather than run unconditionally: the call
  // needs the popup/redirect resolver, and loading that on every page visit is
  // exactly the gapi cost `config.js` goes out of its way to avoid.
  useEffect(() => {
    if (!isGoogleRedirectPending()) return;
    let cancelled = false;
    completeGoogleRedirect()
      .then((profile) => {
        if (profile && !cancelled) {
          hasProfileRef.current = true;
          setUser(profile);
        }
      })
      .catch(() => {
        // The listener above has already restored whatever session exists;
        // there is nothing useful to say to a client who is now signed in.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Called by the auth modals after a successful sign-in or sign-up.
   * `onAuthStateChanged` will also fire and keep the user in sync,
   * but we update state immediately so the UI responds without waiting.
   */
  const login = useCallback((userProfile) => {
    // A profile passed in here always came from Firestore, so remember that we
    // have the real thing and the listener must not downgrade it.
    if (userProfile && (userProfile.firstName || userProfile.provider)) {
      hasProfileRef.current = true;
    }
    setUser(userProfile);
    setAuthModalOpen(false);
    setAuthEmail("");

    // Resume whatever the user was trying to do before we interrupted them.
    const pending = pendingActionRef.current;
    pendingActionRef.current = null;
    if (typeof pending === "function") {
      // Defer so the modal has closed and the new user state has committed.
      setTimeout(() => pending(userProfile), 0);
    }
  }, []);

  const logout = useCallback(async () => {
    pendingActionRef.current = null;
    await logOut();
    // onAuthStateChanged will fire and set user to null automatically
  }, []);

  /** Updates just the user's profile fields in local state (e.g. after adding a phone number). */
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  /**
   * Opens the auth modal.
   *
   * Pass `onSuccess` to have that callback run once the user signs in — this is
   * what lets the booking flow pick up where it left off instead of silently
   * dropping the user back on the page with nothing having happened.
   */
  const openAuthModal = useCallback((options = {}) => {
    const { mode = AUTH_MODES.SIGN_IN, onSuccess = null } = options;
    pendingActionRef.current = typeof onSuccess === "function" ? onSuccess : null;
    setAuthMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    // Abandoning the modal abandons the pending action too.
    pendingActionRef.current = null;
    setAuthModalOpen(false);
  }, []);

  const switchToSignIn = useCallback(() => setAuthMode(AUTH_MODES.SIGN_IN), []);
  const switchToSignUp = useCallback(() => setAuthMode(AUTH_MODES.SIGN_UP), []);
  const switchToReset  = useCallback(() => setAuthMode(AUTH_MODES.RESET), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        guestUid,
        updateUser,
        isAuthenticated,
        hydrated,
        authModalOpen,
        authMode,
        authEmail,
        setAuthEmail,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        switchToSignIn,
        switchToSignUp,
        switchToReset,
      }}
    >
      {children}
      <Surface />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
