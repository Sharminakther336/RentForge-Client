
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import BookingForm from "@/components/booking/BookingForm";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
  CalendarDays,
  LoaderCircle,
  CheckCircle2,
  Wrench,
} from "lucide-react";

// ========================================
// Equipment Type
// ========================================

type Equipment = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  rentalPrice?: number | string;
  rentalType?: string;
  availableQuantity?: number;
  condition?: string;
  brand?: string;
  model?: string;
  image?: string;
  imageUrl?: string;
  equipmentImage?: string;
  rentalTerms?: string;
  ownerInfo?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

// ========================================
// API Configuration
// ========================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// ========================================
// Featured Equipment Data
// ========================================

const featuredEquipment: Record<string, Equipment> = {
  "featured-1": {
    id: "featured-1",
    name: "Heavy Duty Excavator",
    category: "Construction",
    rentalPrice: 8500,
    rentalType: "Daily",
    location: "Sylhet, Bangladesh",
    description:
      "Heavy Duty Excavator for construction, excavation, earthmoving and large-scale project work. Explore this equipment for your next construction project.",
    image:
      "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=1000",
  },

  "featured-2": {
    id: "featured-2",
    name: "Industrial Generator",
    category: "Power Equipment",
    rentalPrice: 2500,
    rentalType: "Daily",
    location: "Dhaka, Bangladesh",
    description:
      "Industrial Generator for power supply at construction sites, businesses and outdoor projects.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1000",
  },

  "featured-3": {
    id: "featured-3",
    name: "Modern Bulldozer",
    category: "Construction",
    rentalPrice: 6500,
    rentalType: "Daily",
    location: "Moulvibazar, Bangladesh",
    description:
      "Modern Bulldozer suitable for construction sites, land clearing and earthmoving operations.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000",
  },

  "featured-4": {
    id: "featured-4",
    name: "Professional Forklift",
    category: "Material Handling",
    rentalPrice: 3500,
    rentalType: "Daily",
    location: "Chattogram, Bangladesh",
    description:
      "Professional Forklift for warehouse operations, lifting materials and transporting goods.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000",
  },

  "featured-5": {
    id: "featured-5",
    name: "Concrete Mixer",
    category: "Construction",
    rentalPrice: 1800,
    rentalType: "Daily",
    location: "Sylhet, Bangladesh",
    description:
      "Concrete Mixer equipment for preparing concrete during construction and building projects.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000",
  },

  "featured-6": {
    id: "featured-6",
    name: "Agricultural Tractor",
    category: "Agriculture",
    rentalPrice: 4000,
    rentalType: "Daily",
    location: "Moulvibazar, Bangladesh",
    description:
      "Agricultural Tractor for farming, field preparation and agricultural transportation work.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000",
  },
};

// ========================================
// Main Details Page
// ========================================

