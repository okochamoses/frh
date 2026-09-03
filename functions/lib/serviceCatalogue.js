/**
 * The server's copy of the service catalogue.
 *
 * Kept in sync with `src/app/salon/services.json` by `scripts/sync-services.mjs`
 * (wired into the functions predeploy hook). Prices and durations are read from
 * here rather than from the request body, so a booking can never be written
 * with a price the salon did not set.
 *
 * `title` is the key: SKU is empty on every row and Service ID is a formatted
 * string, so the title is the only stable identifier the catalogue has.
 */

const catalogue = require("./services.json");

const byTitle = new Map(
    catalogue
        .filter((s) => !s.header && s.title)
        .map((s) => [s.title, s])
);

/**
 * Resolves service titles to the trimmed records stored on a booking.
 *
 * @param {string[]} titles
 * @returns {{services: Array, servicesText: string, totalPrice: number, totalDuration: number}}
 * @throws {Error} with `.unknownTitles` when a title is not in the catalogue
 */
function lookup(titles) {
    if (!Array.isArray(titles) || titles.length === 0) {
        throw new Error("No services selected.");
    }

    const unknownTitles = titles.filter((t) => typeof t !== "string" || !byTitle.has(t));
    if (unknownTitles.length > 0) {
        const err = new Error(`Unknown service: ${unknownTitles.join(", ")}`);
        err.unknownTitles = unknownTitles;
        throw err;
    }

    const services = titles.map((title) => {
        const s = byTitle.get(title);
        return {
            title: s.title,
            price: s.price,
            duration: s.duration,
            category: s.category ?? null,
        };
    });

    return {
        services,
        servicesText: services.map((s) => s.title).join(" | "),
        totalPrice: services.reduce((sum, s) => sum + s.price, 0),
        totalDuration: services.reduce((sum, s) => sum + s.duration, 0),
    };
}

module.exports = {lookup, byTitle};
