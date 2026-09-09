# Chidhama Component Specification

This document defines reusable UI primitives for implementation.

## Component naming

Use PascalCase.

Examples:

- `Button`
- `Input`
- `ServiceCard`
- `AppointmentCard`
- `ProductCard`
- `DatePicker`
- `TimeSlot`
- `Accordion`
- `TestimonialCard`
- `ProgressStepper`

---

## Button

### Variants

`primary`
- Green background
- White text
- Full radius

`secondary`
- Transparent
- Gold border
- Gold text

`tertiary`
- No border
- Gold text
- Arrow icon

`icon`
- 40–44px square/circle
- Compact affordance

### API

```ts
type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "icon";

type ButtonProps = {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};
```

---

## ServiceCard

Used in the booking flow.

Structure:

```text
[checkbox]  Service name                    price
            Short description
```

States:

- default
- hover
- selected
- disabled

Selected state uses deep green.

---

## CategoryAccordion

Used for:

- Styling
- Treatments
- For locs
- Braids
- Extensions
- Enhancements
- Products

Collapsed:

```text
[icon] Category
       Description                         chevron
```

Expanded content appears below the header with a restrained divider.

---

## DatePicker

Desktop can display five dates simultaneously.

Each date:

```text
Tue
13
```

Selected:

- Deep green
- White

---

## TimeSlot

Pill-like control.

API:

```ts
type TimeSlotProps = {
  time: string;
  selected?: boolean;
  disabled?: boolean;
};
```

---

## Input

API:

```ts
type InputProps = {
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};
```

States:

- default
- focus
- filled
- error
- disabled

---

## AppointmentCard

Displays:

- Date
- Time
- Duration
- Location
- Directions CTA
- Selected services
- Total

The total must be visually prominent.

---

## ProductCard

Displays:

- Image
- Product name
- Benefit
- Price
- Add-to-visit action

Keep the card editorial rather than e-commerce-heavy.

---

## PromoCard

Used for:

- Hair plan
- Referral
- Newsletter

Use a soft background and one strong CTA.

---

## TestimonialCard

Displays:

- Quote
- Client name
- Rating
- Optional portrait

The quote uses Playfair Display where appropriate.

---

## ProgressStepper

Three steps:

1. Build your visit
2. Choose services
3. Your details

Active state is deep green.

---

## SummaryBox

Used for checkout totals.

Structure:

```text
Wash & Detox                    ₦8,000
Deep Conditioning              ₦10,000
────────────────────────────────────
Total                           ₦18,000
```

---

## Composition rule

Components should support composition.

Avoid giant monolithic pages.

Prefer:

```tsx
<BookingPage>
  <BookingHeader />
  <ServiceSelector />
  <SchedulePicker />
  <CustomerDetails />
  <BookingSummary />
</BookingPage>
```

over a single page component containing all UI logic.
