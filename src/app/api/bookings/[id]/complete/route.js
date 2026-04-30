import crypto from "crypto";
import { getBookingById, markBookingComplete } from "@/lib/firebase/adminBookingService";
import mailService from "@/lib/mail/MailService";

const DARK = "#120D07";
const GOLD = "#DDA15E";

function verifyToken(bookingId, token) {
  const expected = crypto
    .createHmac("sha256", process.env.BOOKING_SECRET || "")
    .update(bookingId)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

function htmlPage(title, message, isError = false) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — FRH</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f5f0; font-family: Georgia, serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); max-width: 460px; width: 100%; overflow: hidden; }
    .bar { height: 4px; background: ${isError ? "#BD2E2E" : GOLD}; }
    .header { background: ${DARK}; padding: 24px 32px; text-align: center; }
    .header p { color: ${GOLD}; font-size: 18px; letter-spacing: 0.04em; }
    .body { padding: 32px; text-align: center; }
    h1 { font-size: 22px; color: ${DARK}; margin-bottom: 12px; }
    p { font-size: 15px; color: rgba(18,13,7,0.65); line-height: 1.7; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="card">
    <div class="bar"></div>
    <div class="header"><p>Flourish Roots Hair</p></div>
    <div class="body">
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token  = searchParams.get("token") || "";
  const review = searchParams.get("review") === "true";

  if (!verifyToken(id, token)) {
    return htmlPage("Invalid Link", "This link is invalid or has expired.", true);
  }

  let booking;
  try {
    booking = await getBookingById(id);
  } catch (err) {
    console.error("[complete] Firestore read error:", err);
    return htmlPage("Something went wrong", "We couldn't retrieve this booking. Please try again.", true);
  }

  if (!booking) {
    return htmlPage("Not Found", "This booking could not be found.", true);
  }

  if (booking.status === "completed") {
    return htmlPage(
      "Already marked complete",
      `${booking.userFirstName || "The client"} was already notified. No further action needed.`
    );
  }

  try {
    await markBookingComplete(id);
  } catch (err) {
    console.error("[complete] Firestore update error:", err);
    return htmlPage("Something went wrong", "We couldn't update this booking. Please try again.", true);
  }

  try {
    if (review) {
      await mailService.sendServiceCompleteWithReview({
        to:      booking.userEmail,
        booking: { userFirstName: booking.userFirstName },
      });
    } else {
      await mailService.sendServiceComplete({
        to:      booking.userEmail,
        booking: { userFirstName: booking.userFirstName },
      });
    }
  } catch (err) {
    console.error("[complete] email send error:", err);
    // Booking is already marked complete — don't fail the page over email
  }

  return htmlPage(
    "Done!",
    `${booking.userFirstName || "The client"} has been notified${review ? " and asked for a review" : ""}. All done.`
  );
}
