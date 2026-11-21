
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Wrench, ArrowDown } from "lucide-react";

type AuthUser = {
  name?: string;
  email?: string;
  role?: string;
};

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
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // ========================================
  // Sync Authentication
  // ========================================

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("rentforge_token");
      const storedUser = localStorage.getItem("rentforge_user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("rentforge_token");
          localStorage.removeItem("rentforge_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setMounted(true);
    };

    syncAuth();

    window.addEventListener("rentforge-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("rentforge-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // ========================================
  // Explore Equipment
  // ========================================

  const scrollToEquipment = () => {
    const equipmentSection = document.getElementById("equipment");

    if (equipmentSection) {
      equipmentSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      router.push("/#equipment");
    }
  };

  // ========================================
  // List Your Equipment
  // ========================================

  const handleListEquipment = () => {
    if (!mounted) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const role = user.role?.toLowerCase();

    if (role === "owner") {
      router.push("/dashboard/owner/add-equipment");
      return;
    }

    if (role === "admin") {
      router.push("/dashboard/admin");
      return;
    }

    window.alert(
      "Only Owner accounts can list equipment. Please sign in with an Owner account."
    );
  };

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

          {/* Functional Buttons */}

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-4"
          >

            {/* Explore Equipment */}

            <Link
              href="/#equipment"
              className="group inline-flex items-center gap-3 rounded-xl bg-[#C98B52] px-7 py-4 font-semibold text-[#24352D] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D9A16E]"
            >
              Explore Equipment

              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            {/* List Your Equipment */}

            <button
              type="button"
              onClick={handleListEquipment}
              disabled={!mounted}
              className="rounded-xl border-2 border-[#E9EDE5]/70 px-7 py-4 font-semibold transition-all duration-300 hover:bg-white hover:text-[#24352D] disabled:cursor-wait disabled:opacity-60"
            >
              List Your Equipment
            </button>

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

          {/* Clickable Equipment Image */}

          <Link
            href="/#equipment"
            aria-label="Explore available equipment"
            className="group block"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#31463B] shadow-2xl">

              <Image
                src="/banner-equipment.png"
                alt="Excavator and heavy construction equipment available for rent"
                width={1000}
                height={800}
                priority
                className="h-[350px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[430px] md:h-[480px]"
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

              {/* Hover Indicator */}

              <div className="absolute right-5 top-5 rounded-full bg-white/90 p-3 text-[#24352D] opacity-0 transition group-hover:opacity-100">
                <ArrowRight size={20} />
              </div>

            </div>
          </Link>

          {/* Floating Animation Card */}

          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -bottom-6 left-5 rounded-xl bg-white px-6 py-4 text-[#24352D] shadow-xl sm:-left-8"
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

      {/* Bottom Scroll Button */}

      <div className="pb-7 text-center">
        <motion.button
          type="button"
          onClick={scrollToEquipment}
          aria-label="Scroll to equipment"
          animate={{ y: [0, 7, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-[#C98B52]"
        >
          <ArrowDown size={19} />
        </motion.button>
      </div>

    </section>
  );
}
