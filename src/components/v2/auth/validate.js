/**
 * Field-level validation for the v2 auth forms.
 *
 * V1's `validateSignUpForm` stops at the first problem and returns one string,
 * which the v1 modal prints under the whole form. V2 puts the message under the
 * field it belongs to — the pattern the booking flow already uses for a guest's
 * details — so this returns a map of field → message instead, and reports every
 * problem at once rather than one per submit.
 *
 * The underlying rules are v1's: these wrap `@/lib/auth/validators` rather than
 * restating them, so the two surfaces can never drift on what counts as valid.
 */

import { validateEmail, validatePassword } from "@/lib/auth/validators";
import { MOBILE_HINT, isValidMobile } from "@/lib/phone";
import { VALIDATION } from "@/lib/auth/constants";

const emailError = (email) => {
  const check = validateEmail((email ?? "").trim());
  if (check.valid) return null;
  return check.error === "Email is required"
    ? "Please enter your email."
    : "That doesn't look like an email address.";
};

export function signInErrorsFor({ email, password }) {
  const errors = {};
  const emailProblem = emailError(email);
  if (emailProblem) errors.email = emailProblem;
  if (!password?.trim()) errors.password = "Please enter your password.";
  return errors;
}

export function resetErrorsFor({ email }) {
  const errors = {};
  const emailProblem = emailError(email);
  if (emailProblem) errors.email = emailProblem;
  return errors;
}

export function signUpErrorsFor({ firstName, lastName, email, phone, password, confirmPassword }) {
  const errors = {};

  if (!firstName?.trim()) errors.firstName = "Please tell us your name.";
  if (!lastName?.trim()) errors.lastName = "Please add your surname.";

  const emailProblem = emailError(email);
  if (emailProblem) errors.email = emailProblem;

  // The shared check, so a number accepted at booking is accepted here too —
  // including pasted forms like 2348031234567 or +234 (0) 803….
  if (!phone?.trim()) errors.phone = "We need a number to reach you about your appointment.";
  else if (!isValidMobile(phone)) errors.phone = MOBILE_HINT;

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    errors.password =
      passwordCheck.error === "Password is required"
        ? "Please choose a password."
        : `At least ${VALIDATION.MIN_PASSWORD_LENGTH} characters, please.`;
  }

  if (!confirmPassword?.trim()) {
    errors.confirmPassword = "Please type your password again.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "These two don't match.";
  }

  return errors;
}
