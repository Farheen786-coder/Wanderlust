
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!!");
    res.redirect(`/listings/${listing._id}`);;
}

module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(reviewId)) {
        req.flash("error", "Review you requested for does not exists!!");
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
        req.flash("error", "Review you requested for does not exists!!");
        return res.redirect(`/listings/${id}`);
    }
    req.flash("success", "Review Deleted!!");
    res.redirect(`/listings/${id}`);
};
