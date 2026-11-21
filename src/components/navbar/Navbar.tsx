
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Wrench, LayoutDashboard, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Equipment", href: "/equipment" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "About", href: "/about" },
];

type AuthUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function Navbar() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // Read login information from localStorage
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("rentforge_token");
      const storedUser = localStorage.getItem("rentforge_user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("rentforge_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setMounted(true);
    };

    syncAuth();

    // Update Navbar when login information changes
    window.addEventListener("rentforge-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("rentforge-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Role-based dashboard URL
  const dashboardHref = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
        return "/dashboard/admin";

      case "owner":
        return "/dashboard/owner";

      case "customer":
      default:
        return "/dashboard/customer";
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("rentforge_token");
    localStorage.removeItem("rentforge_user");

    setUser(null);
    setIsOpen(false);

    window.dispatchEvent(new Event("rentforge-auth-changed"));

    router.replace("/");
    router.refresh();
  };

  const isLoggedIn = mounted && user !== null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9E0D2] bg-[#F5F1E8]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-[#24352D]">
            <Wrench size={27} className="text-white" />
          </div>

          <span className="text-3xl font-extrabold tracking-tight text-[#24352D]">
            Rent<span className="text-[#C98B52]">Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-bold text-[#24352D] transition-all duration-300 hover:text-[#C98B52] lg:text-lg"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-5 md:flex">
          {!mounted ? null : isLoggedIn ? (
            <>
              <Link
                href={dashboardHref()}
                className="flex items-center gap-2 rounded-xl border border-[#24352D] px-5 py-3 text-base font-bold text-[#24352D] transition hover:bg-[#E9E0D2]"
              >
                <LayoutDashboard size={19} />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-[#24352D] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#C98B52]"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-base font-bold text-[#24352D] transition hover:text-[#C98B52] lg:text-lg"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#24352D] px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-[#C98B52] hover:shadow-lg lg:text-lg"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl p-2.5 text-[#24352D] transition hover:bg-[#E9E0D2] md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={29} /> : <Menu size={29} />}
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
            <div className="flex flex-col gap-5 px-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-[#24352D] transition hover:text-[#C98B52]"
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-3 border-t border-[#E9E0D2] pt-5">
                {!mounted ? null : isLoggedIn ? (
                  <>
                    <Link
                      href={dashboardHref()}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#24352D] py-3.5 text-base font-bold text-[#24352D]"
                    >
                      <LayoutDashboard size={19} />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#24352D] py-3.5 text-base font-bold text-white"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 rounded-xl border-2 border-[#24352D] py-3.5 text-center text-base font-bold text-[#24352D]"
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 rounded-xl bg-[#24352D] py-3.5 text-center text-base font-bold text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

