# Flourish Roots Hair Co. — Website Copy

Complete site copy, one file per page. Written by four hats: digital copywriter,
UX writer, SEO copywriter, conversion copywriter. Each page file carries all four.

## Files

| File | Page | Route |
|---|---|---|
| `01-homepage.md` | Homepage | `/` |
| `02-about.md` | About / Our Story | `/about` |
| `03-services.md` | Services (salon + coaching) | `/services` |
| `04-contact-signup.md` | Contact / Book / Sign-up | `/contact` |

Global elements (nav, footer, forms, system messages) live in this file so they
stay consistent across pages.

---

## Voice guide

**Who is talking:** an older sister who happens to be the best 4C stylist you know.
She has seen your hair before. She is not shocked by it. She will tell you the truth
about it, kindly, and then she will fix it.

**Do**
- Speak Nigerian. "Come in," "your edges," "no wahala" used sparingly and naturally.
- Name the real pain plainly: tight braiding, snatched edges, postpartum shedding, itchy scalp.
- Be specific instead of superlative. "We detangle in sections, damp, from the ends up"
  beats "we use premium techniques."
- Use "your hair," not "the hair." It belongs to a person.
- Say the price. Say the deposit. Say the grace period. Clarity is a kindness.

**Don't**
- No "unlock," "transform," "elevate," "journey," "queen," "hair goals," "slay."
- No promises about growth rates, inches per month, or miracle results.
- No shaming. Not about relaxers, not about wigs, not about how long it has been.
- No exclamation marks stacked. One is plenty, and usually zero.

**The one-line promise (use anywhere):**
> A style you love, on hair that leaves healthier than it came in.

**Positioning sentence (for bios, directories, meta):**
> Flourish Roots Hair Co. is a natural hair salon in Isolo, Lagos, specialising in
> 4C hair — twists, braids and African threading done gently, plus 1:1 hair coaching
> so the health holds between appointments.

---

## Global navigation [UX Writer]

**Primary nav**
- Home
- Services
- Our Story
- Gallery
- Contact

**Nav CTA button:** `Book a visit`

**Mobile nav labels** (shorter, same order)
- Home · Services · Story · Gallery · Contact
- Sticky bottom button: `Book a visit`

**Floating action button (mobile):** `Book`
**FAB aria-label:** `Book a salon appointment`

**Skip link:** `Skip to main content`

---

## Global footer

**Footer tagline**
> Flourish Roots Hair Co.
> Promoting healthier hair, one head at a time.

**Column — Salon**
Twists · Braids · African threading · Weaving combos · Deep treatments · Loosening

**Column — Learn**
Free 4C hair guide · Hair coaching with Mariam · Scalp consultation · Gallery

**Column — Visit**
Shop 303, Destiny Plaza
Ago Palace Way, Isolo, Lagos
Open Mon–Sat. Closed Sundays.
[Get directions]

**Footer newsletter block**
- Heading: `Free 4C hair guide`
- Line: `The routine we give our clients — length retention, wash days, night care. Straight to your inbox.`
- Field placeholder: `Your email address`
- Button: `Send me the guide`
- Fine print: `One guide, then occasional hair notes. Unsubscribe any time.`

**Legal line**
`© {year} Flourish Roots Hair Co. Isolo, Lagos.`
`Privacy · Booking & cancellation policy`

---

## Global form microcopy [UX Writer]

### Field labels and helper text

| Field | Label | Placeholder | Helper |
|---|---|---|---|
| Name | `Your name` | `Mariam Okocha` | — |
| Phone | `Phone number` | `0801 234 5678` | `We send booking updates here on WhatsApp.` |
| Email | `Email address` | `you@email.com` | `Your receipt and reminder go here.` |
| Service | `What are you booking?` | `Choose a service` | `Not sure? Pick "I'm not sure yet" and we'll advise.` |
| Date | `Preferred date` | `Choose a date` | `We open bookings 6 weeks ahead.` |
| Time | `Preferred time` | `Choose a time` | `Please arrive at your slot time. 20 minutes grace.` |
| Hair length | `Current hair length` | `Choose one` | `Helps us set aside the right amount of time.` |
| Notes | `Anything we should know?` | `Tender scalp, protective style for travel, postpartum shedding — tell us.` | `Optional, but it helps.` |

### Error states — plain, never scolding

| Situation | Message |
|---|---|
| Empty required field | `We need this one to hold your slot.` |
| Invalid email | `That email doesn't look complete. Check for a typo?` |
| Invalid phone | `Please enter a Nigerian number, e.g. 0801 234 5678.` |
| No service selected | `Pick a service so we know how long to set aside.` |
| Slot just taken | `Someone booked that slot a moment ago. Here are the closest times.` |
| Date in the past | `That date has passed. Pick an upcoming day.` |
| Sunday selected | `We're closed on Sundays. Mon–Sat works.` |
| Micro twists on a weekend | `Micro twists are weekdays only. Please pick Mon–Fri.` |
| Network failure | `That didn't go through — network. Try again, or WhatsApp us on 0811 021 5014.` |
| Already subscribed | `You're already on the list. Want the guide resent?` |
| Payment proof missing | `Upload or send your transfer proof to confirm the slot.` |

### Success states

| Action | Message |
|---|---|
| Booking submitted | `Slot held. Check your email for the details — and send your deposit proof to confirm.` |
| Booking confirmed | `You're booked. See you at {time} on {date}. Come with your hair detangled if you can.` |
| Consultation booked | `Booked. Mariam will call you on {date} at {time}.` |
| Newsletter signup | `Check your inbox — the guide is on its way.` |
| Contact form sent | `Got it. We reply within a day, Mon–Sat.` |
| Reschedule | `Moved to {new date}, {new time}. Your deposit carries over.` |
| Cancellation | `Cancelled. We've emailed you what happens to your deposit.` |

### Loading / in-between

- `Holding your slot…`
- `Checking what's free…`
- `Sending…`

### Empty states

- No available slots: `Nothing free that week. Try the next one, or join the waitlist and we'll call you when someone moves.`
- Gallery filter with no results: `No styles under that filter yet. Try "Twists" or "Threading."`
- No booking history: `No visits yet. Your first one starts here.` → `Book a visit`
