"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { merriweather } from "@/app/layout";
import { subscribeAllBookings } from "@/lib/firebase/adminService";

const STATUS_STYLES = {
  pending: "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-stone-100 text-stone-500 border-stone-200",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

const formatNgn = (n) => (n == null ? "—" : `₦${Number(n).toLocaleString("en-US")}`);

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    return subscribeAllBookings(setBookings, (err) => {
      console.error("Admin bookings subscription error:", err);
      setError("Couldn't load bookings.");
    });
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    const term = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && (b.status ?? "pending") !== statusFilter) return false;
      if (!term) return true;
      const haystack = [b.userFirstName, b.userEmail, b.userMobileNumber, b.servicesText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [bookings, statusFilter, search]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${merriweather.className} text-2xl font-bold text-stone-900`}>Bookings</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && bookings === null && <p className="text-sm text-stone-500">Loading…</p>}
      {!error && bookings !== null && filtered.length === 0 && (
        <p className="text-sm text-stone-500">No bookings match.</p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Services</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((b) => {
                const start = b.startTime ? dayjs(b.startTime) : null;
                const status = b.status ?? "pending";
                return (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap px-4 py-3">
                      {start ? start.format("D MMM YYYY, HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {b.userFirstName || "—"}
                      {b.guest && (
                        <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] uppercase text-stone-500">
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.userEmail || "—"}</div>
                      <div className="text-stone-400">{b.userMobileNumber || ""}</div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">
                      {b.servicesText ||
                        (Array.isArray(b.services) ? b.services.map((s) => s.title).join(", ") : "—")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatNgn(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_STYLES[status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
