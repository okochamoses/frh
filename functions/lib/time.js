const WAT_OFFSET = "+01:00";

/**
 * Bookings written before the UTC migration store a naive WAT string
 * ("2026-08-21T10:00:00"); newer ones store a true instant ("…Z").
 * Anchor the naive form to WAT so both parse to the same wall-clock time.
 */
function watDate(iso) {
    if (!iso) return null;
    const hasZone = /(Z|[+-]\d{2}:\d{2})$/.test(iso);
    const d = new Date(hasZone ? iso : `${iso}${WAT_OFFSET}`);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Calendar date in Lagos as "YYYY-MM-DD". */
function watDateKey(date) {
    return date.toLocaleDateString("en-CA", {timeZone: "Africa/Lagos"});
}

module.exports = {watDate, watDateKey};