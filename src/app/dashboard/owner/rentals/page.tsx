"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Rental {
  _id: string;
  recordType: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  equipmentInfo?: {
    name?: string;
    category?: string;
    image?: string;
  };
  rentalStartDate?: string;
  rentalEndDate?: string;
  totalDays?: number;
  rentalType?: string;
  requiredQuantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  paymentStatus?: string;
  bookingStatus?: string;
  createdAt?: string;
}

export default function OwnerRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadRentals = useCallback(async () => {
    try {
      setError("");

      const token = localStorage.getItem("rentforge_token");
      const storedUser = localStorage.getItem("rentforge_user");

      if (!token || !storedUser) {
        setRentals([]);
        setError("Please log in to view your rentals.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role?.toLowerCase() !== "owner") {
        setRentals([]);
        setError("Only owners can access this page.");
        return;
      }

      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/api/bookings/owner-bookings`,
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
        throw new Error(data.message || "Failed to load rentals.");
      }

      setRentals(data.bookings || []);
    } catch (err) {
      console.error("Owner rentals error:", err);
      setRentals([]);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB");
  };

  const formatAmount = (value?: number) =>
    `৳${Number(value || 0).toLocaleString("en-BD")}`;

  const pending = rentals.filter(
    (item) =>
      item.recordType === "booking_intent" ||
      item.bookingStatus === "awaiting_payment"
  ).length;

  const confirmed = rentals.length - pending;

  const paidRevenue = rentals
    .filter((item) => item.paymentStatus === "paid")
    .reduce(
      (total, item) => total + Number(item.totalAmount || 0),
      0
    );

  return (
    <main className="min-h-screen bg-[#F5F1E8] p-4 text-[#24352D] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/dashboard/owner"
              className="mb-3 inline-block font-semibold text-[#C98B52] hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-extrabold">
              Equipment Rentals
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Manage customer rental requests and bookings.
            </p>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              loadRentals();
            }}
            disabled={refreshing}
            className="rounded-xl bg-[#24352D] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh Rentals"}
          </button>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Rentals", value: rentals.length },
            { label: "Awaiting Payment", value: pending },
            { label: "Confirmed Rentals", value: confirmed },
            { label: "Paid Revenue", value: formatAmount(paidRevenue) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <h2 className="mt-3 text-3xl font-extrabold">
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold">Rental Requests</h2>
            <p className="mt-1 text-sm text-gray-500">
              Customer, equipment and payment information
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading rentals...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">
              {error}
            </div>
          ) : rentals.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl">📦</div>
              <h3 className="mt-5 text-xl font-bold">
                No Rentals Yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Customer rental requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-[#F5F1E8] text-[#24352D]">
                  <tr>
                    <th className="px-5 py-4">Equipment</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Rental Period</th>
                    <th className="px-5 py-4">Quantity</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Booking</th>
                  </tr>
                </thead>

                <tbody>
                  {rentals.map((item) => {
                    const isIntent =
                      item.recordType === "booking_intent";

                    const payment =
                      item.paymentStatus || (isIntent ? "pending" : "unknown");

                    const booking =
                      item.bookingStatus ||
                      (isIntent ? "awaiting_payment" : "confirmed");

                    return (
                      <tr
                        key={item._id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {item.equipmentInfo?.name || "Equipment"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.equipmentInfo?.category || item.rentalType || "N/A"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold">
                            {item.customerInfo?.name || "Customer"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.customerInfo?.email || "Email unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.customerInfo?.phone || ""}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p>{formatDate(item.rentalStartDate)}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            To {formatDate(item.rentalEndDate)}
                          </p>
                          {item.totalDays && (
                            <p className="mt-1 text-xs text-gray-400">
                              {item.totalDays} days
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          {item.requiredQuantity ?? 0}
                        </td>

                        <td className="px-5 py-5 font-bold">
                          {formatAmount(item.totalAmount)}
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold capitalize text-orange-700">
                            {payment.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                              isIntent
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {booking.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-[#E9E0D2] pt-6 text-sm text-gray-500">
          © 2026 RentForge. Owner Workspace.
        </footer>
      </div>
    </main>
  );
}
