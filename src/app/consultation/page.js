"use client"

import React from "react"
import { merriweather } from "@/app/layout"
import { Lato } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
})

const services = [
  {
    price: "₦15,000",
    priceLabel: "per session",
    link: "https://paystack.com/buy/1-on-1-hair-coaching-cqtffb",
    title: "1-on-1 Hair Coaching",
    description:
      "Personalized guidance built entirely around your texture, lifestyle, and goals. No generic advice just your plan.",
    items: [
      "Full hair and scalp assessment",
      "Personalized product recommendations",
      "Custom routine plan",
      "Virtual or in-person",
    ],
    perfectFor: "Best for: Women ready to stop guessing",
    cta: "Book Now",
  },
  {
    price: "₦12,000",
    priceLabel: "per session",
    link: "https://paystack.com/buy/scalp-care-consultation-ewdznz",
    title: "Scalp Care Consultation",
    description:
      "Itchy, flaky, or stalled growth? We identify the root cause and build a treatment plan that actually fixes it.",
    items: [
      "In-depth scalp analysis",
      "Tailored treatment plan",
      "Product recommendations",
      "Optional in-salon treatment",
    ],
    perfectFor: "Best for: Dandruff, inflammation, buildup, slow growth",
    cta: "Book Now",
  },
  {
    price: "₦10,000",
    priceLabel: "per session",
    link: "https://paystack.com/buy/build-your-routine-session-vpzhbk",
    title: "Build-Your-Routine Session",
    description:
      "Cut through the noise. Walk away with a complete weekly and monthly regimen simple, sustainable, and yours.",
    items: [
      "Weekly + monthly routine plan",
      "Product layering guidance",
      "Printable routine checklist",
      "Customized to your schedule",
    ],
    perfectFor: "Best for: Busy women who need clarity, not more content",
    cta: "Book Now",
  },
  {
    price: "₦75,000",
    priceLabel: "3-month program",
    link: "https://paystack.com/buy/intensive-hair-growth-program-3-months-fdbjqq",
    title: "Intensive Hair Growth Program",
    description:
      "90 days of structured coaching, in-salon treatments, protective styling, and consistent expert support. Real transformation not maintenance.",
    items: [
      "Full hair and scalp assessment",
      "Weekly coaching check-ins",
      "Monthly protective styles + deep treatments",
      "Growth tracking + progress photos",
      "Access to exclusive resources",
    ],
    perfectFor: "Best for: Women serious about permanent transformation",
    cta: "Apply Now",
    featured: true,
  },
]

const painPoints = [
  "My hair breaks every time I touch it",
  "I've been natural for years and it still won't grow",
  "My scalp is always itchy, flaky, or inflamed",
  "I transitioned from relaxer but I don't know how to care for my hair",
  "I've spent serious money on products that delivered nothing",
  "Postpartum shedding has taken so much from me",
]

const credentials = [
  "Certified Hair Coach",
  "Salon Owner",
  "4C Hair Specialist",
  "Ayurvedic Hair Care",
  "Lagos Based",
]

const whyCards = [
  {
    title: "Relaxers Compromise Your Scalp",
    description:
      "Harsh alkaline agents burn the scalp, weaken follicles, and cause damage that doesn't reverse. Your scalp deserves better.",
  },
  {
    title: "Natural Hair Is Remarkably Strong",
    description:
      "Properly cared for, 4C hair unlocks length, density, and shine you didn't know was waiting.",
  },
  {
    title: "One Session Replaces Years of Guessing",
    description:
      "Stop paying for products that don't work. One expert session gives you a routine built to last years.",
  },
  {
    title: "Your Hair Shapes How You Move",
    description:
      "When your hair is thriving, you feel it everywhere. Healthy hair isn't vanity it's self-care that shows.",
  },
]

