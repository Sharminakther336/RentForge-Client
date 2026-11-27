
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

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

  const getPaymentStatus = (item: Rental) => {
    const isIntent = item.recordType === "booking_intent";
    return item.paymentStatus || (isIntent ? "pending" : "unknown");
  };

  const getBookingStatus = (item: Rental) => {
    const isIntent = item.recordType === "booking_intent";

    return (
      item.bookingStatus ||
      (isIntent ? "awaiting_payment" : "confirmed")
    );
  };

  // Search, filter and sorting
  const filteredRentals = useMemo(() => {
    let result = [...rentals];

    // Search by equipment, customer, email or phone
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((item) => {
        const equipmentName =
          item.equipmentInfo?.name?.toLowerCase() || "";

        const customerName =
          item.customerInfo?.name?.toLowerCase() || "";

        const email =
          item.customerInfo?.email?.toLowerCase() || "";

        const phone = item.customerInfo?.phone || "";

        return (
          equipmentName.includes(search) ||
          customerName.includes(search) ||
          email.includes(search) ||
          phone.includes(search)
        );
      });
    }

    // Payment status filter
    if (paymentFilter !== "all") {
      result = result.filter(
        (item) => getPaymentStatus(item) === paymentFilter
      );
    }

    // Booking status filter
    if (bookingFilter !== "all") {
      result = result.filter(
        (item) => getBookingStatus(item) === bookingFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(
        a.rentalStartDate || a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.rentalStartDate || b.createdAt || 0
      ).getTime();

      switch (sortOrder) {
        case "oldest":
          return dateA - dateB;

        case "amount-high":
          return Number(b.totalAmount || 0) -
            Number(a.totalAmount || 0);

        case "amount-low":
          return Number(a.totalAmount || 0) -
            Number(b.totalAmount || 0);

        case "newest":
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [rentals, searchTerm, paymentFilter, bookingFilter, sortOrder]);

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

        {/* Header */}
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

        {/* Statistics */}
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

        {/* Rental Requests */}
        <section className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold">Rental Requests</h2>

            <p className="mt-1 text-sm text-gray-500">
              Customer, equipment and payment information
            </p>
          </div>

          {/* Search and Filters */}
          <div className="grid gap-4 border-b border-gray-100 bg-[#FCFAF6] p-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Search Rentals
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Equipment, customer, email..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C98B52] focus:ring-2 focus:ring-[#C98B52]/20"
              />
            </div>

            {/* Payment Filter */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Status
              </label>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Booking Filter */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Booking Status
              </label>

              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
              >
                <option value="all">All Bookings</option>
                <option value="awaiting_payment">
                  Awaiting Payment
                </option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Sort By
              </label>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
              >
                <option value="newest">Newest Rental Date</option>
                <option value="oldest">Oldest Rental Date</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Result Count and Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-[#24352D]">
                {filteredRentals.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#24352D]">
                {rentals.length}
              </span>{" "}
              rentals
            </p>

            <button
              onClick={() => {
                setSearchTerm("");
                setPaymentFilter("all");
                setBookingFilter("all");
                setSortOrder("newest");
              }}
              className="rounded-lg border border-[#C98B52] px-4 py-2 text-sm font-semibold text-[#C98B52] transition hover:bg-[#C98B52] hover:text-white"
            >
              Reset Filters
            </button>
          </div>

          {/* Loading */}
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
          ) : filteredRentals.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl">🔍</div>

              <h3 className="mt-5 text-xl font-bold">
                No Matching Rentals
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setPaymentFilter("all");
                  setBookingFilter("all");
                  setSortOrder("newest");
                }}
                className="mt-5 rounded-xl bg-[#24352D] px-5 py-3 font-semibold text-white"
              >
                Clear Filters
              </button>
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
                  {filteredRentals.map((item) => {
                    const isIntent =
                      item.recordType === "booking_intent";

                    const payment = getPaymentStatus(item);
                    const booking = getBookingStatus(item);

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
                            {item.equipmentInfo?.category ||
                              item.rentalType ||
                              "N/A"}
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
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                              payment === "paid"
                                ? "bg-green-100 text-green-700"
                                : payment === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
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
