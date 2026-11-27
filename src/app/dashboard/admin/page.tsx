"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Boxes,
  ClipboardList,
  UserRound,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ArrowUpRight,
  Search,
  RefreshCw,
  Save,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import AdminEquipmentPanel from "./AdminEquipmentPanel";

type UserRole = "customer" | "owner" | "admin";

type AdminUser = {
  name?: string;
  email?: string;
  role?: string;
  photo?: string;
};

type ManagedUser = {
  id: string;
  name?: string;
  email: string;
  role: string;
  photo?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
};

type AdminAnalytics = {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingApprovals: number;
  completedRentals: number;
  totalRevenue: number;
  monthlyBookings: {
    month: string;
    year: number;
    total: number;
  }[];
};

type Tab =
  | "Overview"
  | "Users"
  | "Equipment"
  | "Rentals"
  | "My Profile";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const normalizeRole = (role?: string): UserRole => {
  if (role === "owner" || role === "admin") {
    return role;
  }

  return "customer";
};

const navigation: {
  label: Tab;
  icon: typeof LayoutDashboard;
}[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Users", icon: Users },
  { label: "Equipment", icon: Boxes },
  { label: "Rentals", icon: ClipboardList },
  { label: "My Profile", icon: UserRound },
];

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [analytics, setAnalytics] =
    useState<AdminAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersMessage, setUsersMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userSort, setUserSort] = useState("newest");

  const [draftRoles, setDraftRoles] = useState<
    Record<string, UserRole>
  >({});

  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // ADMIN AUTHENTICATION
  useEffect(() => {
    try {
      const token = localStorage.getItem("rentforge_token");
      const storedUser = localStorage.getItem("rentforge_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      const user: AdminUser = JSON.parse(storedUser);

      if (user.role?.toLowerCase() !== "admin") {
        router.replace("/");
        return;
      }

      setAdmin(user);
      setLoading(false);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  // FETCH ADMIN ANALYTICS
  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const token = localStorage.getItem("rentforge_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/analytics/admin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load admin analytics."
          );
        }

        setAnalytics(data.analytics || data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setAnalyticsError(
            error instanceof Error
              ? error.message
              : "Failed to load analytics."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAnalyticsLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => controller.abort();
  }, [loading, router, refreshKey]);

  // FETCH USERS
  useEffect(() => {
    if (loading || activeTab !== "Users") return;

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError("");

      try {
        const token = localStorage.getItem("rentforge_token");

        const response = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch users.");
        }

        const userList = Array.isArray(data)
          ? data
          : data.users || data.data || [];

        const formattedUsers: ManagedUser[] = userList.map(
          (user: any) => ({
            id: String(user._id || user.id),
            name: user.name,
            email: user.email || "",
            role: user.role || "customer",
            photo: user.photo || user.image || "",
            phone: user.phone || "",
            address: user.address || "",
            createdAt: user.createdAt,
          })
        );

        setUsers(formattedUsers);
      } catch (error) {
        setUsersError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [loading, activeTab, refreshKey]);

  // UPDATE USER ROLE
  const handleRoleUpdate = async (userId: string) => {
    const newRole = draftRoles[userId];

    if (!newRole) return;

    setUpdatingUserId(userId);
    setUsersMessage("");
    setUsersError("");

    try {
      const token = localStorage.getItem("rentforge_token");

      const response = await fetch(
        `${API_URL}/api/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update role.");
      }

      setUsers((previous) =>
        previous.map((user) =>
          user.id === userId
            ? { ...user, role: newRole }
            : user
        )
      );

      setDraftRoles((previous) => {
        const updated = { ...previous };
        delete updated[userId];
        return updated;
      });

      setUsersMessage("User role updated successfully.");
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : "Failed to update user role."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // FILTER AND SORT USERS
  const filteredUsers = users
    .filter((user) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (userSort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (userSort === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("rentforge_token");
    localStorage.removeItem("rentforge_user");
    router.replace("/login");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1720] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#C98B52] border-t-transparent" />
          <p className="text-sm text-gray-400">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: analytics?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Total Equipment",
      value: analytics?.totalEquipment ?? 0,
      icon: Boxes,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "Total Bookings",
      value: analytics?.totalBookings ?? 0,
      icon: ClipboardList,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      title: "Pending Approvals",
      value: analytics?.pendingApprovals ?? 0,
      icon: ShieldCheck,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      title: "Completed Rentals",
      value: analytics?.completedRentals ?? 0,
      icon: ArrowUpRight,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1720] text-white">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#101F29] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C98B52] text-[#101F29]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold">RentForge</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#C98B52] text-[#101F29]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#C98B52]/20 text-[#C98B52]">
              {admin?.photo ? (
                <img
                  src={admin.photo}
                  alt="Admin"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={20} />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {admin?.name || "Administrator"}
              </p>
              <p className="truncate text-xs text-gray-400">
                {admin?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-400/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#0B1720]/95 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-300 lg:hidden"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-xl font-bold">{activeTab}</h2>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage your RentForge platform
              </p>
            </div>
          </div>

          <button
            onClick={() => setRefreshKey((key) => key + 1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-[#C98B52] hover:text-[#C98B52]"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <div className="p-5 md:p-8">
          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {admin?.name || "Admin"}!
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Here is what is happening with your platform today.
                </p>
              </div>

              {analyticsError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {analyticsError}
                </div>
              )}

              {/* STAT CARDS */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {statCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-white/10 bg-[#101F29] p-6 transition hover:-translate-y-1 hover:border-[#C98B52]/40"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">
                            {card.title}
                          </p>

                          <h3 className="mt-3 text-3xl font-bold">
                            {analyticsLoading ? (
                              <span className="inline-block h-8 w-16 animate-pulse rounded bg-white/10" />
                            ) : (
                              card.value.toLocaleString()
                            )}
                          </h3>
                        </div>

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
                        >
                          <Icon size={23} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* REVENUE CARD */}
                <div className="rounded-2xl border border-[#C98B52]/30 bg-gradient-to-br from-[#C98B52]/20 to-[#101F29] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        Total Revenue
                      </p>
                      <h3 className="mt-3 text-2xl font-bold text-[#E5B17F]">
                        {analyticsLoading
                          ? "Loading..."
                          : formatCurrency(analytics?.totalRevenue ?? 0)}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C98B52]/20 text-[#E5B17F]">
                      <ArrowUpRight size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* MONTHLY BOOKING CHART */}
              <div className="rounded-2xl border border-white/10 bg-[#101F29] p-5 md:p-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">
                      Monthly Booking Statistics
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Booking activity over the last 12 months
                    </p>
                  </div>

                  <span className="rounded-lg bg-[#C98B52]/10 px-3 py-2 text-xs font-medium text-[#C98B52]">
                    Last 12 Months
                  </span>
                </div>

                <div className="h-[320px] w-full">
                  {analyticsLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Loading chart...
                    </div>
                  ) : analytics?.monthlyBookings?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.monthlyBookings}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -15,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#263943"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="month"
                          stroke="#94A3B8"
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          stroke="#94A3B8"
                          tick={{ fill: "#94A3B8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#101F29",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#C98B52" }}
                        />

                        <Bar
                          dataKey="total"
                          name="Bookings"
                          fill="#C98B52"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={42}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No booking statistics available yet.
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div>
                <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    onClick={() => setActiveTab("Users")}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101F29] p-5 text-left transition hover:border-[#C98B52]/50"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="text-[#C98B52]" size={22} />
                      <span className="font-medium">Manage Users</span>
                    </div>
                    <ArrowUpRight size={18} className="text-gray-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab("Equipment")}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101F29] p-5 text-left transition hover:border-[#C98B52]/50"
                  >
                    <div className="flex items-center gap-3">
                      <Boxes className="text-[#C98B52]" size={22} />
                      <span className="font-medium">Manage Equipment</span>
                    </div>
                    <ArrowUpRight size={18} className="text-gray-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab("Rentals")}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101F29] p-5 text-left transition hover:border-[#C98B52]/50"
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-[#C98B52]" size={22} />
                      <span className="font-medium">Manage Rentals</span>
                    </div>
                    <ArrowUpRight size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === "Users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Search, filter and manage platform users.
                </p>
              </div>

              {usersMessage && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                  {usersMessage}
                </div>
              )}

              {usersError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {usersError}
                </div>
              )}

              {/* SEARCH AND FILTER */}
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#101F29] p-5 md:grid-cols-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search name or email..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1720] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#0B1720] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userSort}
                  onChange={(event) => setUserSort(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0B1720] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* USER TABLE */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101F29]">
                {usersLoading ? (
                  <div className="p-10 text-center text-gray-400">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    No users found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                      <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-gray-400">
                        <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4">Update Role</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#C98B52]/10 text-[#C98B52]">
                                  {user.photo ? (
                                    <img
                                      src={user.photo}
                                      alt={user.name || "User"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <UserRound size={18} />
                                  )}
                                </div>

                                <span className="font-medium">
                                  {user.name || "Unnamed User"}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-gray-400">
                              {user.email}
                            </td>

                            <td className="px-6 py-4">
                              <span className="rounded-full bg-white/5 px-3 py-1 text-xs capitalize text-gray-300">
                                {user.role}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-gray-400">
                              {user.createdAt
                                ? new Date(
                                    user.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={
                                    draftRoles[user.id] ||
                                    normalizeRole(user.role)
                                  }
                                  onChange={(event) =>
                                    setDraftRoles((previous) => ({
                                      ...previous,
                                      [user.id]: event.target
                                        .value as UserRole,
                                    }))
                                  }
                                  className="rounded-lg border border-white/10 bg-[#0B1720] px-2 py-2 text-xs outline-none focus:border-[#C98B52]"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="owner">Owner</option>
                                  <option value="admin">Admin</option>
                                </select>

                                <button
                                  onClick={() =>
                                    handleRoleUpdate(user.id)
                                  }
                                  disabled={
                                    !draftRoles[user.id] ||
                                    updatingUserId === user.id
                                  }
                                  className="rounded-lg bg-[#C98B52] p-2 text-[#101F29] transition hover:bg-[#D9A16D] disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Save role"
                                >
                                  <Save size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
          )}

          {/* EQUIPMENT */}
          {activeTab === "Equipment" && (
            <AdminEquipmentPanel />
          )}

          {/* RENTALS */}
          {activeTab === "Rentals" && (
            <div className="rounded-2xl border border-white/10 bg-[#101F29] p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#C98B52]/10 text-[#C98B52]">
                <ClipboardList size={28} />
              </div>

              <h2 className="text-xl font-bold">Rental Management</h2>

              <p className="mt-2 text-sm text-gray-400">
                Total bookings: {analytics?.totalBookings ?? 0}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Manage rental bookings from the bookings section.
              </p>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "My Profile" && (
            <div className="max-w-2xl rounded-2xl border border-white/10 bg-[#101F29] p-6">
              <h2 className="mb-6 text-xl font-bold">Admin Profile</h2>

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#C98B52]/10 text-[#C98B52]">
                  {admin?.photo ? (
                    <img
                      src={admin.photo}
                      alt="Admin"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={28} />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    {admin?.name || "Administrator"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {admin?.email}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-[#C98B52]/10 px-3 py-1 text-xs capitalize text-[#C98B52]">
                    {admin?.role || "admin"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}