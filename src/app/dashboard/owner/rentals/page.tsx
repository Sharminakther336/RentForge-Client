
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// ============================================
// 1. CREATE BOOKING INTENT - CUSTOMER
// ============================================
const createBooking = async (req, res) => {
  try {
    const {
      equipmentId,
      rentalStartDate,
      rentalEndDate,
      requiredQuantity,
      contactNumber,
      deliveryAddress,
      additionalNotes,
    } = req.body || {};

    // Validate required fields
    if (
      !equipmentId ||
      !rentalStartDate ||
      !rentalEndDate ||
      requiredQuantity === undefined ||
      !contactNumber ||
      !deliveryAddress
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking information.",
      });
    }

    // Validate equipment ID
    if (!ObjectId.isValid(equipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid equipment ID.",
      });
    }

    // Validate quantity
    const quantity = Number(requiredQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Required quantity must be a positive integer.",
      });
    }

    // Validate contact number
    if (
      typeof contactNumber !== "string" ||
      !/^\+?[0-9\s-]{7,20}$/.test(contactNumber.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact number.",
      });
    }

    // Validate delivery address
    if (
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required.",
      });
    }

    // Validate rental dates
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid rental dates.",
      });
    }

    const now = new Date();

    if (startDate.getTime() < now.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Rental start date cannot be in the past.",
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    // Calculate total rental days
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / DAY_IN_MS
    );

    const db = getDB();

    // Find approved equipment
    const equipment = await db.collection("equipment").findOne({
      _id: new ObjectId(equipmentId),
      status: "approved",
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found or not approved.",
      });
    }

    // Calculate rental units
    let rentalUnits;

    switch (equipment.rentalType) {
      case "Daily":
        rentalUnits = totalDays;
        break;

      case "Weekly":
        rentalUnits = Math.ceil(totalDays / 7);
        break;

      case "Monthly":
        rentalUnits = Math.ceil(totalDays / 30);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid equipment rental type.",
        });
    }

    // Check existing bookings for overlapping dates
    const activeBookings = await db.collection("bookings").find({
      equipmentId: new ObjectId(equipmentId),
      bookingStatus: { $ne: "cancelled" },
      rentalStartDate: { $lt: endDate },
      rentalEndDate: { $gt: startDate },
    }).toArray();

    // Check active booking intents
    const activeIntents = await db.collection("bookingIntents").find({
      equipmentId: new ObjectId(equipmentId),
      status: "awaiting_payment",
      expiresAt: { $gt: now },
      rentalStartDate: { $lt: endDate },
      rentalEndDate: { $gt: startDate },
    }).toArray();

    const bookedQuantity = activeBookings.reduce(
      (total, booking) =>
        total + Number(booking.requiredQuantity || 0),
      0
    );

    const reservedQuantity = activeIntents.reduce(
      (total, intent) =>
        total + Number(intent.requiredQuantity || 0),
      0
    );

    const remainingQuantity =
      Number(equipment.availableQuantity) -
      bookedQuantity -
      reservedQuantity;

    if (quantity > remainingQuantity) {
      return res.status(409).json({
        success: false,
        message: "Not enough equipment available for these dates.",
        availableQuantity: Math.max(0, remainingQuantity),
      });
    }

    // Calculate booking amount
    const unitPrice = Number(equipment.rentalPrice);

    const totalAmount =
      unitPrice * rentalUnits * quantity;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate booking amount.",
      });
    }

    // Create temporary booking intent
    // Final booking will be created after successful payment
    const bookingIntent = {
      equipmentId: new ObjectId(equipmentId),
      customerId: new ObjectId(req.user.id),
      ownerId: equipment.ownerId,
      equipmentName: equipment.name,

      rentalStartDate: startDate,
      rentalEndDate: endDate,

      totalDays,
      rentalUnits,
      rentalType: equipment.rentalType,
      requiredQuantity: quantity,
      unitPrice,
      totalAmount,

      contactNumber: contactNumber.trim(),
      deliveryAddress: deliveryAddress.trim(),
      additionalNotes: additionalNotes || "",

      status: "awaiting_payment",

      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    };

    const result = await db
      .collection("bookingIntents")
      .insertOne(bookingIntent);

    return res.status(201).json({
      success: true,
      message: "Booking details calculated successfully. Proceed to payment.",

      bookingIntent: {
        id: result.insertedId.toString(),
        equipmentName: equipment.name,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        totalDays,
        rentalUnits,
        rentalType: equipment.rentalType,
        requiredQuantity: quantity,
        unitPrice,
        totalAmount,
        status: "awaiting_payment",
        expiresAt: bookingIntent.expiresAt,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking request.",
    });
  }
};


