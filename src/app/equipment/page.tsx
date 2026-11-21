
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  RefreshCw,
  PackageOpen,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

type Equipment = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  rentalPrice?: number | string;
  rentalType?: string;
  location?: string;
  availableQuantity?: number;
  image?: string;
  imageUrl?: string;
  equipmentImage?: string;
  createdAt?: string;
  condition?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [rentalTypes, setRentalTypes] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [rentalType, setRentalType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("recent");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // Fetch Equipment From Backend
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "all") {
          params.set("category", category);
        }

        if (rentalType !== "all") {
          params.set("rentalType", rentalType);
        }

        if (minPrice !== "") {
          params.set("minPrice", minPrice);
        }

        if (maxPrice !== "") {
          params.set("maxPrice", maxPrice);
        }

        if (availability !== "all") {
          params.set("availability", availability);
        }

        params.set("sort", sort);

        const response = await fetch(
          `${API_URL}/api/equipment?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load equipment."
          );
        }

        const received: Equipment[] = Array.isArray(data.equipment)
          ? data.equipment
          : [];

        setEquipment(received);

        // Load filter options from the complete equipment list.
        if (
          !search &&
          category === "all" &&
          rentalType === "all" &&
          minPrice === "" &&
          maxPrice === "" &&
          availability === "all"
        ) {
          setCategories(
            Array.from(
              new Set(
                received
                  .map((item) => item.category)
                  .filter((value): value is string => Boolean(value))
              )
            ).sort()
          );

          setRentalTypes(
            Array.from(
              new Set(
                received
                  .map((item) => item.rentalType)
                  .filter((value): value is string => Boolean(value))
              )
            ).sort()
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    search,
    category,
    rentalType,
    minPrice,
    maxPrice,
    availability,
    sort,
  ]);

  // ========================================
  // Reset All Filters
  // ========================================

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setRentalType("all");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("all");
    setSort("recent");
  };

  // ========================================
  // Equipment Helpers
  // ========================================

  const getEquipmentId = (item: Equipment) =>
    String(item._id || item.id || "");

  const getEquipmentImage = (item: Equipment) => {
    return (
      item.image ||
      item.imageUrl ||
      item.equipmentImage ||
      "/banner-equipment.png"
    );
  };

  const formatPrice = (price?: number | string) => {
    const value = Number(price);

    if (!Number.isFinite(value)) return "Price unavailable";

    return `৳${value.toLocaleString("en-BD")}`;
  };

  // ========================================
  // Page UI
  // ========================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F5F1E8]">

        {/* Page Header */}

        <section className="bg-[#24352D] px-5 py-16 text-white md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="font-semibold tracking-widest text-[#C98B52]">
              RENTFORGE MARKETPLACE
            </p>

            <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
              Explore Equipment
            </h1>

            <p className="mt-4 max-w-2xl leading-8 text-gray-300">
              Find the right equipment for your next project.
              Search, compare rental prices and discover
              professional equipment from verified listings.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

          {/* Search */}

          <div className="mb-7 rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm">
            <div className="relative">
              <Search
                size={21}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search equipment name or location..."
                className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] py-4 pl-12 pr-4 text-sm text-[#24352D] outline-none transition focus:border-[#C98B52] focus:ring-2 focus:ring-[#C98B52]/10"
              />
            </div>
          </div>

          {/* Filters */}

          <div className="mb-9 rounded-2xl border border-[#E9E0D2] bg-white p-5 shadow-sm">

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={21}
                  className="text-[#C98B52]"
                />

                <h2 className="text-lg font-bold text-[#24352D]">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm font-semibold text-[#C98B52] transition hover:text-[#24352D]"
              >
                <RotateCcw size={16} />
                Reset Filters
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                  Equipment Category
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] px-4 py-3 text-sm text-[#24352D] outline-none focus:border-[#C98B52]"
                >
                  <option value="all">All Categories</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rental Type */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                  Rental Type
                </label>

                <select
                  value={rentalType}
                  onChange={(event) => setRentalType(event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] px-4 py-3 text-sm text-[#24352D] outline-none focus:border-[#C98B52]"
                >
                  <option value="all">All Rental Types</option>

                  {rentalTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                  Availability
                </label>

                <select
                  value={availability}
                  onChange={(event) =>
                    setAvailability(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] px-4 py-3 text-sm text-[#24352D] outline-none focus:border-[#C98B52]"
                >
                  <option value="all">All Equipment</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* Minimum Price */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                  Minimum Price (৳)
                </label>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Minimum price"
                  className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] px-4 py-3 text-sm text-[#24352D] outline-none focus:border-[#C98B52]"
                />
              </div>

              {/* Maximum Price */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                  Maximum Price (৳)
                </label>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Maximum price"
                  className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] px-4 py-3 text-sm text-[#24352D] outline-none focus:border-[#C98B52]"
                />
              </div>

              {/* Sorting */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24352D]">
                  Sort Equipment
                </label>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="w-full rounded-xl border border-[#E9E0D2] bg-[#FCFAF6] px-4 py-3 text-sm text-[#24352D] outline-none focus:border-[#C98B52]"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-low-high">
                    Price: Low to High
                  </option>
                  <option value="price-high-low">
                    Price: High to Low
                  </option>
                </select>
              </div>

            </div>
          </div>

          {/* Equipment Heading */}

          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-widest text-[#C98B52]">
                FIND YOUR EQUIPMENT
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[#24352D]">
                Available Equipment
              </h2>
            </div>

            <p className="text-sm font-medium text-gray-500">
              {loading ? "Loading..." : `${equipment.length} items found`}
            </p>
          </div>

          {/* Loading */}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="h-56 bg-[#E9E0D2]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 rounded bg-[#E9E0D2]" />
                    <div className="h-4 w-1/2 rounded bg-[#E9E0D2]" />
                    <div className="h-10 rounded bg-[#E9E0D2]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>

              <p className="mt-2 text-sm text-red-600">
                Please check your backend connection.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-[#24352D] px-6 py-3 font-semibold text-white"
              >
                Reset and Try Again
              </button>
            </div>
          )}

          {/* Empty State */}

          {!loading && !error && equipment.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#D8CBB8] bg-white px-6 py-16 text-center">
              <PackageOpen
                size={48}
                className="mx-auto text-[#C98B52]"
              />

              <h3 className="mt-5 text-xl font-bold text-[#24352D]">
                No Equipment Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filter options.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-[#24352D] px-6 py-3 font-semibold text-white transition hover:bg-[#C98B52]"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Equipment Cards */}

          {!loading && !error && equipment.length > 0 && (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {equipment.map((item) => {
                const id = getEquipmentId(item);
                const quantity = Number(item.availableQuantity || 0);
                const isAvailable = quantity > 0;

                return (
                  <article
                    key={id || item.name}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E9E0D2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* Image */}

                    <div className="relative h-56 overflow-hidden bg-[#E9E0D2]">

                      <img
                        src={getEquipmentImage(item)}
                        alt={item.name || "Equipment"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = "/banner-equipment.png";
                        }}
                      />

                      <span
                        className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
                          isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>

                      {item.category && (
                        <span className="absolute bottom-4 left-4 rounded-full bg-[#24352D]/90 px-3 py-1.5 text-xs font-semibold text-white">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}

                    <div className="flex flex-1 flex-col p-5">

                      <div className="flex-1">

                        <h3 className="text-xl font-bold text-[#24352D]">
                          {item.name || "Unnamed Equipment"}
                        </h3>

                        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-gray-500">
                          {item.description || "Professional equipment available for rent."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-[#C98B52]" />
                            {item.location || "Location not specified"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm text-gray-500">
                            {quantity} available
                          </span>

                          <span className="rounded-lg bg-[#F5F1E8] px-3 py-1.5 text-xs font-semibold capitalize text-[#24352D]">
                            {item.rentalType || "Rental"}
                          </span>
                        </div>

                      </div>

                      {/* Price and Details */}

                      <div className="mt-6 flex items-center justify-between border-t border-[#E9E0D2] pt-5">

                        <div>
                          <p className="text-xs text-gray-500">
                            Rental Price
                          </p>

                          <p className="mt-1 text-xl font-extrabold text-[#24352D]">
                            {formatPrice(item.rentalPrice)}
                          </p>

                          <p className="text-xs capitalize text-gray-500">
                            per {item.rentalType || "rental"}
                          </p>
                        </div>

                        <Link
                          href={
                            id
                              ? `/equipment/${encodeURIComponent(id)}`
                              : "/login"
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-[#24352D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C98B52]"
                        >
                          View Details
                          <ArrowRight size={16} />
                        </Link>

                      </div>
                    </div>
                  </article>
                );
              })}

            </div>
          )}

          {/* Footer Note */}

          <div className="mt-12 text-center text-sm text-gray-500">
            Showing approved equipment available on RentForge.
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
