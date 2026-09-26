/**
 * Finding a returning client at the front desk.
 *
 * Staff know a regular by their phone number, not their email — but email is
 * what the server matches a walk-in to an account on, because Firebase Auth
 * owns an address and can say whether anyone proved it, while a typed phone
 * number proves nothing. So this searches the customer list by number and
 * hands back the profile, and the form uses it to offer that person's email
 * for staff to confirm. It is advisory: the result is never sent anywhere.
 *
 * Pure on purpose — no firebase import — so it can be reasoned about and
 * tested without an emulator. Callers pass the list `subscribeAllCustomers`
 * is already streaming into the admin dashboard.
 */

import { normaliseMobile } from "@/lib/phone";

/**
 * The one customer holding this number, or null.
 *
 * Compares normalised on both sides. Profiles store whatever was typed, merely
 * trimmed (`userService.js:78`), so the collection holds a mix of
 * `08031234567` and `+2348031234567` and a raw string compare would miss
 * roughly half the people it should find — silently, which is the worst way
 * for a lookup to fail.
 *
 * Two profiles can legitimately share a number (a mother booking for a
 * daughter). Offering whichever happened to sort first would put the visit on
 * the wrong account, so an ambiguous match is no match.
 *
 * @param {Array<{uid: string, firstName?: string, lastName?: string, email?: string, mobileNumber?: string|null}>} customers
 * @param {string} mobileNumber
 */
export function findCustomerByMobile(customers, mobileNumber) {
  const wanted = normaliseMobile(mobileNumber ?? "");
  if (!wanted) return null;

  const hits = (customers ?? []).filter(
    (c) => c.mobileNumber && normaliseMobile(c.mobileNumber) === wanted
  );
  return hits.length === 1 ? hits[0] : null;
}

/** "Ada Lovelace", or just the first name, or null when there is neither. */
export function customerName(customer) {
  if (!customer) return null;
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}
