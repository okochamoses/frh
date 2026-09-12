"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Camera, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACTIVE_CATEGORIES,
  categoryLabel,
  LOOK_BY_ID,
  searchLooks,
  suggestionFor,
} from "@/lib/booking/catalogue";
import { formatDuration, naira, shortDate, fromInstant } from "@/lib/booking/schedule";
import { sinceLabel } from "@/lib/booking/rebook";
import { whatsappUrl } from "@/lib/booking/calendarLinks";
import { track } from "@/lib/analytics";
import ServicePhoto from "./ServicePhoto";
import { CHECK_ICON, PillButton, Tag } from "./ui";

const selectedIn = (look, selected) => look.options.filter((o) => selected.includes(o.title));

const priceLabel = (look) => (look.hasVariants ? `from ${naira(look.minPrice)}` : naira(look.minPrice));

function durationLabel(look) {
  if (!look.hasVariants) return formatDuration(look.minDuration);
  return `${look.options.length} options`;
}

function lookTags(look, history) {
  const seen = look.options.map((o) => history.get(o.title)).filter(Boolean);
  if (seen.length === 0) return null;
  const due = seen.find((h) => h.due);
  return (
    <>
      {due && <Tag tone="due">Due · {sinceLabel(due.daysSince)}</Tag>}
      <Tag>Booked before</Tag>
    </>
  );
}

function LookCard({ look, selected, history, onToggle, onOpenSheet }) {
  const chosen = selectedIn(look, selected);
  const on = chosen.length > 0;
  const tags = lookTags(look, history);

  const addLabel = on
    ? look.hasVariants
      ? `✓ ${chosen[0].label}`
      : "✓ Added"
    : look.hasVariants
      ? "Choose option"
      : "Add";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-v2-2xl border-[1.5px] transition-colors duration-200",
        on ? "border-ink bg-white" : "border-transparent bg-cream-100"
      )}
    >
      <ServicePhoto
        look={look}
        as="button"
        type="button"
        onClick={() => onOpenSheet(look.id)}
        aria-label={`See photo and details: ${look.name}`}
        className="aspect-[4/5] w-full cursor-zoom-in text-[28px] transition-[filter] hover:brightness-95"
      >
        {tags && <span className="absolute left-2 top-2 flex flex-wrap gap-1">{tags}</span>}
        {on && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
            {CHECK_ICON}
          </span>
        )}
      </ServicePhoto>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-[1.3] text-ink">{look.name}</h3>
        <div className="flex justify-between gap-2 text-[12.5px] text-ink-soft">
          <span>{durationLabel(look)}</span>
          <span className="font-bold tabular-nums text-ink">{priceLabel(look)}</span>
        </div>
        <button
          type="button"
          aria-pressed={on}
          aria-label={
            look.hasVariants ? `Choose an option for ${look.name}` : `${on ? "Remove" : "Add"} ${look.name}`
          }
          onClick={() => (look.hasVariants ? onOpenSheet(look.id) : onToggle(look.options[0]))}
          className={cn(
            "mt-2 h-9 rounded-full text-[12.5px] font-bold transition-colors",
            on ? "bg-ink text-white hover:bg-ink/90" : "bg-white text-ink hover:bg-latte"
          )}
        >
          {addLabel}
        </button>
      </div>
    </article>
  );
}

