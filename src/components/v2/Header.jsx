"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES } from "@/lib/auth/constants";
import Button from "@/components/v2/ui/Button";

/**
 * Primary navigation.
 *
 * Two-tier bar (obsidian utility strip + light nav bar) with mega-menu
 * panels, built on the v2 token set.
 *
 * The bar carries the same `--v2-topband` as the hero, so the two read as
 * one block of colour down the top of the page — and wash out to white
 * together once `TopBandFade` sees the collage pass behind the bar. It stays
 * a light surface either way, which the solid-black brand logo needs.
 * Elevation is layering only — an `ink/10` hairline under the bar, and no
 * shadows anywhere.
 *
 * `panel` is optional: links without one behave as plain nav links.
 */
const NAV_LINKS = [
  {
    label: "Services",
    href: "/v2/services",
    panel: {
      feature: {
        eyebrow: "THE MENU",
        title: "Every texture, cared for",
        copy: "Braids, locs, treatments and cuts — priced up front, no surprises at the chair.",
        image: "/salon.webp",
        cta: { label: "See all services", href: "/v2/services" },
      },
      columns: [
        {
          title: "BY STYLE",
          items: [
            {
              label: "Braids & twists",
              description: "Box braids, barrel twists, cornrows",
              href: "/v2/services#braids",
            },
            {
              label: "Locs",
              description: "Starter locs, retwists, loc repair",
              href: "/v2/services#locs",
            },
            {
              label: "Cuts & styling",
              description: "Shape-ups, silk press, blow-outs",
              href: "/v2/services#styling",
            },
            {
              label: "Wash & go",
              description: "Cleanse, condition, define",
              href: "/v2/services#wash",
            },
          ],
        },
        {
          title: "CARE & TREATMENTS",
          items: [
            {
              label: "Scalp treatments",
              description: "Exfoliating and ayurvedic care",
              href: "/v2/services#treatments",
            },
            {
              label: "Deep conditioning",
              description: "Protein and moisture rebuilds",
              href: "/v2/services#conditioning",
            },
            {
              label: "Products",
              description: "Take the salon routine home",
              href: "/v2/shop",
            },
            {
              label: "Gallery",
              description: "Recent work from the chair",
              href: "/v2/gallery",
            },
          ],
        },
      ],
    },
  },
  {
    label: "The salon",
    href: "/v2/salon",
    panel: {
      feature: {
        eyebrow: "VISIT US",
        title: "Lagos, Nigeria",
        copy: "A quiet room, warm light and stylists who know natural hair.",
        image: "/long-hair.webp",
        cta: { label: "Plan your visit", href: "/v2/salon" },
      },
      columns: [
        {
          title: "THE SPACE",
          items: [
            {
              label: "Inside the salon",
              description: "What a visit actually looks like",
              href: "/v2/salon",
            },
            {
              label: "Opening hours",
              description: "Tuesday to Sunday, by appointment",
              href: "/v2/salon#hours",
            },
            {
              label: "Getting here",
              description: "Directions and parking",
              href: "/v2/salon#directions",
            },
          ],
        },
        {
          title: "BEFORE YOU COME",
          items: [
            {
              label: "First visit guide",
              description: "How to prep your hair",
              href: "/v2/salon#first-visit",
            },
            {
              label: "Booking policy",
              description: "Deposits, changes, cancellations",
              href: "/v2/salon#policy",
            },
            {
              label: "Contact the salon",
              description: "Call, WhatsApp or email",
              href: "/v2/contact",
            },
          ],
        },
      ],
    },
  },
  {
    label: "Hair coaching",
    href: "/v2/consultation",
    panel: {
      feature: {
        eyebrow: "ONE ON ONE",
        title: "A plan for your hair",
        copy: "Sit down with a coach and leave with a routine built for your texture.",
        image: "/coaching.webp",
        cta: { label: "Book a consultation", href: "/v2/consultation" },
      },
      columns: [
        {
          title: "PROGRAMMES",
          items: [
            {
              label: "Single consultation",
              description: "One session, full routine review",
              href: "/v2/consultation#single",
            },
            {
              label: "Coaching plan",
              description: "Ongoing check-ins over months",
              href: "/v2/consultation#plan",
            },
            {
              label: "Scalp diagnosis",
              description: "Get to the cause, not the symptom",
              href: "/v2/consultation#scalp",
            },
          ],
        },
        {
          title: "LEARN",
          items: [
            {
              label: "Hair journal",
              description: "Guides from our stylists",
              href: "/v2/journal",
            },
            {
              label: "Routine builder",
              description: "Answer a few questions, get a routine",
              href: "/v2/consultation#builder",
            },
          ],
        },
      ],
    },
  },
  { label: "About", href: "/v2/about" },
  { label: "Contact", href: "/v2/contact" },
];