// ============================================
// 2. GET CUSTOMER'S RENTAL HISTORY
// ============================================
const getMyBookings = async (req, res) => {
  try {
    const db = getDB();

    const bookings = await db
      .collection("bookings")
      .find({
        customerId: new ObjectId(req.user.id),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve rental history.",
    });
  }
};


// ============================================
// 3. GET OWNER'S RENTAL BOOKINGS
// ============================================
const getOwnerBookings = async (req, res) => {
  try {
    const db = getDB();

    const ownerId = new ObjectId(req.user.id);
    const now = new Date();

    // Get completed payment bookings
    const [bookings, intents] = await Promise.all([
      db.collection("bookings")
        .find({ ownerId })
        .sort({ createdAt: -1 })
        .toArray(),

      // Get active payment intents
      db.collection("bookingIntents")
        .find({
          ownerId,
          status: "awaiting_payment",
          expiresAt: { $gt: now },
        })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    // Combine both records
    const records = [
      ...bookings.map((item) => ({
        ...item,
        recordType: "booking",
      })),

      ...intents.map((item) => ({
        ...item,
        recordType: "booking_intent",
      })),
    ];

    // Collect Customer IDs
    const customerIds = [
      ...new Set(
        records
          .map((item) => item.customerId?.toString())
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ].map((id) => new ObjectId(id));

    // Collect Equipment IDs
    const equipmentIds = [
      ...new Set(
        records
          .map((item) => item.equipmentId?.toString())
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ].map((id) => new ObjectId(id));

    // Load customer and equipment information
    const [customers, equipmentList] = await Promise.all([
      customerIds.length
        ? db.collection("users")
            .find({
              _id: { $in: customerIds },
            })
            .project({
              name: 1,
              email: 1,
              phone: 1,
            })
            .toArray()
        : [],

      equipmentIds.length
        ? db.collection("equipment")
            .find({
              _id: { $in: equipmentIds },
            })
            .project({
              name: 1,
              category: 1,
              image: 1,
            })
            .toArray()
        : [],
    ]);

    // Create lookup maps
    const customerMap = new Map(
      customers.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    const equipmentMap = new Map(
      equipmentList.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    // Prepare Owner Rental Records
    const result = records.map((item) => {
      const customer = customerMap.get(
        item.customerId?.toString()
      );

      const equipment = equipmentMap.get(
        item.equipmentId?.toString()
      );

      const isIntent =
        item.recordType === "booking_intent";

      return {
        _id: item._id.toString(),

        recordType: item.recordType,

        customerInfo: {
          name: customer?.name || "Customer",
          email: customer?.email || "",
          phone:
            item.contactNumber ||
            customer?.phone ||
            "",
        },

        equipmentInfo: {
          name:
            item.equipmentName ||
            equipment?.name ||
            "Equipment",

          category: equipment?.category || "",
          image: equipment?.image || "",
        },

        rentalStartDate: item.rentalStartDate,
        rentalEndDate: item.rentalEndDate,

        totalDays: item.totalDays,
        rentalUnits: item.rentalUnits,
        rentalType: item.rentalType,

        requiredQuantity: item.requiredQuantity,

        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,

        paymentStatus:
          item.paymentStatus ||
          (isIntent ? "pending" : "paid"),

        bookingStatus:
          item.bookingStatus ||
          (isIntent ? "awaiting_payment" : "confirmed"),

        createdAt: item.createdAt,
      };
    });

    // Sort newest booking first
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      total: result.length,
      bookings: result,
    });
  } catch (error) {
    console.error("Get owner bookings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve owner rental records.",
    });
  }
};


// ============================================
// EXPORT CONTROLLERS
// ============================================
module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
};
