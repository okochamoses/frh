"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { merriweather, Bagelan } from "@/app/fonts";
import services from "../salon/services.json";
import { useBooking } from "@/app/contexts/BookingContext";
import { ExpandableBookingBar } from "@/components/ExpandableBookingBar";
import { BookingDrawer } from "@/components/booking/BookingDrawer";
import { useAuth } from "@/app/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMobileNumber } from "@/lib/firebase/userService";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  ...Array.from(new Set(services.map((s) => s.category))).sort(),
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ");
};

// ── Service card ──────────────────────────────────────────────────────────────
function ServiceCard({ service, onClickImage }) {
  const { selectedServices, toggleService } = useBooking();
  const isSelected = selectedServices.some((s) => s.title === service.title);

  return (
    <div className="group flex flex-col bg-white overflow-hidden rounded-sm border border-stone-100 hover:border-stone-300 transition-colors duration-300">
      {/* Image */}
      <div
        className="relative w-full h-96 overflow-hidden cursor-pointer bg-stone-100 flex-shrink-0"
        onClick={() => onClickImage(service.imageUrl)}
      >
        <Image
          src={service.imageUrl || "/placeholder.png"}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {service.featured && (
          <span
            className={`${merriweather.className} absolute top-3 left-3 bg-[#DDA15E] text-[#120D07] text-[9px] tracking-widest uppercase px-2 py-1`}
          >
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <span
          className={`${merriweather.className} text-[9px] tracking-widest uppercase text-[#BD2E2E] mb-2`}
        >
          {service.category}
        </span>

        <h3
          className={`${merriweather.className} text-sm font-bold text-stone-900 leading-snug mb-1 flex-1`}
        >
          {service.title}
        </h3>

        {service.Description && (
          <p className="text-stone-400 text-xs leading-relaxed mt-1 mb-3 line-clamp-2">
            {service.Description}
          </p>
        )}

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-stone-100">
          <div>
            <p className={`${merriweather.className} text-xl text-[#120D07]`}>
              ₦{service.price.toLocaleString("en-US")}
            </p>
            {service.duration > 0 && (
              <p className="text-stone-400 text-xs mt-0.5">
                {formatDuration(service.duration)}
              </p>
            )}
          </div>

          <button
            onClick={() => toggleService(service)}
            className={`${merriweather.className} text-[9px] tracking-widest uppercase px-4 py-2.5 transition-colors duration-200 flex items-center gap-1.5 ${
              isSelected
                ? "bg-[#BD2E2E] text-white hover:bg-[#a02626]"
                : "bg-[#120D07] text-white hover:bg-[#BD2E2E]"
            }`}
          >
            {isSelected && <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />}
            {isSelected ? "Added" : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Phone collection dialog ───────────────────────────────────────────────────
// Nigerian mobile numbers: 0803… locally, +234803… internationally.
const NG_MOBILE = /^(?:\+234|0)[789]\d{9}$/;

/** Stores every number the same way, so the salon can dial straight from an email. */
function normaliseNgMobile(value) {
  return value.startsWith("0") ? `+234${value.slice(1)}` : value;
}

function PhoneDialog({ open, onClose, onSuccess }) {
  const { user, updateUser } = useAuth();
  const [phone, setPhone]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!NG_MOBILE.test(phone)) {
      // The old check only looked at the prefix, so a bare "0" passed and was
      // written to the profile — and then onto every booking.
      setError("Enter a full mobile number, e.g. 08031234567 or +2348031234567");
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (e) => {
    const val = e.target.value.trim();
    if (/^\+?[0-9]*$/.test(val)) setPhone(val);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Write directly to Firestore — no API route needed
      const normalised = normaliseNgMobile(phone);
      await updateMobileNumber(user.uid, normalised);
      updateUser({ mobileNumber: normalised });
      onSuccess();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Phone Number</DialogTitle>
          <DialogDescription>
            We only use this to reach you about your appointment — if we ever need to
            confirm a time or let you know about a delay.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="phone">Mobile Number</Label>
          <Input
            id="phone"
            className="h-12"
            value={phone}
            onChange={handleChange}
            placeholder="08031234567"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "phone-error" : undefined}
          />
          {error && <p id="phone-error" role="alert" className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSubmit} isLoading={loading}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Booking drawer ────────────────────────────────────────────────────────────
// Lives in src/components/booking/BookingDrawer.jsx — /bookings uses the same
// picker to reschedule an appointment.

// ── Pills scroller ────────────────────────────────────────────────────────────
function PillsScroller({ categories, active, onSelect }) {
  const scrollRef = useRef(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setFadeLeft(el.scrollLeft > 4);
    setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    const ro = new ResizeObserver(updateFades);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateFades); ro.disconnect(); };
  }, [updateFades]);

  return (
    <div className="relative flex-1 w-full min-w-0">
      {/* Left fade + scroll hint chevron */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 flex items-center justify-start pl-1 transition-opacity duration-200"
        style={{
          opacity: fadeLeft ? 1 : 0,
          background: "linear-gradient(to right, #faf9f7 60%, transparent)",
        }}
      >
        <svg viewBox="0 0 12 12" className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2L4 6l4 4" />
        </svg>
      </div>
      {/* Right fade + scroll hint chevron */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 flex items-center justify-end pr-1 transition-opacity duration-200"
        style={{
          opacity: fadeRight ? 1 : 0,
          background: "linear-gradient(to left, #faf9f7 60%, transparent)",
        }}
      >
        <svg viewBox="0 0 12 12" className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2l4 4-4 4" />
        </svg>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`${merriweather.className} flex-shrink-0 text-[9px] tracking-widest uppercase px-3 py-2 transition-colors duration-200 ${
              active === cat
                ? "bg-[#120D07] text-white"
                : "bg-white border border-stone-200 text-stone-500 hover:border-stone-800 hover:text-stone-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ServicesPageContent() {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { goToDatetime, step, backToServices } = useBooking();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [preview, setPreview] = useState(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  // Dismissing the phone dialog used to abandon the booking in silence.
  const [phoneAbandoned, setPhoneAbandoned] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setNavVisible(y < lastY || y < 10);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // BookingDrawer is open when step = 'datetime'
  const drawerOpen = step === "datetime";

  const filtered = useMemo(
    () =>
      services
        .filter((s) => !s.header)
        .filter((s) => category === "All" || s.category === category)
        .filter(
          (s) =>
            !search.trim() ||
            s.title.toLowerCase().includes(search.toLowerCase().trim())
        ),
    [search, category]
  );

  const featured = useMemo(() => filtered.filter((s) => s.featured), [filtered]);
  const rest = useMemo(() => filtered.filter((s) => !s.featured), [filtered]);
  const isFiltering = !!search.trim() || category !== "All";

  // Continues the booking once we know who the user is. Takes the profile
  // explicitly because when this runs straight after sign-in the `user` from
  // context has not committed yet.
  const continueBooking = useCallback((profile) => {
    if (!profile?.mobileNumber) {
      setPhoneAbandoned(false);
      setPhoneDialogOpen(true);
      return;
    }
    goToDatetime();
  }, [goToDatetime]);

  const handleBookNow = useCallback(() => {
    if (!isAuthenticated) {
      // Hand the modal what to do afterwards, so signing in resumes the
      // booking instead of dropping the user back on the page having to
      // find and press Book Now a second time.
      openAuthModal({ onSuccess: continueBooking });
      return;
    }
    continueBooking(user);
  }, [isAuthenticated, user, openAuthModal, continueBooking]);

  const handlePhoneSuccess = useCallback(() => {
    setPhoneDialogOpen(false);
    setPhoneAbandoned(false);
    goToDatetime();
  }, [goToDatetime]);

  const handlePhoneClose = useCallback(() => {
    setPhoneDialogOpen(false);
    setPhoneAbandoned(true);
  }, []);

  return (
    <>
      {/* ── Dark hero ── */}
      <div className="bg-[#120D07] pt-36 pb-16 px-6 text-center">
        <p
          className={`${merriweather.className} text-[#DDA15E] text-xs tracking-[0.3em] uppercase mb-4`}
        >
          Flourish Roots Hair Co.
        </p>
        <h1
          className={`${Bagelan.className} text-[clamp(3.5rem,12vw,8rem)] text-white leading-none`}
        >
          SALON SERVICES
        </h1>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className={`sticky z-30 bg-[#faf9f7] border-b border-stone-200 px-4 md:px-8 py-4 transition-[top] duration-300 ${navVisible ? "top-20" : "top-0"}`}>
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-shrink-0 w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="8.5" cy="8.5" r="5.75" />
              <path d="M13.5 13.5l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className={`${merriweather.className} w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-stone-200 focus:border-stone-800 outline-none transition-colors duration-200 placeholder-stone-400 text-stone-800`}
            />
          </div>

          {/* Category pills */}
          <PillsScroller
            categories={CATEGORIES}
            active={category}
            onSelect={setCategory}
          />
        </div>
      </div>

      {/* ── Content — pad bottom so sticky bar doesn't overlap ── */}
      <section className="bg-[#faf9f7] px-4 md:px-8 py-12 min-h-[60vh] pb-28">
        <div className="max-w-screen-xl mx-auto">
          {/* Featured — only when not filtering */}
          {!isFiltering && featured.length > 0 && (
            <div className="mb-14">
              <p
                className={`${merriweather.className} text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5`}
              >
                Featured Services
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((s, i) => (
                  <ServiceCard key={`f-${i}`} service={s} onClickImage={setPreview} />
                ))}
              </div>
            </div>
          )}

          {/* All / filtered */}
          <div>
            <p
              className={`${merriweather.className} text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5`}
            >
              {isFiltering
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : "All Services"}
            </p>

            {(isFiltering ? filtered : rest).length === 0 ? (
              <p
                className={`${merriweather.className} text-stone-400 text-sm italic py-16 text-center`}
              >
                No services found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(isFiltering ? filtered : rest).map((s, i) => (
                  <ServiceCard key={i} service={s} onClickImage={setPreview} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Image preview modal ── */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-sm">
          <DialogHeader className="sr-only">
            <DialogTitle>Service Preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="relative w-full h-[70vh]">
              <Image
                src={preview}
                alt="Service preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Booking layer ── */}
      <ExpandableBookingBar actionLabel="Book Now" onAction={handleBookNow} />

      <PhoneDialog
        open={phoneDialogOpen}
        onClose={handlePhoneClose}
        onSuccess={handlePhoneSuccess}
      />

      {/* Closing the phone dialog leaves the booking unfinished — say so rather
          than letting Book Now look broken. */}
      {phoneAbandoned && !phoneDialogOpen && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-24 z-50 mx-auto w-[min(92vw,26rem)] rounded-lg border border-stone-200 bg-white px-4 py-3 text-center shadow-xl"
        >
          <p className="text-sm text-stone-700">
            Your booking isn&apos;t finished — we still need a phone number.
          </p>
          <div className="mt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => { setPhoneAbandoned(false); setPhoneDialogOpen(true); }}
              className={`${merriweather.className} text-xs font-semibold uppercase tracking-wider text-[#BD2E2E] underline underline-offset-4`}
            >
              Add number
            </button>
            <button
              type="button"
              onClick={() => setPhoneAbandoned(false)}
              className="text-xs uppercase tracking-wider text-stone-400"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <BookingDrawer
        open={drawerOpen}
        onClose={backToServices}
      />
    </>
  );
}

export default function ServicesPage() {
  return <ServicesPageContent />;
}
