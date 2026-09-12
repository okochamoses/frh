# Chidhama Design System v2

Source reference: https://styles.refero.design/style/7ce6bd42-e498-47c0-ad02-7b3a0f5d94e0

Implemented in `tailwind.config.mjs` (tokens), `src/app/v2/v2.css` (type set, motion,
bands) and `src/app/v2/fonts.js` (faces). Where this document and those files
disagree, the code is right and this document is the bug — every value below was
read back out of the running pages, not aspired to.

Live reference: `/v2/design-system`.

## 1. Product & brand

Chidhama is a premium natural-hair salon experience.

The interface should communicate:

- Confidence
- Modernity
- Clarity
- Premium quality
- A fintech-grade sense of polish and trust

### Design personality

**Bold + graphic + confident + disciplined.**

A four-face type system built on one specimen serif, near-black instead of pure
black, pill-shaped buttons, no shadows — elevation comes from surface colour
layering only.

Avoid:

- Pure `#000000` or `#ffffff` borders
- Box-shadows anywhere
- Rectangular buttons (4–8px radius)
- More than one saturated accent colour
- Decorative gradients outside the hero

---

## 2. Colour system

### Core palette

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Fixture | `#1a1a1a` | `ink` / `deep` | Primary text, filled neutral buttons, dark UI |
| Glow | `#f3e3cc` | `gold` | Warm tint: hero band, feature cards, newsletter band, subtle fills |
| Slat | `#c08250` | `slat` | Wood accent: icons, star ratings, rings, marks. Never for text |
| Slat Ink | `#8b5e34` | `slat-ink` | Slat for text and links on light grounds |
| Mustard | `#fbb91c` | `mustard` | Booking actions only + the closing CTA band |
| Mustard Deep | `#e8a60d` | `mustard-deep` | Hover/pressed state for mustard |
| Wall | `#f8f5ef` | `sand` | Page background |
| Linen | `#f1ece4` | `cream-100` | Cards, secondary surfaces |
| Line | `#e6ddd1` | `latte` | Borders, dividers, subtle fills. **Not a text ground** |
| Muted | `#6b665f` | `ink-soft` | Secondary body text |
| Ash | `#736a5e` | `ash` | Tertiary/helper text |
| Ash Disabled | `#a39a8e` | `ash-disabled` | Disabled controls only |
| Bronze | `#3a2f27` | `bronze` | Badge backgrounds, dark overlays |
| Espresso | `#2b211a` | `obsidian` | Deep section backgrounds, footer |

Palette is "Wood & Glow", sampled from the Isolo salon: pale walls, black
fixtures, slatted wood, amber LED light. `gold` is kept as the class name for
backward compatibility and maps to Glow.

### Measured contrast

Text foregrounds against every ground they are allowed on. AA needs **4.5:1**
for normal text, **3:1** at ≥24px (or ≥18.66px bold) and for UI graphics.

| | Wall | Linen | Line | Glow | Mustard | Espresso |
|---|---:|---:|---:|---:|---:|---:|
| Fixture `#1a1a1a` | 15.99 | 14.80 | 12.95 | 13.82 | 9.99 | 1.11 |
| Muted `#6b665f` | 5.23 | 4.84 | 4.23 | 4.52 | 3.27 | 2.76 |
| Ash `#736a5e` | 4.88 | 4.52 | 3.95 | 4.22 | 3.05 | 2.96 |
| Slat Ink `#8b5e34` | 5.15 | 4.76 | 4.17 | 4.45 | 3.22 | 2.81 |
| Slat `#c08250` | 2.95 | 2.73 | 2.39 | 2.55 | 1.84 | 4.91 |
| White `#ffffff` | 1.09 | 1.18 | 1.34 | 1.26 | 1.74 | 15.73 |
| Ash Disabled `#a39a8e` | 2.55 | 2.36 | 2.06 | 2.20 | 1.59 | 5.67 |

### Rules

Fixture (`#1a1a1a`) is the only "black" — never pure `#000000`.

Mustard is the only saturated hue and is reserved for booking actions, so "Book"
is the brightest thing on every page. Use at most one mustard band per page (the
closing CTA). Always full-strength ink text on mustard — white is 1.7:1, and even
`ink/60` only reaches 3.3:1. **Never apply an opacity modifier to text on mustard.**

Text defaults to Fixture for primary copy, Muted for secondary, Ash for
tertiary/helper text.

