"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Package,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Search,
  X,
  Save,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

const RENTAL_TYPES = ["Daily", "Weekly", "Monthly"];

type Equipment = {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  condition: string;
  brand: string;
  model: string;
  image?: string;
  rentalTerms: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
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

export default function MyEquipmentPage() {
  const router = useRouter();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selected, setSelected] = useState<Equipment | null>(null);
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<EquipmentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("rentforge_token");

  // Load Owner Equipment
  const loadEquipment = useCallback(async () => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/equipment/my-equipment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your session is invalid. Please login again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load equipment.");
      }

      setEquipment(data.equipment || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Owner Authentication
  useEffect(() => {
    const userText = localStorage.getItem("rentforge_user");

    if (!getToken() || !userText) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userText);

      if (user.role?.toLowerCase() !== "owner") {
        router.replace("/");
        return;
      }

      loadEquipment();
    } catch {
      router.replace("/login");
    }
  }, [router, loadEquipment]);

  // Search, Filter and Sort
  const filteredEquipment = [...equipment]
    .filter((item) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        (item.name || "").toLowerCase().includes(term) ||
        (item.category || "").toLowerCase().includes(term) ||
        (item.location || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      switch (sortBy) {
        case "oldest":
          return dateA - dateB;

        case "price-low":
          return a.rentalPrice - b.rentalPrice;

        case "price-high":
          return b.rentalPrice - a.rentalPrice;

        case "quantity":
          return b.availableQuantity - a.availableQuantity;

        case "name":
          return a.name.localeCompare(b.name);

        case "newest":
        default:
          return dateB - dateA;
      }
    });

  // Open Edit Modal
  const openEdit = (item: Equipment) => {
    setSelected(item);

    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      location: item.location,
      rentalPrice: String(item.rentalPrice),
      rentalType: item.rentalType,
      availableQuantity: String(item.availableQuantity),
      condition: item.condition || "",
      brand: item.brand || "",
      model: item.model || "",
      image: item.image || "",
      rentalTerms: item.rentalTerms || "",
    });

    setViewing(false);
    setEditing(true);
    setError("");
    setSuccess("");
  };

  // Close Modal
  const closeModal = () => {
    setSelected(null);
    setViewing(false);
    setEditing(false);
    setForm(emptyForm);
  };

  // Form Change
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // Update Equipment
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selected) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const price = Number(form.rentalPrice);
    const quantity = Number(form.availableQuantity);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Rental price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/equipment/${selected._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            rentalPrice: price,
            availableQuantity: quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Equipment update failed.");
      }

      closeModal();
      setSuccess("Equipment updated successfully.");
      await loadEquipment();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Equipment
  const handleDelete = async (item: Equipment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setDeletingId(item._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/equipment/${item._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Equipment deletion failed.");
      }

      setSuccess("Equipment deleted successfully.");
      await loadEquipment();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Common Input Style
  const inputClass =
    "w-full rounded-xl border border-[#E5DED2] bg-[#FAF9F6] px-4 py-3 text-sm text-[#24352D] outline-none transition focus:border-[#C98B52]";

  // Status Badge Style
  const statusStyle = (status: string) => {
    if (status === "approved") return "bg-green-50 text-green-700";
    if (status === "rejected") return "bg-red-50 text-red-600";
    return "bg-amber-50 text-amber-700";
  };

  // Equipment Statistics
  const totalApproved = equipment.filter(
    (item) => item.status === "approved"
  ).length;

  const totalPending = equipment.filter(
    (item) => item.status === "pending"
  ).length;

  const totalRejected = equipment.filter(
    (item) => item.status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-[#F5F1E8] text-[#24352D]">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E9E0D2] bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <Link
            href="/dashboard/owner"
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-[#24352D] p-2.5 text-white">
              <Package size={23} />
            </div>

            <span className="text-2xl font-extrabold">
              Rent<span className="text-[#C98B52]">Forge</span>
            </span>
          </Link>

          <Link
            href="/dashboard/owner"
            className="flex items-center gap-2 text-sm font-bold transition hover:text-[#C98B52]"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        {/* Title */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[2px] text-[#C98B52]">
              Owner Workspace
            </p>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              My Equipment
            </h1>

            <p className="mt-3 text-gray-500">
              Manage, update and monitor all your equipment listings.
            </p>
          </div>

          <Link
            href="/dashboard/owner/add-equipment"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#24352D] px-6 py-3.5 font-bold text-white transition hover:bg-[#C98B52]"
          >
            <Plus size={20} />
            Add Equipment
          </Link>

        </div>

        {/* Feedback */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            { label: "Total Equipment", value: equipment.length },
            { label: "Approved", value: totalApproved },
            { label: "Pending", value: totalPending },
            { label: "Rejected", value: totalRejected },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-extrabold">
                {stat.value}
              </p>
            </div>
          ))}

        </div>

        {/* Search, Filter and Sort */}
        <div className="mb-6 grid gap-4 rounded-2xl border border-[#E9E0D2] bg-white p-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className={`${inputClass} pl-11`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={inputClass}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={inputClass}
            aria-label="Sort equipment"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="quantity">Most Available</option>
            <option value="name">Name: A to Z</option>
          </select>

          <button
            type="button"
            onClick={loadEquipment}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5DED2] px-5 py-3 font-semibold transition hover:bg-[#F5F1E8]"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* Equipment List */}
        <div className="overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-[#E9E0D2] px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">
                Equipment Listings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredEquipment.length} equipment found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E9E0D2] border-t-[#24352D]" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading your equipment...
                </p>
              </div>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package size={42} className="mx-auto text-gray-300" />

              <h3 className="mt-4 text-lg font-bold">
                No Equipment Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or add new equipment.
              </p>

              <Link
                href="/dashboard/owner/add-equipment"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#24352D] px-5 py-3 font-bold text-white hover:bg-[#C98B52]"
              >
                <Plus size={18} />
                Add Equipment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E9E0D2]">

              {filteredEquipment.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-5 p-5 transition hover:bg-[#FAF9F6] sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                >

                  {/* Equipment Info */}
                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E9EDE5]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          size={32}
                          className="text-[#24352D]"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.category}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={14} />
                        {item.location}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(item.status)}`}
                        >
                          {item.status}
                        </span>

                        <span className="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-semibold text-[#24352D]">
                          Quantity: {item.availableQuantity}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">

                    <div className="min-w-24">
                      <p className="text-xl font-extrabold">
                        ৳{item.rentalPrice.toLocaleString("en-BD")}
                      </p>

                      <p className="text-xs text-gray-500">
                        Per {item.rentalType}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setViewing(true);
                          setEditing(false);
                        }}
                        className="flex items-center gap-2 rounded-lg border border-[#24352D] px-3 py-2 text-xs font-bold transition hover:bg-[#E9EDE5]"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-2 rounded-lg bg-[#C98B52] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#B87942]"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item._id}
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />

                        {deletingId === item._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          © 2026 RentForge. Owner Equipment Management.
        </p>

      </div>

      {/* View Details Modal */}
      {viewing && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Equipment Details
              </h2>

              <button
                onClick={closeModal}
                aria-label="Close details"
              >
                <X size={23} />
              </button>
            </div>

            {selected.image && (
              <img
                src={selected.image}
                alt={selected.name}
                className="mb-5 h-52 w-full rounded-xl object-cover"
              />
            )}

            <h3 className="text-2xl font-extrabold">
              {selected.name}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {selected.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">

              <p>
                <strong>Category:</strong>
                <br />
                {selected.category}
              </p>

              <p>
                <strong>Location:</strong>
                <br />
                {selected.location}
              </p>

              <p>
                <strong>Price:</strong>
                <br />
                ৳{selected.rentalPrice} / {selected.rentalType}
              </p>

              <p>
                <strong>Quantity:</strong>
                <br />
                {selected.availableQuantity}
              </p>

              <p>
                <strong>Condition:</strong>
                <br />
                {selected.condition || "Not specified"}
              </p>

              <p>
                <strong>Brand / Model:</strong>
                <br />
                {selected.brand || "—"} {selected.model || ""}
              </p>

              <p className="col-span-2">
                <strong>Rental Terms:</strong>
                <br />
                {selected.rentalTerms || "Not specified"}
              </p>

            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="rounded-xl bg-[#24352D] px-6 py-3 font-bold text-white hover:bg-[#C98B52]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {editing && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#C98B52]">
                  Owner Workspace
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Update Equipment
                </h2>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close edit form"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Equipment Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className={inputClass}
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Location
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Rental Price
                  </label>

                  <input
                    name="rentalPrice"
                    type="number"
                    min="1"
                    value={form.rentalPrice}
                    onChange={handleFormChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Rental Type
                  </label>

                  <select
                    name="rentalType"
                    value={form.rentalType}
                    onChange={handleFormChange}
                    className={inputClass}
                  >
                    {RENTAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Available Quantity
                  </label>

                  <input
                    name="availableQuantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.availableQuantity}
                    onChange={handleFormChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    className={inputClass}
                  >
                    <option value="">Select Condition</option>
                    <option value="Brand New">Brand New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Brand
                  </label>

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Model
                  </label>

                  <input
                    name="model"
                    value={form.model}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Image URL
                </label>

                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleFormChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Rental Terms
                </label>

                <textarea
                  name="rentalTerms"
                  value={form.rentalTerms}
                  onChange={handleFormChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E9E0D2] pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#24352D] px-6 py-3 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#24352D] px-7 py-3 font-bold text-white transition hover:bg-[#C98B52] disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}