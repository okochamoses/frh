import Repository from "@/lib/repositories/Repository";
import {Booking} from "@/lib/models/Booking";

class BookingRepository extends Repository<Booking> {
  constructor() {
    super('Bookings');
  }
}

export default BookingRepository;