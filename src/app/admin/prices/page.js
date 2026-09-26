"use client";

import { useEffect, useMemo, useState } from "react";
import { merriweather } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import services from "@/data/services.json";
import { auth } from "@/lib/firebase/config";
import { PRICE_LISTS, savePriceList, subscribePriceList } from "@/lib/firebase/priceListService";

/**
 * Edits the salon's two price lists. v1 (the original site) and v2 are priced
 * separately: each tab writes its own `price_lists/{list}` document, and the
 * booking callables price a visit from the list of the site it was booked on.
 *
 * Only prices that differ from `services.json` are stored, so clearing a box
 * (or typing the original price back) returns that service to the default.
 */

const LABELS = { v1: "v1 site", v2: "v2 site" };

const ROWS = services.filter((s) => !s.header && s.title);
const CATEGORIES = Array.from(new Set(ROWS.map((s) => s.category)));

const ngn = (n) => `₦${Number(n).toLocaleString("en-US")}`;

export default function AdminPricesPage() {
  const [list, setList] = useState("v2");
  const [saved, setSaved] = useState(null); // overrides as stored
  const [draft, setDraft] = useState({}); // title -> input string
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null); // {kind, text}
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaved(null);
    setDraft({});
    setStatus(null);
    return subscribePriceList(
      list,
      (prices) => {
        setSaved(prices);
        setDraft(Object.fromEntries(Object.entries(prices).map(([t, p]) => [t, String(p)])));
      },
      () => setStatus({ kind: "error", text: "Couldn't load prices." })
    );
  }, [list]);

  // What would be stored: only valid numbers that differ from the default.
  const { next, invalid } = useMemo(() => {
    const next = {};
    const invalid = new Set();
    for (const s of ROWS) {
      const raw = (draft[s.title] ?? "").replace(/[,\s₦]/g, "");
      if (raw === "") continue;
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0) invalid.add(s.title);
      else if (n !== s.price) next[s.title] = n;
    }
    return { next, invalid };
  }, [draft]);

  const dirty = saved !== null && JSON.stringify(sortKeys(next)) !== JSON.stringify(sortKeys(saved));

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? ROWS.filter((s) => s.title.toLowerCase().includes(term)) : ROWS;
  }, [search]);

  const handleSave = async () => {
    if (invalid.size > 0) {
      setStatus({ kind: "error", text: "Prices must be whole naira amounts." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await savePriceList(list, next, auth.currentUser?.email);
      setStatus({ kind: "ok", text: `${LABELS[list]} prices saved.` });
    } catch (err) {
      console.error("[admin/prices] save failed:", err);
      setStatus({ kind: "error", text: "Couldn't save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${merriweather.className} text-2xl font-bold text-stone-900`}>Prices</h1>
        <input
          type="search"
          placeholder="Search services…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-md border border-stone-300 bg-white p-1" role="tablist">
          {PRICE_LISTS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={list === id}
              disabled={dirty && list !== id}
              title={dirty && list !== id ? "Save or discard changes first" : undefined}
              onClick={() => setList(id)}
              className={`rounded px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                list === id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {LABELS[id]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {status && (
            <span className={`text-sm ${status.kind === "error" ? "text-red-600" : "text-green-700"}`}>
              {status.text}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || saving}
            onClick={() => setDraft(Object.fromEntries(Object.entries(saved ?? {}).map(([t, p]) => [t, String(p)])))}
          >
            Discard
          </Button>
          <Button type="button" disabled={!dirty || saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save prices"}
          </Button>
        </div>
      </div>

      <p className="mb-6 text-sm text-stone-500">
        Leave a box empty to use the default price. Changes apply to new bookings on the {LABELS[list]} as soon as
        they&apos;re saved; existing bookings keep the price they were made at.
      </p>

      {saved === null && !status && <p className="text-sm text-stone-500">Loading…</p>}

      {saved !== null &&
        CATEGORIES.map((category) => {
          const rows = visible.filter((s) => s.category === category);
          if (rows.length === 0) return null;
          return (
            <section key={category} className="mb-8">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">{category}</h2>
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-left text-stone-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Service</th>
                      <th className="w-32 px-4 py-2 font-medium">Default</th>
                      <th className="w-44 px-4 py-2 font-medium">{LABELS[list]} price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s) => {
                      const value = draft[s.title] ?? "";
                      const bad = invalid.has(s.title);
                      const changed = s.title in next;
                      return (
                        <tr key={s.title} className="border-t border-stone-100">
                          <td className="px-4 py-2 text-stone-900">{s.title.trim()}</td>
                          <td className="px-4 py-2 tabular-nums text-stone-500">{ngn(s.price)}</td>
                          <td className="px-4 py-2">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                                ₦
                              </span>
                              <input
                                inputMode="numeric"
                                aria-label={`${LABELS[list]} price for ${s.title.trim()}`}
                                placeholder={String(s.price)}
                                value={value}
                                onChange={(e) => setDraft((d) => ({ ...d, [s.title]: e.target.value }))}
                                className={`w-full rounded-md border py-1.5 pl-6 pr-2 tabular-nums ${
                                  bad
                                    ? "border-red-400 bg-red-50"
                                    : changed
                                      ? "border-amber-400 bg-amber-50"
                                      : "border-stone-300"
                                }`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
    </div>
  );
}

function sortKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}
