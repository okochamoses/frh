/**
 * Nigerian mobile numbers, in one place.
 *
 * The pattern and the normalisation were written three times over — the v2
 * booking flow, the v1 services page, and `functions/lib/guest.js` on the
 * server. The server copy has to stay where it is (it is a separate deploy
 * with its own module system), but the two client copies do not, and the
 * account page needed a third. Sharing them is what keeps "valid at booking"
 * and "valid in your profile" the same claim.
 */

/** `08031234567` or `+2348031234567`. Spaces and dashes must be stripped first. */
export const NG_MOBILE = /^(?:\+234|0)[789]\d{9}$/;

/** How people type a number; not how it is stored. */
export const stripSpacing = (value) => String(value ?? "").replace(/[\s\-().]/g, "");

/**
 * The ways people actually type, paste or autofill a Nigerian number, brought
 * to `0…` or `+234…` so one pattern can judge them: `2348031234567` (no plus),
 * `002348031234567` (international dialling prefix), `+234 (0) 803 123 4567`
 * (the trunk zero kept after the country code), `803 123 4567` (no prefix).
 */
function canonical(value) {
  let n = stripSpacing(value);
  if (n.startsWith("00234")) n = `+${n.slice(2)}`;
  else if (n.startsWith("234")) n = `+${n}`;
  if (n.startsWith("+2340")) n = `+234${n.slice(5)}`;
  if (/^[789]\d{9}$/.test(n)) n = `0${n}`;
  return n;
}

/** E.164, which is what everything downstream — SMS, WhatsApp, the salon — expects. */
export function normaliseMobile(value) {
  const n = canonical(value);
  return n.startsWith("0") ? `+234${n.slice(1)}` : n;
}

export function isValidMobile(value) {
  return NG_MOBILE.test(canonical(value));
}

/** For reading, not storing: `+2347031144832` → `0703 114 4832`. Anything else is shown as given. */
export function displayMobile(value) {
  const n = normaliseMobile(value);
  if (!NG_MOBILE.test(n)) return value;
  const local = `0${n.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/** The one wording for a bad number, so it reads the same wherever it is asked for. */
export const MOBILE_HINT =
  "Enter a full mobile number, e.g. 08031234567 or +2348031234567";
