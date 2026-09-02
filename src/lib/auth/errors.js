/**
 * Maps Firebase Auth error codes to messages we are willing to show a user.
 *
 * A note on `auth/invalid-credential`: this project has email enumeration
 * protection enabled (Firebase console → Authentication → Settings → User
 * actions), which is the modern default. Under it, Firebase deliberately
 * returns the same code whether the address is unknown or the password is
 * wrong, so that an attacker cannot use the sign-in form to discover which
 * email addresses have accounts.
 *
 * That means we must NOT say "no account found" — we genuinely do not know,
 * and saying it sends a user who simply mistyped their password off to a
 * sign-up form that then rejects them for already existing. The older
 * `auth/user-not-found` and `auth/wrong-password` codes are kept only as a
 * fallback in case the setting is ever turned off.
 */

const SIGN_IN_MESSAGES = {
  "auth/invalid-credential": "Email or password is incorrect. Please try again.",
  "auth/user-not-found": "Email or password is incorrect. Please try again.",
  "auth/wrong-password": "Email or password is incorrect. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Please contact us for help.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a few minutes before trying again, or reset your password.",
  "auth/network-request-failed": "Cannot reach the network. Check your connection and try again.",
};

const SIGN_UP_MESSAGES = {
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Please choose a stronger password of at least 8 characters.",
  // Returned when a password policy is configured in the Firebase console.
  "auth/password-does-not-meet-requirements":
    "Please choose a stronger password of at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Cannot reach the network. Check your connection and try again.",
};

const GOOGLE_MESSAGES = {
  "auth/account-exists-with-different-credential":
    "This email is already registered with a password. Sign in with your password instead.",
  "auth/unauthorized-domain": "Google sign-in is not available on this domain.",
  "auth/network-request-failed": "Cannot reach the network. Check your connection and try again.",
};

/** True for the codes that mean "the user backed out", which are not errors. */
export function isUserCancelledPopup(error) {
  return (
    error?.code === "auth/popup-closed-by-user" ||
    error?.code === "auth/cancelled-popup-request" ||
    error?.code === "auth/user-cancelled"
  );
}

export function getSignInErrorMessage(error) {
  return SIGN_IN_MESSAGES[error?.code] ?? "Sign in failed. Please try again.";
}

export function getSignUpErrorMessage(error) {
  return SIGN_UP_MESSAGES[error?.code] ?? "Sign up failed. Please try again.";
}

export function getGoogleErrorMessage(error) {
  return GOOGLE_MESSAGES[error?.code] ?? "Google sign-in failed. Please try again.";
}

export function getPasswordResetErrorMessage(error) {
  if (error?.code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  return "Could not send the reset email. Please try again.";
}
