"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { merriweather, Bagelan } from "@/app/layout"
import services from "../salon/services.json"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const BOOKING_URL =
  "https://www.fresha.com/a/flourish-roots-hair-co-lagos-ago-palace-way-bxvf8kef/booking?allOffer=true&menu=true&pId=1427796"

const CATEGORIES = ["All", ...Array.from(new Set(services.map((s) => s.category))).sort()]

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ")
}

// ── Service card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, onClickImage }) {
  return (
    <div className="group flex flex-col bg-white overflow-hidden rounded-sm border border-stone-100 hover:border-stone-300 transition-colors duration-300">

      {/* Image */}
      <div
        className="relative w-full h-96 overflow-hidden cursor-pointer bg-stone-100 flex-shrink-0"
        onClick={() => onClickImage(service.imageUrl)}
      >
        <Image
          src={service.imageUrl || "/placeholder.png"}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {service.featured && (
          <span className={`${merriweather.className} absolute top-3 left-3 bg-[#DDA15E] text-[#120D07] text-[9px] tracking-widest uppercase px-2 py-1`}>
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <span className={`${merriweather.className} text-[9px] tracking-widest uppercase text-[#BD2E2E] mb-2`}>
          {service.category}
        </span>

        <h3 className={`${merriweather.className} text-sm font-bold text-stone-900 leading-snug mb-1 flex-1`}>
          {service.title}
        </h3>

        {service.Description && (
          <p className="text-stone-400 text-xs leading-relaxed mt-1 mb-3 line-clamp-2">
            {service.Description}
          </p>
        )}

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-stone-100">
          <div>
            <p className={`${merriweather.className} text-xl text-[#120D07]`}>
              ₦{service.price.toLocaleString("en-US")}
            </p>
            {service.duration > 0 && (
              <p className="text-stone-400 text-xs mt-0.5">{formatDuration(service.duration)}</p>
            )}
          </div>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${merriweather.className} text-[9px] tracking-widest uppercase bg-[#120D07] text-white px-4 py-2.5 hover:bg-[#BD2E2E] transition-colors duration-200`}
          >
            Book
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [search, setSearch]     = useState("")
  const [category, setCategory] = useState("All")
  const [preview, setPreview]   = useState(null)

  const filtered = useMemo(() => {
    return services
      .filter((s) => !s.header)
      .filter((s) => category === "All" || s.category === category)
      .filter((s) =>
        !search.trim() ||
        s.title.toLowerCase().includes(search.toLowerCase().trim())
      )
  }, [search, category])

  const featured = useMemo(() => filtered.filter((s) => s.featured), [filtered])
  const rest     = useMemo(() => filtered.filter((s) => !s.featured), [filtered])

  const isFiltering = !!search.trim() || category !== "All"

  return (
    <>
      {/* ── Dark hero ── */}
      <div className="bg-[#120D07] pt-36 pb-16 px-6 text-center">
        <p className={`${merriweather.className} text-[#DDA15E] text-xs tracking-[0.3em] uppercase mb-4`}>
          Flourish Roots Hair Co.
        </p>
        <h1 className={`${Bagelan.className} text-[clamp(3.5rem,12vw,8rem)] text-white leading-none`}>
          SALON SERVICES
        </h1>
      </div>

      {/* ── Sticky filter bar — offset by header height (h-20 = 80px) ── */}
      <div className="sticky top-20 z-30 bg-[#faf9f7] border-b border-stone-200 px-4 md:px-8 py-4">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Search */}
          <div className="relative flex-shrink-0 w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8.5" cy="8.5" r="5.75" />
              <path d="M13.5 13.5l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className={`${merriweather.className} w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-stone-200 focus:border-stone-800 outline-none transition-colors duration-200 placeholder-stone-400 text-stone-800`}
            />
          </div>

          {/* Category pills — horizontal scroll on all screen sizes */}
          <div
            className="flex gap-2 overflow-x-auto flex-1 w-full"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`${merriweather.className} flex-shrink-0 text-[9px] tracking-widest uppercase px-3 py-2 transition-colors duration-200 ${
                  category === cat
                    ? "bg-[#120D07] text-white"
                    : "bg-white border border-stone-200 text-stone-500 hover:border-stone-800 hover:text-stone-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <section className="bg-[#faf9f7] px-4 md:px-8 py-12 min-h-[60vh]">
        <div className="max-w-screen-xl mx-auto">

          {/* Featured — only show when not actively filtering */}
          {!isFiltering && featured.length > 0 && (
            <div className="mb-14">
              <p className={`${merriweather.className} text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5`}>
                Featured Services
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((s, i) => (
                  <ServiceCard key={`f-${i}`} service={s} onClickImage={setPreview} />
                ))}
              </div>
            </div>
          )}

          {/* All / filtered */}
          <div>
            <p className={`${merriweather.className} text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5`}>
              {isFiltering
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : "All Services"}
            </p>

            {(isFiltering ? filtered : rest).length === 0 ? (
              <p className={`${merriweather.className} text-stone-400 text-sm italic py-16 text-center`}>
                No services found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(isFiltering ? filtered : rest).map((s, i) => (
                  <ServiceCard key={i} service={s} onClickImage={setPreview} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── Image preview modal ── */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-sm">
          <DialogHeader className="sr-only">
            <DialogTitle>Service Preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="relative w-full h-[70vh]">
              <Image
                src={preview}
                alt="Service preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
