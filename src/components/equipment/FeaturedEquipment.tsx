
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

const equipment = [
  {
    id: 1,
    name: "Heavy Duty Excavator",
    category: "Construction",
    price: 8500,
    location: "Sylhet, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=800",
  },
  {
    id: 2,
    name: "Industrial Generator",
    category: "Power Equipment",
    price: 2500,
    location: "Dhaka, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
  },
  {
    id: 3,
    name: "Modern Bulldozer",
    category: "Construction",
    price: 6500,
    location: "Moulvibazar, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
  },
  {
    id: 4,
    name: "Professional Forklift",
    category: "Material Handling",
    price: 3500,
    location: "Chattogram, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
  },
  {
    id: 5,
    name: "Concrete Mixer",
    category: "Construction",
    price: 1800,
    location: "Sylhet, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
  },
  {
    id: 6,
    name: "Agricultural Tractor",
    category: "Agriculture",
    price: 4000,
    location: "Moulvibazar, Bangladesh",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export default function FeaturedEquipment() {
  return (
    <section className="bg-[#F5F1E8] px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[3px] text-[#C98B52]">
              Explore Our Collection
            </span>

            <h2 className="mt-3 text-3xl font-bold text-[#24352D] md:text-4xl">
              Featured Equipment
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-gray-600">
              Discover reliable equipment for your next project.
              Choose the right tools and machinery at affordable prices.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 font-semibold text-[#24352D] transition hover:text-[#C98B52]"
          >
            View All Equipment
            <ArrowRight size={19} />
          </Link>
        </div>

        {/* Equipment Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {equipment.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -7 }}
              className="group overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Equipment Image */}
              <div className="relative h-56 overflow-hidden bg-[#E9EDE5]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <span className="absolute left-4 top-4 rounded-full bg-[#24352D] px-4 py-2 text-xs font-semibold text-white">
                  {item.category}
                </span>
              </div>

              {/* Equipment Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#24352D]">
                  {item.name}
                </h3>

                <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} className="text-[#C98B52]" />
                  {item.location}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                  <div>
                    <p className="text-xs text-gray-500">
                      Rental Price
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#24352D]">
                      ৳{item.price.toLocaleString("en-BD")}
                      <span className="text-sm font-normal text-gray-500">
                        {" "}/ day
                      </span>
                    </p>
                  </div>

                  <Link
                    href={`/equipment/${item.id}`}
                    className="rounded-xl bg-[#24352D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C98B52] hover:text-[#24352D]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
