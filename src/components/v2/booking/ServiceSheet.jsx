"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOOK_BY_ID, categoryLabel, suggestionFor } from "@/lib/booking/catalogue";
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
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[71] flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto bg-white text-ink outline-none",
            "inset-x-0 bottom-0 rounded-t-[28px] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(480px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4"
          )}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-latte sm:hidden" aria-hidden="true" />
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-cream-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </Dialog.Close>

          <div className="grid gap-4 p-5 sm:p-6">
            <ServicePhoto
              look={look}
              alt={look.image ? `Example of ${look.name}` : ""}
              className="h-[300px] rounded-v2-2xl text-[64px]"
            />
            <p className="-mt-2 text-[12.5px] text-ink-soft">
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

            <div className="sticky bottom-0 -mx-5 -mb-5 bg-white px-5 pb-5 pt-2 sm:-mx-6 sm:-mb-6 sm:px-6 sm:pb-6">{action}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
