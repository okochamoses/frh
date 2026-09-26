/**
 * Which styles the salon holds with a deposit, and how much.
 *
 * One list, because there were three and they disagreed. The salon's own
 * service export states the rule inside a dozen free-text descriptions (along
 * with its bank details, which is why `catalogue.js` now strips that text); the
 * salon page's booking terms restated it; the homepage FAQ restated a shorter
 * version of it; and the confirm step of the booking flow told every client
 * they would "pay at the salon" regardless. A client booking mini twists could
 * read all four and still not know a transfer was expected before the slot was
 * held.
 *
 * Matched on the catalogue's exact titles — the same string the booking
 * callable prices against — not on display names, which carry a variant suffix.
 * Percentages are the salon's.
 */
const RULES = [
  { pct: 70, titles: [/^micro twists$/i, /^sister locs/i] },
  {
    pct: 50,
    titles: [
      /^mini twists$/i,
      /^mini braids$/i,
      /^natural hair braids$/i,
      /^bantu knots$/i,
      /^mini twists loosening$/i,
      /^micro twists loosening$/i,
    ],
  },
];

/** The deposit percentage for a service title, or 0 if it is settled on the day. */
export function depositPctForTitle(title) {
  const name = String(title ?? "").trim();
  const rule = RULES.find((r) => r.titles.some((re) => re.test(name)));
  return rule ? rule.pct : 0;
}

/**
 * The deposit owed on a basket: each service's own percentage of its own price,
 * not one percentage applied to the total. A wash added to a micro twists
 * booking does not become 70% payable because it shares the slot.
 *
 * Returns `{ amount, pcts }` — `pcts` is the distinct percentages in play, so a
 * summary can say "50%" rather than "50–70%" when only one applies.
 */
export function depositForOptions(options = []) {
  let amount = 0;
  const pcts = new Set();
  for (const option of options) {
    const pct = depositPctForTitle(option?.title ?? option?.name);
    if (!pct) continue;
    amount += Math.round((option.price * pct) / 100);
    pcts.add(pct);
  }
  return { amount, pcts: [...pcts].sort((a, b) => a - b) };
}
