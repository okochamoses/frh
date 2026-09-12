/* A maps search for the salon's own address — no place ID to go stale, and it
   resolves the same way on a phone as on a laptop. Shared by every place on
   the site that prints the address, so they all open the same pin. */
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    "Flourish Roots Hair Co, Shop 303 Destiny Plaza, Ago Palace Way, Isolo, Lagos",
  );

/* Where the reviews quoted in the testimonials section come from, so the
   attribution under each quote is checkable rather than a claim.

   This is the same address search as above, which resolves to the salon's
   listing but lands on the overview rather than the reviews tab. Swapping in
   the share link from the Google Business Profile (it carries the place ID)
   would open the reviews directly — worth doing, but a place ID that goes
   stale silently is worse than one extra tap, so it is not guessed at here. */
export const GOOGLE_REVIEWS_URL = MAPS_URL;
