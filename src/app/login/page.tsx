
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Save login information for local session handling
      localStorage.setItem("rentforge_token", data.token);
      localStorage.setItem("rentforge_user", JSON.stringify(data.user));

      setSuccess("Login successful! Welcome to RentForge.");

      // Return to homepage
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
          <section className="relative flex min-h-[350px] flex-col justify-between overflow-hidden bg-[#24352D] p-8 text-white sm:p-12 lg:min-h-[650px]">

            <div className="relative z-10">
              <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C98B52]">
                <Wrench size={25} />
              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[3px] text-[#DCA36E]">
                Welcome Back
              </p>

              <h1 className="max-w-md text-4xl font-bold leading-tight sm:text-5xl">
                Build Better.
                <span className="block text-[#D99A5D]">
                  Rent Smarter.
                </span>
              </h1>

              <p className="mt-6 max-w-md leading-7 text-white/70">
                Your next project starts with the right equipment.
                Sign in to manage your rentals and discover trusted
                equipment owners.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#D99A5D]" size={23} />
                <span className="text-sm text-white/80">
                  Trusted Equipment Rental Marketplace
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

          {/* Right Side - Login Form */}
          <section className="flex items-center justify-center p-7 sm:p-12 lg:p-14">

            <div className="w-full max-w-md">

              <div className="mb-8">
                <p className="mb-3 text-sm font-bold uppercase tracking-[2px] text-[#C98B52]">
                  Account Access
                </p>

                <h2 className="text-3xl font-bold text-[#24352D]">
                  Sign In
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your account information to continue.
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

              <form onSubmit={handleLogin} className="space-y-6">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#24352D]"
                  >
                    Email Address
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 transition focus-within:border-[#C98B52] focus-within:ring-2 focus-within:ring-[#C98B52]/15">
                    <Mail size={19} className="text-gray-400" />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent px-3 py-4 text-sm text-[#24352D] outline-none"
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
                    <LockKeyhole size={19} className="text-gray-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent px-3 py-4 text-sm text-[#24352D] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 transition hover:text-[#24352D]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#24352D] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#344B40] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}

                  {!loading && <ArrowRight size={18} />}
                </button>

              </form>

              {/* Google Login Placeholder */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("Google sign-in is not configured yet.")
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-[#24352D] transition hover:bg-gray-50"
              >
                <span className="text-lg font-bold">G</span>
                Continue with Google
              </button>

              {/* Register Link */}
              <p className="mt-8 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#C98B52] transition hover:text-[#24352D]"
                >
                  Create Account
                </Link>
              </p>

              <p className="mt-7 text-center text-xs text-gray-400">
                Secure access to your RentForge account.
              </p>

            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
