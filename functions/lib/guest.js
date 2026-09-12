/**
 * Guest bookings: a booking made without an account.
 *
 * The v2 booking page signs a guest in anonymously, so every booking still has
 * an owner (`userId`) and the callable can still see who is asking. What a
 * guest does not have is a profile, so they send their contact details with
 * the booking and this module decides whether to believe them.
 *
 * The phone number is required and the email optional. The salon reaches
 * clients by phone and WhatsApp; the email is only for the confirmation.
 */

const {validateEmail} = require("./validators");

const NG_MOBILE = /^(?:\+234|0)[789]\d{9}$/;
const MAX_NAME_LENGTH = 60;

/**
 * How many upcoming bookings one guest may hold, counted separately per
 * device (anonymous uid), per phone number and per email.
 *
 * Anonymous sign-in is free, so without these caps the callable would let
 * anyone fill the salon's diary, or send booking confirmations to a stranger's
 * inbox, simply by varying the details.
 */
const MAX_UPCOMING_PER_GUEST = 3;

/** Stores every number the same way, so the salon can dial straight from an email. */
function normaliseMobile(value) {
    const compact = String(value ?? "").replace(/[\s-]/g, "");
    return compact.startsWith("0") ? `+234${compact.slice(1)}` : compact;
}

/**
 * Validates the details a guest sent. Returns the cleaned contact, or
 * `{error}` with a message written for the customer.
 *
 * @param {unknown} guest
 * @returns {{firstName: string, mobileNumber: string, email: string|null} | {error: string}}
 */
function parseGuest(guest) {
    if (!guest || typeof guest !== "object") {
        return {error: "Please tell us your name and phone number."};
    }

    const firstName = String(guest.firstName ?? "").replace(/\s+/g, " ").trim();
    if (!firstName) return {error: "Please tell us your name."};
    if (firstName.length > MAX_NAME_LENGTH) return {error: "That name is too long."};

    const rawMobile = String(guest.mobileNumber ?? "").replace(/[\s-]/g, "");
    if (!NG_MOBILE.test(rawMobile)) {
        return {error: "Enter a full mobile number, e.g. 08031234567 or +2348031234567."};
    }

    let email = null;
    if (guest.email !== undefined && guest.email !== null && String(guest.email).trim() !== "") {
        email = String(guest.email).trim().toLowerCase();
        if (!validateEmail(email).valid) return {error: "That email address doesn't look right."};
    }

    return {firstName, mobileNumber: normaliseMobile(rawMobile), email};
}

module.exports = {parseGuest, normaliseMobile, MAX_UPCOMING_PER_GUEST};
