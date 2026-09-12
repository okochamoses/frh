"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { merriweather } from "@/app/layout";
import { subscribeAllCustomers } from "@/lib/firebase/adminService";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    return subscribeAllCustomers(setCustomers, (err) => {
      console.error("Admin customers subscription error:", err);
      setError("Couldn't load customers.");
    });
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) =>
      [c.firstName, c.lastName, c.email, c.mobileNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [customers, search]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${merriweather.className} text-2xl font-bold text-stone-900`}>Customers</h1>
        <input
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && customers === null && <p className="text-sm text-stone-500">Loading…</p>}
      {!error && customers !== null && filtered.length === 0 && (
        <p className="text-sm text-stone-500">No customers match.</p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Sign-up method</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr key={c.uid}>
                  <td className="px-4 py-3">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3">{c.email || "—"}</td>
                  <td className="px-4 py-3">{c.mobileNumber || "—"}</td>
                  <td className="px-4 py-3 capitalize">{c.provider || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {c.createdAt?.toDate ? dayjs(c.createdAt.toDate()).format("D MMM YYYY") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
