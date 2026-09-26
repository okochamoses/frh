"use client";

import Image from "next/image";
import {
  Award,
  Calendar,
  ChevronRight,
  Check,
  Clock,
  Crown,
  Droplet,
  Gift,
  Info,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  User,
  ArrowRight,
} from "lucide-react";

import Button from "@/components/v2/ui/Button";
import Input from "@/components/v2/ui/Input";
import Select from "@/components/v2/ui/Select";
import Checkbox from "@/components/v2/ui/Checkbox";
import Radio from "@/components/v2/ui/Radio";
import ServiceCard from "@/components/v2/ui/ServiceCard";
import AppointmentCard from "@/components/v2/ui/AppointmentCard";
import ProductCard from "@/components/v2/ui/ProductCard";
import PromoCard from "@/components/v2/ui/PromoCard";
import TestimonialCard from "@/components/v2/ui/TestimonialCard";
import DatePicker from "@/components/v2/ui/DatePicker";
import TimeSlot from "@/components/v2/ui/TimeSlot";
import ProgressStepper from "@/components/v2/ui/ProgressStepper";
import SummaryBox from "@/components/v2/ui/SummaryBox";
import { SpecSection, SpecLabel, Swatch } from "@/components/v2/SpecSection";
import { ADDRESS_ONE_LINE } from "@/components/v2/salon";

const PILLARS = [
  { icon: Leaf, label: "Natural" },
  { icon: Award, label: "Expert" },
  { icon: ShieldCheck, label: "Trusted" },
  { icon: Crown, label: "Premium" },
];

const COLORS = [
  { name: "Wall", hex: "#F8F5EF" },
  { name: "Linen", hex: "#F1ECE4" },
  { name: "Line", hex: "#E6DDD1" },
  { name: "Glow", hex: "#F3E3CC" },
  { name: "Slat", hex: "#C08250" },
  { name: "Mustard", hex: "#FBB91C" },
  { name: "Espresso", hex: "#2B211A" },
  { name: "Fixture", hex: "#1A1A1A" },
];

const ICONS = [
  { icon: Calendar, label: "Calendar" },
  { icon: Clock, label: "Clock" },
  { icon: MapPin, label: "Location" },
  { icon: Check, label: "Check" },
  { icon: ArrowRight, label: "Arrow Right" },
  { icon: Droplet, label: "Hair" },
  { icon: Scissors, label: "Scissors" },
  { icon: Gift, label: "Bottle" },
  { icon: Leaf, label: "Leaf" },
  { icon: Gift, label: "Gift" },
  { icon: User, label: "User" },
  { icon: Phone, label: "Phone" },
  { icon: Mail, label: "Mail" },
  { icon: Info, label: "Info" },
  { icon: ChevronRight, label: "Chevron" },
];

const SPACING = [4, 8, 16, 24, 32, 40, 48, 64, 80, 96];

