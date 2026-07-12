const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
            index: true,
        },
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        nights: {
            type: Number,
            required: true,
            min: 1,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        taxRate: {
            type: Number,
            required: true,
            min: 0,
        },
        taxAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        stripeSessionId: String,
        holdExpiresAt: Date,
    },
    { timestamps: true }
);

bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Booking", bookingSchema);
