import { getUnremindedBookingsInWindow, markReminderSent } from "@/lib/firebase/adminBookingService";
import mailService from "@/lib/mail/MailService";

const SCHEDULER_SECRET = "59153cff-3ce5-4762-83d8-f0cd568b199e";
const WAT_OFFSET_MS    = 60 * 60 * 1000; // UTC+1

function toWATIso(ms) {
  return new Date(ms).toISOString().slice(0, 19);
}

export async function POST(req) {
  if (req.headers.get("secure") !== SCHEDULER_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Build the reminder window: bookings starting between now+45min and now+75min (WAT)
  const nowWAT       = Date.now() + WAT_OFFSET_MS;
  const windowStart  = toWATIso(nowWAT + 45 * 60 * 1000);
  const windowEnd    = toWATIso(nowWAT + 75 * 60 * 1000);

  let bookings;
  try {
    bookings = await getUnremindedBookingsInWindow(windowStart, windowEnd);
  } catch (err) {
    console.error("[scheduler] Firestore query error:", err);
    return Response.json({ error: "Failed to query bookings" }, { status: 500 });
  }

  if (bookings.length === 0) {
    return Response.json({ sent: 0 });
  }

  const results = await Promise.allSettled(
    bookings.map(async (booking) => {
      await mailService.sendAppointmentReminder({
        to:      booking.userEmail,
        booking: {
          userFirstName: booking.userFirstName,
          services:      booking.services ?? [],
          servicesText:  booking.servicesText,
          startTime:     booking.startTime,
        },
      });
      await markReminderSent(booking.id);
      return booking.id;
    })
  );

  const sent   = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected");

  failed.forEach((r, i) =>
    console.error(`[scheduler] reminder failed for booking index ${i}:`, r.reason)
  );

  return Response.json({ sent, failed: failed.length });
}
