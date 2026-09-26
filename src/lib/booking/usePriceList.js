"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { applyPriceList, getCatalogueVersion, subscribeCatalogue } from "./catalogue";
import { subscribePriceList } from "@/lib/firebase/priceListService";

/**
 * The admin's overrides for one list, `{title: naira}`. Empty until loaded, so
 * pages show the `services.json` price rather than nothing.
 */
export function usePriceList(list) {
  const [prices, setPrices] = useState({});
  useEffect(() => subscribePriceList(list, setPrices), [list]);
  return prices;
}

/** Keeps the v2 catalogue's prices live. Mount once per page tree. */
export function V2PriceSync() {
  const prices = usePriceList("v2");
  useEffect(() => applyPriceList(prices), [prices]);
  return null;
}

/**
 * Re-renders the caller whenever v2 prices change. The return value is only
 * useful as a memo dependency.
 */
export function useCatalogueVersion() {
  return useSyncExternalStore(subscribeCatalogue, getCatalogueVersion, () => 0);
}
