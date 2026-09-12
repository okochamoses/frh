/**
 * The service catalogue, shaped for browsing.
 *
 * `src/app/salon/services.json` is a flat export from the salon's booking
 * software. The v2 booking page wants something closer to how people choose a
 * hairstyle: one card per look, with the sizes or lengths of that look inside
 * it. The export already encodes that grouping — variants of one look share a
 * "Service ID" (Shuku jumbo / medium / mini all carry 20,639,708) — so this
 * module turns shared ids into looks with variants.
 *
 * The `title` of each service stays the booking key: it is what the
 * `createBooking` callable prices against, so it is sent exactly as it appears
 * in the JSON, trailing spaces included.
 *
 * Optional per-service fields read from services.json (all may be omitted):
 *   rebookAfterDays  number | null  How long until a client is usually due again.
 *                                   Overrides the category default below; null
 *                                   switches rebook suggestions off for it.
 *   pairsWith        string[]       Titles to suggest alongside it.
 *   takeDown         string         Title of the service that removes it.
 *   displayName      string         A shorter name for cards and the summary.
 *   variantLabel     string         Label for this row inside its look.
 */

import services from "@/app/salon/services.json";

// ── Categories ────────────────────────────────────────────────────────────────

/**
 * Display order, and the name a client would use for each category.
 *
 * `slug` is the category's anchor on the public services page, and the target
 * the header's mega-menu links to. It lives here so a renamed category cannot
 * leave the menu pointing at nothing.
 */
export const CATEGORIES = [
  { id: "Twists and Coils", slug: "twists", label: "Twists & coils", keywords: "twist coil" },
  { id: "Braids", slug: "braids", label: "Braids", keywords: "braid plait box" },
  { id: "Threading", slug: "threading", label: "Threading", keywords: "thread kiko wool" },
  { id: "Hairstyling (Protective and Everyday Styles)", slug: "styling", label: "Everyday styles", keywords: "style updo ponytail puff cornrow" },
  { id: "Treatments, Hair Care & Washing", slug: "treatments", label: "Wash & care", keywords: "wash treatment condition care trim" },
  { id: "Locs Hairstyling", slug: "locs", label: "Locs", keywords: "loc dread retwist relock" },
  { id: "Take-down", slug: "take-down", label: "Take-down", keywords: "take down remove loosen loosening" },
  { id: "Bridal Hair", slug: "bridal", label: "Bridal", keywords: "wedding bride bridal" },
  { id: "Manicure", slug: "nails", label: "Nails", keywords: "nail manicure pedicure toe acrylic gel" },
];

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function categoryLabel(id) {
  return CATEGORY_BY_ID[id]?.label ?? id;
}

// ── Rebook cadence ────────────────────────────────────────────────────────────

/**
 * Starting points, in days, for when a client is usually due again. A
 * `rebookAfterDays` on the service in services.json always wins.
 */
const CATEGORY_REBOOK_DAYS = {
  "Twists and Coils": 35,
  Braids: 35,
  Threading: 14,
  "Hairstyling (Protective and Everyday Styles)": 14,
  "Treatments, Hair Care & Washing": 14,
  "Locs Hairstyling": 35,
  "Take-down": null, // a follow-up in itself, never a routine
  "Bridal Hair": null,
  Manicure: 21,
};

const TITLE_REBOOK_DAYS = [
  [/^Trimming/i, 84],
  [/^Starter loc/i, 28],
];

// ── Pairings ──────────────────────────────────────────────────────────────────

const WASH_EXTRAS = ["After wash cornrows", "Blow Drying"];

/** Take-down services for styles that need one first. Keys and values are titles. */
const DEFAULT_TAKE_DOWN = {
  "Barrel Twist": "Natural hair twists loosening",
  "Twists with any combo (twists with weaves or styling)": "Natural hair twists loosening",
  "Flat twists (All back)": "Natural hair twists loosening",
  "Flatwists (with combo)": "Natural hair twists loosening",
  "Finger Coils": "Natural hair twists loosening",
  "Mini twists": "Mini twists loosening",
  "Twists with mini weaves": "Mini twists loosening",
  "Micro Twists": "Micro twists loosening",
  "Twists with micro weaves": "Micro twists loosening",
  "Loose Braids": "Loosening(Natural Braids)",
  "Natural Hair Braids": "Loosening(Natural Braids)",
  "Mini braids": "Natural mini braids loosening",
  "Some gaps threading SAT(Small Cutting)": "SAT(Small Cutting)loosening",
  "SAT with weaves": "SAT(Small Cutting)loosening",
};

