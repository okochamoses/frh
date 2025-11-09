import {createContext, useContext, useEffect, useState} from "react";
import services from "@/app/salon/services.json";
import dayjs from "dayjs";
import axios from "axios";
import {useAuth} from "@/app/contexts/AuthContext";

const BookingContext = createContext();
const OFF_DAYS = 'Monday';
const START_TIME = 9;
const END_TIME = 18;
const WORK_HOURS = END_TIME - START_TIME;
const OVERTIME = 2;

export const BookingProvider = ({ children }) => {
  const {user} = useAuth();

  const [booking, setBooking] = useState();
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingLoader, setBookingLoader] = useState(false);

  useEffect(() => {
    const days = [...availableDays, ...computeWorkDays()];
    setAvailableDays(days);
    setAvailableTimes(computeAvailableTimes(days));
  }, []);

  const computeWorkDays = () => (
      Array.from({ length: 30 }, (_, i) => {
        const day = dayjs().add(i, "day").startOf("day");
        return {
          day,
          isOffDay: day.day() === 1,
        }
      })
  )
  const computeAvailableTimes = (availableDays = []) => {
    let days = {};
    availableDays.filter(day => !day.isOffDay).forEach((day) => {
      let index = 0;
      while ((index * 15) / 60 <= WORK_HOURS) {
        const startOfWorkDay = dayjs(day.day).hour(START_TIME);
        const time = startOfWorkDay.add(index * 15, "minutes");
        const formattedDate = day.day.format("DD/MM/YYYY");

        if (!days[formattedDate]) {
          days[formattedDate] = [];
        }
        days[formattedDate].push(time)
        index++;
      }
    })
    return days;
  };

  const updateBooking = (updates) => {
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const updateBookingTime = (time) => {
    setBookingTime(time);
  }

  const bookService = async(bookingTime, services) => {
    setBookingLoader(true);
    const totalTime = services.reduce((acc, curr) => acc + curr?.duration, 0);
    const request = {
      fromTime: bookingTime.utc().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
      toTime: bookingTime.utc().add(totalTime, "minutes").add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
      services,
      user: user,
    }
    // save the booking via API
    const res = await axios.post('/api/booking', request);
    if (res.status !== 200) {
      // display error to user
    } else {
      // display successful booking message with booking details
      return {success: true}
    }
    setBookingLoader(false);
  }

  return (
    <BookingContext.Provider value={{
      availableDays,
      availableTimes,
      booking,
      bookingLoader,
      bookService,
      bookingTime,
      updateBooking,
      updateBookingTime,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
};
