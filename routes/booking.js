const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.get("/:id/availability", wrapAsync(bookingController.checkAvailability));
router.post("/:id/checkout", isLoggedIn, wrapAsync(bookingController.createCheckoutSession));
router.get("/success", wrapAsync(bookingController.handleCheckoutSuccess));

module.exports = router;