/** Labels for variants whose title is too long or has no " - " suffix to borrow from. */
const VARIANT_LABELS = {
  "Interlocking/Relocking Mini Locs": "Mini locs",
  "Interlocking/Relocking Mini Locs - Jumbo sized/Regular Sized Locs": "Jumbo / regular locs",
  "Interlocking/Relocking Mini Locs - Medium Sized Locs (Interlocing and relocking)": "Medium locs",
  "Cornrows (weaves)": "Simple",
  "Pony Tail (Packing gel)": "Adult",
  "Sister Locs": "Standard length",
  "All Toe Fixing": "All toes",
};

/** Names for looks whose shared base title reads badly on a card. */
const LOOK_NAMES = {
  "Interlocking/Relocking Mini Locs": "Interlocking / relocking",
  "Starter loc": "Starter locs",
};

// ── Building looks ────────────────────────────────────────────────────────────

const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Only direct image links are worth rendering. `pin.it` short links are share
 * pages, not images, and would show as broken pictures.
 */
function usableImage(url) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) return null;
  if (/^https?:\/\/pin\.it\//.test(url)) return null;
  return url;
}

/** Splits the catalogue's free-text description from the late policy it often carries. */
function splitDescription(text) {
  const raw = String(text ?? "").replace(/\r/g, "");
  // The salon's export repeats the lateness policy as a "Note:" on most rows.
  // It belongs on the booking-terms section once, not under sixty prices — and
  // the split cannot require a leading newline, because at least one row (Finger
  // Coils) is nothing but the note, which then showed as its whole description.
  const [main] = raw.split(/\s*Note:/i);
  return clean(main);
}

function rebookDaysFor(service) {
  if (service.rebookAfterDays === null) return null;
  if (Number.isFinite(service.rebookAfterDays)) return service.rebookAfterDays;
  const byTitle = TITLE_REBOOK_DAYS.find(([re]) => re.test(clean(service.title)));
  if (byTitle) return byTitle[1];
  return CATEGORY_REBOOK_DAYS[service.category] ?? null;
}

// The same rows the server will accept: header rows are section titles in the
// salon's export, not bookable services (functions/lib/serviceCatalogue.js).
const bookable = services.filter((s) => !s.header && s.title && s["Online Booking"] !== "Disabled");

/** Every bookable service, keyed by its exact title. */
export const SERVICE_BY_TITLE = new Map();

/** Every look, keyed by id. */
export const LOOK_BY_ID = new Map();

