
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  UserRound,
  LogOut,
  Boxes,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowUpRight,
  Wrench,
  Menu,
  X,
  MapPin,
  CalendarDays,
} from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  status: "pending" | "approved" | "rejected";
  image?: string;
  createdAt: string;
};

type Owner = {
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const sidebarLinks = [
  {
    name: "Overview",
    href: "/dashboard/owner",
    icon: LayoutDashboard,
  },
  {
    name: "Add Equipment",
    href: "/dashboard/owner/add-equipment",
    icon: PlusCircle,
  },
  {
    name: "My Equipment",
    href: "/dashboard/owner/my-equipment",
    icon: Package,
  },
  {
    name: "Equipment Rentals",
    href: "/dashboard/owner/rentals",
    icon: ClipboardList,
  },
  {
    name: "My Profile",
    href: "/dashboard/owner/profile",
    icon: UserRound,
  },
];

export default function OwnerDashboard() {
  const router = useRouter();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("rentforge_token");
        const storedUser = localStorage.getItem("rentforge_user");

        if (!token || !storedUser) {
          router.replace("/login");
          return;
        }

        const currentUser: Owner = JSON.parse(storedUser);

        if (currentUser.role?.toLowerCase() !== "owner") {
          if (currentUser.role?.toLowerCase() === "admin") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/dashboard/customer");
          }
          return;
        }

        setOwner(currentUser);

        const response = await fetch(
          `${API_URL}/api/equipment/my-equipment`,
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
            data.message || "Unable to load your equipment."
          );
        }

        setEquipment(data.equipment || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("rentforge_token");
    localStorage.removeItem("rentforge_user");

    window.dispatchEvent(new Event("rentforge-auth-changed"));

    router.replace("/");
    router.refresh();
  };

  const totalEquipment = equipment.length;

  const approvedEquipment = equipment.filter(
    (item) => item.status === "approved"
  ).length;

  const pendingEquipment = equipment.filter(
    (item) => item.status === "pending"
  ).length;

  const rejectedEquipment = equipment.filter(
    (item) => item.status === "rejected"
  ).length;

  const totalUnits = equipment.reduce(
    (total, item) => total + item.availableQuantity,
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E9E0D2] border-t-[#24352D]" />
          <p className="mt-4 font-semibold text-[#24352D]">
            Loading Owner Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8] text-[#24352D]">

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E9E0D2] bg-[#F5F1E8] px-5 py-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-[#24352D] p-2 text-white">
            <Wrench size={22} />
          </div>
          <span className="text-xl font-extrabold">
            Rent<span className="text-[#C98B52]">Forge</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-lg p-2 hover:bg-[#E9E0D2]"
          aria-label="Toggle dashboard menu"
        >
          {mobileMenu ? <X size={25} /> : <Menu size={25} />}
        </button>
      </header>

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E9E0D2] bg-[#24352D] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="flex items-center justify-between border-b border-white/10 px-7 py-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-[#C98B52] p-2.5">
                <Wrench size={24} className="text-white" />
              </div>

              <span className="text-2xl font-extrabold">
                Rent<span className="text-[#D99A5D]">Forge</span>
              </span>
            </Link>

            <button
              onClick={() => setMobileMenu(false)}
              className="lg:hidden"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Profile */}
          <div className="mx-5 mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              {owner?.photo ? (
                <img
                  src={owner.photo}
                  alt="Owner profile"
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C98B52] text-lg font-bold">
                  {owner?.name?.charAt(0).toUpperCase() || "O"}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="truncate font-bold">
                  {owner?.name || "Equipment Owner"}
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Equipment Owner
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-5 pt-8">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[2px] text-white/40">
              Workspace
            </p>

            <nav className="space-y-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                      link.name === "Overview"
                        ? "bg-[#C98B52] text-white shadow-lg"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-3 border-t border-white/10 p-5">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowUpRight size={19} />
              Back to Website
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#F3B5A7] transition hover:bg-red-500/10"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenu && (
          <button
            aria-label="Close menu overlay"
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        {/* Main Content */}
        <section className="min-w-0 flex-1">

          {/* Topbar */}
          <header className="hidden items-center justify-between border-b border-[#E9E0D2] bg-white px-8 py-5 lg:flex">
            <div>
              <p className="text-sm text-gray-500">
                Owner Workspace
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Dashboard Overview
              </h2>
            </div>

            <Link
              href="/dashboard/owner/add-equipment"
              className="flex items-center gap-2 rounded-xl bg-[#24352D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#C98B52]"
            >
              <PlusCircle size={19} />
              Add Equipment
            </Link>
          </header>

          {/* Dashboard Body */}
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">

            {/* Welcome */}
            <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[2px] text-[#C98B52]">
                  Owner Dashboard
                </p>

                <h1 className="text-3xl font-extrabold sm:text-4xl">
                  Welcome back, {owner?.name?.split(" ")[0] || "Owner"}!
                </h1>

                <p className="mt-3 text-gray-500">
                  Manage your equipment and monitor your rental activity.
                </p>
              </div>

              <Link
                href="/dashboard/owner/add-equipment"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C98B52] px-6 py-3.5 font-bold text-white transition hover:bg-[#B87942]"
              >
                <PlusCircle size={20} />
                List New Equipment
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Statistics */}
            <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-[#E9EDE5] p-3 text-[#24352D]">
                    <Package size={23} />
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    All Listings
                  </span>
                </div>

                <p className="mt-6 text-3xl font-extrabold">
                  {totalEquipment}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Total Equipment
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <CheckCircle2 size={23} />
                  </div>
                  <span className="text-xs font-semibold text-green-600">
                    Approved
                  </span>
                </div>

                <p className="mt-6 text-3xl font-extrabold">
                  {approvedEquipment}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Approved Equipment
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                    <Clock3 size={23} />
                  </div>
                  <span className="text-xs font-semibold text-amber-600">
                    Waiting
                  </span>
                </div>

                <p className="mt-6 text-3xl font-extrabold">
                  {pendingEquipment}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Pending Approval
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-orange-50 p-3 text-[#C98B52]">
                    <Boxes size={23} />
                  </div>
                  <span className="text-xs font-semibold text-[#C98B52]">
                    Inventory
                  </span>
                </div>

                <p className="mt-6 text-3xl font-extrabold">
                  {totalUnits}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Available Units
                </p>
              </div>
            </div>

            {/* Equipment Overview */}
            <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">

              {/* Recent Equipment */}
              <div className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white xl:col-span-2">
                <div className="flex items-center justify-between border-b border-[#E9E0D2] px-6 py-5">
                  <div>
                    <h2 className="text-lg font-bold">
                      Recent Equipment
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Your latest equipment listings
                    </p>
                  </div>

                  <Link
                    href="/dashboard/owner/my-equipment"
                    className="text-sm font-bold text-[#C98B52] transition hover:text-[#24352D]"
                  >
                    View All
                  </Link>
                </div>

                {equipment.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9EDE5] text-[#24352D]">
                      <Package size={30} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold">
                      No Equipment Yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Start by adding your first equipment.
                    </p>

                    <Link
                      href="/dashboard/owner/add-equipment"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#24352D] px-5 py-3 text-sm font-bold text-white hover:bg-[#C98B52]"
                    >
                      <PlusCircle size={18} />
                      Add Equipment
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E9E0D2]">
                    {equipment.slice(0, 5).map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col justify-between gap-4 px-6 py-5 transition hover:bg-[#FAF9F6] sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E9EDE5]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={23} className="text-[#24352D]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold">
                              {item.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {item.category}
                            </p>

                            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                              <MapPin size={13} />
                              {item.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                          <div>
                            <p className="font-bold">
                              ৳{item.rentalPrice.toLocaleString("en-BD")}
                            </p>
                            <p className="text-xs text-gray-500">
                              / {item.rentalType}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                              item.status === "approved"
                                ? "bg-green-50 text-green-700"
                                : item.status === "rejected"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Quick Actions */}
              <div className="space-y-6">

                <div className="rounded-2xl bg-[#24352D] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[2px] text-[#D99A5D]">
                    Quick Action
                  </p>

                  <h2 className="mt-3 text-xl font-bold">
                    Grow Your Rental Business
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/65">
                    Add more quality equipment to attract customers
                    and grow your rental opportunities.
                  </p>

                  <Link
                    href="/dashboard/owner/add-equipment"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C98B52] px-5 py-3.5 font-bold text-white transition hover:bg-[#B87942]"
                  >
                    <PlusCircle size={19} />
                    Add Equipment
                  </Link>
                </div>

                <div className="rounded-2xl border border-[#E9E0D2] bg-white p-6">
                  <h2 className="text-lg font-bold">
                    Listing Summary
                  </h2>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <CheckCircle2 size={17} className="text-green-600" />
                          Approved
                        </span>
                        <strong>{approvedEquipment}</strong>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{
                            width: `${
                              totalEquipment
                                ? (approvedEquipment / totalEquipment) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <Clock3 size={17} className="text-amber-600" />
                          Pending
                        </span>
                        <strong>{pendingEquipment}</strong>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            width: `${
                              totalEquipment
                                ? (pendingEquipment / totalEquipment) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <XCircle size={17} className="text-red-500" />
                          Rejected
                        </span>
                        <strong>{rejectedEquipment}</strong>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{
                            width: `${
                              totalEquipment
                                ? (rejectedEquipment / totalEquipment) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#E9E0D2] pt-6 text-sm text-gray-500 sm:flex-row">
              <p>© 2026 RentForge. Owner Workspace.</p>
              <p className="flex items-center gap-2">
                <CalendarDays size={16} />
                Manage your equipment with confidence.
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
