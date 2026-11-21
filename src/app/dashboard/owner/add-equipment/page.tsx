
"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PackagePlus,
  ImagePlus,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

const rentalTypes = ["Daily", "Weekly", "Monthly"];

export default function AddEquipmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("rentforge_token");
    const savedUser = localStorage.getItem("rentforge_user");

    if (!savedToken || !savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role?.toLowerCase() !== "owner") {
        router.replace("/");
        return;
      }

      setToken(savedToken);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Please login as an equipment owner.");
      return;
    }

    if (!form.category || !form.rentalType) {
      setError("Please select a category and rental type.");
      return;
    }

    if (Number(form.rentalPrice) <= 0) {
      setError("Rental price must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(Number(form.availableQuantity)) ||
      Number(form.availableQuantity) <= 0
    ) {
      setError("Available quantity must be a positive whole number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          rentalPrice: Number(form.rentalPrice),
          availableQuantity: Number(form.availableQuantity),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit equipment."
        );
      }

      setSuccess(
        "Equipment submitted successfully! Waiting for admin approval."
      );

      setForm({
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
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E5DED2] bg-[#FAF9F6] px-4 py-3.5 text-sm text-[#24352D] outline-none transition focus:border-[#C98B52] focus:ring-2 focus:ring-[#C98B52]/15";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#24352D]";

  return (
    <main className="min-h-screen bg-[#F5F1E8]">

      {/* Header */}
      <header className="border-b border-[#E9E0D2] bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard/owner" className="flex items-center gap-3">
            <div className="rounded-xl bg-[#24352D] p-2.5 text-white">
              <Wrench size={23} />
            </div>

            <span className="text-2xl font-extrabold text-[#24352D]">
              Rent<span className="text-[#C98B52]">Forge</span>
            </span>
          </Link>

          <Link
            href="/dashboard/owner"
            className="flex items-center gap-2 text-sm font-bold text-[#24352D] transition hover:text-[#C98B52]"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">

        {/* Title */}
        <div className="mb-9">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#24352D] text-white">
            <PackagePlus size={28} />
          </div>

          <p className="mb-2 text-sm font-bold uppercase tracking-[2px] text-[#C98B52]">
            Owner Workspace
          </p>

          <h1 className="text-3xl font-extrabold text-[#24352D] sm:text-4xl">
            Add New Equipment
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            List your equipment on RentForge and connect with customers
            looking for reliable rental solutions.
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-3xl border border-[#E9E0D2] bg-white shadow-sm">

          <div className="border-b border-[#E9E0D2] bg-[#24352D] px-6 py-5 sm:px-9">
            <h2 className="text-xl font-bold text-white">
              Equipment Information
            </h2>

            <p className="mt-1 text-sm text-white/60">
              Enter the details of your equipment below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-9 p-6 sm:p-9">

            {/* Feedback */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-3 text-green-700">
                  <CheckCircle2 size={22} className="shrink-0" />
                  <div>
                    <p className="font-bold">{success}</p>
                    <p className="mt-1 text-sm">
                      Your equipment status is Pending until an admin
                      approves it.
                    </p>

                    <Link
                      href="/dashboard/owner"
                      className="mt-4 inline-flex items-center gap-2 font-bold underline"
                    >
                      Return to Dashboard
                      <ArrowLeft size={16} className="rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <section>
              <h3 className="mb-5 border-b border-[#E9E0D2] pb-3 text-lg font-bold text-[#24352D]">
                01. Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label htmlFor="name" className={labelClass}>
                    Equipment Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Canon EOS R6 Camera"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className={labelClass}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your equipment and its features..."
                    rows={4}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className={labelClass}>
                    Equipment Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      Equipment Location *
                    </span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Sylhet, Bangladesh"
                    className={inputClass}
                    required
                  />
                </div>

              </div>
            </section>

            {/* Rental Information */}
            <section>
              <h3 className="mb-5 border-b border-[#E9E0D2] pb-3 text-lg font-bold text-[#24352D]">
                02. Rental Information
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label htmlFor="rentalPrice" className={labelClass}>
                    Rental Price (৳) *
                  </label>
                  <input
                    id="rentalPrice"
                    name="rentalPrice"
                    type="number"
                    min="1"
                    value={form.rentalPrice}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rentalType" className={labelClass}>
                    Rental Type *
                  </label>
                  <select
                    id="rentalType"
                    name="rentalType"
                    value={form.rentalType}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    {rentalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="availableQuantity" className={labelClass}>
                    Available Quantity *
                  </label>
                  <input
                    id="availableQuantity"
                    name="availableQuantity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.availableQuantity}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="condition" className={labelClass}>
                    Equipment Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Condition</option>
                    <option value="Brand New">Brand New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brand" className={labelClass}>
                    Brand
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Canon, Caterpillar"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="model" className={labelClass}>
                    Model
                  </label>
                  <input
                    id="model"
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="e.g. EOS R6"
                    className={inputClass}
                  />
                </div>

              </div>
            </section>

            {/* Equipment Image */}
            <section>
              <h3 className="mb-5 border-b border-[#E9E0D2] pb-3 text-lg font-bold text-[#24352D]">
                03. Equipment Image
              </h3>

              <div className="rounded-2xl border-2 border-dashed border-[#DCD5C9] bg-[#FAF9F6] p-6">

                <div className="mb-4 flex items-center gap-3 text-[#24352D]">
                  <ImagePlus size={24} className="text-[#C98B52]" />
                  <div>
                    <p className="font-bold">Equipment Image URL</p>
                    <p className="text-xs text-gray-500">
                      Paste a publicly accessible image URL.
                    </p>
                  </div>
                </div>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/equipment.jpg"
                  className={inputClass}
                />

                {form.image && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-[#E9E0D2] bg-white p-2">
                    <img
                      src={form.image}
                      alt="Equipment preview"
                      className="h-48 w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

              </div>
            </section>

            {/* Rental Terms */}
            <section>
              <h3 className="mb-5 border-b border-[#E9E0D2] pb-3 text-lg font-bold text-[#24352D]">
                04. Rental Terms
              </h3>

              <div>
                <label htmlFor="rentalTerms" className={labelClass}>
                  Rental Terms & Conditions *
                </label>

                <textarea
                  id="rentalTerms"
                  name="rentalTerms"
                  value={form.rentalTerms}
                  onChange={handleChange}
                  placeholder="Explain equipment usage, return policy and other rental conditions..."
                  rows={4}
                  className={inputClass}
                  required
                />
              </div>
            </section>

            {/* Status Info */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-800">
                Approval Notice
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                New equipment listings are submitted as Pending and must be
                approved by an administrator before customers can rent them.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#E9E0D2] pt-6 sm:flex-row sm:justify-end">

              <Link
                href="/dashboard/owner"
                className="rounded-xl border border-[#24352D] px-7 py-3.5 text-center text-sm font-bold text-[#24352D] transition hover:bg-[#F5F1E8]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading || !token}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#24352D] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#C98B52] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Save size={19} />
                    Submit Equipment
                  </>
                )}
              </button>

            </div>

          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          © 2026 RentForge. Equipment Rental Marketplace.
        </p>

      </div>
    </main>
  );
}
