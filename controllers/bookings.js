const Stripe = require("stripe");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const ExpressError = require("../utils/ExpressError.js");
const { buildAvailabilityQuery, calculateNights } = require("../utils/booking.js");
const { calculateBookingTotals } = require("../utils/tax.js");

function getStripeClient() {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
        throw new ExpressError(503, "Stripe is not configured");
    }

    return Stripe(stripeSecret);
}

function getAppBaseUrl(req) {
    return process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function parseBookingDates(body) {
    const bookingBody = body.booking || body;
    const checkIn = new Date(bookingBody.checkIn);
    const checkOut = new Date(bookingBody.checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        throw new ExpressError(400, "Please choose valid booking dates");
    }

    if (checkIn >= checkOut) {
        throw new ExpressError(400, "Check-out must be after check-in");
    }

    return { checkIn, checkOut };
}

module.exports.checkAvailability = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const { checkIn, checkOut } = parseBookingDates(req.query);
    const conflict = await Booking.findOne(
        buildAvailabilityQuery(listing._id, checkIn, checkOut)
    );

    res.json({
        available: !conflict,
        conflict: conflict
            ? {
                  bookingId: conflict._id,
                  status: conflict.status,
              }
            : null,
    });
};

module.exports.createCheckoutSession = async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("owner");
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    if (!listing.owner) {
        throw new ExpressError(400, "Listing owner is missing");
    }

    if (!req.user) {
        throw new ExpressError(401, "You must be logged in to book a stay");
    }

    const { checkIn, checkOut } = parseBookingDates(req.body);
    const existingBooking = await Booking.findOne(
        buildAvailabilityQuery(listing._id, checkIn, checkOut)
    );

    if (existingBooking) {
        throw new ExpressError(409, "Those dates are already booked");
    }

    const nights = calculateNights(checkIn, checkOut);
    const totals = calculateBookingTotals({
        listing,
        nights,
    });

    const booking = await Booking.create({
        listing: listing._id,
        guest: req.user._id,
        host: listing.owner._id,
        checkIn,
        checkOut,
        nights,
        subtotal: totals.subtotal,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        status: "pending",
        holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const stripe = getStripeClient();
    const currency = process.env.STRIPE_CURRENCY || "inr";
    const appBaseUrl = getAppBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: req.user.email,
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: `${listing.title} booking`,
                    },
                    unit_amount: Math.round(totals.totalAmount * 100),
                },
                quantity: 1,
            },
        ],
        success_url: `${appBaseUrl}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appBaseUrl}/listings/${listing._id}`,
        metadata: {
            bookingId: String(booking._id),
            listingId: String(listing._id),
        },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({
        url: session.url,
        bookingId: booking._id,
    });
};

module.exports.handleCheckoutSuccess = async (req, res) => {
    const stripe = getStripeClient();
    const sessionId = req.query.session_id;

    if (!sessionId) {
        throw new ExpressError(400, "Missing Stripe session id");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
        throw new ExpressError(400, "Booking metadata is missing");
    }

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        throw new ExpressError(404, "Booking not found");
    }

    if (session.payment_status === "paid") {
        booking.status = "confirmed";
        booking.holdExpiresAt = undefined;
        await booking.save();
        req.flash("success", "Your booking is confirmed!");
        return res.redirect(`/listings/${booking.listing._id}`);
    }

    req.flash("error", "Payment was not completed");
    return res.redirect(`/listings/${booking.listing._id}`);
};
