import {Booking} from "../../models/Booking";
import Repository from "@/lib/repositories/Repository";

class BookingService {
  private bookingRepository: Repository<Booking>;
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository
  }


  async addBooking(request: any) {
    const {
      fromTime, toTime, services, user
    } = request;

    const booking: Booking = new Booking()
    booking.servicesJson = JSON.stringify(services);
    booking.servicesText = services.map(s => s.title).join('|');
    booking.startTime = fromTime;
    booking.endTime = toTime;
    booking.email = user.email;
    booking.userId = user.id;
    booking.firstName = user.firstName;
    booking.mobileNumber = user.mobileNumber;
    booking.totalAmount = services.reduce((sum, s) => sum + s.price, 0);

    const savedBooking = await this.bookingRepository.create(booking)

    return savedBooking;
  }
}

export default BookingService;