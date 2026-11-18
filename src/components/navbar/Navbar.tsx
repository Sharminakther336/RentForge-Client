
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Equipment", href: "/equipment" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9E0D2] bg-[#F5F1E8]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#24352D]">
            <Wrench size={23} className="text-white" />
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-[#24352D]">
            Rent<span className="text-[#C98B52]">Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-[#24352D] transition-colors duration-300 hover:text-[#C98B52]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="font-semibold text-[#24352D] transition hover:text-[#C98B52]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#24352D] px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#C98B52] hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-[#24352D] transition hover:bg-[#E9E0D2] md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[#E9E0D2] bg-[#F5F1E8] md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-[#24352D] transition hover:text-[#C98B52]"
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex gap-3 border-t border-[#E9E0D2] pt-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg border border-[#24352D] py-3 text-center font-semibold text-[#24352D]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg bg-[#24352D] py-3 text-center font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