**Ash and Muted are light-ground tokens only.** Ash clears AA on Wall, Linen and
white; it does not on Line (3.95) or Glow (4.22). Muted does not clear AA on Line
(4.23) either. Line is a border and fill colour — if text has to sit on it, the
text is Fixture or the ground changes.

Slat never carries text. Slat Ink is the text-safe wood tone on light grounds.

`ash-disabled` exists only because WCAG 1.4.3 exempts disabled controls. Use it
for the disabled state of a real control and nothing else — a disabled slot that
matches live tertiary text stops reading as disabled.

---

## 3. Typography

### Families

Four faces, loaded in `src/app/v2/fonts.js` and exposed as CSS variables on the
V2 wrapper.

| Role | Face | Variable / class | Weights |
|---|---|---|---|
| Display | **Icarus Nocturne** (local `.ttf`) | `--font-serif` / `.type-display-*`, `font-serif` | 400 only |
| Eyebrow | **Barlow Condensed** | `--font-display` / `.type-eyebrow`, `font-display` | 600, 700 |
| Paragraph | **Barlow** (upright) | `--font-paragraph` / `font-paragraph` | 400, 500, 600 |
| Body / UI | **Manrope** | `--font-body` / `font-body` | 400–700 |

Manrope is the wrapper's default face, so buttons, labels, nav and forms get it
without asking. Barlow is applied to `<p>` globally in `v2.css`; the
`font-paragraph` utility only exists to opt other elements into the same face.

Icarus Nocturne is the brand display serif from the specimen sheet. **One weight,
no italic.** Emphasis inside a headline comes from size or colour, never bold or
italic — the browser would synthesise both and smear the hairlines, so
`font-synthesis: none` is set on every display class. Its hairlines break up below
~28px, so it is never offered smaller than `type-display-md` and never carries
body copy or UI labels. It also wants a solid, high-contrast ground rather than a
busy photograph.

### Type scale

Display — Icarus Nocturne, fluid, tracking left at the face's own fitting
(negative tracking collides the overhanging swashes):

| Class | Size | Line height |
|---|---|---|
| `.type-display-hero` | `clamp(3rem, 1.9rem + 4.6vw, 6.5rem)` | 0.92 |
| `.type-display-xl` | `clamp(2.5rem, 1.95rem + 2.3vw, 4rem)` | 0.98 |
| `.type-display-lg` | `clamp(2rem, 1.7rem + 1.25vw, 2.75rem)` | 1.05 |
| `.type-display-md` | 1.75rem (28px) | 1.15 |

Eyebrow — Barlow Condensed 600, uppercase, tracked out because the condensed cut
knits caps together at this size:

| Class / token | Size | Tracking |
|---|---|---|
| `.type-eyebrow`, `text-eyebrow` | 12px | 0.18em |
| `text-eyebrow-lg` | 14px | 0.16em |

`.type-eyebrow` sets its own colour to Muted. Overriding it to Ash is fine on
Wall and Linen, not on Glow.

UI and body — Manrope (Barlow for `<p>`):

| Token | Size | Line height | Tracking |
|---|---:|---:|---:|
| `text-display-xl` | 64px | 0.95 | -0.02em |
| `text-display-fluid` | `clamp(2.75rem, 2.05rem + 2.88vw, 5.5rem)` | 0.95 | -0.02em |
| `text-v2-h1` | 48px | 1.00 | -0.015em |
| `text-v2-h2` | 36px | 1.05 | -0.01em |
| `text-v2-h3` | 20px | 1.20 | — |
| `text-v2-body` | 16px | 1.50 | — |
| `text-v2-body-sm` | 14px | 1.45 | — |
| `text-v2-label` | 12px | 1.30 | — |

### Typography rules

Display text is Icarus Nocturne. The older rule that headings run in Barlow
Condensed 700 no longer holds — Barlow Condensed is the eyebrow face now.

Tighten letter-spacing as size increases on the *sans* scale only. The serif
scale keeps its own fitting.

Body text is left-aligned; centre only headlines and single-line CTAs.

---

## 4. Spacing

Base spacing unit: **8px**, with a 4px step absorbed at the small end. Exposed as
`--space-*` on `.v2-root`.

```text
4   xs      32  xl      80  5xl
8   sm      40  2xl     96  6xl
16  md      48  3xl
24  lg      64  4xl
```

---

## 5. Border radius

