import { validateEmail } from "@/lib/auth/validators";

const SYSTEME_API_BASE = "https://api.systeme.io";
const LEAD_GEN_TAG_ID = 1957649;
const FIRST_NAME_SLUG = "first_name";

export async function POST(req) {
  try {
    const body = await req.json();

    const emailValidation = validateEmail(body.email);
    if (!emailValidation.valid) {
      return Response.json({ error: emailValidation.error }, { status: 400 });
    }
    const email = body.email.trim();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : undefined;

    const apiKey = process.env.SYSTEME_IO_API_KEY;
    if (!apiKey) {
      console.error("Lead magnet: SYSTEME_IO_API_KEY is not set.");
      return Response.json(
        { error: "Newsletter signup is not configured." },
        { status: 503 }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    };

    const fields = firstName ? [{ slug: FIRST_NAME_SLUG, value: firstName }] : [];

    const res = await fetch(`${SYSTEME_API_BASE}/api/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, fields }),
    });

    const data = await res.json().catch((err) => {
      console.error("Lead magnet: failed to parse contact response:", err);
      return {};
    });

    if (!res.ok) {
      const alreadyExists = data.violations?.some((v) =>
        v.message?.toLowerCase().includes("already used")
      );
      if (alreadyExists) return Response.json({ success: true });
      const message = data.detail || data.message || data.error || "Failed to subscribe.";
      return Response.json({ error: message }, { status: res.status });
    }

    if (data.id) {
      fetch(`${SYSTEME_API_BASE}/api/contacts/${data.id}/tags`, {
        method: "POST",
        headers,
        body: JSON.stringify({ tagId: LEAD_GEN_TAG_ID }),
      })
        .then((tagRes) => {
          if (!tagRes.ok) {
            console.error(`Failed to add Lead Gen tag to contact ${data.id} (${email})`);
          }
        })
        .catch((err) => {
          console.error(`Tag request failed for contact ${data.id} (${email}):`, err);
        });
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