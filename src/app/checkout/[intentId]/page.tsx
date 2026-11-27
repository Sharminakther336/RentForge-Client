
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BookingIntent {
  id: string;
  equipmentName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalDays: number;
  rentalUnits: number;
  rentalType: string;
  requiredQuantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  expiresAt: string;
}

export default function CheckoutPage() {
  const params = useParams<{ intentId: string }>();
  const intentId = params.intentId;

  const [booking, setBooking] = useState<BookingIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("rentforge_checkout");

      if (!saved) {
        setError("Booking information not found. Please book again.");
        return;
      }

      const parsed: BookingIntent = JSON.parse(saved);

      if (parsed.id !== intentId) {
        setError("Invalid booking session. Please book again.");
        return;
      }

      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        setError("Your booking session has expired. Please book again.");
        return;
      }

      setBooking(parsed);
    } catch {
      setError("Unable to load booking information.");
    } finally {
      setLoading(false);
    }
  }, [intentId]);

  const handlePayment = async (outcome: "success" | "failed") => {
    if (!booking || processing) return;

    const token = localStorage.getItem("rentforge_token");

    if (!token) {
      setError("Please login before completing payment.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${intentId}/mock-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ outcome }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Payment processing failed."
        );
      }

      if (outcome === "success") {
        setSuccess(true);
        setBookingId(data.bookingId || "");
        sessionStorage.removeItem("rentforge_checkout");
      } else {
        setError(data.message || "Demo payment failed.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-5">
        <div className="bg-white max-w-lg w-full rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2
            size={64}
            className="text-green-500 mx-auto mb-5"
          />
          <h1 className="text-3xl font-bold text-[#24352D] mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-5">
            Your demo payment was successful. Your booking is confirmed.
          </p>
          {bookingId && (
            <p className="text-sm text-gray-500 mb-6 break-all">
              Booking ID: {bookingId}
            </p>
          )}
          <Link
            href="/dashboard/customer"
            className="inline-block bg-[#24352D] text-white px-7 py-3 rounded-lg font-semibold hover:bg-[#344A3F]"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-5">
        <div className="bg-white max-w-lg w-full rounded-2xl p-8 text-center shadow-sm">
          <AlertCircle
            size={48}
            className="text-red-500 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Checkout Unavailable
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/equipment"
            className="bg-[#24352D] text-white px-6 py-3 rounded-lg inline-block"
          >
            Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

  const expired =
    new Date(booking.expiresAt).getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-[#F8FAF9] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-[#C98B52] font-semibold mb-2">
            RENTFORGE CHECKOUT
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#24352D]">
            Complete Your Booking
          </h1>
          <p className="text-gray-500 mt-2">
            Review your rental details and complete demo payment.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#24352D] mb-6">
              Booking Summary
            </h2>

            <div className="border-b pb-5 mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {booking.equipmentName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Booking ID: {booking.id}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Rental Start</p>
                <p className="font-semibold">
                  {new Date(booking.rentalStartDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Rental End</p>
                <p className="font-semibold">
                  {new Date(booking.rentalEndDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Rental Duration</p>
                <p className="font-semibold">
                  {booking.totalDays} days
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Rental Type</p>
                <p className="font-semibold">
                  {booking.rentalType}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Quantity</p>
                <p className="font-semibold">
                  {booking.requiredQuantity}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Unit Price</p>
                <p className="font-semibold">
                  ৳{Number(booking.unitPrice).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8 bg-[#F8FAF9] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="text-[#C98B52]" />
                <h3 className="font-semibold text-[#24352D]">
                  Demo Payment Notice
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                This is a demonstration payment system.
                No real money will be charged.
              </p>
            </div>

            {error && (
              <div className="mt-5 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-[#24352D] mb-6">
              Payment Details
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-[#C98B52]" size={25} />
              <span className="font-semibold text-gray-700">
                Demo Payment
              </span>
            </div>

            <div className="space-y-3 text-sm border-b pb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{booking.totalDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity</span>
                <span>{booking.requiredQuantity}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-5">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="text-2xl font-bold text-[#24352D]">
                ৳{Number(booking.totalAmount).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 items-center text-xs text-gray-500 mb-5">
              <Clock size={15} />
              Booking expires at{" "}
              {new Date(booking.expiresAt).toLocaleTimeString()}
            </div>

            <button
              onClick={() => handlePayment("success")}
              disabled={processing || expired}
              className="w-full bg-[#24352D] text-white py-3 rounded-lg font-semibold hover:bg-[#344A3F] disabled:opacity-50"
            >
              {processing ? "Processing..." : "Pay Now (Demo)"}
            </button>

            <button
              onClick={() => handlePayment("failed")}
              disabled={processing || expired}
              className="w-full mt-3 border border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
            >
              Simulate Failed Payment
            </button>

            {expired && (
              <p className="text-red-600 text-xs mt-3">
                This booking session has expired. Please book again.
              </p>
            )}

            <p className="text-center text-xs text-gray-400 mt-5">
              Demo only · No real transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