const ACCOUNT_LINKS = [
  { label: "My bookings", href: "/bookings" },
  { label: "Account settings", href: "/settings" },
];

function displayName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Your account"
  );
}

function initials(user) {
  const first = user?.firstName?.[0];
  const last = user?.lastName?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return (user?.email?.[0] ?? "?").toUpperCase();
}

function Wordmark({ className, ...props }) {
  return (
    <Link
      href="/v2"
      aria-label="Flourish Roots Hair — home"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    >
      <Image
        src="/logo.svg"
        alt=""
        width={40}
        height={39}
        priority
        className="h-9 w-auto lg:h-10"
      />
      {/* The mark carries the brand on its own at phone widths, where it sits
          centered in the bar; the wordmark joins it once there is room. */}
      <span className="hidden font-display text-2xl leading-none text-ink lg:inline">
        Flourish Roots<span className="text-gold">.</span>
      </span>
    </Link>
  );
}

/** One row inside a mega-menu column or a mobile accordion. */
function PanelRow({ item, tabIndex }) {
  return (
    <Link
      href={item.href}
      tabIndex={tabIndex}
      className="group flex items-center justify-between gap-4 border-b border-latte py-4 transition-colors duration-200 ease-out last:border-b-0 hover:bg-cream-100"
    >
      <span className="min-w-0">
        <span className="block text-v2-body-sm font-semibold text-ink">
          {item.label}
        </span>
        <span className="mt-0.5 block text-v2-body-sm text-ink-soft">
          {item.description}
        </span>
      </span>
      <ChevronRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-ash transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-ink"
      />
    </Link>
  );
}

