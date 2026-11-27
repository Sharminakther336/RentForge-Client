"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

type PaymentState = "loading" | "pending" | "success" | "error";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<PaymentState>("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const sessionId = new URLSearchParams(
        window.location.search
      ).get("session_id");

      const token = sessionStorage.getItem("rentforge_token");

      if (!sessionId) {
        setStatus("error");
        setMessage("Stripe session ID is missing.");
        return;
      }

      if (!token) {
        setStatus("error");
        setMessage("Please sign in to verify your payment.");
        return;
      }

      try {
        for (let attempt = 0; attempt < 15; attempt++) {
          if (cancelled) return;

          const response = await fetch(
            `${API_URL}/api/stripe/verify-session/${encodeURIComponent(sessionId)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || "Payment verification failed."
            );
          }

          if (data.paymentVerified === true) {
            if (cancelled) return;

            setBookingId(data.bookingId || null);
            setStatus("success");
            setMessage("Your payment has been confirmed successfully!");
            return;
          }

          if (data.paymentStatus === "expired") {
            throw new Error("Your booking request has expired.");
          }

          if (cancelled) return;

          setStatus("pending");
          setMessage(
            "Payment received. Waiting for booking confirmation..."
          );

          if (attempt < 14) {
            await new Promise((resolve) =>
              setTimeout(resolve, 2000)
            );
          }
        }

        if (!cancelled) {
          setStatus("pending");
          setMessage(
            "Your payment is still being processed. Please check your bookings shortly."
          );
        }
      } catch (error) {
        if (cancelled) return;

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify payment."
        );
      }
    };

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F6F2] px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl md:p-10">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 animate-spin text-[#C98B52]" />
            <h1 className="mt-6 text-2xl font-bold text-[#24352D]">
              Verifying Payment
            </h1>
            <p className="mt-3 text-gray-500">
              Please wait while we verify your Stripe payment.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-20 w-20 text-green-600" />
            <h1 className="mt-6 text-3xl font-bold text-[#24352D]">
              Payment Successful!
            </h1>
            <p className="mt-3 text-gray-600">{message}</p>

            {bookingId && (
              <p className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
                Booking ID: {bookingId}
              </p>
            )}

            <Link
              href="/dashboard/customer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#24352D] px-7 py-3 font-semibold text-white transition hover:bg-[#344B40]"
            >
              View My Bookings
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {status === "pending" && (
          <div className="flex flex-col items-center">
            <Clock className="h-20 w-20 text-amber-500" />
            <h1 className="mt-6 text-2xl font-bold text-[#24352D]">
              Payment Processing
            </h1>
            <p className="mt-3 text-gray-600">{message}</p>
            <Link
              href="/dashboard/customer"
              className="mt-8 rounded-xl bg-[#24352D] px-7 py-3 font-semibold text-white"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-20 w-20 text-red-500" />
            <h1 className="mt-6 text-2xl font-bold text-[#24352D]">
              Payment Verification Failed
            </h1>
            <p className="mt-3 text-gray-600">{message}</p>
            <Link
              href="/dashboard/customer"
              className="mt-8 rounded-xl bg-[#24352D] px-7 py-3 font-semibold text-white"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
