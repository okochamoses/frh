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
import {IoMdClose} from "react-icons/io";
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
import { Label } from "@/components/ui/label"
import {FcGoogle} from "react-icons/fc";
import {FaFacebook} from "react-icons/fa6";

const SalonServices = () => {
  const bookingSteps = {
    BOOK_TIME: "book-time",
    SELECT_SERVICE: "select-service",
  }

  const [selectedServices, setSelectedServices] = useState([]);
  const [categorizedServices, setCategorizedServices] = useState({featured: []})
  const [journey, setJourney] = useState(bookingSteps.SELECT_SERVICE) // select-service, book-time
  const [time, setTime] = useState();
  const [day, setDay] = useState(dayjs().startOf("day"));
  const [availableDays, setAvailableDays] = useState([]);

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

  const handleDaySelect = (day) => {
    setDay(day);
    // need to rerender the times and block out booked sessions
  }

  const handleTimeSelect = (time) => {
    setTime(time);
  }

  const handleSubmit = () => {
    if(journey === "select-service") {
      setJourney(bookingSteps.BOOK_TIME)
    }
    if (journey === bookingSteps.SELECT_SERVICE) {
      // do something
    }
  }
  const totalTime = () => selectedServices.reduce((acc, curr) => acc + curr?.duration, 0);

  return (
      <>
        <section className="px-6 flex flex-col pt-24">
          <section className="max-w-[1600px] md:px-10 lg:px-40 m-auto">

            <div className="grid grid-cols-3 gap-8">

              {/*Select booking time*/}
              <div className={`${journey === bookingSteps.BOOK_TIME ? "block":"hidden"} col-span-3 md:col-span-2`}>
                <h2 className={`${merriweather.className} text-4xl font-bold md:text-left text-center`}>Select Time</h2>
                <Booking availableDays={availableDays} chosenDay={day} chosenTime={time} handleDaySelect={handleDaySelect} handleTimeSelect={handleTimeSelect}/>
              </div>

              <div className={`${journey === bookingSteps.SELECT_SERVICE ? "block":"hidden"} col-span-3 md:col-span-2`}>
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
                  time ? (
                      <div className="pb-5 text-gray-500 text-sm">
                        <p className="flex items-center gap-2"><CiCalendar />{time.format("dddd, D MMMM")}</p>
                        <p className="flex items-center gap-2"><CiClock2 />{time.format("HH:mm")}-{time.add(totalTime(), "minutes").format("HH:mm")} ({convertToHour(totalTime())} duration)</p>
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
                {
                  journey === bookingSteps.BOOK_TIME ?
                      <Modal />
                      :
                      <button
                          className={`font-bold text-white w-full p-3 rounded-lg ${selectedServices.length
                          !== 0 ? "bg-black" : "bg-gray-300"}`}
                          disabled={selectedServices.length === 0}
                          onClick={handleSubmit}
                      >Continue
                      </button>
                }
              </div>
            </div>
            {/*Mobile bar for selections*/}
            <div className="md:hidden fixed flex justify-between items-center bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
              <div className="font-bold">
                <p>₦{selectedServices.reduce((acc, curr) => acc + curr.price, 0).toLocaleString('en-US')}</p>
                <p>{selectedServices.length ? selectedServices.length : "No"} services • {convertToHour(selectedServices.reduce((acc, curr) => acc + curr.duration, 0))}</p>
              </div>
              {
                journey === bookingSteps.BOOK_TIME ?
                    <Modal />
                    :
                    <button className={`mt-3 font-bold text-white w-32 p-3 rounded-lg ${selectedServices.length !== 0 ? "bg-black" : "bg-gray-300"}`} disabled={selectedServices.length === 0} onClick={handleSubmit}>
                      Continue
                    </button>
              }
            </div>
          </section>


          <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
            <span
                className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>SALON SERVICES •&nbsp;</span>
          </Marquee>
        </section>
      </>
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

const Booking = ({availableDays, chosenDay, chosenTime, handleDaySelect, handleTimeSelect}) => {
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
                          className={`${merriweather.className} flex justify-center items-center h-16 w-16 border rounded-full text-3xl font-bold ${isOffDay ? "line-through text-gray-300" : ""} ${chosenDay.isSame(day) ? "bg-blue-600 text-white" : "bg-white text-black"}  cursor-pointer`}
                          onClick={() => handleDaySelect(day)}
                      >
                        <span>{day.format("DD")}</span>
                      </div>
                      <p className={"text-center"}>{day.format("ddd")}</p>
                    </SwiperSlide>
                )
            )}
          </Swiper>
        </div>

        <div>
          {
            Array.from({ length: 30 }, (_, i) => dayjs().hour(9).minute(0).second(0).millisecond(0)).map((t, index) => {
              const time = t.add(index * 15, "minutes");
              return (
                  <div
                      className={`border p-5 rounded-lg my-2 hover:bg-gray-200 ${chosenTime?.isSame(time) ? "border-2 border-blue-600 bg-gray-100" : "border-gray-200"}`}
                      key={index}
                      onClick={() => handleTimeSelect(time)}
                  >
                    {time.format("hh:mm A")}
                  </div>
              )
            })
          }
        </div>
      </div>
  )
}

const Modal = () => (
  <Dialog>
    <form>
      <DialogTrigger asChild>
        <button
            className={`font-bold text-white w-full p-3 rounded-lg bg-black`}
        >Continue
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={"text-3xl"}>Log in or Sign up</DialogTitle>
          <DialogDescription className={"text-sm"}>
            Make changes to your profile here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid"><Button className={"my-1"} variant="outline"><FcGoogle /> Login with Google</Button></div>
          <div className="grid"><Button className={"my-1"} variant="outline"><FaFacebook className={"text-blue-600"} /> Login with Facebook</Button></div>

          <hr className={"m-4"} />

          <div className="grid gap-3">
            <Input className={"py-5"} id="email" name="email" type="email" placeholder="Email" />
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
)

// const Modal = ({toggle}) => {
//   const [isOpen, setIsOpen] = useState(false);
//
//   return (
//       <div className="relative">
//         {/* Open Button */}
//         <button
//             className="px-4 py-2 bg-blue-600 text-white rounded"
//             onClick={() => setIsOpen(true)}
//         >
//           Open Modal
//         </button>
//
//         {isOpen && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//               <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
//                 <h2 className="text-3xl font-bold my-3">Log in or Sign Up</h2>
//                 <p className="mb-4">Log in or sign up to complete your booking</p>
//                 <button className={"w-full border rounded-lg p-3 my-2"}>Continue with Facebook</button>
//                 <button className={"w-full border rounded-lg p-3 my-2"}>Continue with Google</button>
//
//                 <hr className={"my-6"} />
//
//                 <input className={"w-full border rounded-lg p-3 my-2"} />
//
//                 <button className={"w-full border rounded-lg p-3 my-2 font-bold text-white bg-black"} onClick={() => setIsOpen(false)}>Continue</button>
//
//                 {/* Close Icon */}
//                 <button
//                     className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//                     onClick={() => setIsOpen(false)}
//                 >
//                   <IoMdClose />
//                 </button>
//               </div>
//             </div>
//         )}
//       </div>
//   );
// }


export default SalonServices;