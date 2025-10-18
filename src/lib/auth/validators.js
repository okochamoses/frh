import { VALIDATION } from "./constants";

export const validateEmail = (email) => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Email is required" };
  }

  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: "Phone number is required" };
  }

  if (!VALIDATION.PHONE_REGEX.test(phone)) {
    return { valid: false, error: "Invalid phone number" };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  return { valid: true };
};

export const validateSignUpForm = (formData) => {
  const { firstName, lastName, email, phone, password, confirmPassword } = formData;

  if (!firstName?.trim()) return { valid: false, error: "First name is required" };
  if (!lastName?.trim()) return { valid: false, error: "Last name is required" };

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) return emailValidation;

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) return phoneValidation;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) return passwordValidation;

  if (!confirmPassword?.trim()) {
    return { valid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }

  return { valid: true };
};