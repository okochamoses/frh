/**
 * The note a client leaves with a booking.
 *
 * The FAQ asks people to use this field by name — "tell us when you book so we
 * plan the gentler approach" for relaxed or transitioning hair, "mention it in
 * your booking notes" for children's hair — so what arrives here is usually the
 * detail that decides how long the chair is needed. It reaches the salon by
 * email, and is the only free text a client can put into that email, so it is
 * cleaned here and escaped again at the template.
 */

/** Mirrors MAX_NOTES in src/components/v2/booking/BookingFlow.jsx. */
const MAX_NOTES_LENGTH = 500;

// Control characters would survive into the owner's email as mojibake. Tab and
// newline are left alone here — the whitespace rules below fold them in.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Cleans the note a booking carried, or reports why it can't be used.
 *
 * An absent note is not an error — the field is optional — so `undefined`,
 * `null` and an empty string all return `{notes: null}`.
 *
 * @param {unknown} value
 * @returns {{notes: string|null} | {error: string}}
 */
function parseNotes(value) {
    if (value === undefined || value === null) return {notes: null};
    if (typeof value !== "string") {
        return {error: "That note could not be read. Please type it again."};
    }

    const notes = value
        .replace(CONTROL_CHARS, "")
        .replace(/\r\n?/g, "\n")
        // Any run of blank lines becomes one: pasted text often carries a dozen,
        // which would push the rest of the owner's digest off the screen.
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[^\S\n]+/g, " ")
        // Line by line, so a kept line break doesn't carry a stray space either side.
        .replace(/ ?\n ?/g, "\n")
        .trim();

    if (!notes) return {notes: null};
    if (notes.length > MAX_NOTES_LENGTH) {
        return {error: `Please keep your note under ${MAX_NOTES_LENGTH} characters.`};
    }

    return {notes};
}

module.exports = {parseNotes, MAX_NOTES_LENGTH};