const testimonials = [
  {
    stars: "⭐⭐⭐⭐⭐",
    text: "I had been natural for three years and my hair still wasn't growing. After one session, Mariam gave me a routine that works. My edges are back and my hair is longer than it's ever been.",
    author: "Adaeze O.",
    detail: "Lagos Island | 1-on-1 Coaching",
  },
  {
    stars: "⭐⭐⭐⭐⭐",
    text: "After my second baby, my hair was shedding badly. Within six weeks of Mariam's plan, it stopped completely. She doesn't just coach hair she genuinely cares.",
    author: "Fatimah B.",
    detail: "Surulere | Scalp Consultation",
  },
  {
    stars: "⭐⭐⭐⭐⭐",
    text: "My hair grew four inches. The protective styles were beautiful and the coaching kept me consistent. Worth every kobo. I've already referred three friends.",
    author: "Chisom N.",
    detail: "Lekki | 3-Month Program",
  },
]

const steps = [
  {
    title: "Send a WhatsApp",
    description:
      "Tell us your concerns and which service interests you. No forms, no waiting just a conversation.",
  },
  {
    title: "Confirm Your Session",
    description:
      "We lock in your date and time virtual via video call or in-person at our Ago Palace Way salon, Isolo.",
  },
  {
    title: "Pay Securely",
    description:
      "Pay via bank transfer, Paystack, or cash (in-person). Payment confirms your booking.",
  },
  {
    title: "Start Flourishing",
    description:
      "Receive your personalized plan and watch your hair respond. We're with you every step.",
  },
]

const paymentMethods = [
  "Bank Transfer",
  "Paystack",
  "Cash (In-Person)",
  "WhatsApp Pay",
  "Installment (3-Month Program)",
]

const faqs = [
  {
    question: "Can I book virtually if I'm not in Lagos?",
    answer:
      "Yes. All coaching sessions are available via video call. We have clients across Nigeria and in the diaspora.",
  },
  {
    question: "I just transitioned from relaxer. Where do I start?",
    answer:
      "Start with 1-on-1 Hair Coaching. We'll assess your hair, explain your type and porosity, and build a simple routine for your newly natural hair.",
  },
  {
    question: "Will you recommend expensive foreign products?",
    answer:
      "Never. We focus on affordable, accessible products in Nigeria including our own Ayurvedic hair mask range made right here in Lagos.",
  },
  {
    question: "How long before I see results?",
    answer:
      "Most clients notice a difference in 2–4 weeks. Significant length retention and growth typically shows within 3 months of consistency.",
  },
  {
    question: "Do you work with men?",
    answer:
      "Yes. Scalp health is for everyone. Message us on WhatsApp to book.",
  },
  {
    question: "What if I'm not satisfied with my session?",
    answer:
      "Reach out within 48 hours and we'll make it right no conditions.",
  },
]

const stats = [
  { value: "200+", label: "Women Helped" },
  { value: "4C", label: "Hair Specialist" },
  { value: "3+", label: "Years Experience" },
  { value: "Lagos", label: "Based + Virtual" },
]

