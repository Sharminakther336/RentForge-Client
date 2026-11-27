"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Rental = {
  _id?: string;
  equipmentName?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  requiredQuantity?: number;
  totalAmount?: number;
  paymentStatus?: string;
  bookingStatus?: string;
  status?: string;
  createdAt?: string;
};

type Profile = {
  name?: string;
  email?: string;
  photo?: string;
  phone?: string;
  address?: string;
  role?: string;
};

export default function CustomerDashboard() {
  const router = useRouter();

  const [tab, setTab] = useState("overview");
  const [rentalSearch, setRentalSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [profile, setProfile] = useState<Profile>({});
  const [rentals, setRentals] = useState<Rental[]>([]);

  const [form, setForm] = useState({
    name: "",
    photo: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load Customer Dashboard
  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const token = localStorage.getItem("rentforge_token");
      const storedUser = localStorage.getItem("rentforge_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role?.toLowerCase() !== "customer") {
        if (user.role?.toLowerCase() === "owner") {
          router.replace("/dashboard/owner");
        } else if (user.role?.toLowerCase() === "admin") {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/login");
        }
        return;
      }

      setProfile(user);

      setForm({
        name: user.name || "",
        photo: user.photo || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [bookingResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/api/bookings/my-bookings`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/users/me`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok || !bookingData.success) {
        throw new Error(
          bookingData.message || "Unable to load rental history."
        );
      }

      setRentals(bookingData.bookings || []);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();

        const currentUser =
          profileData.user || profileData.profile || profileData;

        if (currentUser && currentUser.success !== false) {
          const updated = { ...user, ...currentUser };

          setProfile(updated);

          setForm({
            name: updated.name || "",
            photo: updated.photo || "",
            phone: updated.phone || "",
            address: updated.address || "",
          });
        }
      }
    } catch (err) {
      console.error("Customer dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Logout
  const logout = () => {
    localStorage.removeItem("rentforge_token");
    localStorage.removeItem("rentforge_user");

    window.dispatchEvent(new Event("rentforge-auth-changed"));

    router.replace("/");
    router.refresh();
  };

  // Update Customer Profile
  const saveProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("rentforge_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Profile update failed.");
      }

      const updated = {
        ...profile,
        ...form,
        ...(data.user || data.profile || {}),
      };

      setProfile(updated);

      localStorage.setItem(
        "rentforge_user",
        JSON.stringify(updated)
      );

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Format Date
  const formatDate = (value?: string) => {
    if (!value) return "N/A";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-GB");
  };

  // Format Currency
  const money = (value?: number) =>
    `৳${Number(value || 0).toLocaleString("en-BD")}`;

  // Paid Rentals
  const paidRentals = rentals.filter(
    (item) => item.paymentStatus?.toLowerCase() === "paid"
  );

  // Total Spent
  const totalSpent = paidRentals.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0
  );

  // Search, Filter and Sort Rental History
  const filteredRentals = [...rentals]
    .filter((item) =>
      (item.equipmentName || "Equipment")
        .toLowerCase()
        .includes(rentalSearch.trim().toLowerCase())
    )
    .filter((item) =>
      paymentFilter === "all"
        ? true
        : (item.paymentStatus || "unknown").toLowerCase() === paymentFilter
    )
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.rentalStartDate || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.rentalStartDate || 0
      ).getTime();

      return dateB - dateA;
    });

  // Dashboard Tabs
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "rentals", label: "My Rentals" },
    { id: "favorites", label: "Favorites" },
    { id: "profile", label: "My Profile" },
  ];

  // Loading Screen
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E9E0D2] border-t-[#24352D]" />

          <p className="mt-4 font-semibold text-[#24352D]">
            Loading Customer Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8] text-[#24352D]">

      {/* Header */}
      <header className="border-b border-[#E9E0D2] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">

          <Link href="/" className="text-2xl font-extrabold">
            Rent<span className="text-[#C98B52]">Forge</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-sm hover:text-[#C98B52]"
            >
              Home
            </Link>

            <Link
              href="/equipment"
              className="text-sm hover:text-[#C98B52]"
            >
              Equipment
            </Link>

            <button
              onClick={logout}
              className="rounded-xl bg-[#24352D] px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[2px] text-[#C98B52]">
            Customer Workspace
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Welcome back, {profile.name?.split(" ")[0] || "Customer"}!
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your rentals and personal information.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setError("");
                setSuccess("");
              }}
              className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                tab === item.id
                  ? "bg-[#24352D] text-white"
                  : "border border-[#E9E0D2] bg-white hover:bg-[#E9EDE5]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Overview */}
        {tab === "overview" && (
          <>
            <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Rentals
                </p>

                <h2 className="mt-3 text-3xl font-extrabold">
                  {rentals.length}
                </h2>
              </div>

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Paid Rentals
                </p>

                <h2 className="mt-3 text-3xl font-extrabold text-green-700">
                  {paidRentals.length}
                </h2>
              </div>

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Paid
                </p>

                <h2 className="mt-3 text-3xl font-extrabold text-[#C98B52]">
                  {money(totalSpent)}
                </h2>
              </div>

            </div>

            {/* Recent Rentals */}
            <section className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">
                  Recent Rentals
                </h2>

                <button
                  onClick={() => setTab("rentals")}
                  className="text-sm font-bold text-[#C98B52]"
                >
                  View All
                </button>
              </div>

              {rentals.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-4xl">📦</p>

                  <h3 className="mt-4 font-bold">
                    No Rentals Yet
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Explore equipment and make your first rental.
                  </p>

                  <Link
                    href="/equipment"
                    className="mt-5 inline-block rounded-xl bg-[#C98B52] px-6 py-3 font-bold text-white"
                  >
                    Browse Equipment
                  </Link>
                </div>
              ) : (
                <div className="mt-5 divide-y divide-[#E9E0D2]">
                  {rentals.slice(0, 5).map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="font-bold">
                          {item.equipmentName || "Equipment"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(item.rentalStartDate)} –{" "}
                          {formatDate(item.rentalEndDate)}
                        </p>
                      </div>

                      <p className="font-bold">
                        {money(item.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </section>
          </>
        )}

        {/* My Rentals */}
        {tab === "rentals" && (
          <section className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm">

            <div className="border-b border-[#E9E0D2] px-6 py-5">
              <h2 className="text-xl font-bold">
                My Rental History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your confirmed bookings and payment records.
              </p>
            </div>

            {/* Rental History Search and Payment Filter */}
            <div className="grid gap-4 border-b border-[#E9E0D2] p-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="rental-search"
                  className="mb-2 block text-sm font-semibold text-[#24352D]"
                >
                  Search Equipment
                </label>

                <input
                  id="rental-search"
                  type="search"
                  value={rentalSearch}
                  onChange={(event) =>
                    setRentalSearch(event.target.value)
                  }
                  placeholder="Type an equipment name..."
                  className="w-full rounded-xl border border-[#E9E0D2] bg-white px-4 py-3 outline-none transition focus:border-[#C98B52]"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-filter"
                  className="mb-2 block text-sm font-semibold text-[#24352D]"
                >
                  Filter by Payment
                </label>

                <select
                  id="payment-filter"
                  value={paymentFilter}
                  onChange={(event) =>
                    setPaymentFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E9E0D2] bg-white px-4 py-3 outline-none transition focus:border-[#C98B52]"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

            </div>

            {rentals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No confirmed rentals found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">

                  <thead className="bg-[#F5F1E8]">
                    <tr>
                      <th className="px-5 py-4">Equipment</th>
                      <th className="px-5 py-4">Start Date</th>
                      <th className="px-5 py-4">End Date</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRentals.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="border-t border-gray-100"
                      >
                        <td className="px-5 py-4 font-semibold">
                          {item.equipmentName || "Equipment"}
                        </td>

                        <td className="px-5 py-4">
                          {formatDate(item.rentalStartDate)}
                        </td>

                        <td className="px-5 py-4">
                          {formatDate(item.rentalEndDate)}
                        </td>

                        <td className="px-5 py-4">
                          {item.requiredQuantity ?? 0}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {money(item.totalAmount)}
                        </td>

                        <td className="px-5 py-4 capitalize">
                          {(item.paymentStatus || "unknown").replace(
                            /_/g,
                            " "
                          )}
                        </td>

                        <td className="px-5 py-4 capitalize">
                          {(
                            item.bookingStatus ||
                            item.status ||
                            "unknown"
                          ).replace(/_/g, " ")}
                        </td>
                      </tr>
                    ))}

                    {filteredRentals.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-gray-500"
                        >
                          No rentals match your search or payment filter.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            )}

          </section>
        )}

        {/* Favorites */}
        {tab === "favorites" && (
          <section className="rounded-2xl border border-[#E9E0D2] bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">♡</div>

            <h2 className="mt-4 text-xl font-bold">
              My Favorites
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              Favorites API is not connected yet. Saved equipment
              functionality will be enabled after adding the backend service.
            </p>

            <Link
              href="/equipment"
              className="mt-6 inline-block rounded-xl bg-[#C98B52] px-6 py-3 font-bold text-white"
            >
              Explore Equipment
            </Link>

          </section>
        )}

        {/* My Profile */}
        {tab === "profile" && (
          <section className="max-w-3xl rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-bold">
              My Profile
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Update your personal information.
            </p>

            <form
              onSubmit={saveProfile}
              className="mt-6 space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <input
                  disabled
                  value={profile.email || ""}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Photo URL
                </label>

                <input
                  type="url"
                  value={form.photo}
                  onChange={(e) =>
                    setForm({ ...form, photo: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Phone Number
                </label>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#24352D] px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

            </form>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-[#E9E0D2] pt-6 text-sm text-gray-500">
          © 2026 RentForge. Customer Workspace.
        </footer>

      </div>
    </main>
  );
}