# Chidhama Design System v2

Source reference: https://styles.refero.design/style/7ce6bd42-e498-47c0-ad02-7b3a0f5d94e0

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

Two-font system, near-black instead of pure black, pill-shaped buttons, no shadows — elevation comes from surface color layering only.

Avoid:

- Pure `#000000` or `#ffffff` borders
- Box-shadows anywhere
- Rectangular buttons (4–8px radius)
- More than one saturated accent color
- Decorative gradients outside the hero

---

## 2. Color system

### Core palette

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Espresso Ink | `#1a0000` | `ink` / `deep` | Primary text, filled CTAs, nav bar, dark surfaces |
| Iris Blue | `#98bbf4` | `gold` | Sole accent — decorative highlights, accent card surfaces |
| Canvas White | `#ffffff` | `sand` | Page background |
| Linen Mist | `#f2f2f2` | `cream-100` | Cards, secondary surfaces |
| Bone | `#ededec` | `latte` | Borders, dividers, subtle fills |
| Taupe Slate | `#514f4c` | `ink-soft` | Secondary body text |
| Ash Gray | `#aeaea6` | `ash` | Helper/tertiary text |
| Charcoal Bronze | `#3a3a3a` | `bronze` | Badge backgrounds, dark overlays |
| Obsidian Roast | `#221919` | `obsidian` | Deep section backgrounds |

`gold` is kept as the Tailwind class name for backward compatibility with existing components, but it now maps to Iris Blue, not a gold/amber tone.

### Rules

Espresso Ink (`#1a0000`) is the only "black" — never pure `#000000`.

Iris Blue is the only accent color. Do not introduce a second saturated hue.

Text defaults to Espresso Ink for primary copy, Taupe Slate for secondary, Ash Gray for tertiary/helper text.

---

## 3. Typography

### Families

**Display:** Barlow Condensed (weight 700) — free substitute for Greed Condensed
**Body / UI:** Manrope (weights 400–700) — free substitute for Area

### Type scale

| Style | Font | Weight | Size | Line height | Letter spacing |
|---|---|---:|---:|---:|---:|
| Display XL | Barlow Condensed | 700 | 64px | 0.95 | -0.02em |
| H1 | Barlow Condensed | 700 | 48px | 1.00 | -0.015em |
| H2 | Barlow Condensed | 700 | 36px | 1.05 | -0.01em |
| H3 | Manrope | 600 | 20px | 1.20 | — |
| Body | Manrope | 400 | 16px | 1.50 | — |
| Body Small | Manrope | 400 | 14px | 1.45 | — |
| Label | Manrope | 600 | 12px | 1.30 | — |

### Typography rules

Use Barlow Condensed 700 exclusively for display/heading text — never at weight 400 (looks weak at display sizes).

Use Manrope for all functional/body copy.

Tighten letter-spacing as size increases (display sizes get more negative tracking).

Body text is left-aligned; center only headlines and single-line CTAs.

---

## 4. Spacing

Base spacing unit: **8px**, with a 4px step absorbed into it at the small end.

```text
4   xs
8   sm
16  md
24  lg
32  xl
40  2xl
48  3xl
64  4xl
80  5xl
96  6xl
```

---

## 5. Border radius

```text
8px    radius.md    — inputs
12px   radius.lg    — inputs, small controls
16px   radius.xl    — compact cards
20px   radius.2xl   — standard cards (default)
24px   radius.3xl   — feature cards
32px   radius.4xl   — major containers
full   radius.full  — all buttons, pills, badges (non-negotiable)
```

Buttons are always fully pill-shaped. No rectangular or slightly-rounded buttons.

---

## 6. Elevation

**No box-shadows anywhere.** Elevation is communicated purely through surface color layering:

- Level 0: Canvas (`#ffffff`)
- Level 1: Linen (`#f2f2f2`)
- Level 2: Bone (`#ededec`)
- Level 3: Iris wash (`#98bbf4`, sparing use)
- Level 4: Obsidian (`#221919`)

