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

import AdminEquipmentPanel from "./AdminEquipmentPanel";

// ========================================
// TYPES
// ========================================

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

type Tab =
  | "Overview"
  | "Users"
  | "Equipment"
  | "Rentals"
  | "My Profile";

// ========================================
// API CONFIGURATION
// ========================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const normalizeRole = (role?: string): UserRole => {
  if (role === "owner" || role === "admin") {
    return role;
  }

  return "customer";
};

// ========================================
// NAVIGATION
// ========================================

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

// ========================================
// ADMIN DASHBOARD
// ========================================

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Users states
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

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(
    null
  );

  const [refreshKey, setRefreshKey] = useState(0);

  // ========================================
  // ADMIN AUTHENTICATION
  // ========================================

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

  // ========================================
  // FETCH ALL USERS
  // ========================================

  useEffect(() => {
    if (activeTab !== "Users" || loading) return;

    const controller = new AbortController();

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      setUsersMessage("");

      try {
        const token = localStorage.getItem("rentforge_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/users/admin/all`,
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
            data.message || "Unable to load users."
          );
        }

        const receivedUsers: ManagedUser[] = Array.isArray(data.users)
          ? data.users
          : [];

        setUsers(receivedUsers);

        const initialRoles: Record<string, UserRole> = {};

        receivedUsers.forEach((user) => {
          initialRoles[user.id] = normalizeRole(user.role);
        });

        setDraftRoles(initialRoles);
      } catch (error) {
        if (!controller.signal.aborted) {
          setUsersError(
            error instanceof Error
              ? error.message
              : "Failed to load users."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, [activeTab, loading, refreshKey, router]);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("rentforge_token");
    localStorage.removeItem("rentforge_user");
    router.replace("/login");
  };

  // ========================================
  // REFRESH USERS
  // ========================================

  const handleRefreshUsers = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // ========================================
  // UPDATE USER ROLE
  // ========================================

  const handleRoleUpdate = async (user: ManagedUser) => {
    const newRole = draftRoles[user.id];

    if (!newRole || newRole === user.role) {
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setUsersError("");
      setUsersMessage("");

      const token = localStorage.getItem("rentforge_token");

      const response = await fetch(
        `${API_URL}/api/users/admin/${user.id}/role`,
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
        throw new Error(data.message || "Failed to update role.");
      }

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id
            ? { ...item, role: newRole }
            : item
        )
      );

      setUsersMessage("User role updated successfully!");
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ========================================
  // FILTER USERS
  // ========================================

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (user.name || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ========================================
  // SORT USERS
  // ========================================

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (userSort) {
      case "oldest":
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );

      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");

      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");

      case "newest":
      default:
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
    }
  });

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#C98B52] border-t-transparent" />
          <p className="text-sm text-gray-400">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // DASHBOARD CONTENT
  // ========================================

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-[#C98B52]">
                ADMIN CONTROL CENTER
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-gray-400">
                Welcome back, {admin?.name || "Admin"}!
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  title: "Total Users",
                  value: users.length,
                  icon: Users,
                  color: "text-blue-400",
                },
                {
                  title: "Total Equipment",
                  value: "Manage",
                  icon: Boxes,
                  color: "text-green-400",
                },
                {
                  title: "Total Rentals",
                  value: "Manage",
                  icon: ClipboardList,
                  color: "text-purple-400",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-[#151F30] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">
                          {item.title}
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-white">
                          {item.value}
                        </h2>
                      </div>

                      <div className="rounded-xl bg-white/5 p-4">
                        <Icon className={`h-7 w-7 ${item.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151F30] p-6">
              <h2 className="text-xl font-semibold text-white">
                Quick Actions
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => setActiveTab("Users")}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-4 text-left text-white transition hover:bg-white/10"
                >
                  <span>Manage Users</span>
                  <ArrowUpRight className="h-5 w-5 text-[#C98B52]" />
                </button>

                <button
                  onClick={() => setActiveTab("Equipment")}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-4 text-left text-white transition hover:bg-white/10"
                >
                  <span>Manage Equipment</span>
                  <ArrowUpRight className="h-5 w-5 text-[#C98B52]" />
                </button>

                <button
                  onClick={() => setActiveTab("Rentals")}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-4 text-left text-white transition hover:bg-white/10"
                >
                  <span>Manage Rentals</span>
                  <ArrowUpRight className="h-5 w-5 text-[#C98B52]" />
                </button>
              </div>
            </div>
          </div>
        );

      // ========================================
      // USERS
      // ========================================

      case "Users":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#C98B52]">
                  USER MANAGEMENT
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white">
                  Manage Users
                </h1>
                <p className="mt-2 text-gray-400">
                  View users and manage their roles.
                </p>
              </div>

              <button
                onClick={handleRefreshUsers}
                disabled={usersLoading}
                className="flex items-center gap-2 rounded-xl bg-[#C98B52] px-4 py-3 font-semibold text-[#101827] transition hover:bg-[#d99a61] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    usersLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            {/* Search and filters */}
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#151F30] p-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Search Users
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1220] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#C98B52]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Filter by Role
                </label>

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm text-white outline-none focus:border-[#C98B52]"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Sort Users
                </label>

                <select
                  value={userSort}
                  onChange={(event) =>
                    setUserSort(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm text-white outline-none focus:border-[#C98B52]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            {usersError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {usersError}
              </div>
            )}

            {usersMessage && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                {usersMessage}
              </div>
            )}

            {/* Users table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151F30]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
                <h2 className="font-semibold text-white">
                  All Registered Users
                </h2>

                <p className="text-sm text-gray-400">
                  Showing {sortedUsers.length} of {users.length} users
                </p>
              </div>

              {usersLoading ? (
                <div className="p-10 text-center text-gray-400">
                  Loading users...
                </div>
              ) : sortedUsers.length === 0 ? (
                <div className="p-10 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-gray-500" />
                  <p className="text-gray-300">
                    No users found.
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-white/5 text-xs uppercase text-gray-400">
                      <tr>
                        <th className="px-5 py-4">User</th>
                        <th className="px-5 py-4">Contact</th>
                        <th className="px-5 py-4">Current Role</th>
                        <th className="px-5 py-4">Change Role</th>
                        <th className="px-5 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {sortedUsers.map((user) => {
                        const currentDraft =
                          draftRoles[user.id] ||
                          normalizeRole(user.role);

                        return (
                          <tr
                            key={user.id}
                            className="transition hover:bg-white/[0.03]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {user.photo ? (
                                  <img
                                    src={user.photo}
                                    alt={user.name || "User"}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C98B52]/20 text-sm font-bold text-[#C98B52]">
                                    {(user.name || user.email)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}

                                <div>
                                  <p className="font-medium text-white">
                                    {user.name || "Unnamed User"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm text-gray-200">
                                {user.email}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {user.phone || "No phone"}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-gray-200">
                                {user.role}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <select
                                value={currentDraft}
                                onChange={(event) =>
                                  setDraftRoles((previous) => ({
                                    ...previous,
                                    [user.id]: event.target.value as UserRole,
                                  }))
                                }
                                className="rounded-lg border border-white/10 bg-[#0B1220] px-3 py-2 text-sm text-white outline-none focus:border-[#C98B52]"
                              >
                                <option value="customer">
                                  Customer
                                </option>
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>

                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleRoleUpdate(user)}
                                disabled={
                                  updatingUserId === user.id ||
                                  currentDraft === user.role
                                }
                                className="flex items-center gap-2 rounded-lg bg-[#C98B52] px-3 py-2 text-xs font-semibold text-[#101827] transition hover:bg-[#d99a61] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Save className="h-3.5 w-3.5" />
                                {updatingUserId === user.id
                                  ? "Saving..."
                                  : "Save"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      // ========================================
      // EQUIPMENT
      // ========================================

      case "Equipment":
        return <AdminEquipmentPanel />;

      // ========================================
      // RENTALS
      // ========================================

      case "Rentals":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#C98B52]">
                RENTAL MANAGEMENT
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Manage Rentals
              </h1>
              <p className="mt-2 text-gray-400">
                Rental management overview.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151F30] p-8 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-[#C98B52]" />
              <h2 className="text-xl font-semibold text-white">
                Rental Management
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Rental management features can be added here.
              </p>
            </div>
          </div>
        );

      // ========================================
      // MY PROFILE
      // ========================================

      case "My Profile":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#C98B52]">
                ACCOUNT SETTINGS
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                My Profile
              </h1>
            </div>

            <div className="max-w-2xl rounded-2xl border border-white/10 bg-[#151F30] p-6">
              <div className="flex items-center gap-4">
                {admin?.photo ? (
                  <img
                    src={admin.photo}
                    alt={admin.name || "Admin"}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C98B52]/20 text-2xl font-bold text-[#C98B52]">
                    {(admin?.name || "A").charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {admin?.name || "Admin"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {admin?.email}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#C98B52]/10 px-3 py-1 text-xs text-[#C98B52]">
                    <ShieldCheck className="h-3 w-3" />
                    Administrator
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm text-gray-400">Name</p>
                <p className="mt-1 text-white">
                  {admin?.name || "Not available"}
                </p>

                <p className="mt-5 text-sm text-gray-400">Email</p>
                <p className="mt-1 text-white">
                  {admin?.email || "Not available"}
                </p>

                <p className="mt-5 text-sm text-gray-400">Role</p>
                <p className="mt-1 capitalize text-white">
                  {admin?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ========================================
  // MAIN LAYOUT
  // ========================================

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#111B2B] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-white">
              Rent<span className="text-[#C98B52]">Forge</span>
            </h2>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-gray-500">
              ADMIN PANEL
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-[#C98B52] text-[#101827]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {isActive && (
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C98B52]/20 font-bold text-[#C98B52]">
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {admin?.name || "Admin"}
              </p>
              <p className="truncate text-xs text-gray-500">
                {admin?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#0B1220]/95 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-300 hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <p className="text-xs text-gray-500">
                RENTFORGE / ADMIN
              </p>
              <p className="font-semibold text-white">
                {activeTab}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">
                {admin?.name || "Administrator"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C98B52]/30 bg-[#C98B52]/10 text-sm font-bold text-[#C98B52]">
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}