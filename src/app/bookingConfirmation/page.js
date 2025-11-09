"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import dayjs from "dayjs"
import {useBooking} from "@/app/contexts/BookingContext";

const BookingConfirmed = () => {
  const { booking } = useBooking();

  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-md border border-gray-200">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex flex-col items-center border-b pb-4 mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Booking Confirmed
              </h2>
              <p className="text-sm text-gray-500">
                Thank you! Your appointment has been scheduled.
              </p>
            </div>

            {/* Booking Info */}
            <div className="text-sm text-gray-600 mb-2">
              <div className="flex justify-between">
                <span>Booking ID</span>
                <span className="font-medium text-gray-800">
                {booking.id.slice(0, 8).toUpperCase()}
              </span>
              </div>
              <div className="flex justify-between">
                <span>Date Created</span>
                <span className="font-medium text-gray-800">
                {dayjs(booking.createdAt).format("MMM D, YYYY h:mm A")}
              </span>
              </div>
            </div>

            {/* Services Section */}
            <div className="border-t border-dashed my-4"></div>
            <div className="space-y-3">
              {booking.servicesJson.map((service, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{service.title}</p>
                      <p className="text-xs text-gray-500">{service.category}</p>
                    </div>
                    <span className="text-gray-800 font-semibold">
                  ₦{service.price.toLocaleString()}
                </span>
                  </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed my-4"></div>

            {/* Timing */}
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Start Time</span>
                <span className="font-medium text-gray-800">
                {dayjs(booking.startTime).format("MMM D, YYYY h:mm A")}
              </span>
              </div>
              <div className="flex justify-between">
                <span>End Time</span>
                <span className="font-medium text-gray-800">
                {dayjs(booking.endTime).format("h:mm A")}
              </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-dashed mt-4 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                <span>Total</span>
                <span>₦{booking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>We look forward to seeing you!</p>
              <p className="mt-1">
                {dayjs(booking.startTime).format("dddd, MMMM D, YYYY")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

export default BookingConfirmed
