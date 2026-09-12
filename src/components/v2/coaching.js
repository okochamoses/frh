/* The coaching offer, in one place.
 *
 * The paths are listed by the cards, named again by the chooser above them and
 * linked from the header's mega-menu, so the price, the name and the anchor
 * have three chances to drift apart. They are declared once here instead.
 *
 * Order is by price, ascending. A reader scanning four numbers reads them as a
 * scale, and an unsorted scale reads as an accident.
 */

const WHATSAPP = "2348110215014";

/** WhatsApp deep link with the first message already written. */
export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_ASK_GENERAL = whatsappLink(
  "Hi Mariam — I'm looking at the coaching sessions and I'm not sure which one fits my hair. Can you help me pick?",
);

export const PATHS = [
  {
    id: "builder",
    price: "₦20,000",
    priceLabel: "One session",
    title: "Build-Your-Routine Session",
    /** The line the chooser leads with — the reader's problem, not our name for it. */
    symptom: "I have no idea what I am doing on wash day",
    body: "We go through what you already own and what your week actually looks like, then write the routine around both.",
    items: [
      "A wash day and a night routine, written down",
      "How to layer the products already on your shelf",
      "A short list of what to buy next, sold in Lagos",
    ],
    fit: "Best if you want clarity rather than more products",
    format: "In salon or by video call",
    link: "https://paystack.com/buy/build-your-routine-session-vpzhbk",
    ask: "Hi Mariam — I'd like to know if the ₦20,000 Build-Your-Routine Session is the right one for my hair.",
  },
  {
    id: "scalp",
    price: "₦30,000",
    priceLabel: "One session",
    title: "Scalp Care Consultation",
    symptom: "My scalp itches, flakes or feels sore",
    body: "For itching, flaking, soreness or growth that has stalled. We work out what is causing it before anything gets treated.",
    items: [
      "A close read of your scalp, hairline and roots",
      "A treatment plan with an order and a timeline",
      "An in-salon treatment can be added on the day",
    ],
    fit: "Best for dandruff, inflammation, buildup or thinning edges",
    format: "In salon, or by video call with photos",
    link: "https://paystack.com/buy/scalp-care-consultation-ewdznz",
    ask: "Hi Mariam — I'd like to ask about the ₦30,000 Scalp Care Consultation.",
  },
  {
    id: "single",
    price: "₦50,000",
    priceLabel: "One session",
    title: "1-on-1 Hair Coaching",
    symptom: "I have tried everything and nothing holds",
    body: "The full read — scalp, porosity, density and the damage already there — and then a routine built for your texture and your life.",
    items: [
      "Full hair and scalp assessment",
      "Your routine, your product list, and the technique walked through with you",
      "The written plan to take away",
    ],
    fit: "Best if you want to stop guessing and start from the beginning",
    format: "In salon or by video call",
    link: "https://paystack.com/buy/1-on-1-hair-coaching-cqtffb",
    ask: "Hi Mariam — I'd like to ask about the ₦50,000 1-on-1 Hair Coaching session.",
    /* A structural fact about what the session contains, not a claim about how
       many people buy it. */
    badge: "Most complete session",
    featured: true,
  },
  {
    id: "plan",
    price: "₦150,000",
    priceLabel: "Three months",
    title: "Intensive Hair Growth Programme",
    symptom: "I want someone on it with me for a few months",
    body: "Ninety days of coaching with the salon work built in, for hair that needs hands on it regularly rather than one conversation.",
    items: [
      "A check-in every week for twelve weeks",
      "A protective style and a deep treatment each month",
      "Photographs at each month, so changes are measured rather than remembered",
    ],
    fit: "Best if you want someone accountable for the next three months",
    format: "Monthly in salon, check-ins by phone",
    link: "https://paystack.com/buy/intensive-hair-growth-program-3-months-fdbjqq",
    ask: "Hi Mariam — I'd like to talk through the ₦150,000 three-month programme before I book it.",
  },
];
