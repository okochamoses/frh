import mailService from "@/lib/mail/MailService";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { userEmail, userFirstName, userMobileNumber, services, servicesText, startTime, totalAmount } = body;

  if (!userEmail) {
    return Response.json({ error: "userEmail is required" }, { status: 400 });
  }

  const booking = { userEmail, userFirstName, userMobileNumber, services, servicesText, startTime, totalAmount };

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