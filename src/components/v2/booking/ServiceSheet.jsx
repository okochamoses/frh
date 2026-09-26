"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOOK_BY_ID, categoryLabel, suggestionFor } from "@/lib/booking/catalogue";
import { useCatalogueVersion } from "@/lib/booking/usePriceList";
import { depositPctForTitle } from "@/lib/booking/deposits";
import { formatDuration, naira } from "@/lib/booking/schedule";
import ServicePhoto from "./ServicePhoto";
import { PillButton, useV2PortalContainer } from "./ui";

function durationRange(look) {
  if (look.minDuration === look.maxDuration) return formatDuration(look.minDuration);
  return `${formatDuration(look.minDuration)}–${formatDuration(look.maxDuration)}`;
}

/**
 * The photo-and-details sheet. A centred dialog on desktop, a bottom sheet on
 * phones. For looks that come in sizes or lengths it is also where the size is
 * chosen, so the grid never has to show three near-identical cards.
 */
export default function ServiceSheet({ lookId, selected, onClose, onApply }) {
  useCatalogueVersion(); // re-render when the salon changes a price
  const look = lookId ? LOOK_BY_ID.get(lookId) : null;
  const chosen = look ? look.options.find((o) => selected.includes(o.title)) : null;
  const [picked, setPicked] = useState(null);
  const container = useV2PortalContainer();

  // Reset the size choice whenever a different look is shown.
  useEffect(() => {
    setPicked(chosen?.title ?? (look && !look.hasVariants ? look.options[0].title : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookId]);

  if (!look) {
    return <Dialog.Root open={false} />;
  }

  const option = look.options.find((o) => o.title === picked) ?? null;
  const takeDown = look.options.map((o) => suggestionFor(o, [])).find((s) => s?.kind === "take-down");

  const facts = [
    ["Time in the chair", option ? formatDuration(option.duration) : durationRange(look)],
    ["Price", option ? naira(option.price) : `from ${naira(look.minPrice)}`],
    ["Category", categoryLabel(look.category)],
  ];
  if (takeDown) facts.push(["Take-down later", `${naira(takeDown.option.price)} · ${formatDuration(takeDown.option.duration)}`]);
  // A deposit changes what this booking costs today, so it belongs with the
  // price rather than in a policy section the client reaches afterwards.
  const depositPct = Math.max(...look.options.map((o) => depositPctForTitle(o.title)), 0);
  if (depositPct) {
    facts.push([
      "To hold the slot",
      option ? `${naira(Math.round((option.price * depositPct) / 100))} up front` : `${depositPct}% up front`,
    ]);
  }

  let action;
  if (!look.hasVariants) {
    action = chosen ? (
      <PillButton variant="ghost" className="w-full" onClick={() => onApply(look, null)}>
        Remove from booking
      </PillButton>
    ) : (
      <PillButton className="w-full" onClick={() => onApply(look, look.options[0])}>
        Add to booking · {naira(look.options[0].price)}
      </PillButton>
    );
  } else if (!option) {
    action = (
      <PillButton className="w-full" disabled>
        Choose an option first
      </PillButton>
    );
  } else if (chosen?.title === option.title) {
    action = (
      <div className="grid gap-2">
        <PillButton variant="ghost" className="w-full" onClick={onClose}>
          Keep {option.label.toLowerCase()}
        </PillButton>
        <button
          type="button"
          onClick={() => onApply(look, null)}
          className="justify-self-center text-[13px] font-semibold text-ink underline underline-offset-4"
        >
          Remove from booking
        </button>
      </div>
    );
  } else {
    action = (
      <PillButton className="w-full" onClick={() => onApply(look, option)}>
        {chosen ? "Switch to" : "Add"} {option.label.toLowerCase()} · {naira(option.price)}
      </PillButton>
    );
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-obsidian/55 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        {/* The sheet is a fixed three-part box — photo, scrolling body, action
            — rather than one long scroller. It used to be the latter, and the
            sticky action could be pushed past the bottom of a short phone
            viewport, so the one button the sheet exists for was off-screen.

            Height is capped in dvh so the mobile browser chrome is accounted
            for, and the photo is measured in vh rather than pixels so it gives
            way on a short screen instead of eating the body. */}
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[71] flex flex-col overflow-hidden bg-white text-ink outline-none",
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[28px]",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(88dvh,44rem)] sm:w-[min(480px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4"
          )}
        >
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-sm hover:bg-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </Dialog.Close>

          {/* Full bleed to the sheet's own edges: inset with a gutter the photo
              read as a thumbnail pasted into a form, and the reference photo is
              the reason most people open this. */}
          <ServicePhoto
            look={look}
            alt={look.image ? `Example of ${look.name}` : ""}
            sizes="(min-width: 640px) 480px, 100vw"
            fit="contain"
            className="h-[40vh] max-h-[360px] min-h-[200px] shrink-0 rounded-t-[28px] text-[64px]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent"
            />
            {/* Grab handle, over the photo now that the photo is the top edge. */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden"
            />
          </ServicePhoto>

          <div className="grid min-h-0 flex-1 auto-rows-max gap-4 overflow-y-auto overscroll-contain p-5 sm:p-6">
            <p className="text-[12.5px] text-ink-soft">
              {look.image
                ? "Reference photo. Your stylist will match it to your hair's length and texture."
                : "We don't have a photo of this one yet."}
            </p>

            <Dialog.Title className="pr-10 text-[22px] font-bold leading-tight tracking-[-0.01em] text-balance">
              {look.name}
            </Dialog.Title>

            <dl className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-v2-lg">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-cream-100 px-3 py-2.5 text-[13px]">
                  <dt className="text-xs text-ink-soft">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
              {facts.length % 2 === 1 && <div className="bg-cream-100" aria-hidden="true" />}
            </dl>

            {look.hasVariants && (
              <fieldset>
                <legend className="type-eyebrow mb-2">Choose an option</legend>
                <div role="radiogroup" aria-label={`${look.name} options`} className="grid gap-1.5">
                  {look.options.map((o) => (
                    <button
                      key={o.title}
                      type="button"
                      role="radio"
                      aria-checked={picked === o.title}
                      onClick={() => setPicked(o.title)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-v2-lg border-[1.5px] px-3.5 py-3 text-left text-sm font-semibold transition-colors",
                        picked === o.title ? "border-ink bg-cream-100" : "border-latte bg-white hover:border-ash"
                      )}
                    >
                      {o.label}
                      <span className="text-[13px] font-medium tabular-nums text-ink-soft">
                        {formatDuration(o.duration)} · {naira(o.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {look.description && <p className="text-[15px] leading-relaxed text-ink-soft">{look.description}</p>}
          </div>

          {/* Outside the scroller, so it is always the last thing on screen.
              pb accounts for the phone home indicator. */}
          <div className="shrink-0 border-t border-latte/60 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6">
            {action}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
