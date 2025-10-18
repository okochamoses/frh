import BookingService from "../../../lib/services/sheetsImpl/BookingService";
import BookingRepository from "../../../lib/repositories/sheetsImpl/BookingRepository";

const bookingService = new BookingService(
    new BookingRepository()
);

export async function POST(req) {
  try {
    const request = await req.json();
    const result = await bookingService.addBooking(request);
    return Response.json({ message: "Booking successful", data: result }, { status: 200 });
  } catch (err) {
    console.error("Booking API Error:", err);
    return Response.json({ error: "Oops! Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({message: "Up"})
}