function MegaPanel({ panel, id, open }) {
  return (
    <div
      id={id}
      // The panel is always mounted so its links stay in the a11y tree order;
      // `inert`-like behaviour comes from pointer-events + tabIndex below.
      className={cn(
        "absolute left-0 right-0 top-full z-40 hidden px-4 pt-3 lg:block md:px-8",
        "transition-[opacity,transform] duration-200 ease-out",
        open
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0"
      )}
      aria-hidden={!open}
    >
      <div className="mx-auto grid max-w-[var(--v2-container)] grid-cols-[minmax(0,320px)_1fr] overflow-hidden rounded-v2-3xl border border-latte bg-sand">
        <div className="relative flex flex-col justify-between gap-6 bg-cream-100 p-6">
          <div>
            <p className="text-v2-label font-semibold tracking-[0.12em] text-ink-soft">
              {panel.feature.eyebrow}
            </p>
            <p className="mt-2 font-display text-v2-h3 text-ink">
              {panel.feature.title}
            </p>
            <p className="mt-2 text-v2-body-sm text-ink-soft">
              {panel.feature.copy}
            </p>
          </div>

          <div className="relative h-36 overflow-hidden rounded-v2-2xl">
            <Image
              src={panel.feature.image}
              alt=""
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>

          <Link
            href={panel.feature.cta.href}
            tabIndex={open ? 0 : -1}
            className="inline-flex h-11 w-fit items-center rounded-full bg-ink px-5 text-v2-body-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-ink/90"
          >
            {panel.feature.cta.label}
          </Link>
        </div>

        <div className="grid gap-x-10 gap-y-8 p-8 sm:grid-cols-2">
          {panel.columns.map((column) => (
            <div key={column.title}>
              <p className="text-v2-label font-semibold tracking-[0.12em] text-ash">
                {column.title}
              </p>
              <div className="mt-2">
                {column.items.map((item) => (
                  <PanelRow
                    key={item.href}
                    item={item}
                    tabIndex={open ? 0 : -1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Signed-in avatar button + dropdown. `compact` renders the avatar alone with
 * the menu anchored to its left edge — the form used in the mobile bar, where
 * there is only room for the mark itself.
 */
function AccountMenu({ user, onLogout, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={compact ? `Account — ${displayName(user)}` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center rounded-full text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out",
          compact
            ? "h-11 w-11 justify-center bg-gold hover:bg-gold/80"
            : "h-11 gap-2 bg-latte pl-1.5 pr-4 hover:bg-latte/70"
        )}
      >
        {compact ? (
          <span aria-hidden className="text-v2-label font-semibold">
            {initials(user)}
          </span>
        ) : (
          <>
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-v2-label font-semibold text-ink"
            >
              {initials(user)}
            </span>
            <span className="max-w-[9rem] truncate">
              {user?.firstName || displayName(user)}
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "h-4 w-4 transition-transform duration-200 ease-out",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-3 w-64 overflow-hidden rounded-v2-2xl border border-latte bg-sand p-2",
            compact ? "left-0" : "right-0"
          )}
        >
          <p className="truncate px-3 py-2 text-v2-body-sm text-ink-soft">
            {displayName(user)}
          </p>
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.href}
              role="menuitem"
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-v2-lg px-3 py-2.5 text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out hover:bg-cream-100"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="mt-1 block w-full rounded-v2-lg border-t border-latte px-3 py-2.5 text-left text-v2-body-sm font-semibold text-ink-soft transition-colors duration-200 ease-out hover:bg-cream-100 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState(null); // label of the open mega menu
  const [openSection, setOpenSection] = useState(null); // mobile accordion
  const pathname = usePathname();
  const panelIdBase = useId();
  const closeTimer = useRef(null);
  const { user, isAuthenticated, hydrated, logout, openAuthModal } = useAuth();

  // Close everything on navigation.
  useEffect(() => {
    setDrawerOpen(false);
    setOpenPanel(null);
    setOpenSection(null);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      setDrawerOpen(false);
      setOpenPanel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Hover intent: a short grace period lets the pointer cross the gap between
  // the trigger and the panel without the panel snapping shut.
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenPanel(null), 150);
  }, []);

  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);

  // Leaving the nav for another part of the bar dismisses the panel outright.
  const closePanel = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpenPanel(null);
  }, []);

  return (
    <>
      <header
        className="v2-topband sticky top-0 z-50"
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
      >
        {/* Utility strip — the top tier of the two-tier bar. */}
        <div className="hidden bg-obsidian md:block">
          <div className="mx-auto flex h-9 max-w-[var(--v2-container)] items-center justify-between px-4 text-v2-label text-white/55 md:px-8">
            <p>Lagos, Nigeria · Tuesday to Sunday, by appointment</p>
            <div className="flex items-center gap-6">
              <a
                href="tel:+2348110215014"
                className="transition-colors duration-200 ease-out hover:text-white"
              >
                +234 811 021 5014
              </a>
              <a
                href="https://wa.me/2348110215014"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 ease-out hover:text-white"
              >
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/frh_naturals/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 ease-out hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Main bar. */}
        {/* `relative z-50` keeps the bar (and the account dropdown it owns)
            painting above the mega panels, which follow it in the DOM. */}
        <div className="relative z-50 mx-auto flex h-16 max-w-[var(--v2-container)] v2-topband items-center justify-between gap-6 border-b border-ink/10 px-4 md:px-8 lg:h-20">
          {/* Auth state lives on the left of the mobile bar, opposite the menu
              button, with the mark centered between them. */}
          <div className="flex items-center lg:hidden">
            {!hydrated ? (
              <span aria-hidden className="h-11 w-11 rounded-full bg-latte" />
            ) : isAuthenticated ? (
              <AccountMenu compact user={user} onLogout={logout} />
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal({ mode: AUTH_MODES.SIGN_IN })}
                className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-v2-body-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-ink/90"
              >
                Log in
              </button>
            )}
          </div>

          {/* Centered on phones, so absolutely positioned there and returned
              to the flex flow once the wordmark and nav appear. */}
          <Wordmark
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:mr-2 lg:translate-x-0"
            onMouseEnter={closePanel}
          />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname?.startsWith(`${link.href}/`);
                const isOpen = openPanel === link.label;
                const panelId = `${panelIdBase}-${link.label.replace(/\s+/g, "-")}`;

                return (
                  <li
                    key={link.href}
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenPanel(link.panel ? link.label : null);
                    }}
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={link.panel ? isOpen : undefined}
                      aria-controls={link.panel ? panelId : undefined}
                      onFocus={() =>
                        setOpenPanel(link.panel ? link.label : null)
                      }
                      className={cn(
                        "relative flex items-center gap-1 py-2 text-v2-body-sm transition-colors duration-200 ease-out hover:text-ink",
                        active || isOpen
                          ? "font-semibold text-ink"
                          : "text-ink-soft"
                      )}
                    >
                      {link.label}
                      {link.panel && (
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "h-4 w-4 transition-transform duration-200 ease-out",
                            isOpen && "rotate-180"
                          )}
                        />
                      )}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-ink"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0" onMouseEnter={closePanel}>
            {/* Reserve the space until auth has hydrated so the bar does not
                jump between the signed-out and signed-in clusters. */}
            {!hydrated ? (
              <span aria-hidden className="hidden h-11 w-32 rounded-full bg-latte lg:block" />
            ) : isAuthenticated ? (
              <div className="hidden lg:block">
                <AccountMenu user={user} onLogout={logout} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal({ mode: AUTH_MODES.SIGN_IN })}
                className="hidden h-11 items-center rounded-full bg-gold px-5 text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out hover:bg-gold/80 lg:inline-flex"
              >
                Log in
              </button>
            )}

            <Button
              withArrow
              href="/v2/booking"
              className="hidden lg:inline-flex"
            >
              Book an appointment
            </Button>

            <button
              type="button"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-latte text-ink transition-colors duration-200 ease-out hover:bg-latte/70 lg:hidden"
            >
              {drawerOpen ? (
                <X aria-hidden className="h-5 w-5" />
              ) : (
                <Menu aria-hidden className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {NAV_LINKS.filter((link) => link.panel).map((link) => (
          <MegaPanel
            key={link.href}
            id={`${panelIdBase}-${link.label.replace(/\s+/g, "-")}`}
            panel={link.panel}
            open={openPanel === link.label}
          />
        ))}
      </header>

      {/*
        The drawer lives outside <header> on purpose: a sticky, transformed
        header creates a containing block that would trap a position:fixed
        child inside the header's own box.
      */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-sand md:top-[100px] lg:hidden",
          "transition-opacity duration-200 ease-out",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!drawerOpen}
      >
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
          {hydrated && isAuthenticated && (
            <div className="mb-6 rounded-v2-2xl bg-cream-100 p-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-v2-body-sm font-semibold text-ink"
                >
                  {initials(user)}
                </span>
                <p className="min-w-0 truncate text-v2-body-sm font-semibold text-ink">
                  {displayName(user)}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ACCOUNT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    tabIndex={drawerOpen ? 0 : -1}
                    className="inline-flex h-10 items-center rounded-full bg-latte px-4 text-v2-body-sm font-semibold text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <nav aria-label="Mobile">
            <ul className="flex flex-col divide-y divide-latte">
              {NAV_LINKS.map((link) => {
                const expanded = openSection === link.label;

                return (
                  <li key={link.href}>
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={link.href}
                        tabIndex={drawerOpen ? 0 : -1}
                        className="block flex-1 py-4 font-display text-v2-h2 text-ink"
                      >
                        {link.label}
                      </Link>

                      {link.panel && (
                        <button
                          type="button"
                          tabIndex={drawerOpen ? 0 : -1}
                          aria-label={`${expanded ? "Hide" : "Show"} ${link.label} links`}
                          aria-expanded={expanded}
                          onClick={() =>
                            setOpenSection(expanded ? null : link.label)
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-latte text-ink transition-colors duration-200 ease-out hover:bg-latte/70"
                        >
                          <ChevronDown
                            aria-hidden
                            className={cn(
                              "h-5 w-5 transition-transform duration-200 ease-out",
                              expanded && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {link.panel && expanded && (
                      <div className="pb-4">
                        {link.panel.columns.flatMap((column) =>
                          column.items.map((item) => (
                            <PanelRow
                              key={item.href}
                              item={item}
                              tabIndex={drawerOpen ? 0 : -1}
                            />
                          ))
                        )}
                        <Link
                          href={link.panel.feature.cta.href}
                          tabIndex={drawerOpen ? 0 : -1}
                          className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-5 text-v2-body-sm font-semibold text-white"
                        >
                          {link.panel.feature.cta.label}
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-8 flex flex-col gap-1 text-v2-body-sm text-ink-soft">
            <a href="tel:+2348110215014" tabIndex={drawerOpen ? 0 : -1}>
              +234 811 021 5014
            </a>
            <a
              href="https://wa.me/2348110215014"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={drawerOpen ? 0 : -1}
            >
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/frh_naturals/"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={drawerOpen ? 0 : -1}
            >
              Instagram
            </a>
          </div>
        </div>

        {/* Sticky action rail — stays reachable however long the list gets. */}
        <div className="border-t border-latte bg-sand px-4 pb-6 pt-4">
          <Button
            withArrow
            href="/v2/booking"
            className="w-full"
            tabIndex={drawerOpen ? 0 : -1}
          >
            Book an appointment
          </Button>

          {hydrated &&
            (isAuthenticated ? (
              <button
                type="button"
                tabIndex={drawerOpen ? 0 : -1}
                onClick={logout}
                className="mt-3 h-12 w-full rounded-full border border-ink text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out hover:bg-ink/5"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                tabIndex={drawerOpen ? 0 : -1}
                onClick={() => {
                  setDrawerOpen(false);
                  openAuthModal({ mode: AUTH_MODES.SIGN_IN });
                }}
                className="mt-3 h-12 w-full rounded-full border border-ink text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out hover:bg-ink/5"
              >
                Log in
              </button>
            ))}
        </div>
      </div>
    </>
  );
}
