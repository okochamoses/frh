/**
 * The salon's editable price lists.
 *
 * v1 and v2 are priced separately, so each has its own document:
 * `price_lists/v1` and `price_lists/v2`, shaped `{prices: {title: naira}}`.
 * A title missing from `prices` keeps the price in `services.json`. Anyone can
 * read them; only an admin can write (firestore.rules), and the booking
 * callables read the same documents to price a visit server-side.
 */

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./config";

export const PRICE_LISTS = ["v1", "v2"];

/** Calls `onChange(prices)` now and on every change. Returns the unsubscribe. */
export function subscribePriceList(list, onChange, onError) {
  return onSnapshot(
    doc(db, "price_lists", list),
    (snap) => onChange(snap.exists() ? snap.data().prices ?? {} : {}),
    (err) => {
      console.error(`[priceList] ${list} subscription error:`, err);
      onError?.(err);
    }
  );
}

/** Replaces one list's overrides. Admin only. */
export async function savePriceList(list, prices, adminEmail) {
  await setDoc(doc(db, "price_lists", list), {
    prices,
    updatedAt: serverTimestamp(),
    updatedBy: adminEmail ?? null,
  });
}
