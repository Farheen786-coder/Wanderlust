
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const {listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.session);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    const ownerId = listing.owner && (listing.owner._id || listing.owner);
    const currentUserId = res.locals.currUser && res.locals.currUser._id;

    if(!ownerId || !currentUserId || String(ownerId) !== String(currentUserId)){
        req.flash("error", "You are not the owner of this listing!!");
        return res.redirect(`/listings/${id}`);
    };
    next();
}

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(reviewId)) {
        req.flash("error", "Review not found!!");
        return res.redirect("/listings");
    }

    let review = await Review.findById(reviewId);
    if(!review){
        req.flash("error", "Review not found!!");
        return res.redirect(`/listings/${id}`);
    }

    const authorId = review.author && (review.author._id || review.author);
    const currentUserId = res.locals.currUser && res.locals.currUser._id;
    const isAdmin = Boolean(res.locals.currUser && res.locals.currUser.isAdmin);

    if(!isAdmin && (!authorId || !currentUserId || String(authorId) !== String(currentUserId))){
        req.flash("error", "You did not create this review!!");
        return res.redirect(`/listings/${id}`);
    };
    next();
}
