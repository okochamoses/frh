"use client";

/**
 * The Google button's behaviour, shared by the sign-in and sign-up forms.
 *
 * `signInWithGoogle` resolves to null when the popup was blocked and it fell
 * back to a full-page redirect — the page is on its way out, so there is
 * nothing to do here and, in particular, nothing to stop the spinner for. The
 * trip back is completed by `AuthProvider`.
 */

import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/authService";
import { getGoogleErrorMessage, isUserCancelledPopup } from "@/lib/auth/errors";

export default function useGoogleAuth({ onDone, onError }) {
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    onError(null);
    try {
      const profile = await signInWithGoogle();
      if (profile) onDone(profile);
    } catch (err) {
      // Closing the popup is a decision, not a failure.
      if (!isUserCancelledPopup(err)) onError(getGoogleErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return { busy, start };
}