export default function Consultation() {
  const primaryServiceLink = services[0].link

  return (
    <div className={`${lato.className} flex flex-col items-center pt-20`}>
      {/* Hero Section */}
      <section className="w-full bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="mb-5 rounded-full bg-primary-foreground/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground">
            Lagos' Premier Natural Hair Studio
          </p>
          <h1 className={`${merriweather.className} max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl`}>
            Your Hair Was Never the Problem. You Just Needed the Right Guide.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-primary-foreground/85 sm:text-base">
            You've done everything right and still, your hair isn't thriving. That changes today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryServiceLink} target="_blank" rel="noopener noreferrer">
              <Button className="font-semibold">Book Now</Button>
            </Link>
            <Link href="#services">
              <Button variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                See All Services
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-5 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-semibold text-primary-foreground sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-primary-foreground/75">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="w-full bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-primary">
            Sound Familiar?
          </p>
          <h2 className={`${merriweather.className} text-center text-3xl font-bold text-foreground sm:text-4xl`}>
            You're Not the Problem Your Routine Is
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((item) => (
              <Card key={item} className="border-l-4 border-l-accent">
                <CardContent className="p-5 text-sm leading-6 text-foreground">{item}</CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-base font-semibold text-primary">
            You don't need more products. You need a plan built for your hair.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
          <Card className="border-primary-foreground/20 bg-primary-foreground/10">
            <CardContent className="p-0">
              <img src="/long-hair.webp" alt="Hair coach" className="h-full min-h-[280px] w-full rounded-lg object-cover" />
            </CardContent>
          </Card>
          <div>
            <p className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
              Meet Your Hair Coach
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold leading-tight sm:text-4xl`}>
              I'm Mariam I've Sat Exactly Where You're Sitting
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              I'm a certified hair coach, salon owner, and Lagos woman who has personally lived through hair loss, dryness, and postpartum shedding.
            </p>
            <p className="mt-3 text-primary-foreground/85">
              I built Flourish Roots because Nigerian women deserve expert, culturally rooted care not generic tutorials or expensive imports. Every woman I work with deserves to understand her hair deeply, and to love what she sees.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {credentials.map((credential) => (
                <span key={credential} className="rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs">
                  {credential}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Natural Hair Care Section */}
      <section className="w-full bg-accent/15">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Hair Care is Health Care
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold text-foreground sm:text-4xl`}>
              Why This Work Matters
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {whyCards.map((card) => (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <h3 className={`${merriweather.className} text-lg font-semibold text-primary`}>{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mx-auto mt-8 max-w-3xl border-primary bg-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <p className="text-xl italic">
                "Hair care is not vanity it is health care. Your scalp is skin. Your follicles are living organs. Treat them accordingly."
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">
                - Mariam Okocha Ijeoma, Flourish Roots Hair Co.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Our Services
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold text-foreground sm:text-4xl`}>
              Choose Your Hair Journey
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every service is designed for the Nigerian woman our hair, our climate, our reality.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.title}
                className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md ${
                  service.featured ? "border-red-200 ring-1 ring-red-200" : "border-border"
                }`}
              >
                {service.featured ? (
                  <p className="absolute -top-3 right-4 rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                    Most Sought-After
                  </p>
                ) : null}

                {/* Price up top */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">{service.price}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{service.priceLabel}</span>
                </div>

                <h3 className={`${merriweather.className} text-lg font-semibold text-foreground leading-snug`}>{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>

                <ul className="mt-4 space-y-2 text-sm text-foreground">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs font-light text-muted-foreground">{service.perfectFor}</p>

                <div className="mt-auto pt-5">
                  <Link href={service.link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full" variant={service.featured ? "default" : "outline"}>{service.cta}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Card className="mx-auto mt-8 max-w-2xl border-red-200 bg-red-50">
            <CardContent className="p-4 text-center text-sm font-semibold text-red-700">
              Only 5 spaces available this month for the Intensive Program.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Real Results
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold text-foreground sm:text-4xl`}>
              What Our Clients Are Saying
            </h2>
            <p className="mt-3 text-muted-foreground">Real women. Real hair. Real change.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author}>
                <CardContent className="p-6">
                  <p className="text-base">{testimonial.stars}</p>
                  <p className="mt-3 text-sm italic leading-7 text-foreground">"{testimonial.text}"</p>
                  <p className="mt-4 font-semibold text-primary">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className={`${merriweather.className} text-center text-3xl font-semibold sm:text-4xl`}>Four Steps to the Hair You've Always Wanted</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-primary-foreground/80">
            Getting started is as simple as sending a message.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-semibold text-accent-foreground">
                  {index + 1}
                </div>
                <h3 className={`${merriweather.className} mt-4 text-lg font-semibold`}>{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/80">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className={`${merriweather.className} text-center text-3xl font-semibold text-foreground sm:text-4xl`}>
            Flexible Payment Options
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Investing in your hair should never feel out of reach.
          </p>
          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-3">
            {paymentMethods.map((method) => (
              <span key={method} className="rounded-lg border bg-muted/60 px-4 py-2 text-sm font-medium text-primary">
                {method}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              FAQ
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold text-foreground sm:text-4xl`}>
              Your Questions, Answered
            </h2>
            <p className="mt-3 text-muted-foreground">Honest answers for Nigerian women who've heard it all before.</p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-5">
                  <h3 className={`${merriweather.className} text-base font-semibold text-primary`}>{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className={`${merriweather.className} text-4xl font-semibold leading-tight sm:text-5xl`}>
            Your Hair Journey Starts Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
            Stop waiting for the right time. Your hair is ready when you are. Let's build your routine, restore your scalp, and grow the hair you've always wanted together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryServiceLink} target="_blank" rel="noopener noreferrer">
              <Button className="font-semibold">Start Now</Button>
            </Link>
            <Link href="#services">
              <Button variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