function buildLooks() {
  const groups = new Map();
  for (const s of bookable) {
    const key = s["Service ID"] ? `${s.category}|${s["Service ID"]}` : `${s.category}|${s.title}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }

  const looks = [];
  let n = 0;
  for (const rows of groups.values()) {
    n += 1;
    const first = rows[0];
    const isGroup = rows.length > 1;
    const rawBase = isGroup ? clean(first.title.split(" - ")[0]) : clean(first.displayName || first.title);
    const baseName = LOOK_NAMES[rawBase] ?? rawBase;

    const options = rows.map((s, i) => {
      const [, suffix] = clean(s.title).split(" - ");
      const label =
        clean(s.variantLabel) ||
        VARIANT_LABELS[clean(s.title)] ||
        (suffix ? suffix.replace(new RegExp(`\\s*${escapeRegExp(rawBase.split(" ").pop())}$`, "i"), "").trim() || suffix : null) ||
        (isGroup ? "Standard" : null);

      const option = {
        id: `${n}-${i}`,
        title: s.title, // exact — the booking key
        name: isGroup ? `${baseName} · ${label}` : baseName,
        label,
        price: Number(s.price) || 0,
        duration: Number(s.duration) || 0,
        category: s.category,
        rebookAfterDays: rebookDaysFor(s),
        pairsWith: Array.isArray(s.pairsWith) ? s.pairsWith : null,
        takeDown: typeof s.takeDown === "string" ? s.takeDown : null,
      };
      SERVICE_BY_TITLE.set(s.title, option);
      return option;
    });

    // Cheapest first, so "from ₦3,000" is the first thing in the size list.
    options.sort((a, b) => a.price - b.price || a.duration - b.duration);

    const image = rows.map((s) => usableImage(s.imageUrl)).find(Boolean) ?? null;

    const look = {
      id: `look-${n}`,
      name: baseName,
      category: first.category,
      image,
      description: splitDescription(first.Description),
      options,
      hasVariants: isGroup,
      minPrice: Math.min(...options.map((o) => o.price)),
      minDuration: Math.min(...options.map((o) => o.duration)),
      maxDuration: Math.max(...options.map((o) => o.duration)),
      featured: rows.some((s) => s.featured),
    };
    look.ownText = [look.name, ...options.map((o) => `${o.title} ${o.label ?? ""}`), look.description]
      .join(" ")
      .toLowerCase();
    look.categoryText = `${categoryLabel(look.category)} ${CATEGORY_BY_ID[look.category]?.keywords ?? ""}`.toLowerCase();

    for (const o of options) o.lookId = look.id;
    LOOK_BY_ID.set(look.id, look);
    looks.push(look);
  }

  const order = (id) => {
    const i = CATEGORIES.findIndex((c) => c.id === id);
    return i === -1 ? CATEGORIES.length : i;
  };
  // Stable within a category: the salon's own export order.
  return looks
    .map((look, i) => ({ look, i }))
    .sort((a, b) => order(a.look.category) - order(b.look.category) || a.i - b.i)
    .map(({ look }) => look);
}

export const LOOKS = buildLooks();

/** Categories that actually have bookable looks, in display order. */
export const ACTIVE_CATEGORIES = CATEGORIES.filter((c) => LOOKS.some((l) => l.category === c.id));

export function lookForTitle(title) {
  const option = SERVICE_BY_TITLE.get(title);
  return option ? LOOK_BY_ID.get(option.lookId) : null;
}

/**
 * Looks matching a free-text query and a category ("all" for every category).
 *
 * A look's own words rank first: "updo" should lead with the updos, not with
 * whichever everyday style happens to come first in the export. Looks that only
 * match through their category's words ("take down", "nails") follow, so people
 * who search the way they talk still land somewhere useful.
 */
export function searchLooks(query, category = "all") {
  const words = clean(query).toLowerCase().split(" ").filter(Boolean);
  const pool = LOOKS.filter((look) => category === "all" || look.category === category);
  if (words.length === 0) return pool;

  const own = pool.filter((look) => words.every((w) => look.ownText.includes(w)));
  const byCategory = pool.filter(
    (look) => !own.includes(look) && words.every((w) => `${look.ownText} ${look.categoryText}`.includes(w))
  );
  return [...own, ...byCategory];
}

/**
 * The one add-on worth suggesting for a selected service, or null.
 *
 * Take-down comes first: arriving in old twists for new ones is the most
 * common reason a visit overruns. Wash extras follow for wash services.
 */
export function suggestionFor(option, selectedTitles) {
  const taken = new Set(selectedTitles);
  const candidates = [];

  const takeDown = option.takeDown ?? DEFAULT_TAKE_DOWN[clean(option.title)];
  if (takeDown) candidates.push({ title: takeDown, kind: "take-down" });

  const pairs =
    option.pairsWith ??
    (option.category === "Treatments, Hair Care & Washing" && /^Washing/i.test(clean(option.title))
      ? WASH_EXTRAS
      : []);
  for (const title of pairs) candidates.push({ title, kind: "pair" });

  for (const c of candidates) {
    const match = SERVICE_BY_TITLE.get(c.title) ?? [...SERVICE_BY_TITLE.values()].find((o) => clean(o.title) === clean(c.title));
    if (match && !taken.has(match.title)) return { ...c, option: match };
  }
  return null;
}
