import { MapPin } from "lucide-react";
import { MAPS_URL } from "@/components/v2/location";
import { ADDRESS_ONE_LINE } from "@/components/v2/salon";
import {
  VIEW,
  PIN,
  BUILDINGS,
  MAJOR_ROADS,
  MINOR_ROADS,
  SERVICE_ROADS,
  STREET_LABELS,
} from "@/components/v2/mapGeometry";

/**
 * The salon's corner of Isolo, drawn rather than screenshotted.
 *
 * This replaces a screenshot of Google Maps, which was two problems at once:
 * Google's terms do not allow their map imagery to be used as a static asset,
 * and their palette — signal blue, POI red, highway gold, third-party shop
 * pins — fought every colour on the page and buried our own pin among the
 * bedding stores.
 *
 * The geometry is OpenStreetMap data (ODbL), projected once at build time into
 * `mapGeometry.js`, so this costs no API key, no request at runtime and about
 * 12kB gzipped. Being vector, it takes the brand palette directly and stays
 * crisp at any size — and it carries exactly the four streets somebody
 * actually navigates by, with nothing else competing for the pin.
 *
 * The attribution line is a licence condition. Leave it there.
 */
export default function SalonMap({ className = "", sizes }) {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open directions to Flourish Roots Hair Co., ${ADDRESS_ONE_LINE}, in Google Maps`}
      className={`group relative block overflow-hidden rounded-v2-4xl bg-cream-100 ${className}`}
    >
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
      >
        <rect width={VIEW.width} height={VIEW.height} className="fill-cream-100" />

        {/* Blocks first, as the quietest possible texture — they are there to
            tell you this is a dense neighbourhood, not to be read. */}
        <g className="fill-latte/70">
          {BUILDINGS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Roads are drawn casing-then-fill, widest class last, so junctions
            knit together instead of showing their seams. */}
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-cream-100"
        >
          {SERVICE_ROADS.map((d, i) => (
            <path key={`sc${i}`} d={d} strokeWidth={7} />
          ))}
          {MINOR_ROADS.map((d, i) => (
            <path key={`nc${i}`} d={d} strokeWidth={13} />
          ))}
          {MAJOR_ROADS.map((d, i) => (
            <path key={`mc${i}`} d={d} strokeWidth={26} />
          ))}
        </g>

        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {SERVICE_ROADS.map((d, i) => (
            <path key={`s${i}`} d={d} strokeWidth={3} className="stroke-ash/40" />
          ))}
          {MINOR_ROADS.map((d, i) => (
            <path key={`n${i}`} d={d} strokeWidth={8} className="stroke-sand" />
          ))}
          {MAJOR_ROADS.map((d, i) => (
            <path key={`m${i}`} d={d} strokeWidth={19} className="stroke-white" />
          ))}
        </g>

        {/* Street names ride along their own road, the way they do on a printed
            map — set in the body face, because the display face is drawn for
            headlines and turns to hairlines at this size. */}
        <g className="fill-ink-soft">
          {STREET_LABELS.map(({ name, x, y, angle, major }) => (
            <text
              key={name}
              x={x}
              y={y}
              transform={`rotate(${angle} ${x} ${y})`}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={major ? 20 : 15}
              letterSpacing={major ? 1.6 : 1.1}
              className={major ? "font-semibold uppercase" : "uppercase"}
              style={{ paintOrder: "stroke", stroke: "#f1ece4", strokeWidth: 5 }}
            >
              {name.replace(/ (Street|Avenue)$/, "")}
            </text>
          ))}
        </g>

        {/* The pin. Its tip is the actual point, with a soft halo behind it
            so the marker reads over blocks, roads and junctions alike — and
            the halo is centred on the tip rather than on the marker, because
            the tip is the bit that means "here". */}
        <g transform={`translate(${PIN.x} ${PIN.y})`}>
          <circle r={54} className="fill-mustard/15" />
          <circle r={30} className="fill-mustard/25" />
          <path
            d="M0 0c-6-13-21-23-21-38a21 21 0 1 1 42 0c0 15-15 25-21 38Z"
            className="fill-ink"
          />
          <circle cy={-38} r={8.5} className="fill-mustard" />
        </g>
      </svg>

      {/* Our own label, because the pin alone does not say whose it is. */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 mt-8 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2 font-display text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-white">
        Flourish Roots
      </span>

      <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-sand px-5 py-3 text-v2-body-sm font-semibold text-ink transition-transform duration-300 ease-out group-hover:-translate-y-1 md:bottom-6 md:left-6">
        <MapPin aria-hidden className="h-4 w-4" />
        Get directions
      </span>

      <span className="absolute bottom-2 right-3 text-[0.625rem] text-ash">
        © OpenStreetMap contributors
      </span>
    </a>
  );
}
