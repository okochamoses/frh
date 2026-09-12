import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppointmentCard({
  date,
  time,
  duration,
  location,
  directionsHref,
  className,
}) {
  return (
    <div className={cn("rounded-v2-xl border border-latte bg-white p-6", className)}>
      <ul className="flex flex-col gap-4">
        <li className="flex items-center gap-3">
          <Calendar aria-hidden className="h-4 w-4 text-slat" />
          <span className="text-v2-body text-ink">{date}</span>
        </li>
        <li className="flex items-center gap-3">
          <Clock aria-hidden className="h-4 w-4 text-slat" />
          <span className="text-v2-body text-ink">{time}</span>
          {duration && (
            <span className="text-v2-body-sm text-ink-soft">
              • {duration} (Estimated)
            </span>
          )}
        </li>
        <li className="flex items-center gap-3">
          <MapPin aria-hidden className="h-4 w-4 text-slat" />
          <span className="text-v2-body text-ink">{location}</span>
        </li>
      </ul>
      {directionsHref && (
        <a
          href={directionsHref}
          className="mt-5 inline-flex items-center gap-2 text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out hover:text-ink/70"
        >
          View directions
          <ArrowRight aria-hidden className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
