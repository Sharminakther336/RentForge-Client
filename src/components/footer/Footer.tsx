
import Link from "next/link";
import {
  Wrench,
  Mail,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "All Equipment", href: "/equipment" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "About Us", href: "/about" },
];

const categories = [
  "Construction Equipment",
  "Power Tools",
  "Generators",
  "Agriculture",
  "Material Handling",
  "Safety Equipment",
];

const socialLinks = [
  { name: "Facebook", icon: FaFacebookF, href: "https://facebook.com" },
  { name: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
  { name: "LinkedIn", icon: FaLinkedinIn, href: "https://linkedin.com" },
  { name: "YouTube", icon: FaYoutube, href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-[#24352D] text-white">

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 md:px-10">

        {/* Brand Information */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C98B52] text-[#24352D]">
              <Wrench size={24} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              RentForge
            </span>
          </Link>

          <p className="mt-6 max-w-xs text-sm leading-7 text-[#E9EDE5]/75">
            Your trusted equipment rental marketplace.
            Find quality machinery, connect with reliable
            owners and power your next project with confidence.
          </p>

          {/* Social Media Icons */}
          <div className="mt-7 flex gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#E9EDE5] transition-all duration-300 hover:border-[#C98B52] hover:bg-[#C98B52] hover:text-[#24352D]"
                >
                  <Icon size={19} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-white">
            Quick Links
          </h3>

          <div className="mt-6 flex flex-col gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group flex items-center gap-2 text-sm text-[#E9EDE5]/75 transition hover:text-[#C98B52]"
              >
                {link.name}

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold text-white">
            Categories
          </h3>

          <div className="mt-6 flex flex-col gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/equipment?category=${encodeURIComponent(category)}`}
                className="text-sm text-[#E9EDE5]/75 transition hover:text-[#C98B52]"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-bold text-white">
            Get In Touch
          </h3>

          <p className="mt-6 text-sm leading-7 text-[#E9EDE5]/75">
            Have questions about renting or listing equipment?
            Visit our contact page to get in touch with us.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C98B52] px-5 py-3 text-sm font-bold text-[#24352D] transition hover:-translate-y-1 hover:bg-[#D9A16E]"
          >
            Contact Us
            <ArrowUpRight size={17} />
          </Link>

          <div className="mt-7 flex items-center gap-3 text-sm text-[#E9EDE5]/75">
            <MapPin size={19} className="text-[#C98B52]" />
            Equipment Rental Marketplace
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-[#E9EDE5]/75">
            <Mail size={19} className="text-[#C98B52]" />
            Customer Support
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center md:flex-row md:px-10">

          <p className="text-sm text-[#E9EDE5]/65">
            © {new Date().getFullYear()} RentForge. All rights reserved.
          </p>

          <p className="text-sm text-[#E9EDE5]/65">
            Built for smarter equipment rental.
          </p>

        </div>
      </div>

    </footer>
  );
}

