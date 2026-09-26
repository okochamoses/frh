"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { MAX_APPOINTMENT_MINUTES, formatDuration, naira } from "@/lib/booking/schedule";
import { SERVICE_BY_TITLE } from "@/lib/booking/catalogue";
import { useCatalogueVersion } from "@/lib/booking/usePriceList";
import { track } from "@/lib/analytics";

/**
 * The cart the services grid writes into: which titles are chosen, what they
 * cost, how long they take, and the rules for adding one.
 *
 * It lived inside `BookingFlow` until the admin dashboard needed to record a
 * walk-in. Staff pick services from the same grid a customer does, so they
 * need the same rules — and `applyFromSheet` in particular is not a rule
 * anyone would reimplement the same way twice. It strips every other option of
 * a look before adding, with a carve-out in the too-long guard for a swap, so
 * choosing "medium" after "small" replaces rather than stacks. Two copies of
 * that would drift, and the drift would look like a pricing bug.
 *
 * @param {object} params
 * @param {(message: string, undo?: () => void) => void} params.showToast
 * @param {string} [params.surface]   Named in the analytics events, so staff
 *                                   picks don't read as customer picks.
 * @param {() => void} [params.onChange] Called whenever the cart changes — the
 *                                   booking flow uses it to clear a stale error.
 */
export function useServiceCart({ showToast, surface = "public", onChange } = {}) {
  const [selected, setSelected] = useState([]); // exact service titles
  const [sheetLook, setSheetLook] = useState(null);
  const catalogueVersion = useCatalogueVersion();

  // Mirrors `selected` so the stable callbacks below can read it without
  // taking it as a dependency.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const options = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prices change under the same titles
    () => selected.map((t) => SERVICE_BY_TITLE.get(t)).filter(Boolean),
    [selected, catalogueVersion]
  );
  const duration = options.reduce((sum, o) => sum + o.duration, 0);
  const total = options.reduce((sum, o) => sum + o.price, 0);

  // Read by the too-long guard, for the same reason as selectedRef: it keeps
  // `toggle` and `applyFromSheet` stable rather than rebuilding them on every
  // change of total.
  const durationRef = useRef(0);
  durationRef.current = duration;

  const changed = useCallback(() => onChange?.(), [onChange]);

  /**
   * Refuses an addition that would run past a single day, and says why.
   *
   * The salon closes, so an appointment has a ceiling. Nothing is disabled up
   * front: a greyed-out card tells a customer they cannot have something
   * without telling them what to do about it. Instead the tap is accepted,
   * the service is not added, and the message names both numbers — what this
   * service needs and what is actually left — so the next move is obvious.
   */
  const refuseIfTooLong = useCallback(
    (option) => {
      const remaining = MAX_APPOINTMENT_MINUTES - durationRef.current;
      if (option.duration <= remaining) return false;

      track("service_too_long", {
        service: option.title,
        needs: option.duration,
        remaining,
        surface,
      });
      showToast(
        remaining > 0
          ? `${option.name} needs ${formatDuration(option.duration)}, and only ${formatDuration(remaining)} is left in the day.`
          : `${option.name} needs ${formatDuration(option.duration)}, and the day is already full. Remove something first.`
      );
      return true;
    },
    [showToast, surface]
  );

  const announceAdd = useCallback(
    (option) =>
      showToast(
        `Added ${option.name.toLowerCase()} · +${formatDuration(option.duration)} · ${naira(option.price)}`,
        () => setSelected((prev) => prev.filter((t) => t !== option.title))
      ),
    [showToast]
  );

  const toggle = useCallback(
    (option, { announce = false } = {}) => {
      // Reported off a ref, not from inside the updater: React may run an
      // updater twice, which would double-count every add.
      const had = selectedRef.current.includes(option.title);
      // Removals always go through; only a new service can overrun the day.
      if (!had && refuseIfTooLong(option)) return;
      track(had ? "service_removed" : "service_added", {
        service: option.title,
        price: option.price,
        duration: option.duration,
        surface,
      });
      setSelected((prev) => {
        const has = prev.includes(option.title);
        return has ? prev.filter((t) => t !== option.title) : [...prev, option.title];
      });
      changed();
      if (announce) announceAdd(option);
    },
    [refuseIfTooLong, surface, changed, announceAdd]
  );

  const addOption = useCallback(
    (option) => {
      if (!selectedRef.current.includes(option.title)) toggle(option, { announce: true });
    },
    [toggle]
  );

  /** From the sheet: `option` null removes the look, otherwise it replaces any other option of that look. */
  const applyFromSheet = useCallback(
    (look, option) => {
      const others = look.options.map((o) => o.title);
      /*
       * The sheet is where a longer variant gets chosen, so it needs the same
       * guard — but only when nothing of this look is swapped out for it.
       * Switching between two options of the same look frees the old one's time
       * first, so it cannot be judged against the current total.
       */
      const swapping = selectedRef.current.some((t) => others.includes(t));
      if (option && !swapping && refuseIfTooLong(option)) return;
      setSelected((prev) => [
        ...prev.filter((t) => !others.includes(t)),
        ...(option ? [option.title] : []),
      ]);
      setSheetLook(null);
      changed();
      if (option) announceAdd(option);
    },
    [refuseIfTooLong, changed, announceAdd]
  );

  const openSheet = useCallback((lookId) => setSheetLook(lookId), []);
  const closeSheet = useCallback(() => setSheetLook(null), []);

  return {
    selected,
    setSelected,
    // Exposed so a caller whose own effects must not re-run on every cart
    // change can still read the live value — the booking flow's `?look=`
    // handler is the one that needs it.
    selectedRef,
    options,
    duration,
    total,
    refuseIfTooLong,
    toggle,
    addOption,
    applyFromSheet,
    sheetLook,
    openSheet,
    closeSheet,
  };
}

export default useServiceCart;
