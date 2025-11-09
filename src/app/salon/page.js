"use client"

import React, {useEffect, useState} from 'react';
import {Bagelan, merriweather} from "@/app/layout";
import Marquee from "react-fast-marquee";
import services from "./services.json"
import dayjs from "dayjs";
import {FreeMode, Navigation, Pagination} from "swiper/modules";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faAngleLeft, faAngleRight, faCalendar, faCalendarAlt, faClock,
} from "@fortawesome/free-solid-svg-icons";
import {CiCalendar, CiClock2} from "react-icons/ci";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {FaFacebook} from "react-icons/fa6";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import {Label} from "@/components/ui/label";
import {BookingProvider, useBooking} from "@/app/contexts/BookingContext";
import {useAuth} from "@/app/contexts/AuthContext";
import utc from 'dayjs/plugin/utc';
import {useRouter} from "next/router";

dayjs.extend(utc);

const SalonServicesPage = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [categorizedServices, setCategorizedServices] = useState({featured: []})
  const [day, setDay] = useState(dayjs().startOf("day"));
  const [availableDays, setAvailableDays] = useState([]);
  const [isPhoneRequired, setIsPhoneRequired] = useState(false);
  const [chooseService, setChooseService] = useState()

  const { displayAuthModal, loading, token, user, isValidToken } = useAuth();
  const { bookingLoader, bookingTime, bookService } = useBooking();
  const router = useRouter()

  const categorizeServices = () => {
    const categorizedServices = {featured: []};
    services.forEach(service => {
      if (service?.featured) {
        categorizedServices.featured.push(service)
      }
      if (categorizedServices[service.category]) {
        categorizedServices[service.category].push(service)
      } else {
        categorizedServices[service.category] = [service]
      }
    });
    return categorizedServices;
  }

  const computeWorkDays = () => (
    Array.from({ length: 30 }, (_, i) => {
      const day = dayjs().add(i, "day").startOf("day");
      return {
        day,
        isOffDay: day.day() === 1,
      }
    })
  )

  useEffect(() => {
    setCategorizedServices(categorizeServices());
    setAvailableDays([...availableDays, ...computeWorkDays()]);
  }, [services]);

  const handleServiceSelect = (title) => {
    setSelectedServices((prev) =>
        prev.some((s) => s.title === title)
            ? prev.filter((s) => s.title !== title)
            : [...prev, ...services.filter(s => s.title === title)]
    );
  }

  const handleSubmit = async () => {
    console.log(isValidToken())
    if (isValidToken()) {
      console.log(1)
      if (!chooseService) {
        setChooseService(true);
        console.log(2)
        return;
      }
      console.log(3)
      // handle the full submission
      const res = await bookService(bookingTime, selectedServices);
      if (res.status) {
        // show the booking confirmation
        router.push('/bookingConfirmation')
      }
    }
    if (!chooseService) {
      setChooseService(true);
      return;
    }
    if(chooseService && !isValidToken()) displayAuthModal();
    if (!chooseService && bookingTime?.isSame(bookingTime?.startOf("day"))) {
      console.log("Error, please book time")
    }
  }

  const totalTime = () => selectedServices.reduce((acc, curr) => acc + curr?.duration, 0);

  return (
      <section className="px-6 flex flex-col pt-24">
          <section className="max-w-[1600px] md:px-10 lg:px-40 m-auto">

            <div className="grid grid-cols-3 gap-8">

              {/*Select booking time*/}
              <div className={`${chooseService ? "block":"hidden"} col-span-3 md:col-span-2`}>
                <h2 className={`${merriweather.className} text-4xl font-bold md:text-left text-center`}>Select Time</h2>
                <Booking />
              </div>

              <div className={`${!chooseService ? "block":"hidden"} col-span-3 md:col-span-2`}>
                <h2 className={`${merriweather.className} text-4xl font-bold md:text-left text-center`}>Services</h2>
                {
                  Object.keys(categorizedServices).map((cs, index) =>
                      <div key={index}>
                        <h3 className="capitalize text-2xl font-bold my-5">{cs}</h3>
                        <ServiceItems cs={categorizedServices[cs]} handleSelect={handleServiceSelect} selectedServices={selectedServices} />
                      </div>
                  )
                }
              </div>

              <div className="hidden md:block rounded-2xl p-6 border h-fit sticky top-24 self-start">
                <h3 className="font-bold text-2xl">Selected</h3>

                <hr className="my-6"/>
                {
                  bookingTime ? (
                      <div className="pb-5 text-gray-500 text-sm">
                        <p className="flex items-center gap-2"><CiCalendar />{bookingTime.format("dddd, D MMMM")}</p>
                        <p className="flex items-center gap-2"><CiClock2 />{bookingTime.format("HH:mm")}-{bookingTime.add(totalTime(), "minutes").format("HH:mm")} ({convertToHour(totalTime())} duration)</p>
                      </div>
                  ) : undefined
                }
                {
                  selectedServices.length === 0 ?
                      <p>No services selected</p>:
                      selectedServices.map((service, idx) => <SelectedServiceItem key={idx}  {...service} />)

                }
                <hr className="my-6"/>
                <div className="flex flex-row justify-between font-bold pb-6">
                  <span>Total</span>
                  <span>₦{selectedServices.reduce((acc, curr) => acc + curr.price, 0).toLocaleString('en-US')}</span>
                </div>
                  <Button className="w-full" disabled={!selectedServices.length} onClick={handleSubmit} isLoading={bookingLoader}>Continue</Button>
                  <AddPhoneNumber isOpen={token && !user?.mobileNumber && chooseService} setIsPhoneRequired={setIsPhoneRequired} />
              </div>
            </div>
            {/*Mobile bar for selections*/}
            <div className="md:hidden fixed flex justify-between items-center bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
              <div className="font-bold">
                <p>₦{selectedServices.reduce((acc, curr) => acc + curr.price, 0).toLocaleString('en-US')}</p>
                <p>{selectedServices.length ? selectedServices.length : "No"} services • {convertToHour(selectedServices.reduce((acc, curr) => acc + curr.duration, 0))}</p>
              </div>
              <Button className="w-full" disabled={!selectedServices.length} onClick={handleSubmit} isLoading={bookingLoader}>Continue</Button>
            </div>
          </section>


          <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
            <span
                className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>SALON SERVICES •&nbsp;</span>
          </Marquee>
        </section>
  );
}