const RADII = [
  { label: "4px", value: "4px" },
  { label: "8px", value: "8px" },
  { label: "12px", value: "12px" },
  { label: "16px", value: "16px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "32px", value: "32px" },
  { label: "Full", value: "999px" },
];

const TYPE_SPECS = [
  {
    key: "Display",
    sample: "Rooted & Radiant",
    className: "type-display-lg",
    spec: "Icarus Nocturne\n32–44 • Regular",
  },
  {
    key: "Eyebrow",
    sample: "Character set // Flourish Roots",
    className: "type-eyebrow",
    spec: "Barlow Condensed\n12 • +0.18em",
  },
  {
    key: "H1",
    sample: "Hair that flourishes from root to tip.",
    className: "font-display text-v2-h1",
    spec: "Barlow Condensed\n48/48 • Semibold",
  },
  {
    key: "H2",
    sample: "Build your visit",
    className: "font-display text-v2-h2",
    spec: "Barlow Condensed\n36/38 • Semibold",
  },
  {
    key: "H3",
    sample: "Services & add-ons",
    className: "text-v2-h3 font-semibold",
    spec: "Manrope Semibold\n20/24",
  },
  {
    key: "Body",
    sample:
      "Holistic care for thicker, healthier hair. Backed by science. Rooted in tradition.",
    className: "text-v2-body",
    spec: "Manrope Regular\n16/24",
  },
  {
    key: "Small",
    sample: "We've sent a confirmation to your email address.",
    className: "text-v2-body-sm",
    spec: "Manrope Regular\n14/20",
  },
  {
    key: "Caption",
    sample: "10:00 AM • 2 hrs (Estimated)",
    className: "text-v2-label font-medium",
    spec: "Inter Medium\n12/16",
  },
];

const DATES = [
  { key: "12", weekday: "Mon", day: "12" },
  { key: "13", weekday: "Tue", day: "13" },
  { key: "14", weekday: "Wed", day: "14" },
  { key: "15", weekday: "Thu", day: "15" },
  { key: "16", weekday: "Fri", day: "16" },
];

const IMAGERY = [
  { src: "/salon.webp", alt: "Salon interior with arched mirrors and warm lighting" },
  { src: "/long-hair.webp", alt: "Editorial portrait of natural textured hair" },
  { src: "/product.webp", alt: "Amber product bottle on natural stone" },
  { src: "/gallery/IMG_6324.webp", alt: "Warm timber slat wall detail" },
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[var(--v2-container)] px-4 py-12 md:px-8 md:py-16">
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <div className="grid gap-12 border-b border-latte pb-14 lg:grid-cols-[0.85fr_1fr_1.35fr] lg:gap-10">
        <div className="lg:border-r lg:border-latte lg:pr-10">
          <h1 className="font-display text-display-xl text-ink">
            Flourish Roots<span className="text-slat">.</span>
          </h1>
          <p className="mt-2 text-v2-label font-semibold uppercase tracking-[0.18em] text-slat-ink">
            Design System
          </p>
          <p className="mt-6 max-w-[38ch] text-v2-body-sm text-ink-soft">
            A premium, warm and professional design system inspired by elegance,
            trust and care.
          </p>

          <ul className="mt-8 flex flex-wrap gap-8 border-t border-latte pt-8">
            {PILLARS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <Icon aria-hidden className="h-7 w-7 text-slat" strokeWidth={1.5} />
                <span className="text-v2-label uppercase tracking-wider text-ink-soft">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:border-r lg:border-latte lg:pr-10">
          <SpecSection title="Colors">
            <div className="grid grid-cols-4 gap-6">
              {COLORS.map((c) => (
                <Swatch key={c.name} {...c} />
              ))}
            </div>
          </SpecSection>
        </div>

        <SpecSection title="Typography">
          <div className="flex items-end gap-8">
            <p className="type-display-hero leading-none text-ink">Aa</p>
            <div className="pb-2">
              <p className="text-v2-body font-semibold text-ink">Icarus Nocturne</p>
              <SpecLabel>
                Display serif — headlines and pull quotes, 28px and up
              </SpecLabel>
            </div>
          </div>
          <div className="flex items-end gap-8">
            <p className="font-display text-[64px] leading-none text-ink">Aa</p>
            <div className="pb-2">
              <p className="text-v2-body font-semibold text-ink">Barlow Condensed</p>
              <SpecLabel>Subheads and eyebrows</SpecLabel>
            </div>
          </div>
          <div className="flex items-end gap-8">
            <p className="text-[64px] font-medium leading-none text-ink">Aa</p>
            <div className="pb-2">
              <p className="text-v2-body font-semibold text-ink">Manrope</p>
              <SpecLabel>Body text and UI</SpecLabel>
            </div>
          </div>

          <dl className="flex flex-col divide-y divide-latte border-t border-latte">
            {TYPE_SPECS.map((t) => (
              <div key={t.key} className="flex items-start gap-4 py-4">
                <dt className="w-14 shrink-0 text-v2-label uppercase tracking-wider text-ink-soft">
                  {t.key}
                </dt>
                <dd className="min-w-0 flex-1">
                  <p className={`${t.className} text-ink`}>{t.sample}</p>
                </dd>
                <p className="w-28 shrink-0 whitespace-pre-line text-right text-v2-label text-ink-soft">
                  {t.spec}
                </p>
              </div>
            ))}
          </dl>
        </SpecSection>
      </div>

      {/* ── Buttons / Icons · Forms · Cards ──────────────────────────── */}
      <div className="grid gap-12 border-b border-latte py-14 lg:grid-cols-[0.85fr_1fr_1.15fr] lg:gap-10">
        <div className="flex flex-col gap-12 lg:border-r lg:border-latte lg:pr-10">
          <SpecSection title="Buttons">
            <div className="grid grid-cols-[110px_1fr] items-center gap-y-6">
              <SpecLabel>Primary</SpecLabel>
              <Button withArrow className="justify-self-start">
                Book an appointment
              </Button>

              <SpecLabel>Secondary</SpecLabel>
              <Button variant="secondary" withArrow className="justify-self-start">
                Our services
              </Button>

              <SpecLabel>Tertiary (Text)</SpecLabel>
              <Button variant="tertiary" withArrow className="justify-self-start">
                View directions
              </Button>

              <SpecLabel>Icon button</SpecLabel>
              <div className="flex gap-3">
                <Button
                  variant="icon"
                  aria-label="Continue"
                  className="bg-deep text-white hover:bg-deep/90"
                >
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Button>
                <Button variant="icon" aria-label="Pick a date">
                  <Calendar aria-hidden className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SpecSection>

          <SpecSection title="Icons">
            <ul className="grid grid-cols-5 gap-y-6">
              {ICONS.map(({ icon: Icon, label }, i) => (
                <li key={`${label}-${i}`} className="flex flex-col items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-latte">
                    <Icon aria-hidden className="h-4 w-4 text-ink" strokeWidth={1.5} />
                  </span>
                  <span className="text-v2-label text-ink-soft">{label}</span>
                </li>
              ))}
            </ul>
          </SpecSection>
        </div>

        <div className="lg:border-r lg:border-latte lg:pr-10">
          <SpecSection title="Form Elements">
            <div className="flex flex-col gap-5">
              <div>
                <SpecLabel>Input / Default</SpecLabel>
                <Input placeholder="e.g. Chiamaka Okafor" className="mt-2" />
              </div>
              <div>
                <SpecLabel>Input / Filled</SpecLabel>
                <Input defaultValue="you@example.com" className="mt-2" readOnly />
              </div>
              <div>
                <SpecLabel>Input / Focus</SpecLabel>
                <Input
                  defaultValue="080 1234 5678"
                  readOnly
                  className="mt-2 border-ink ring-2 ring-ink/30"
                />
              </div>
              <div>
                <SpecLabel>Select</SpecLabel>
                <Select defaultValue="" className="mt-2">
                  <option value="" disabled>
                    Choose your style
                  </option>
                  <option>Braids</option>
                  <option>Locs</option>
                  <option>Extensions</option>
                </Select>
              </div>
              <div>
                <SpecLabel>Checkbox</SpecLabel>
                <div className="mt-3 flex flex-col gap-3">
                  <Checkbox label="Wash &amp; Detox" defaultChecked />
                  <Checkbox label="Deep Conditioning" />
                </div>
              </div>
              <div>
                <SpecLabel>Radio</SpecLabel>
                <div className="mt-3 flex flex-col gap-3">
                  <Radio name="ds-radio" label="Styling" defaultChecked />
                  <Radio name="ds-radio" label="Treatments" />
                </div>
              </div>
            </div>
          </SpecSection>
        </div>

        <SpecSection title="Cards">
          <div className="flex flex-col gap-6">
            <div>
              <SpecLabel>Service Item</SpecLabel>
              <ServiceCard
                className="mt-2"
                name="Wash &amp; Detox"
                description="Clarify &amp; cleanse"
                price="₦8,000"
                icon={<Droplet aria-hidden className="h-4 w-4" strokeWidth={1.5} />}
                selected
                onChange={() => {}}
              />
            </div>

            <div>
              <SpecLabel>Appointment Card</SpecLabel>
              <AppointmentCard
                className="mt-2"
                date="Tue, 13 May 2025"
                time="10:00 AM"
                duration="2 hrs"
                location={`Flourish Roots Hair Co., ${ADDRESS_ONE_LINE}`}
                directionsHref="#"
              />
            </div>

            <div>
              <SpecLabel>Promo Card</SpecLabel>
              <PromoCard
                className="mt-2"
                title="Keep it lush in between"
                body="A little routine goes a long way. We've curated a plan just for you."
                ctaLabel="See my hair plan"
              />
            </div>

            <div>
              <SpecLabel>Product Card</SpecLabel>
              <ProductCard
                className="mt-2"
                image="/product.webp"
                imageAlt="Hair growth oil in an amber bottle"
                name="Flourish Roots Hair Growth Oil"
                benefit="Nourish your roots and encourage strong, healthy growth."
                price="₦12,500"
              />
            </div>
          </div>
        </SpecSection>
      </div>

      {/* ── Spacing & radius ─────────────────────────────────────────── */}
      <div className="grid gap-12 border-b border-latte py-14 lg:grid-cols-2 lg:gap-10">
        <SpecSection title="Spacing System (8pt)">
          <ul className="flex items-end gap-4 overflow-x-auto pb-2">
            {SPACING.map((s) => (
              <li key={s} className="flex shrink-0 flex-col items-center gap-2">
                <span
                  className="block bg-latte"
                  style={{ width: s, height: s, borderRadius: 4 }}
                />
                <span className="text-v2-label text-ink-soft">{s}</span>
              </li>
            ))}
          </ul>
        </SpecSection>

        <SpecSection title="Border Radius">
          <ul className="flex gap-4 overflow-x-auto pb-2">
            {RADII.map((r) => (
              <li key={r.label} className="flex shrink-0 flex-col items-center gap-2">
                <span
                  className="block h-12 w-12 shrink-0 border border-latte bg-cream-100"
                  style={{ borderRadius: r.value }}
                />
                <span className="text-v2-label text-ink-soft">{r.label}</span>
              </li>
            ))}
          </ul>
        </SpecSection>
      </div>

      {/* ── UI component examples ────────────────────────────────────── */}
      <div className="border-b border-latte py-14">
        <h2 className="text-v2-label font-semibold uppercase tracking-[0.14em] text-ink">
          UI Component Examples
        </h2>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.35fr_1fr_1fr]">
          <div className="flex flex-col gap-8">
            <div>
              <SpecLabel>Date Picker</SpecLabel>
              <DatePicker className="mt-3 flex-wrap" dates={DATES} value="13" />
            </div>
            <div>
              <SpecLabel>Time Slots</SpecLabel>
              <div className="mt-3 flex flex-wrap gap-3">
                <TimeSlot time="9:00 AM" />
                <TimeSlot time="10:00 AM" selected />
                <TimeSlot time="11:00 AM" />
                <TimeSlot time="1:00 PM" />
                <TimeSlot time="2:00 PM" />
                <TimeSlot time="3:00 PM" />
              </div>
            </div>
          </div>

          <div>
            <SpecLabel>Testimonial Card</SpecLabel>
            <TestimonialCard
              className="mt-3"
              tone="cream"
              quote="I've never felt my hair this healthy and full of life. The care, the products, everything is amazing."
              name="Adaeze, Client"
              portrait="/gallery/IMG_6327.webp"
            />
          </div>

          <div>
            <SpecLabel>Progress Stepper</SpecLabel>
            <ProgressStepper
              className="mt-6"
              steps={["Build your visit", "Choose services", "Your details"]}
              current={1}
            />
          </div>

          <div>
            <SpecLabel>Summary Box</SpecLabel>
            <SummaryBox
              className="mt-3"
              items={[
                { label: "Wash & Detox", price: "₦8,000" },
                { label: "Deep Conditioning", price: "₦10,000" },
              ]}
              total="₦18,000"
            />
          </div>
        </div>
      </div>

      {/* ── Imagery ──────────────────────────────────────────────────── */}
      <div className="grid gap-10 py-14 lg:grid-cols-[260px_1fr]">
        <SpecSection title="Imagery Style">
          <p className="max-w-[32ch] text-v2-body-sm text-ink-soft">
            Warm, natural lighting. Elegant interiors. Real people. Natural
            elements. Premium and authentic.
          </p>
        </SpecSection>

        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {IMAGERY.map((img) => (
            <li
              key={img.src}
              className="relative aspect-[4/3] overflow-hidden rounded-v2-lg"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