function LookRow({ look, selected, history, onToggle, onOpenSheet }) {
  const chosen = selectedIn(look, selected);
  const on = chosen.length > 0;
  const tags = lookTags(look, history);
  const current = on && look.hasVariants ? chosen[0] : null;
  const activate = () => (look.hasVariants ? onOpenSheet(look.id) : onToggle(look.options[0]));

  /*
   * The row used to be a `role="checkbox"` div with a real <button> (the
   * photo) nested inside it — invalid ARIA (a button can't live inside a
   * checkbox) and two ambiguous tab stops per row. The photo is now a
   * sibling, not a child, so there is nothing to nest, and the row's own
   * activation target is a real <button>: `aria-pressed` when it's a plain
   * toggle, and no checkbox/pressed semantics at all when it opens the
   * variant-picker dialog instead of toggling anything.
   */
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-v2-xl border p-4 transition-colors",
        on ? "border-ink bg-white" : "border-transparent bg-cream-100 hover:border-latte"
      )}
    >
      <ServicePhoto
        look={look}
        as="button"
        type="button"
        onClick={() => onOpenSheet(look.id)}
        aria-label={`See photo: ${look.name}`}
        className="h-[70px] w-14 shrink-0 cursor-zoom-in rounded-v2-lg text-[13px]"
      />
      <button
        type="button"
        aria-pressed={look.hasVariants ? undefined : on}
        aria-label={look.hasVariants ? `Choose an option for ${look.name}` : look.name}
        onClick={activate}
        className="grid w-full flex-1 cursor-pointer grid-cols-[22px_minmax(0,1fr)_auto] items-start gap-3.5 text-left"
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-[7px] border-[1.5px]",
            on ? "border-ink bg-ink text-white" : "border-ash bg-white text-transparent"
          )}
        >
          {CHECK_ICON}
        </span>
        <div className="min-w-0">
          <p className="font-body text-[15px] font-semibold leading-snug text-ink">
            {look.name}
            {current && <span className="text-ink-soft"> · {current.label}</span>}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-soft">
            <span>{current ? formatDuration(current.duration) : durationLabel(look)}</span>
            {tags}
          </div>
        </div>
        <p className="font-body text-[15px] font-bold tabular-nums text-ink">
          {current ? naira(current.price) : priceLabel(look)}
        </p>
      </button>
    </div>
  );
}

function Nudge({ look, selected, dismissed, onAdd, onDismiss, grid }) {
  const chosen = selectedIn(look, selected);
  if (chosen.length === 0 || dismissed.includes(look.id)) return null;

  const suggestion = chosen.map((o) => suggestionFor(o, selected)).find(Boolean);
  if (!suggestion) return null;

  const addOn = suggestion.option;
  const addOnLook = LOOK_BY_ID.get(addOn.lookId);
  const lead =
    suggestion.kind === "take-down" ? (
      <>
        <b className="text-ink">Coming in with an old style?</b> Add {addOn.name.toLowerCase()} first.
      </>
    ) : (
      <>
        <b className="text-ink">Often added:</b> {addOn.name.toLowerCase()}.
      </>
    );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-v2-lg border border-dashed border-ash px-3.5 py-3",
        grid ? "col-span-full" : "sm:ml-[118px]"
      )}
    >
      <span className="flex items-center gap-3">
        {addOnLook && <ServicePhoto look={addOnLook} className="h-11 w-9 shrink-0 rounded-v2-md text-[11px]" />}
        <span className="font-body text-[13px] text-ink-soft">
          {lead} +{formatDuration(addOn.duration)}, {naira(addOn.price)}
        </span>
      </span>
      <span className="flex items-center gap-3">
        <PillButton size="sm" variant="quiet" onClick={() => onAdd(addOn)} aria-label={`Add ${addOn.name}`}>
          Add
        </PillButton>
        <button
          type="button"
          onClick={() => onDismiss(look.id)}
          className="text-[13px] font-semibold text-ink underline underline-offset-4"
        >
          No thanks
        </button>
      </span>
    </div>
  );
}

function RebookCard({ suggestion, target, onBookSame, onPick, onSnooze }) {
  const primary = suggestion.options[0];
  const look = LOOK_BY_ID.get(primary.lookId);
  const names = suggestion.options.map((o) => o.name).join(" + ");
  const total = suggestion.options.reduce((sum, o) => sum + o.price, 0);
  const minutes = suggestion.options.reduce((sum, o) => sum + o.duration, 0);
  const last = fromInstant(suggestion.booking.startTime);

  return (
    <section
      aria-labelledby="rebook-title"
      className="mb-7 grid grid-cols-1 gap-x-5 gap-y-4 rounded-v2-3xl bg-gold/40 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-6"
    >
      {look && (
        <ServicePhoto
          look={look}
          as="button"
          type="button"
            aria-label={`See photo: ${look.name}`}
          onClick={() => onPick("sheet", look.id)}
          className="hidden h-[92px] w-[72px] cursor-zoom-in rounded-v2-xl text-lg sm:block"
        />
      )}
      <div>
        <p className="type-eyebrow">Welcome back</p>
        <h2 id="rebook-title" className="mt-1 text-xl font-bold leading-tight tracking-[-0.01em] text-ink text-balance">
          It&apos;s been {sinceLabel(suggestion.daysSince)} since your last visit. Book the same again?
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          {names} · {formatDuration(minutes)} · {naira(total)}. Last time: {shortDate(last.key)}, {last.time}.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 sm:col-start-2">
        {target && (
          <PillButton onClick={onBookSame}>
            Book {shortDate(target.key)}, {target.time}
          </PillButton>
        )}
        <PillButton variant="ghost" onClick={() => onPick("time")}>
          {target ? "Choose another time" : "Choose a time"}
        </PillButton>
        <button type="button" onClick={onSnooze} className="px-1 text-[13px] font-semibold text-ink underline underline-offset-4">
          Not yet
        </button>
      </div>
    </section>
  );
}

