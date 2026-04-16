"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { merriweather, Bagelan } from "@/app/layout";
import services from "../salon/services.json";
import { BookingProvider, useBooking } from "@/app/contexts/BookingContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { CiCalendar, CiClock2 } from "react-icons/ci";
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
import "swiper/css";
import "swiper/css/navigation";

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

// ── Booking bar (sticky bottom) ───────────────────────────────────────────────
function BookingBar({ onBookNow }) {
  const { selectedServices, totalPrice, totalDuration } = useBooking();

  if (selectedServices.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#120D07] text-white shadow-2xl">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <p className={`${merriweather.className} text-sm font-bold`}>
            {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
          </p>
          <p className="text-stone-400 text-xs mt-0.5">
            ₦{totalPrice.toLocaleString("en-US")} • {formatDuration(totalDuration)}
          </p>
        </div>
        <button
          onClick={onBookNow}
          className={`${merriweather.className} text-[9px] tracking-widest uppercase bg-[#DDA15E] text-[#120D07] px-6 py-3 hover:bg-[#c8894a] transition-colors duration-200 flex-shrink-0`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

// ── Phone collection dialog ───────────────────────────────────────────────────
function PhoneDialog({ open, onClose, onSuccess }) {
  const { user, updateUser } = useAuth();
  const [phone, setPhone]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!/^(?:\+234|0)/.test(phone)) {
      setError("Number must start with +234 or 0");
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
      await updateMobileNumber(user.uid, phone);
      updateUser({ mobileNumber: phone });
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
            Enter your phone number to confirm your appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="phone">Mobile Number</Label>
          <Input
            id="phone"
            className="h-12"
            value={phone}
            onChange={handleChange}
            placeholder="+234 or 0..."
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
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

// ── Booking drawer (date + time selection) ────────────────────────────────────
function BookingDrawer({ open, onClose }) {
  const {
    availableDays, timeSlots,
    selectedTime, selectTime,
    totalDuration, totalPrice, selectedServices,
    isSubmitting, bookingError, bookingSuccess,
    submitBooking, backToServices, reset,
  } = useBooking();

  // Derive the active date from the selected time slot
  const selectedDate = selectedTime?.startOf("day") ?? null;

  // Show slots for the selected date, falling back to today
  const activeKey   = selectedDate?.format("DD/MM/YYYY") ?? dayjs().format("DD/MM/YYYY");
  const currentSlots = timeSlots[activeKey] ?? [];

  const handleDayClick = (day, isOffDay) => {
    if (isOffDay) return;
    // Select the first available slot on that day so the time grid updates immediately
    const firstSlot = timeSlots[day.format("DD/MM/YYYY")]?.[0];
    if (firstSlot) selectTime(firstSlot);
  };

  const handleClose = () => { backToServices(); onClose(); };
  const handleDone  = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/*
        Three-zone layout:
          1. Pinned header  — title + summary strip
          2. Scrollable body — date carousel + time grid
          3. Pinned footer  — confirm button
        `overflow-hidden` on DialogContent prevents the whole modal from scrolling;
        only the middle zone scrolls.
      */}
      <DialogContent
        className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {bookingSuccess ? (
          // ── Success state ─────────────────────────────────────────────────
          <div className="flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-8 pb-5 text-center">
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm"
                aria-hidden
              >
                <FontAwesomeIcon icon={faCheck} className="text-xl text-emerald-600" />
              </div>
              <DialogTitle
                className={`${merriweather.className} text-2xl font-bold tracking-tight text-stone-900`}
              >
                Booking confirmed
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-stone-500">
                We&apos;ll reach out shortly to confirm your appointment.
              </DialogDescription>
            </div>

            <div className="space-y-4 px-6 pb-2">
              {selectedTime && (
                <div className="rounded-xl border border-stone-200/90 bg-stone-50/80 p-4 shadow-sm">
                  <p
                    className={`${merriweather.className} mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400`}
                  >
                    When
                  </p>
                  <div className="space-y-2.5 text-left text-sm text-stone-700">
                    <p className="flex items-start gap-3">
                      <CiCalendar className="mt-0.5 h-[1.1em] w-[1.1em] flex-shrink-0 text-stone-500" />
                      <span className="leading-snug">{selectedTime.format("dddd, D MMMM YYYY")}</span>
                    </p>
                    <p className="flex items-start gap-3">
                      <CiClock2 className="mt-0.5 h-[1.1em] w-[1.1em] flex-shrink-0 text-stone-500" />
                      <span>
                        {selectedTime.format("HH:mm")} –{" "}
                        {selectedTime.add(totalDuration, "minute").format("HH:mm")}
                        <span className="ml-1.5 text-stone-400 tabular-nums">
                          ({formatDuration(totalDuration)})
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm">
                <p
                  className={`${merriweather.className} mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400`}
                >
                  Your services
                </p>
                <ul className="divide-y divide-stone-100">
                  {selectedServices.map((s, i) => (
                    <li
                      key={`${s.title}-${i}`}
                      className="flex gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <p className={`${merriweather.className} text-sm font-semibold leading-snug text-stone-900`}>
                          {s.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500">
                          {s.category && <span className="text-stone-400">{s.category}</span>}
                          {s.category && s.duration > 0 && (
                            <span className="text-stone-300" aria-hidden>
                              ·
                            </span>
                          )}
                          {s.duration > 0 && <span>{formatDuration(s.duration)}</span>}
                        </div>
                      </div>
                      <p
                        className={`${merriweather.className} flex-shrink-0 text-sm font-semibold tabular-nums text-[#120D07]`}
                      >
                        ₦{s.price.toLocaleString("en-US")}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4">
                  <span
                    className={`${merriweather.className} text-xs font-bold uppercase tracking-wider text-stone-600`}
                  >
                    Total
                  </span>
                  <span className={`${merriweather.className} text-lg font-bold tabular-nums text-[#120D07]`}>
                    ₦{totalPrice.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              <Button className="w-full" onClick={handleDone}>
                Done
              </Button>
            </div>
          </div>

        ) : (
          <>
            {/* ── Zone 1: Pinned header ─────────────────────────────────── */}
            <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex-shrink-0">
              <DialogTitle className={`${merriweather.className} text-xl mb-1`}>
                Select Date &amp; Time
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""}&ensp;·&ensp;
                {formatDuration(totalDuration)}&ensp;·&ensp;
                ₦{totalPrice.toLocaleString("en-US")}
              </DialogDescription>
            </div>

            {/* ── Zone 2: Scrollable body ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Date carousel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={`${merriweather.className} text-sm font-bold text-stone-800`}>
                    {dayjs().format("MMMM YYYY")}
                  </p>
                  <div className="flex gap-4 text-stone-400">
                    <button className="swiper-prev-booking hover:text-stone-800 transition-colors">
                      <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button className="swiper-next-booking hover:text-stone-800 transition-colors">
                      <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                  </div>
                </div>

                <Swiper
                  speed={500}
                  navigation={{ nextEl: ".swiper-next-booking", prevEl: ".swiper-prev-booking" }}
                  modules={[Navigation]}
                  breakpoints={{
                    0:   { slidesPerView: 5, slidesPerGroup: 5 },
                    480: { slidesPerView: 7, slidesPerGroup: 7 },
                  }}
                >
                  {availableDays.map(({ day, isOffDay }, i) => {
                    const isActive = selectedDate?.isSame(day, "day");
                    return (
                      <SwiperSlide key={i} className="flex justify-center">
                        <button
                          onClick={() => handleDayClick(day, isOffDay)}
                          disabled={isOffDay}
                          className="flex flex-col items-center gap-1 w-full py-1"
                        >
                          <span
                            className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold border transition-colors duration-150 ${
                              isOffDay
                                ? "line-through text-stone-300 border-transparent cursor-not-allowed"
                                : isActive
                                ? "bg-[#120D07] text-white border-[#120D07]"
                                : "text-stone-800 border-stone-200 hover:border-stone-700"
                            }`}
                          >
                            {day.format("D")}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase">
                            {day.format("ddd")}
                          </span>
                        </button>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>

              {/* Time slots */}
              <div>
                <p className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 mb-3`}>
                  Available Times
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {currentSlots.map((time, i) => {
                    const isActive = selectedTime?.isSame(time);
                    return (
                      <button
                        key={i}
                        onClick={() => selectTime(time)}
                        className={`text-xs py-2.5 border transition-colors duration-150 ${
                          isActive
                            ? "bg-[#120D07] text-white border-[#120D07]"
                            : "border-stone-200 text-stone-700 hover:border-stone-800 hover:bg-stone-50"
                        }`}
                      >
                        {time.format("HH:mm")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection summary */}
              {selectedTime && (
                <div className="flex items-center gap-5 text-sm text-stone-500 bg-stone-50 rounded-sm px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <CiCalendar className="flex-shrink-0 text-base" />
                    {selectedTime.format("ddd, D MMM")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CiClock2 className="flex-shrink-0 text-base" />
                    {selectedTime.format("HH:mm")} – {selectedTime.add(totalDuration, "minute").format("HH:mm")}
                  </span>
                </div>
              )}

              {bookingError && (
                <p className="text-red-600 text-sm">{bookingError}</p>
              )}
            </div>

            {/* ── Zone 3: Pinned footer ─────────────────────────────────── */}
            <div className="px-6 pb-6 pt-4 border-t border-stone-100 flex-shrink-0">
              <Button
                className="w-full"
                disabled={!selectedTime}
                isLoading={isSubmitting}
                onClick={submitBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
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

  const handleBookNow = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!user?.mobileNumber) {
      setPhoneDialogOpen(true);
      return;
    }
    goToDatetime();
  }, [isAuthenticated, user, openAuthModal, goToDatetime]);

  const handlePhoneSuccess = useCallback(() => {
    setPhoneDialogOpen(false);
    goToDatetime();
  }, [goToDatetime]);

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
      <div className="sticky top-20 z-30 bg-[#faf9f7] border-b border-stone-200 px-4 md:px-8 py-4">
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
          <div
            className="flex gap-2 overflow-x-auto flex-1 w-full"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`${merriweather.className} flex-shrink-0 text-[9px] tracking-widest uppercase px-3 py-2 transition-colors duration-200 ${
                  category === cat
                    ? "bg-[#120D07] text-white"
                    : "bg-white border border-stone-200 text-stone-500 hover:border-stone-800 hover:text-stone-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
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
      <BookingBar onBookNow={handleBookNow} />

      <PhoneDialog
        open={phoneDialogOpen}
        onClose={() => setPhoneDialogOpen(false)}
        onSuccess={handlePhoneSuccess}
      />

      <BookingDrawer
        open={drawerOpen}
        onClose={backToServices}
      />
    </>
  );
}

// Wrap page in BookingProvider so useBooking is available to all sub-components
export default function ServicesPage() {
  return (
    <BookingProvider>
      <ServicesPageContent />
    </BookingProvider>
  );
}
