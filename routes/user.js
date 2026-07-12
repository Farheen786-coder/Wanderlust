
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

const googleAuthConfigured = (req, res, next) => {
    if (
        !process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_CALLBACK_URL
    ) {
        req.flash("error", "Google login is not configured yet");
        return res.redirect("/login");
    }

    next();
};

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.login);

router.get(
    "/auth/google",
    saveRedirectUrl,
    googleAuthConfigured,
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/auth/google/callback",
    googleAuthConfigured,
    passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
    userController.login
);

router.get("/logout", userController.logout);

module.exports = router;
