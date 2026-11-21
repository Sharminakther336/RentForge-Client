
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

    window.dispatchEvent(new Event("rentforge-auth-changed"));

    router.replace("/login");
  };

  // ========================================
  // REFRESH USERS
  // ========================================

  const refreshUsers = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // ========================================
  // CHANGE DRAFT ROLE
  // ========================================

  const handleRoleChange = (
    userId: string,
    role: UserRole
  ) => {
    setDraftRoles((previous) => ({
      ...previous,
      [userId]: role,
    }));

    setUsersError("");
    setUsersMessage("");
  };

  // ========================================
  // UPDATE USER ROLE
  // ========================================

  const handleUpdateRole = async (user: ManagedUser) => {
    const newRole = draftRoles[user.id];

    if (!newRole || newRole === user.role) return;

    if (user.id === "") {
      setUsersError("Invalid user ID.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.name || user.email}'s role to "${newRole}"?`
    );

    if (!confirmed) return;

    setUpdatingUserId(user.id);
    setUsersError("");
    setUsersMessage("");

    try {
      const token = localStorage.getItem("rentforge_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/users/admin/${user.id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update user role."
        );
      }

      const updatedRole = normalizeRole(
        data.user?.role || newRole
      );

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id
            ? { ...item, role: updatedRole }
            : item
        )
      );

      setDraftRoles((previous) => ({
        ...previous,
        [user.id]: updatedRole,
      }));

      setUsersMessage(
        data.message || "User role updated successfully."
      );
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : "Failed to update role."
      );

      setDraftRoles((previous) => ({
        ...previous,
        [user.id]: normalizeRole(user.role),
      }));
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
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
        <p className="text-lg font-semibold text-[#24352D]">
          Loading Admin Dashboard...
        </p>
      </div>
    );
  }

  // ========================================
  // OVERVIEW
  // ========================================

  const renderOverview = () => (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-[#C98B52]">
          RENTFORGE ADMINISTRATION
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#24352D]">
          Welcome, {admin?.name || "Admin"}!
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your equipment rental platform from one place.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Users",
            value: users.length || "—",
            icon: Users,
            description: "Registered platform users",
          },
          {
            title: "Total Equipment",
            value: "—",
            icon: Boxes,
            description: "Listed rental equipment",
          },
          {
            title: "Total Rentals",
            value: "—",
            icon: ClipboardList,
            description: "Customer rental records",
          },
          {
            title: "Pending Approval",
            value: "—",
            icon: ShieldCheck,
            description: "Equipment awaiting review",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-[#F5F1E8] p-3">
                  <Icon size={23} className="text-[#24352D]" />
                </div>

                <span className="text-2xl font-bold text-[#24352D]">
                  {item.value}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#24352D]">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-[#24352D] p-7 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck size={30} className="text-[#D8A36B]" />

          <h2 className="text-xl font-bold">
            Admin Control Center
          </h2>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
          Your administrator account is active. Use the sidebar
          to access user management, equipment management,
          rental records and your profile.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-[#24352D]">
          Quick Actions
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {(["Users", "Equipment", "Rentals"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center justify-between rounded-xl border border-[#E9E0D2] bg-white p-5 text-left transition hover:border-[#C98B52] hover:shadow-md"
            >
              <span className="font-semibold text-[#24352D]">
                Manage {tab}
              </span>

              <ArrowUpRight
                size={20}
                className="text-[#C98B52]"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );

  // ========================================
  // USERS MANAGEMENT
  // ========================================

  const renderUsers = () => (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-[#C98B52]">
            ADMIN MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#24352D]">
            Users Management
          </h1>

          <p className="mt-2 text-gray-500">
            View registered users and manage their account roles.
          </p>
        </div>

        <button
          onClick={refreshUsers}
          disabled={usersLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#24352D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344B40] disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={usersLoading ? "animate-spin" : ""}
          />
          Refresh Users
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users", value: users.length },
          {
            label: "Customers",
            value: users.filter((u) => u.role === "customer").length,
          },
          {
            label: "Owners",
            value: users.filter((u) => u.role === "owner").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.label}</p>

            <p className="mt-2 text-3xl font-bold text-[#24352D]">
              {usersLoading ? "..." : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-4 rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-[#E9E0D2] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#C98B52]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-xl border border-[#E9E0D2] bg-white px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="owner">Owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {usersError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {usersError}
        </div>
      )}

      {usersMessage && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {usersMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E9E0D2] px-5 py-5">
          <h2 className="text-lg font-bold text-[#24352D]">
            Registered Users
          </h2>

          <span className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length}
          </span>
        </div>

        {usersLoading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin text-[#C98B52]"
            />
            Loading users...
          </div>
        ) : usersError && users.length === 0 ? (
          <div className="p-10 text-center">
            <Users
              size={35}
              className="mx-auto mb-3 text-gray-400"
            />

            <p className="font-semibold text-[#24352D]">
              Unable to load users
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Check your backend connection and Admin access.
            </p>

            <button
              onClick={refreshUsers}
              className="mt-5 rounded-xl bg-[#24352D] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users
              size={35}
              className="mx-auto mb-3 text-gray-400"
            />

            <p className="font-semibold text-[#24352D]">
              No users found
            </p>

            <p className="mt-1 text-sm">
              Try changing your search or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#F8F5EF] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Current Role</th>
                  <th className="px-5 py-4">Change Role</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E9E0D2]">
                {filteredUsers.map((user) => {
                  const currentRole = normalizeRole(user.role);
                  const selectedRole =
                    draftRoles[user.id] || currentRole;

                  const isChanged = selectedRole !== currentRole;

                  const isSelf =
                    user.email?.toLowerCase() ===
                    admin?.email?.toLowerCase();

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-[#FCFAF6]"
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1E8] font-bold text-[#24352D]">
                              {(user.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-[#24352D]">
                              {user.name || "Unnamed User"}
                            </p>

                            <p className="text-xs text-gray-400">
                              {user.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            currentRole === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : currentRole === "owner"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {currentRole}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={selectedRole}
                          disabled={
                            isSelf || updatingUserId === user.id
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              user.id,
                              event.target.value as UserRole
                            )
                          }
                          className="rounded-lg border border-[#E9E0D2] bg-white px-3 py-2 text-sm capitalize outline-none focus:border-[#C98B52] disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          <option value="customer">Customer</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>

                        {isSelf && (
                          <p className="mt-1 text-xs text-gray-400">
                            Your account
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleUpdateRole(user)}
                          disabled={
                            !isChanged ||
                            isSelf ||
                            updatingUserId === user.id
                          }
                          className="flex items-center gap-2 rounded-lg bg-[#24352D] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#344B40] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {updatingUserId === user.id ? (
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Save size={14} />
                          )}

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

      <p className="mt-4 text-xs leading-6 text-gray-500">
        Note: Your own administrator role cannot be changed from
        this panel. The last administrator cannot be demoted.
      </p>
    </div>
  );

  // ========================================
  // MY PROFILE
  // ========================================

  const renderProfile = () => (
    <div>
      <h1 className="text-3xl font-bold text-[#24352D]">
        My Profile
      </h1>

      <p className="mt-2 text-gray-500">
        Your administrator account information.
      </p>

      <div className="mt-7 max-w-2xl rounded-2xl border border-[#E9E0D2] bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          {admin?.photo ? (
            <img
              src={admin.photo}
              alt={admin.name || "Admin"}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#24352D] text-2xl font-bold text-white">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-[#24352D]">
              {admin?.name || "Admin"}
            </h2>

            <span className="mt-1 inline-block rounded-full bg-[#E7F2E9] px-3 py-1 text-xs font-semibold text-green-700">
              Administrator
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="mt-1 font-semibold text-[#24352D]">
              {admin?.name || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="mt-1 font-semibold text-[#24352D]">
              {admin?.email || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account Role</p>
            <p className="mt-1 font-semibold capitalize text-[#24352D]">
              {admin?.role || "Admin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================
  // PLACEHOLDER FOR RENTALS
  // ========================================

  const renderRentals = () => (
    <div>
      <h1 className="text-3xl font-bold text-[#24352D]">
        Rentals Management
      </h1>

      <p className="mt-2 text-gray-500">
        Monitor rental records and booking activity across the platform.
      </p>

      <div className="mt-8 rounded-2xl border border-[#E9E0D2] bg-white p-8 text-center shadow-sm">
        <ClipboardList
          size={35}
          className="mx-auto mb-4 text-gray-400"
        />

        <h2 className="text-xl font-bold text-[#24352D]">
          Rentals Management
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          Backend integration is pending for this section.
        </p>

        <span className="mt-5 inline-block rounded-full bg-[#FFF2E5] px-4 py-2 text-xs font-semibold text-[#9A602D]">
          Backend integration pending
        </span>
      </div>
    </div>
  );

  // ========================================
  // RENDER CONTENT
  // ========================================

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return renderOverview();

      case "Users":
        return renderUsers();

      case "Equipment":
        return <AdminEquipmentPanel />;

      case "Rentals":
        return renderRentals();

      case "My Profile":
        return renderProfile();

      default:
        return renderOverview();
    }
  };

  // ========================================
  // MAIN DASHBOARD LAYOUT
  // ========================================

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#24352D]">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#24352D] text-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#C98B52] p-2">
              <Boxes size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold">RentForge</h2>
              <p className="text-xs text-gray-300">
                Admin Panel
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    selected
                      ? "bg-[#C98B52] text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-white/10 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C98B52] font-bold">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {admin?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-400">
                Administrator
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#E9E0D2] bg-[#F5F1E8]/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <div>
              <p className="text-xs text-gray-500">
                Dashboard
              </p>

              <h2 className="font-bold text-[#24352D]">
                {activeTab}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck
              size={21}
              className="text-[#C98B52]"
            />

            <span className="hidden text-sm font-semibold sm:inline">
              Admin Account
            </span>
          </div>
        </header>

        <div className="p-5 md:p-8 lg:p-10">
          {renderContent()}
        </div>

        <footer className="border-t border-[#E9E0D2] px-8 py-5 text-center text-sm text-gray-500">
          © 2026 RentForge. Admin Workspace.
        </footer>
      </main>
    </div>
  );
}
