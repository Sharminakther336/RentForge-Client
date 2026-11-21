
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Boxes,
  Pencil,
  Trash2,
  X,
  Save,
  MapPin,
  Package,
} from "lucide-react";

type EquipmentStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | EquipmentStatus;

type Equipment = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  rentalPrice?: number;
  rentalType?: string;
  availableQuantity?: number;
  condition?: string;
  brand?: string;
  model?: string;
  image?: string;
  rentalTerms?: string;
  status: EquipmentStatus;
  rejectionReason?: string;
  ownerInfo?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

type EquipmentForm = {
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: string;
  rentalType: string;
  availableQuantity: string;
  condition: string;
  brand: string;
  model: string;
  image: string;
  rentalTerms: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const categories = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

const emptyForm: EquipmentForm = {
  name: "",
  description: "",
  category: "",
  location: "",
  rentalPrice: "",
  rentalType: "Daily",
  availableQuantity: "1",
  condition: "",
  brand: "",
  model: "",
  image: "",
  rentalTerms: "",
};

export default function AdminEquipmentPanel() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);

  const [actionId, setActionId] = useState<string | null>(null);

  const [editingItem, setEditingItem] =
    useState<Equipment | null>(null);

  const [editForm, setEditForm] =
    useState<EquipmentForm>(emptyForm);

  const [savingEdit, setSavingEdit] = useState(false);

  // ========================================
  // FETCH EQUIPMENT
  // ========================================

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadEquipment = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("rentforge_token");

        if (!token) {
          throw new Error("Please log in again as an administrator.");
        }

        const params = new URLSearchParams();

        params.set("status", statusFilter);

        if (categoryFilter !== "all") {
          params.set("category", categoryFilter);
        }

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        const response = await fetch(
          `${API_URL}/api/equipment/admin/all?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load equipment."
          );
        }

        if (!active) return;

        setEquipment(
          Array.isArray(data.equipment) ? data.equipment : []
        );

        setTotal(Number(data.total) || 0);
        setPending(Number(data.pending) || 0);
        setApproved(Number(data.approved) || 0);
        setRejected(Number(data.rejected) || 0);
      } catch (err) {
        if (!active || controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load equipment."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEquipment();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    statusFilter,
    categoryFilter,
    searchTerm,
    refreshKey,
  ]);

  // ========================================
  // REFRESH
  // ========================================

  const refreshEquipment = () => {
    setRefreshKey((value) => value + 1);
    setMessage("");
    setError("");
  };

  // ========================================
  // APPROVE / REJECT EQUIPMENT
  // ========================================

  const handleStatusChange = async (
    item: Equipment,
    status: "approved" | "rejected"
  ) => {
    let rejectionReason = "";

    if (status === "rejected") {
      const reason = window.prompt(
        "Enter the reason for rejecting this equipment:"
      );

      if (reason === null) return;

      rejectionReason = reason.trim();

      if (!rejectionReason) {
        setError("Please provide a rejection reason.");
        return;
      }
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${status} "${item.name}"?`
    );

    if (!confirmed) return;

    setActionId(item._id);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("rentforge_token");

      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/equipment/admin/${item._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            ...(status === "rejected" ? { rejectionReason } : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${status} equipment.`
        );
      }

      setMessage(data.message || `Equipment ${status} successfully.`);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed."
      );
    } finally {
      setActionId(null);
    }
  };

  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const openEditModal = (item: Equipment) => {
    setEditingItem(item);

    setEditForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || categories[0],
      location: item.location || "",
      rentalPrice: String(item.rentalPrice ?? ""),
      rentalType: item.rentalType || "Daily",
      availableQuantity: String(item.availableQuantity ?? 1),
      condition: item.condition || "",
      brand: item.brand || "",
      model: item.model || "",
      image: item.image || "",
      rentalTerms: item.rentalTerms || "",
    });

    setError("");
    setMessage("");
  };

  const updateFormField = (
    field: keyof EquipmentForm,
    value: string
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ========================================
  // SAVE EDIT
  // ========================================

  const handleEditSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingItem) return;

    setSavingEdit(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("rentforge_token");

      if (!token) {
        throw new Error("Please log in again as an administrator.");
      }

      const payload = {
        ...editForm,
        rentalPrice: Number(editForm.rentalPrice),
        availableQuantity: Number(editForm.availableQuantity),
      };

      const response = await fetch(
        `${API_URL}/api/equipment/admin/${editingItem._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update equipment."
        );
      }

      setEditingItem(null);
      setMessage(data.message || "Equipment updated successfully.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Equipment update failed."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // ========================================
  // DELETE EQUIPMENT
  // ========================================

  const handleDelete = async (item: Equipment) => {
    const confirmed = window.confirm(
      `Permanently delete "${item.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionId(item._id);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("rentforge_token");

      if (!token) {
        throw new Error("Please log in again as an administrator.");
      }

      const response = await fetch(
        `${API_URL}/api/equipment/admin/${item._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete equipment."
        );
      }

      setMessage(data.message || "Equipment deleted successfully.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Equipment deletion failed."
      );
    } finally {
      setActionId(null);
    }
  };

  // ========================================
  // STATUS BADGE
  // ========================================

  const statusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#C98B52]">
            ADMIN MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#24352D]">
            Equipment Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review, approve, edit and manage all listed equipment.
          </p>
        </div>

        <button
          onClick={refreshEquipment}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#24352D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344B40] disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Equipment",
            value: total,
            icon: Boxes,
            color: "text-[#24352D]",
          },
          {
            label: "Pending Review",
            value: pending,
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Approved",
            value: approved,
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            label: "Rejected",
            value: rejected,
            icon: XCircle,
            color: "text-red-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-[#24352D]">
                    {loading ? "..." : stat.value}
                  </h2>
                </div>

                <div className="rounded-xl bg-[#F5F1E8] p-3">
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={19} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid gap-4 rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            placeholder="Search equipment or owner..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-[#E9E0D2] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#C98B52]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          className="rounded-xl border border-[#E9E0D2] bg-white px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-[#E9E0D2] bg-white px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#24352D]">
          Equipment Listings
        </h2>

        <span className="text-sm text-gray-500">
          {equipment.length} result(s)
        </span>
      </div>

      {/* Equipment List */}
      {loading ? (
        <div className="rounded-2xl border border-[#E9E0D2] bg-white p-12 text-center">
          <RefreshCw
            size={30}
            className="mx-auto mb-3 animate-spin text-[#C98B52]"
          />
          <p className="text-sm text-gray-500">
            Loading equipment...
          </p>
        </div>
      ) : equipment.length === 0 ? (
        <div className="rounded-2xl border border-[#E9E0D2] bg-white p-12 text-center">
          <Package
            size={38}
            className="mx-auto mb-4 text-gray-400"
          />

          <h3 className="text-lg font-bold text-[#24352D]">
            No Equipment Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            No equipment matches the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {equipment.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Equipment Image */}
              <div className="relative h-52 bg-[#F5F1E8]">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Boxes size={48} className="text-[#A9B2A8]" />
                  </div>
                )}

                <span
                  className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-bold capitalize ${statusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </div>

              {/* Equipment Information */}
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#C98B52]">
                    {item.category || "Uncategorized"}
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-[#24352D]">
                    {item.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                    {item.description || "No description available."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8F6F1] p-4">
                  <div>
                    <p className="text-xs text-gray-500">Rental Price</p>
                    <p className="mt-1 font-bold text-[#24352D]">
                      ৳{Number(item.rentalPrice || 0).toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-gray-500">
                        /{item.rentalType || "Daily"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="mt-1 font-bold text-[#24352D]">
                      {item.availableQuantity ?? 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#C98B52]" />
                    {item.location || "Location not provided"}
                  </p>

                  <p>
                    <span className="font-semibold text-[#24352D]">
                      Owner:
                    </span>{" "}
                    {item.ownerInfo?.name || "Unknown"}
                  </p>

                  <p className="break-all">
                    <span className="font-semibold text-[#24352D]">
                      Email:
                    </span>{" "}
                    {item.ownerInfo?.email || "Not available"}
                  </p>
                </div>

                {item.status === "rejected" && item.rejectionReason && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <strong>Rejection reason:</strong>{" "}
                    {item.rejectionReason}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 border-t border-[#E9E0D2] pt-4">
                  {item.status !== "approved" && (
                    <button
                      onClick={() => handleStatusChange(item, "approved")}
                      disabled={actionId === item._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle size={15} />
                      Approve
                    </button>
                  )}

                  {item.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(item, "rejected")}
                      disabled={actionId === item._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(item)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#E9E0D2] px-3 py-2.5 text-xs font-semibold text-[#24352D] transition hover:bg-[#F5F1E8]"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    disabled={actionId === item._id}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================
          EDIT EQUIPMENT MODAL
      ======================================== */}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E9E0D2] p-5">
              <div>
                <h2 className="text-xl font-bold text-[#24352D]">
                  Edit Equipment
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Update equipment information.
                </p>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                disabled={savingEdit}
                aria-label="Close edit form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Equipment Name *
                  </label>
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) => updateFormField("name", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => updateFormField("description", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Category *
                  </label>
                  <select
                    required
                    value={editForm.category}
                    onChange={(e) => updateFormField("category", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] bg-white px-3 py-3 text-sm outline-none focus:border-[#C98B52]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Location *
                  </label>
                  <input
                    required
                    value={editForm.location}
                    onChange={(e) => updateFormField("location", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Rental Price (৳) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.rentalPrice}
                    onChange={(e) => updateFormField("rentalPrice", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Rental Type *
                  </label>
                  <select
                    value={editForm.rentalType}
                    onChange={(e) => updateFormField("rentalType", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] bg-white px-3 py-3 text-sm outline-none focus:border-[#C98B52]"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Available Quantity *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.availableQuantity}
                    onChange={(e) => updateFormField("availableQuantity", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Condition
                  </label>
                  <input
                    value={editForm.condition}
                    onChange={(e) => updateFormField("condition", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Brand
                  </label>
                  <input
                    value={editForm.brand}
                    onChange={(e) => updateFormField("brand", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Model
                  </label>
                  <input
                    value={editForm.model}
                    onChange={(e) => updateFormField("model", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editForm.image}
                    onChange={(e) => updateFormField("image", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                    Rental Terms
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.rentalTerms}
                    onChange={(e) => updateFormField("rentalTerms", e.target.value)}
                    className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E9E0D2] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={savingEdit}
                  className="rounded-xl border border-[#E9E0D2] px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 rounded-xl bg-[#24352D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#344B40] disabled:opacity-50"
                >
                  {savingEdit ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
