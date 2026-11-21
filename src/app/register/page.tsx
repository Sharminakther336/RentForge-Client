
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Camera,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password)
    ) {
      setError(
        "Password must contain uppercase, lowercase and at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            photo: photo.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      // Save the new customer's login information
      localStorage.setItem("rentforge_token", data.token);
      localStorage.setItem("rentforge_user", JSON.stringify(data.user));

      setSuccess("Account created successfully! Welcome to RentForge.");

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F5F1E8] px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

          {/* Left Side */}
          <section className="relative flex min-h-[350px] flex-col justify-between overflow-hidden bg-[#24352D] p-8 text-white sm:p-12 lg:min-h-[720px]">

            <div>
              <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C98B52]">
                <Wrench size={25} />
              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[3px] text-[#DCA36E]">
                Join RentForge
              </p>

              <h1 className="max-w-md text-4xl font-bold leading-tight sm:text-5xl">
                Start Building.
                <span className="block text-[#D99A5D]">
                  Start Renting.
                </span>
              </h1>

              <p className="mt-6 max-w-md leading-7 text-white/70">
                Create your account and discover a smarter way to
                rent quality equipment. Connect with trusted owners
                and make your next project easier.
              </p>
            </div>

            <div className="mt-12 space-y-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#D99A5D]" size={23} />
                <span className="text-sm text-white/80">
                  Secure and Trusted Equipment Marketplace
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
                <div>
                  <h3 className="text-2xl font-bold">500+</h3>
                  <p className="mt-1 text-xs text-white/60">Equipment</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold">200+</h3>
                  <p className="mt-1 text-xs text-white/60">Owners</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold">1K+</h3>
                  <p className="mt-1 text-xs text-white/60">Rentals</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Side - Registration Form */}
          <section className="flex items-center justify-center p-7 sm:p-10 lg:p-12">

            <div className="w-full max-w-md">

              <div className="mb-7">
                <p className="mb-3 text-sm font-bold uppercase tracking-[2px] text-[#C98B52]">
                  Create Account
                </p>

                <h2 className="text-3xl font-bold text-[#24352D]">
                  Get Started
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Fill in your details to join RentForge.
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#24352D]"
                  >
                    Full Name
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 transition focus-within:border-[#C98B52] focus-within:ring-2 focus-within:ring-[#C98B52]/15">
                    <User size={18} className="text-gray-400" />

                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-[#24352D] outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#24352D]"
                  >
                    Email Address
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 transition focus-within:border-[#C98B52] focus-within:ring-2 focus-within:ring-[#C98B52]/15">
                    <Mail size={18} className="text-gray-400" />

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-[#24352D] outline-none"
                    />
                  </div>
                </div>

                {/* Photo URL */}
                <div>
                  <label
                    htmlFor="photo"
                    className="mb-2 block text-sm font-semibold text-[#24352D]"
                  >
                    Profile Photo URL
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 transition focus-within:border-[#C98B52] focus-within:ring-2 focus-within:ring-[#C98B52]/15">
                    <Camera size={18} className="text-gray-400" />

                    <input
                      id="photo"
                      type="url"
                      placeholder="Paste your photo URL"
                      value={photo}
                      onChange={(e) => setPhoto(e.target.value)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-[#24352D] outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#24352D]"
                  >
                    Password
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 transition focus-within:border-[#C98B52] focus-within:ring-2 focus-within:ring-[#C98B52]/15">
                    <LockKeyhole size={18} className="text-gray-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-[#24352D] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="text-gray-400 hover:text-[#24352D]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    At least 6 characters, including uppercase and lowercase letters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#24352D]"
                  >
                    Confirm Password
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 transition focus-within:border-[#C98B52] focus-within:ring-2 focus-within:ring-[#C98B52]/15">
                    <LockKeyhole size={18} className="text-gray-400" />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-[#24352D] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      className="text-gray-400 hover:text-[#24352D]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#24352D] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#344B40] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}

                  {!loading && <ArrowRight size={18} />}
                </button>

              </form>

              {/* Login Link */}
              <p className="mt-7 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#C98B52] transition hover:text-[#24352D]"
                >
                  Sign In
                </Link>
              </p>

              <p className="mt-6 text-center text-xs text-gray-400">
                Your account will be registered as a Customer.
              </p>

            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
