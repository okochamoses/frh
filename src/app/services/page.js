"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import services from "../salon/services.json"; // adjust path if needed
import { merriweather } from "@/app/layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const convertToHour = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return (
      (hour > 0 ? `${hour}h` : "") +
      (hour === 0 || remainingMins === 0 ? "" : ", ") +
      (remainingMins > 0 ? `${remainingMins}m` : "")
  );
};

const SalonServicesOnly = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Separate featured from normal services
  const featuredServices = useMemo(
      () => services.filter((s) => s.featured),
      []
  );
  const otherServices = useMemo(
      () => services.filter((s) => !s.featured),
      []
  );

  // ✅ Filtered services when searching
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return services
        .filter((s) =>
            s.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
        .sort((a, b) => a.title.localeCompare(b.title));
  }, [searchTerm]);

  // ✅ Decide what to show: featured + all OR just filtered
  const displayFeatured = !searchTerm.trim();

  return (
      <section className="px-6 flex flex-col pt-24 pb-56">
        <section className="max-w-[1600px] md:px-10 lg:px-40 m-auto">
          {/* Header */}
          <h2
              className={`${merriweather.className} text-4xl font-bold md:text-left text-center mb-6`}
          >
            Salon Services
          </h2>

          {/* Search Bar */}
          <div className="w-full mb-10 flex justify-center">
            <Input
                type="text"
                placeholder="Search hairstyle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-lg w-full h-12 text-lg"
            />
          </div>

          {/* FEATURED SECTION */}
          {displayFeatured && featuredServices.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold mb-6">Featured</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredServices.map((service, index) => (
                      <ServiceCard
                          key={`featured-${index}`}
                          service={service}
                          onClickImage={() => setSelectedImage(service.image)}
                      />
                  ))}
                </div>
              </div>
          )}

          {/* SERVICES SECTION */}
          <div>
            <h3 className="text-2xl font-bold mb-6">
              {displayFeatured ? "All Services" : "Search Results"}
            </h3>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(displayFeatured ? otherServices : filteredServices).length === 0 ? (
                  <p className="text-gray-500 italic">No matching services found.</p>
              ) : (
                  (displayFeatured ? otherServices : filteredServices).filter(s => !s.header).map(
                      (service, index) => (
                          <ServiceCard
                              key={index}
                              service={service}
                              onClickImage={() => setSelectedImage(service.image)}
                          />
                      )
                  )
              )}
            </div>
          </div>
        </section>

        {/* IMAGE PREVIEW MODAL */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            {selectedImage && (
                <div className="relative w-full h-[500px]">
                  <Image
                      src={selectedImage}
                      alt="Service preview"
                      fill
                      className="object-cover rounded-xl"
                  />
                </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
  );
};

/* Reusable service card */
const ServiceCard = ({ service, onClickImage }) => (
    <div className="border rounded-2xl p-5 flex flex-col hover:shadow-md transition">
      <div
          className="relative w-full h-96 mb-4 cursor-pointer"
          onClick={onClickImage}
      >
        <Image
            src={service?.imageUrl || "/placeholder.png"}
            alt={service.title}
            fill
            className="object-cover rounded-xl"
        />
      </div>
      <h3 className="text-lg font-semibold">{service.title}</h3>
      <p className="text-gray-500 text-sm mb-1">
        {convertToHour(service.duration)}
      </p>
      <p className="text-gray-500 text-sm mb-2">{service.Description}</p>
      <p className="text-lg font-bold text-blue-600">
        ₦{service.price.toLocaleString("en-US")}
      </p>
    </div>
);

export default SalonServicesOnly;
