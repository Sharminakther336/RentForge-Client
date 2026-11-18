
"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  BadgeCheck,
  Wallet,
  Clock,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    id: 1,
    title: "Quality Equipment",
    description:
      "Access well-maintained and reliable equipment for every type of project.",
    icon: ShieldCheck,
    number: "01",
  },
  {
    id: 2,
    title: "Trusted Owners",
    description:
      "Connect with verified equipment owners and rent with confidence.",
    icon: BadgeCheck,
    number: "02",
  },
  {
    id: 3,
    title: "Affordable Pricing",
    description:
      "Compare rental prices and find the best equipment within your budget.",
    icon: Wallet,
    number: "03",
  },
  {
    id: 4,
    title: "Easy & Secure Booking",
    description:
      "Book your required equipment through a simple and secure rental process.",
    icon: Clock,
    number: "04",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
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

export default function WhyChooseUs() {
  return (
    <section className="overflow-hidden bg-[#F5F1E8] px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[3px] text-[#C98B52]">
            The RentForge Advantage
          </span>

          <h2 className="mt-4 text-3xl font-bold leading-tight text-[#24352D] md:text-5xl">
            Why Choose{" "}
            <span className="text-[#C98B52]">RentForge?</span>
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            We make equipment rental simple, reliable and
            affordable. Everything you need to complete
            your project with confidence.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl border border-[#E5E0D6] bg-white p-7 shadow-sm transition-all duration-300 hover:border-[#C98B52] hover:shadow-xl"
              >
                {/* Number */}
                <div className="absolute right-6 top-6 text-sm font-bold text-[#D9D4C9]">
                  {feature.number}
                </div>

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#24352D] text-white transition-all duration-300 group-hover:bg-[#C98B52] group-hover:text-[#24352D] group-hover:rotate-6">
                  <Icon size={30} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <h3 className="mt-7 text-xl font-bold text-[#24352D]">
                  {feature.title}
                </h3>

                <p className="mt-4 min-h-20 text-sm leading-7 text-gray-600">
                  {feature.description}
                </p>

                {/* Bottom Line */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="h-1 w-12 rounded-full bg-[#C98B52] transition-all duration-300 group-hover:w-20" />

                  <ArrowRight
                    size={19}
                    className="text-[#C98B52] transition-transform duration-300 group-hover:translate-x-2"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 rounded-2xl bg-[#24352D] px-7 py-9 text-center md:px-12"
        >
          <h3 className="text-2xl font-bold text-white md:text-3xl">
            Ready to Start Your Next Project?
          </h3>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#E9EDE5]/75">
            Find the right equipment, connect with trusted owners
            and make your next project easier with RentForge.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