const ServiceItems = (props) => (
    props.cs.map(({title, duration, Description, price}, index) => (
        <div className="flex justify-between p-5 my-3 border rounded-xl cursor-pointer hover:bg-gray-200" key={index}>
          <div className="w-full">
            <p className="text-lg">{title}</p>
            <p className="text-gray-500 text-sm">{convertToHour(duration)}</p>
            <p className="text-gray-500 text-sm">{Description}</p>
            <p className="pt-3">₦{price.toLocaleString('en-US')}</p>
          </div>
          <div className="m-auto" onClick={() => props.handleSelect(title)}>
            {
              props.selectedServices.some(s => s.title === title) ?
                  <div className="flex items-center justify-center h-8 w-8 bg-blue-700 rounded hover:bg-blue-800 text-white">-</div> :
                  <div className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded hover:bg-gray-300">+</div>
            }
          </div>
        </div>
    ))
)

const SelectedServiceItem = ({title, price, duration}) => (
    <div className="pb-4">
      <div className="flex flex-row">
        <div className="basis-4/5">{title}</div>
        <div className="basis-1/5 text-right">₦{price.toLocaleString('en-US')}</div>
      </div>
      <div className="text-sm text-gray-400">{convertToHour(duration)}</div>
    </div>
)

const convertToHour = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return (hour > 0 ? `${hour}h` : '') + (hour === 0 || remainingMins === 0 ? '' : ', ') + (remainingMins > 0 ? `${remainingMins}m`: '')
}

