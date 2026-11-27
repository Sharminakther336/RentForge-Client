
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, LoaderCircle, ShieldCheck } from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

type BookingFormProps = {
  equipmentId: string;
  equipmentName: string;
  rentalPrice: number | string;
  rentalType?: string;
  availableQuantity?: number;
};

export default function BookingForm({
  equipmentId,
  equipmentName,
  rentalPrice,
  rentalType,
  availableQuantity,
}: BookingFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    rentalStartDate: "",
    rentalEndDate: "",
    requiredQuantity: "1",
    contactNumber: "",
    deliveryAddress: "",
    additionalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleBooking = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("rentforge_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (
      equipmentId.startsWith("featured-") ||
      !/^[a-fA-F0-9]{24}$/.test(equipmentId)
    ) {
      setError(
        "This featured equipment cannot be booked. Please select an approved equipment listing."
      );
      return;
    }

    if (form.rentalStartDate < today) {
      setError("Rental start date cannot be in the past.");
      return;
    }

    if (form.rentalEndDate <= form.rentalStartDate) {
      setError("End date must be after start date.");
      return;
    }

    const quantity = Number(form.requiredQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (
      availableQuantity !== undefined &&
      quantity > availableQuantity
    ) {
      setError(
        `Maximum available quantity is ${availableQuantity}.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId,
          rentalStartDate: form.rentalStartDate,
          rentalEndDate: form.rentalEndDate,
          requiredQuantity: quantity,
          contactNumber: form.contactNumber.trim(),
          deliveryAddress: form.deliveryAddress.trim(),
          additionalNotes: form.additionalNotes.trim(),
        }),
      });

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.bookingIntent?.id
      ) {
        throw new Error(
          data.message || "Unable to create booking request."
        );
      }

      sessionStorage.setItem(
        "rentforge_checkout",
        JSON.stringify(data.bookingIntent)
      );

      router.push(`/checkout/${data.bookingIntent.id}`);
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

  return (
    <div className="mt-7 rounded-2xl border border-[#E9E0D2] bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#F5F1E8] p-3">
          <CalendarDays
            className="text-[#C98B52]"
            size={23}
          />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#24352D]">
            Book This Equipment
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Complete your rental details
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-[#F5F1E8] p-4">
        <p className="text-sm text-gray-500">
          {equipmentName}
        </p>

        <p className="mt-1 text-xl font-extrabold text-[#24352D]">
          ৳{Number(rentalPrice).toLocaleString("en-BD")}

          <span className="ml-1 text-sm font-medium text-gray-500">
            / {rentalType || "rental"}
          </span>
        </p>
      </div>

      <form
        onSubmit={handleBooking}
        className="mt-6 space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#24352D]">
              Rental Start Date *
            </label>

            <input
              type="date"
              required
              min={today}
              value={form.rentalStartDate}
              onChange={(e) =>
                updateField("rentalStartDate", e.target.value)
              }
              className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#24352D]">
              Rental End Date *
            </label>

            <input
              type="date"
              required
              min={form.rentalStartDate || today}
              value={form.rentalEndDate}
              onChange={(e) =>
                updateField("rentalEndDate", e.target.value)
              }
              className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 text-sm outline-none focus:border-[#C98B52]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#24352D]">
            Required Quantity *
          </label>

          <input
            type="number"
            required
            min="1"
            max={availableQuantity}
            value={form.requiredQuantity}
            onChange={(e) =>
              updateField("requiredQuantity", e.target.value)
            }
            className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
          />

          {availableQuantity !== undefined && (
            <p className="mt-1 text-xs text-gray-500">
              Available quantity: {availableQuantity}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#24352D]">
            Contact Number *
          </label>

          <input
            type="tel"
            required
            placeholder="01XXXXXXXXX"
            value={form.contactNumber}
            onChange={(e) =>
              updateField("contactNumber", e.target.value)
            }
            className="w-full rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#24352D]">
            Delivery Address *
          </label>

          <textarea
            required
            rows={3}
            placeholder="Enter your complete delivery address"
            value={form.deliveryAddress}
            onChange={(e) =>
              updateField("deliveryAddress", e.target.value)
            }
            className="w-full resize-none rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#24352D]">
            Additional Notes (Optional)
          </label>

          <textarea
            rows={2}
            placeholder="Any special instructions..."
            value={form.additionalNotes}
            onChange={(e) =>
              updateField("additionalNotes", e.target.value)
            }
            className="w-full resize-none rounded-xl border border-[#E9E0D2] px-4 py-3 outline-none focus:border-[#C98B52]"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-[#F5F1E8] p-3">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-[#C98B52]"
          />

          <p className="text-xs leading-5 text-gray-600">
            You will be redirected to Stripe's secure checkout
            to complete your payment. This project is currently
            using Stripe test mode.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#24352D] px-6 py-4 font-bold text-white transition hover:bg-[#C98B52] hover:text-[#24352D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
              Processing...
            </>
          ) : (
            "Continue to Checkout"
          )}
        </button>
      </form>
    </div>
  );
}
