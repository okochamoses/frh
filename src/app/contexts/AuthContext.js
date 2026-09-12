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
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/userService";
import { logOut } from "@/lib/firebase/authService";
import AuthModal from "@/components/auth/AuthModal";
import { AUTH_MODES } from "@/lib/auth/constants";

const AuthContext = createContext();

export function AuthProvider({ children }) {
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

  // Derived — recomputed on every render so it's never stale
  const isAuthenticated = hydrated && user !== null;

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
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