const Booking = () => {
  const { availableDays, availableTimes, bookingTime, updateBookingTime } = useBooking();

  return (
      <div>
        <div className="flex justify-between items-center py-5">
          <p className="font-bold">{dayjs().format("MMMM, YYYY")}</p>
          <div className="w-16 flex justify-between">
            <span className="swiper-button-prev-custom cursor-pointer">
              <FontAwesomeIcon icon={faAngleLeft} className="" />
            </span>
            <span className="swiper-button-next-custom cursor-pointer">
              <FontAwesomeIcon icon={faAngleRight} className="" />
            </span>
          </div>
        </div>
        <div className="w-full pb-5">
          <Swiper
              slidesPerView={7}
              slidesPerGroup={7}
              speed={800}
              freeMode={true}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              modules={[FreeMode, Navigation, Pagination]}
              className="mySwiper"
              breakpoints={{
                0: {
                  slidesPerView: 4,   // 📱 mobile
                  slidesPerGroup: 4,  // ✅ match group size
                },
                768: {
                  slidesPerView: 7,   // 💻 tablets and up
                  slidesPerGroup: 7,
                },
              }}
              style={{
                ["--swiper-wrapper-transition-timing-function"]: "cubic-bezier(0.79, 0.33, 0.14, 0.53)",
              }}
          >
            {availableDays.map(
                ({day, isOffDay}, index) => (
                    <SwiperSlide
                        key={index}
                        style={{display: "flex", justifyContent: "center"}}
                        className="flex-col justify-center items-center"
                    >
                      <div
                          className={`${merriweather.className} flex justify-center items-center h-16 w-16 border rounded-full text-3xl font-bold ${isOffDay ? "line-through text-gray-300" : ""} ${bookingTime?.format('DD/MM/YYYY') === day.format('DD/MM/YYYY') ? "bg-blue-600 text-white" : "bg-white text-black"}  cursor-pointer`}
                          onClick={() => updateBookingTime(day)}
                      >
                        <span>{day?.format("DD")}</span>
                      </div>
                      <p className={"text-center"}>{day.format("ddd")}</p>
                    </SwiperSlide>
                )
            )}
          </Swiper>
        </div>

        <div>
          {
            (bookingTime ? availableTimes[bookingTime.format("DD/MM/YYYY")] : availableTimes[dayjs().format("DD/MM/YYYY")])?.map((time, index) => (
              <div
                  key={index}
                  className={`border p-5 rounded-lg my-2 hover:bg-gray-200 ${
                      bookingTime?.isSame(time)
                          ? "border-2 border-blue-600 bg-gray-100"
                          : "border-gray-200"
                  }`}
                  onClick={() => updateBookingTime(time)}
              >
                {time.format("HH:mm")}
              </div>
            ))
          }
        </div>
      </div>
  )
}

const AddPhoneNumber = () => {
  const { token, user, setUser } = useAuth();
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneProvided, setPhoneProvided] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isOpen = token && !user?.mobileNumber && !phoneProvided;
  if (!isOpen) return null;

  const validate = () => {
    if (!/^(?:\+234|0)/.test(phone)) {
      setError("Number must start with +234 or 0");
      return false;
    }
    setError("");
    return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true)
    const {data, status} = await axios.patch('/api/user', {id: user.id, mobileNumber: phone});
    if(status !== 200) return; // log a something went wrong error
    setUser(data)
    setPhoneProvided(true);
    setIsLoading(false);
  }

  const onChange = (e) => {
    const phone = e.target.value.trim();
    // Allow only + at start and digits
    if (/^\+?[0-9]*$/.test(phone)) {
      setPhone(phone);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={() => setPhoneProvided(true)}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className={"text-2xl"}>Add Phone</DialogTitle>
            <DialogDescription>
              Enter your phone number to confirm your appointment
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link">
                Mobile Number
              </Label>
              <Input className="h-12" id="link" value={phone} onChange={onChange} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
              <Button className="w-full" type="submit" onClick={handleSubmit}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};



const SalonServices = () => <BookingProvider><SalonServicesPage /></BookingProvider>

export default SalonServices;