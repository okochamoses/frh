import NewsletterService from "../../../lib/services/sheetsImpl/NewsletterService";
import NewsletterRepository from "../../../lib/repositories/sheetsImpl/NewsletterRepository";

const newsletterService = new NewsletterService(
    new NewsletterRepository()
);

export async function POST(req) {
  try {
    const { email } = await req.json();
    const result = await newsletterService.subscribe(email);
    return Response.json({ message: "Subscribed successfully", data: result }, { status: 200 });
  } catch (err) {
    console.error("Newsletter API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({message: "Up"})
}
