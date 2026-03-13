const SYSTEME_API_BASE = "https://api.systeme.io";
// If create fails with 404, try path: /api/v2/contacts (see systeme.io API docs).

export async function POST(req) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : undefined;

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const apiKey = process.env.SYSTEME_IO_API_KEY;
    if (!apiKey) {
      console.error("Lead magnet: SYSTEME_IO_API_KEY is not set.");
      return Response.json(
        { error: "Newsletter signup is not configured." },
        { status: 503 }
      );
    }

    const payload = { email };
    if (firstName) payload.firstName = firstName;

    const res = await fetch(`${SYSTEME_API_BASE}/api/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data.message || data.error || "Failed to subscribe.";
      return Response.json({ error: message }, { status: res.status });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Lead magnet API error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
