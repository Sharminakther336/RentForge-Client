
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wrench } from "lucide-react";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
    },
  },
};

export default function Banner() {
  return (
    <section className="relative overflow-hidden rounded-b-[30px] bg-[#24352D] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">

        {/* LEFT CONTENT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.18,
              },
            },
          }}
          className="relative z-10"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#A8B9A5]/20 px-4 py-2 text-sm text-[#E9EDE5]"
          >
            <Wrench size={15} className="text-[#C98B52]" />
            EQUIPMENT RENTAL MARKETPLACE
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl leading-[1.12] font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            Rent Smart.
            <span className="block text-[#C98B52]">
              Build Better.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-lg text-base leading-8 text-[#E9EDE5]/80 md:text-lg"
          >
            Find the perfect equipment for every project.
            Discover quality machinery, compare prices and
            book with confidence.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              href="/equipment"
              className="group inline-flex items-center gap-3 rounded-xl bg-[#C98B52] px-7 py-4 font-semibold text-[#24352D] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D9A16E]"
            >
              Explore Equipment
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/register"
              className="rounded-xl border-2 border-[#E9EDE5]/70 px-7 py-4 font-semibold transition-all duration-300 hover:bg-white hover:text-[#24352D]"
            >
              List Your Equipment
            </Link>
          </motion.div>

          {/* Statistics */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap gap-10 border-t border-white/15 pt-7"
          >
            <div>
              <h3 className="text-3xl font-bold text-white">
                500+
              </h3>
              <p className="mt-1 text-sm text-[#E9EDE5]/70">
                Equipment
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                200+
              </h3>
              <p className="mt-1 text-sm text-[#E9EDE5]/70">
                Owners
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                1K+
              </h3>
              <p className="mt-1 text-sm text-[#E9EDE5]/70">
                Rentals
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT EQUIPMENT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute -inset-3 rounded-[2rem] border border-[#C98B52]/30" />

          <div className="relative overflow-hidden rounded-[1.5rem] bg-[#31463B] shadow-2xl">
            <Image
              src="/banner-equipment.png"
              alt="Excavator and heavy construction equipment available for rent"
              width={1000}
              height={800}
              priority
              className="h-[350px] w-full object-cover sm:h-[430px] md:h-[480px]"
            />

            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Image Text */}
            <div className="absolute bottom-7 left-6">
              <span className="rounded-full border border-white/70 px-4 py-2 text-xs font-medium text-white">
                PROFESSIONAL EQUIPMENT
              </span>

              <h2 className="mt-4 text-xl font-bold text-white sm:text-2xl">
                Power Your Next Project
              </h2>

              <div className="mt-3 h-1.5 w-24 rounded-full bg-[#C98B52]" />
            </div>
          </div>

          {/* Floating Animation Card */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-6 left-5 rounded-xl bg-white px-6 py-4 text-[#24352D] shadow-xl sm:-left-8"
          >
            <p className="text-xs text-gray-500">
              Your Next Project Starts Here
            </p>

            <p className="mt-1 font-bold">
              Professional Equipment
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Animation */}
      <div className="pb-7 text-center">
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30"
        >
          <ArrowRight className="rotate-90" size={19} />
        </motion.div>
      </div>
    </section>
  );
}