```text
8px    rounded-v2-md    — small controls
12px   rounded-v2-lg    — inputs, date cells
16px   rounded-v2-xl    — compact cards
20px   rounded-v2-2xl   — standard cards (default)
24px   rounded-v2-3xl   — feature cards
32px   rounded-v2-4xl   — major containers
full   rounded-full     — all buttons, pills, badges (non-negotiable)
```

Buttons are always fully pill-shaped. A clickable *card* is not a button for this
rule — it keeps its card radius.

---

## 6. Elevation

**No box-shadows anywhere.** `shadow-v2-sm` and `shadow-v2-md` are both defined as
`none` so the utility exists but cannot introduce one. Elevation is communicated
purely through surface colour layering:

- Level 0: Wall `#f8f5ef` — the page ground
- Level 1: Linen `#f1ece4` — cards, secondary surfaces
- Level 2: Line `#e6ddd1` — fills that need to sit below a Linen card
- Level 3: Glow `#f3e3cc` — warm decorative bands, feature cards
- Level 4: Espresso `#2b211a` — deep sections, footer

Use a 1px Line border for tertiary definition between adjacent same-colour
surfaces instead of a shadow.

---

## 7. Buttons

Implemented once in `src/components/v2/ui/Button.jsx`. Every variant is
`rounded-full`, `transition-colors duration-200 ease-out`, and
`disabled:opacity-50`.

| Variant | Background | Text | Height | Padding |
|---|---|---|---|---|
| `primary` | `deep` `#1a1a1a`, hover `deep/90` | white | 48px | 24px |
| `book` | `mustard`, hover `mustard-deep` | `ink` | 48px | 24px |
| `secondary` | transparent, 1px `ink` border, hover `ink/5` | `ink` | 48px | 24px |
| `tertiary` | transparent | `ink`, hover `ink/70` | auto | 0 |
| `icon` | `latte`, hover `latte/70` | `ink` | 44×44px | 0 |

Font is Manrope 600 at 14px.

`book` is the only mustard control, and its text is full-strength ink — see §2.

Do not use Glow for button borders or button text — it is a decorative surface,
not interactive chrome.

Renders a `<button>`, or a `next/link` anchor when `href` is given.

---

## 8. Form controls

### Input

`src/components/v2/ui/Input.jsx`.

- Height: 48px
- Background: `cream-100`
- Border: 1px `latte`, or `red-700` in the error state
- Radius: `rounded-v2-lg` (12px)
- Text: `ink`, placeholder `ink-soft`

Focus: `focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/30`.

Always pass `label`. The component wires `htmlFor`/`id`, and `error` wires
`aria-invalid` plus `aria-describedby`. A placeholder is not a label.

### Checkbox / Radio

Selected: background `ink`, check/dot in `white`.
Unchecked: white fill, 1.5px `ash` border.

### Select

Matches input dimensions; chevron aligned right.

---

## 9. Cards

### Standard card

- Background: `cream-100`
- Radius: `rounded-v2-2xl` (20px)
- Padding: 20–24px
- No shadow — use a 1px `latte` border if separation from an identical-colour background is needed

### Feature card

- Radius: `rounded-v2-3xl` (24px)
- Generous padding
- May use Glow sparingly as a decorative surface

### Product card

Full-bleed image inside the card's radius mask, no padding around the image;
content order: image → name → benefit line → price → CTA.

Where a look has no photograph, `ServicePhoto` falls back to a lettered tile on a
Wall→Linen gradient. The ground stops at Linen deliberately: the "No photo yet"
caption is real text and Line is too dark to carry it.

---

## 10. Service selection

```text
[ ] Service name                         ₦8,000
    Short description
```

Selected treatment: `ink`-filled checkbox, `cream-100` tinted card background,
bolded service name. No shadow.

---

## 11. Date picker

Compact pill/card dates, `rounded-v2-lg`.

Selected: `ink` background, white text.
Available: `cream-100`, `ink` text, hover `latte`.
The client's usual day: 1.5px inset `slat` ring.
Unavailable: `ash-disabled` text, `line-through`, `cursor-not-allowed`, and an
`aria-label` carrying the reason — the strike and the label do the work, not the
colour.

---

## 12. Time slots

Compact pill buttons.

Selected: `ink` background, white text.
Available: `cream-100` background, `ink` text.

---

## 13. Progress stepper

```text
●────────○────────○
1        2        3
```

Active/completed step: `ink` text.
Inactive: `ash` text.

---

## 14. Imagery direction

**Salon photography:** warm architectural lighting, natural wood, arched mirrors,
clean near-black accents.

