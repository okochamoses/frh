import crypto from "crypto";
import mailService from "@/lib/mail/MailService";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://flourishrootshair.com";

function makeCompleteUrl(bookingId, review) {
  const token = crypto
    .createHmac("sha256", process.env.BOOKING_SECRET || "")
    .update(bookingId)
    .digest("hex");
  return `${APP_URL}/api/bookings/${bookingId}/complete?token=${token}&review=${review}`;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { bookingId, userEmail, userFirstName, userMobileNumber, services, servicesText, startTime, totalAmount } = body;

  if (!userEmail) {
    return Response.json({ error: "userEmail is required" }, { status: 400 });
  }

  const completeUrl       = bookingId ? makeCompleteUrl(bookingId, false) : null;
  const completeReviewUrl = bookingId ? makeCompleteUrl(bookingId, true)  : null;

  const booking = { userEmail, userFirstName, userMobileNumber, services, servicesText, startTime, totalAmount, completeUrl, completeReviewUrl };

  const [clientResult, ownerResult] = await Promise.allSettled([
    mailService.sendBookingConfirmation({ to: userEmail, booking }),
    mailService.sendOwnerNotification(booking),
  ]);

  if (clientResult.status === "rejected")
    console.error("[notify] client email failed:", clientResult.reason);
  if (ownerResult.status === "rejected")
    console.error("[notify] owner email failed:", ownerResult.reason);

  const allFailed = clientResult.status === "rejected" && ownerResult.status === "rejected";
  if (allFailed) {
    return Response.json({ error: "Failed to send emails" }, { status: 500 });
  }

  return Response.json({ success: true });
}