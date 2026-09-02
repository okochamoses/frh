/** The three views the auth modal can show. */
export const AUTH_MODES = {
  SIGN_IN: "signin",
  SIGN_UP: "signup",
  RESET: "reset",
};

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?\d{10,15}$/,
  MIN_PASSWORD_LENGTH: 8,
};