**Product photography:** clean full-bleed objects on neutral or Linen
backgrounds. Avoid warm amber/dark-glass staging that clashes with the near-black
+ warm-neutral system — prefer cooler, cleaner backdrops.

**Avoid:** oversaturation, excessive filters, generic stock compositions, and
mixing editorial portraits with phone snapshots in the same run of images.

---

## 15. Layout principles

Max content width: `1400px`, centred — set once as `--v2-container` (`1464px`,
the 1400px column plus the 32px desktop gutters).

Desktop gutter: `32px`. Tablet gutter: `24px`. Mobile gutter: `16px`.

Touch targets ≥ `44px`. This is stricter than WCAG 2.2 AA (which asks 24×24 at
2.5.8); 44px is a house rule and is currently **not** met by the desktop nav
links (40px), the booking filter chips (30–34px) or the mobile logo (37px).

`.v2-root` sets `overflow-x: clip` — `clip` rather than `hidden`, because
`hidden` would make it a scroll container and break the sticky header inside it.

---

## 16. Motion

Ease-out curves. No bounce, no constant motion. Durations actually in use:

| Duration | Where |
|---|---|
| 150–200ms | Micro interactions — button and link colour, icon nudges |
| 300ms | Component transitions, service-index opacity |
| 450ms | FAQ answer `grid-template-rows` |
| 500ms | Card headline and arrow transforms on hover |
| 700ms | Image scale on card hover |
| 800ms | Top-band background wash (header, hero and page ground in one motion) |
| 900ms | `Reveal` scroll entrance — opacity + translate, `cubic-bezier(0.16, 1, 0.3, 1)` |

The two long ones are deliberate and are not "layout transitions": the 800ms band
wash is a full-page ground change that reads as harsh when quick, and the 900ms
reveal is a compositor-only settle on content the reader has not looked at yet.
Anything the reader is waiting on stays at 300ms or below.

`prefers-reduced-motion: reduce` collapses every animation and transition in the
V2 tree to 0.01ms, and `.v2-reveal` only hides its content inside the
`no-preference` query — so with the preference set, or with JS off, the page
renders finished rather than blank.

---

## 17. Accessibility

Target: **WCAG 2.1 AA**.

**Skip link.** `.v2-skip-link` in the V2 layout is the first tabbable element on
every page, jumping to `#v2-main`. The header carries 47 tab stops before the
content starts, so this is not optional. The target has `tabIndex={-1}` so focus
actually moves — without it the browser scrolls and leaves focus in the header.

**Focus.** `.v2-root :focus-visible` draws a 2px `ink` outline at 2px offset. No
browser-default blue. Never remove it without replacing it.

**Contrast.** See the matrix in §2 and the ground restrictions on Ash and Muted.

**State is never colour alone.** Unavailable dates carry a strike-through and an
`aria-label` reason; closed days carry the word "Closed".

**Accessible names** on every button and link. Decorative SVG gets
`aria-hidden="true"`; meaningful imagery gets real `alt`.

### Known open items

Tracked, not fixed:

- `ink/60` on Mustard — 3.3:1. Opacity modifiers on mustard text (§2 forbids them; the marquee and eyebrow still use them)
- `white/45` on Espresso — 4.31:1
- `ink/55` on Glow — 3.64:1
- `slat` on Glow for decorative marks — 2.55:1 against a 3:1 requirement
- Touch targets below 44px — see §15
- All V2 routes share one `<title>` and one meta description

---

## 18. Implementation rule for LLMs

1. Reuse existing design tokens (`ink`, `ink-soft`, `deep`, `gold`→Glow, `sand`,
   `cream-100`, `latte`, `ash`, `ash-disabled`, `slat`, `slat-ink`, `bronze`,
   `obsidian`) before introducing new values.
2. Prefer existing components in `src/components/v2/ui` before creating a one-off.
3. Never add box-shadow classes — use surface layering or a 1px `latte` border.
4. Buttons are always pill-shaped (`rounded-full`); never introduce a rectangular
   button. Clickable cards keep their card radius.
5. Do not use `gold` (Glow) for button borders, button text, or links — decorative
   accent only. Do not use `slat` for text; use `slat-ink`.
6. Never put an opacity modifier on text sitting on Mustard.
7. Ash and Muted text go on Wall, Linen or white — not on Line or Glow.
8. Display type is Icarus Nocturne at one weight. Never `font-bold` or `italic`
   on it, and never below 28px.
9. Do not substitute generic SaaS patterns for the patterns defined here.