function UpcomingNote({ booking }) {
  const when = fromInstant(booking.startTime);
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-v2-xl bg-cream-100 px-5 py-4 text-sm">
      <span>
        <b>Your next visit:</b> {shortDate(when.key)} at {when.time} · {booking.servicesText ?? "your appointment"}
      </span>
      <a href="/bookings" className="font-semibold text-ink underline underline-offset-4">
        Manage it
      </a>
    </div>
  );
}

export default function ServicesStep({
  selected,
  history,
  view,
  onView,
  category,
  onCategory,
  query,
  onQuery,
  dismissedNudges,
  onDismissNudge,
  onToggle,
  onAdd,
  onOpenSheet,
  rebook,
  upcoming,
}) {
  // A search typed earlier (or restored) must not hide behind the icon.
  const [searchOpen, setSearchOpen] = useState(() => Boolean(query.trim()));
  const searchRef = useRef(null);

  const results = searchLooks(query, category);

  /*
   * A search that finds nothing is the clearest signal the catalogue has a gap
   * — or that clients call a style something we don't. Debounced, so "twis"
   * on the way to "twist" isn't reported as its own miss.
   */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const noResults = results.length === 0;
  const trimmedQuery = query.trim();
  useEffect(() => {
    if (!noResults || !trimmedQuery) return;
    const id = setTimeout(() => track("search_empty", { query: trimmedQuery, category }), 900);
    return () => clearTimeout(id);
  }, [noResults, trimmedQuery, category]);
  const grouped = category === "all" && !query.trim();
  const bookedBefore = grouped
    ? results.filter((look) => look.options.some((o) => history.has(o.title)))
    : [];

  const shared = { selected, history, onToggle, onOpenSheet };

  const renderGroup = (looks) =>
    view === "grid" ? (
      <div className="grid grid-flow-row-dense grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {looks.map((look) => (
          <Fragment key={look.id}>
            <LookCard look={look} {...shared} />
            <Nudge look={look} selected={selected} dismissed={dismissedNudges} onAdd={onAdd} onDismiss={onDismissNudge} grid />
          </Fragment>
        ))}
      </div>
    ) : (
      <div className="grid gap-2">
        {looks.map((look) => (
          <Fragment key={look.id}>
            <LookRow look={look} {...shared} />
            <Nudge look={look} selected={selected} dismissed={dismissedNudges} onAdd={onAdd} onDismiss={onDismissNudge} />
          </Fragment>
        ))}
      </div>
    );

  const whatsappCard = (
    <a
      href={whatsappUrl("Hi! I'd like to book a style but I'm not sure what it's called. Here's a photo:")}
      target="_blank"
      rel="noreferrer"
      data-wa-source="booking-know-the-look"
      className="flex items-center gap-3.5 rounded-v2-xl border-[1.5px] border-dashed border-ash bg-white px-4 py-3 transition-colors hover:border-ink"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-100">
        <Camera aria-hidden className="h-5 w-5 text-ink-soft" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-ink">Know the look, not the name?</span>
        <span className="block text-[13px] leading-snug text-ink-soft">
          Send us a screenshot on WhatsApp. A stylist will reply with the closest match and the price.
        </span>
      </span>
      <ArrowRight aria-hidden className="h-4 w-4 text-ink-soft" />
    </a>
  );

  /*
   * Built as a list rather than inline JSX so the WhatsApp card can be dropped
   * in after the first group, whichever group that happens to be.
   */
  const sections = [];
  if (grouped) {
    if (bookedBefore.length > 0) {
      sections.push(
        <section key="booked-before" aria-label="Booked before">
          <p className="type-eyebrow mb-2 mt-5">Booked before</p>
          {renderGroup(bookedBefore)}
        </section>
      );
    }
    for (const c of ACTIVE_CATEGORIES) {
      const looks = results.filter((l) => l.category === c.id && !bookedBefore.includes(l));
      if (!looks.length) continue;
      sections.push(
        <section key={c.id} aria-label={c.label}>
          <p className="type-eyebrow mb-2 mt-5">{c.label}</p>
          {renderGroup(looks)}
        </section>
      );
    }
  } else {
    sections.push(
      <section
        key="results"
        aria-label={category === "all" ? "Search results" : categoryLabel(category)}
        className="mt-4"
      >
        {renderGroup(results)}
      </section>
    );
  }

  return (
    <div>
      {rebook && <RebookCard {...rebook} />}
      {!rebook && upcoming && <UpcomingNote booking={upcoming} />}

      {/*
        On a phone the search field and the view toggle used to wrap onto two
        rows, costing 106px before a single service was visible. Search is the
        less-used of the two on a 70-item catalogue people mostly browse, so it
        collapses to an icon until asked for. From `sm` up both fit on one row
        and nothing changes.
      */}
      <div className="mb-3.5 flex items-center gap-2.5">
        <label className={cn("relative min-w-0 flex-1", searchOpen ? "block" : "hidden sm:block")}>
          <span className="sr-only">Search services</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onBlur={() => !query.trim() && setSearchOpen(false)}
            placeholder="Search: twists, updo, locs, kids…"
            className="h-11 w-full rounded-v2-lg border border-latte bg-cream-100 pl-10 pr-3.5 text-sm font-medium text-ink outline-none placeholder:text-ink-soft focus:border-ink"
          />
        </label>

        {!searchOpen && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search services"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink hover:bg-latte sm:hidden"
          >
            <Search aria-hidden className="h-4 w-4" />
          </button>
        )}

        <div
          role="group"
          aria-label="View"
          className={cn(
            "inline-flex gap-0.5 rounded-full bg-cream-100 p-1",
            // Hidden only while the phone search is open, so the field gets the row.
            searchOpen ? "hidden sm:inline-flex" : "ml-auto sm:ml-0"
          )}
        >
          {[
            ["grid", "Looks"],
            ["list", "List"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => onView(id)}
              className={cn(
                "h-[30px] rounded-full px-3 text-[12.5px] font-semibold",
                view === id ? "bg-ink text-white" : "text-ink-soft"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/*
        Ten categories, of which only four fit a 375px screen. Two fixes: the
        strip sticks below the 64px site header so it stays reachable once you
        are deep in the list, and a fade on the right edge says there is more
        to scroll to — without it the last chip ended flush and the remaining
        six were invisible.
      */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 bg-sand/95 px-4 py-1.5 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="relative">
          <div
            role="group"
            aria-label="Categories"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[{ id: "all", label: "All" }, ...ACTIVE_CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => onCategory(c.id)}
                className={cn(
                  "h-[34px] shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                  category === c.id ? "border-ink bg-ink text-white" : "border-latte bg-white text-ink hover:bg-cream-100"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sand to-transparent sm:hidden"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <>
          <div className="mt-4 rounded-v2-xl bg-cream-100 p-7 text-center text-sm text-ink-soft">
            Nothing called &ldquo;{query}&rdquo; yet. Try &ldquo;twist&rdquo;, &ldquo;updo&rdquo; or &ldquo;locs&rdquo;, or send us
            a photo of the look instead.
          </div>
          <div className="mt-3">{whatsappCard}</div>
        </>
      ) : (
        sections.map((section, i) => (
          <Fragment key={section.key}>
            {section}
            {/* After the first group, not before it: showing the way out before
                anyone has seen the catalogue frames it as the hard path. */}
            {i === 0 && <div className="mt-5">{whatsappCard}</div>}
          </Fragment>
        ))
      )}
    </div>
  );
}