Use a 1px Bone border for tertiary definition between adjacent same-color surfaces instead of a shadow.

---

## 7. Buttons

### Primary

- Background: `ink` (`#1a0000`)
- Text: `white`
- Radius: full (pill)
- Height: 48px
- Horizontal padding: 20–24px
- Font: Manrope 600 / 14–16px

### Secondary (ghost)

- Background: transparent
- Border: 1px solid `ink` or `latte`
- Text: `ink`
- Radius: full (pill)

Do not use the Iris Blue accent for button borders or text — it's reserved for decorative surfaces/highlights, not interactive chrome.

### Tertiary

Text-only action in `ink`, underline or arrow on hover — no accent color.

### Icon button

- Minimum size: 40×40px
- Circular
- Background: `latte`, text: `ink`

---

## 8. Form controls

### Input

- Height: 48–52px
- Background: `cream-100`
- Border: 1px solid `latte`
- Radius: 12px (`radius.lg`)
- Text: `ink`

Focus:

- Border: `ink`
- 2px focus ring in `ink`, no browser-default blue

### Checkbox / Radio

Selected: background `ink`, check/dot in `white`.
Unchecked: transparent/white, border in `latte` or `ink-soft`.

### Select

Match input dimensions; chevron aligned right.

---

## 9. Cards

### Standard card

- Background: `cream-100`
- Radius: 20px (`radius.2xl`)
- Padding: 20–24px
- No shadow — use a 1px `latte` border if separation from an identical-color background is needed

### Feature card

- Radius: 24px (`radius.3xl`)
- Generous padding
- Can use Iris Blue wash sparingly as a decorative surface

### Product card

Full-bleed image inside the card's radius mask, no padding around the image; content order: image → name → benefit line → price → CTA.

---

## 10. Service selection

```text
[ ] Service name                         ₦8,000
    Short description
```

Selected treatment: `ink`-filled checkbox, `cream-100` tinted card background, bolded service name. No shadow.

---

## 11. Date picker

Compact pill/card dates.

Selected date: `ink` background, white text.
Available: `cream-100`/white, `ink` text.
Unavailable: reduced contrast (`ash`), no pointer interaction.

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

Active step: `ink` fill, white number.
Inactive: `latte` outline, `ash` text.

---

## 14. Imagery direction

**Salon photography:** warm architectural lighting, natural wood, arched mirrors, clean near-black accents — kept as-is from prior spec, still compatible with the new palette.

**Product photography:** clean full-bleed objects on neutral or Linen Mist backgrounds. Avoid warm amber/dark-glass staging that clashes with the new near-black + white system — prefer cooler, cleaner backdrops.

**Avoid:** oversaturation, excessive filters, generic stock compositions.

---

## 15. Layout principles

Max content width: `1400px`, centered — set once as `--v2-container` (`1464px`, which is the 1400px column plus the 32px desktop gutters).

Desktop gutter: `32px`. Tablet gutter: `24px`. Mobile gutter: `16px`.

Touch targets ≥ `44px`.

---

## 16. Motion

Micro interaction: 150–200ms. Component transition: 200–300ms. Layout transition: 300–450ms. Ease-out curves. No bounce, no constant motion.

---

## 17. Accessibility

WCAG AA contrast target. Visible keyboard focus on all interactive controls (2px `ink` ring). Never communicate state by color alone. Meaningful accessible names on buttons/links.

---

## 18. Implementation rule for LLMs

1. Reuse existing design tokens (`ink`, `ink-soft`, `deep`, `gold`→Iris Blue, `sand`, `cream-100`, `latte`, `ash`, `bronze`, `obsidian`) before introducing new values.
2. Prefer existing components in `src/components/v2/ui` before creating one-off components.
3. Never add box-shadow classes — use surface layering or a 1px `latte` border instead.
4. Buttons are always pill-shaped (`rounded-full`); never introduce a rectangular button.
5. Do not use the `gold` (Iris Blue) token for button borders, button text, or links — it's a decorative accent only.
6. Do not substitute generic SaaS patterns for the patterns defined here.