export default function EquipmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const equipmentId = String(params.id || "");

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // Load Equipment
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    const loadEquipment = async () => {
      setLoading(true);
      setError("");

      try {
        // Authentication check

        const token = localStorage.getItem("rentforge_token");
        const storedUser = localStorage.getItem("rentforge_user");

        if (!token || !storedUser) {
          router.replace("/login");
          return;
        }

        try {
          JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("rentforge_token");
          localStorage.removeItem("rentforge_user");
          router.replace("/login");
          return;
        }

        // Support /equipment/1
        // Support /equipment/featured-1

        const featuredKey = equipmentId.startsWith("featured-")
          ? equipmentId
          : /^\d+$/.test(equipmentId)
            ? `featured-${equipmentId}`
            : "";

        const featuredItem = featuredEquipment[featuredKey];

        if (featuredItem) {
          setEquipment(featuredItem);
          return;
        }

        // Fetch MongoDB equipment

        const response = await fetch(`${API_URL}/api/equipment`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load equipment details."
          );
        }

        const items: Equipment[] = Array.isArray(data.equipment)
          ? data.equipment
          : [];

        const selectedEquipment = items.find((item) => {
          const itemId = String(item._id || item.id || "");

          return itemId === decodeURIComponent(equipmentId);
        });

        if (!selectedEquipment) {
          setError("Equipment not found or no longer available.");
          return;
        }

        setEquipment(selectedEquipment);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load equipment details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (equipmentId) {
      loadEquipment();
    }

    return () => {
      controller.abort();
    };
  }, [equipmentId, router]);

  // ========================================
  // Image Helper
  // ========================================

  const getEquipmentImage = () => {
    return (
      equipment?.image ||
      equipment?.imageUrl ||
      equipment?.equipmentImage ||
      "/banner-equipment.png"
    );
  };

  // ========================================
  // Price Helper
  // ========================================

  const formatPrice = (price?: number | string) => {
    const value = Number(price || 0);

    return `৳${value.toLocaleString("en-BD")}`;
  };

  // ========================================
  // Loading Screen
  // ========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center bg-[#F5F1E8]">
          <div className="text-center">
            <LoaderCircle
              size={46}
              className="mx-auto animate-spin text-[#C98B52]"
            />

            <p className="mt-4 font-semibold text-[#24352D]">
              Loading Equipment Details...
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ========================================
  // Error Screen
  // ========================================

  if (error || !equipment) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center bg-[#F5F1E8] px-5">
          <div className="w-full max-w-md rounded-2xl border border-[#E9E0D2] bg-white p-10 text-center shadow-sm">
            <Package
              size={48}
              className="mx-auto text-[#C98B52]"
            />

            <h1 className="mt-5 text-2xl font-bold text-[#24352D]">
              Equipment Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {error || "This equipment could not be found."}
            </p>

            <Link
              href="/equipment"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#24352D] px-6 py-3 font-semibold text-white transition hover:bg-[#C98B52]"
            >
              <ArrowLeft size={18} />
              Back to Equipment
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ========================================
  // Equipment Information
  // ========================================

  const quantity = equipment.availableQuantity;

  const isAvailable =
    quantity === undefined || quantity > 0;

  const isFeatured = Boolean(
    equipment.id?.startsWith("featured-")
  );

  const databaseEquipmentId = String(
    equipment._id || equipment.id || equipmentId
  );

  const isValidDatabaseId =
    /^[a-fA-F0-9]{24}$/.test(databaseEquipmentId);

  // ========================================
  // Details Page UI
  // ========================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F5F1E8]">

        {/* Page Header */}

        <section className="bg-[#24352D] px-5 py-10 text-white md:py-14">
          <div className="mx-auto max-w-7xl">

            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition hover:text-[#C98B52]"
            >
              <ArrowLeft size={18} />
              Back to Equipment
            </Link>

            <p className="mt-7 text-sm font-semibold tracking-widest text-[#C98B52]">
              RENTFORGE EQUIPMENT DETAILS
            </p>

            <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
              {equipment.name}
            </h1>

            <p className="mt-4 flex items-center gap-2 text-gray-300">
              <MapPin size={18} />
              {equipment.location || "Location not provided"}
            </p>
          </div>
        </section>

        {/* Main Content */}

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="grid gap-9 lg:grid-cols-5">

            {/* LEFT COLUMN */}

            <div className="lg:col-span-3">

              {/* Equipment Image */}

              <div className="overflow-hidden rounded-3xl border border-[#E9E0D2] bg-white shadow-sm">
                <img
                  src={getEquipmentImage()}
                  alt={equipment.name}
                  className="h-[300px] w-full object-cover sm:h-[450px]"
                  onError={(event) => {
                    event.currentTarget.src =
                      "/banner-equipment.png";
                  }}
                />
              </div>

              {/* Equipment Description */}

              <div className="mt-7 rounded-2xl border border-[#E9E0D2] bg-white p-7">
                <div className="flex items-center gap-3">
                  <Wrench
                    size={23}
                    className="text-[#C98B52]"
                  />

                  <h2 className="text-2xl font-bold text-[#24352D]">
                    Equipment Description
                  </h2>
                </div>

                <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
                  {equipment.description ||
                    "No description has been provided."}
                </p>
              </div>

              {/* Equipment Specifications */}

              <div className="mt-6 rounded-2xl border border-[#E9E0D2] bg-white p-7">
                <h2 className="text-2xl font-bold text-[#24352D]">
                  Equipment Specifications
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <div>
                    <p className="text-sm text-gray-500">
                      Brand
                    </p>

                    <p className="mt-1 font-semibold text-[#24352D]">
                      {equipment.brand || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Model
                    </p>

                    <p className="mt-1 font-semibold text-[#24352D]">
                      {equipment.model || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Equipment Condition
                    </p>

                    <p className="mt-1 font-semibold text-[#24352D]">
                      {equipment.condition || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Rental Type
                    </p>

                    <p className="mt-1 font-semibold capitalize text-[#24352D]">
                      {equipment.rentalType || "Not specified"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Rental Terms */}

              <div className="mt-6 rounded-2xl border border-[#E9E0D2] bg-white p-7">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    size={24}
                    className="text-[#C98B52]"
                  />

                  <h2 className="text-xl font-bold text-[#24352D]">
                    Rental Terms & Conditions
                  </h2>
                </div>

                <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                  {equipment.rentalTerms ||
                    "Please contact the equipment owner to confirm rental terms and conditions."}
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN */}

            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl border border-[#E9E0D2] bg-white p-7 shadow-sm">

                {/* Availability */}

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                    isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <CheckCircle2 size={15} />

                  {quantity === undefined
                    ? "Featured Listing"
                    : isAvailable
                      ? "Available"
                      : "Unavailable"}
                </span>

                <h2 className="mt-5 text-2xl font-bold text-[#24352D]">
                  {equipment.name}
                </h2>

                {/* Price */}

                <div className="mt-6 border-b border-[#E9E0D2] pb-6">
                  <p className="text-sm text-gray-500">
                    Rental Price
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#24352D]">
                    {formatPrice(equipment.rentalPrice)}
                  </p>

                  <p className="mt-1 text-sm capitalize text-gray-500">
                    Per {equipment.rentalType || "rental"}
                  </p>
                </div>

                {/* Equipment Information */}

                <div className="mt-6 space-y-5">

                  <div className="flex items-start gap-3">
                    <Tag
                      size={20}
                      className="mt-0.5 text-[#C98B52]"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Category
                      </p>

                      <p className="mt-1 font-semibold text-[#24352D]">
                        {equipment.category || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={20}
                      className="mt-0.5 text-[#C98B52]"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Location
                      </p>

                      <p className="mt-1 font-semibold text-[#24352D]">
                        {equipment.location || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package
                      size={20}
                      className="mt-0.5 text-[#C98B52]"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Available Quantity
                      </p>

                      <p className="mt-1 font-semibold text-[#24352D]">
                        {quantity === undefined
                          ? "Not specified"
                          : quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={20}
                      className="mt-0.5 text-[#C98B52]"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Rental Type
                      </p>

                      <p className="mt-1 font-semibold capitalize text-[#24352D]">
                        {equipment.rentalType || "Not specified"}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Owner Information */}

                <div className="mt-7 rounded-xl bg-[#F5F1E8] p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={19}
                      className="text-[#C98B52]"
                    />

                    <p className="text-sm font-bold text-[#24352D]">
                      Equipment Owner
                    </p>
                  </div>

                  {equipment.ownerInfo?.name ||
                  equipment.ownerInfo?.email ? (
                    <>
                      <p className="mt-3 font-semibold text-[#24352D]">
                        {equipment.ownerInfo.name || "Owner"}
                      </p>

                      {equipment.ownerInfo.email && (
                        <p className="mt-1 break-all text-sm text-gray-500">
                          {equipment.ownerInfo.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      Owner information is not available for this featured listing.
                    </p>
                  )}
                </div>

                {/* Booking Action */}

                {quantity !== undefined && quantity <= 0 ? (
                  <button
                    type="button"
                    disabled
                    className="mt-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-300 px-6 py-4 font-bold text-gray-600"
                  >
                    Currently Unavailable
                  </button>
                ) : isFeatured || !isValidDatabaseId ? (
                  <div className="mt-7 rounded-xl border border-[#E9E0D2] bg-[#F5F1E8] p-4">
                    <p className="text-sm leading-6 text-gray-600">
                      This is a featured demonstration listing. Please select an approved database listing to make a booking.
                    </p>
                  </div>
                ) : (
                  <BookingForm
                    equipmentId={databaseEquipmentId}
                    equipmentName={equipment.name}
                    rentalPrice={equipment.rentalPrice || 0}
                    rentalType={equipment.rentalType}
                    availableQuantity={equipment.availableQuantity}
                  />
                )}

                <Link
                  href="/equipment"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#24352D] px-6 py-4 font-bold text-[#24352D] transition hover:bg-[#24352D] hover:text-white"
                >
                  Explore More Equipment
                  <ArrowRight size={19} />
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                  {isFeatured
                    ? "This is a featured demonstration listing. Live booking is available through approved database listings."
                    : "Your booking will be confirmed after successful demo payment."}
                </p>

              </div>
            </div>

          </div>

          {/* Back Link */}

          <div className="mt-10">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 font-semibold text-[#24352D] transition hover:text-[#C98B52]"
            >
              <ArrowLeft size={18} />
              Back to All Equipment
            </Link>
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}
