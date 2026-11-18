
"use client";

import { motion } from "framer-motion";
import {
  HardHat,
  Wrench,
  Zap,
  Tractor,
  Forklift,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    id: 1,
    name: "Construction Equipment",
    description: "Excavators, bulldozers and heavy machinery.",
    icon: HardHat,
    count: "120+ Equipment",
  },
  {
    id: 2,
    name: "Power Tools",
    description: "Professional tools for every project.",
    icon: Wrench,
    count: "85+ Equipment",
  },
  {
    id: 3,
    name: "Generators",
    description: "Reliable power solutions for your needs.",
    icon: Zap,
    count: "45+ Equipment",
  },
  {
    id: 4,
    name: "Agriculture",
    description: "Tractors and modern farming equipment.",
    icon: Tractor,
    count: "60+ Equipment",
  },
  {
    id: 5,
    name: "Material Handling",
    description: "Forklifts and equipment for heavy loads.",
    icon: Forklift,
    count: "35+ Equipment",
  },
  {
    id: 6,
    name: "Safety Equipment",
    description: "Essential safety tools and protective gear.",
    icon: ShieldCheck,
    count: "50+ Equipment",
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
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function Categories() {
  return (
    <section className="bg-white px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-12 text-center">
          <span className="text-sm font-bold uppercase tracking-[3px] text-[#C98B52]">
            Browse By Category
          </span>

          <h2 className="mt-3 text-3xl font-bold text-[#24352D] md:text-4xl">
            Explore Equipment Categories
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            Find the right equipment for your work.
            Explore our wide range of rental categories
            and choose what your project needs.
          </p>
        </div>

        {/* Category Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                variants={cardVariants}
                whileHover={{ y: -7 }}
                className="group rounded-2xl border border-[#E5E0D6] bg-[#F5F1E8] p-7 transition-all duration-300 hover:border-[#C98B52] hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#24352D] text-white transition-colors duration-300 group-hover:bg-[#C98B52] group-hover:text-[#24352D]">
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#24352D]">
                    {category.count}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#24352D]">
                  {category.name}
                </h3>

                <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
                  {category.description}
                </p>

                <Link
                  href={`/equipment?category=${encodeURIComponent(category.name)}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#24352D] transition-colors group-hover:text-[#C98B52]"
                >
                  Explore Category
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
