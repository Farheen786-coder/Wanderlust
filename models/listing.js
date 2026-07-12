const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    images: [
        {
            url: String,
            filename: String,
        },
    ],
    price: Number,
    location: String,
    country: String,
    category: { // New field added for filtering
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        default: 1,
        min: 1,
    },
    amenities: {
        type: [String],
        default: [],
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
        },
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    // geometry field if needed...
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

listingSchema.index({ geometry: "2dsphere" });
listingSchema.index({ price: 1, category: 1, capacity: 1 });
listingSchema.index({ amenities: 1 });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
