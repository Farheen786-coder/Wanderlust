const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Message = require("../models/message.js");
const ExpressError = require("../utils/ExpressError.js");
const { getListingDefaults } = require("../utils/listingDefaults.js");
const { geocodeLocation } = require("../utils/geocode.js");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function parseOptionalNumber(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === "string" && value.trim() === "") {
        return undefined;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
}

function normalizeAmenities(amenities) {
    if (!amenities) {
        return [];
    }

    if (Array.isArray(amenities)) {
        return amenities.map((amenity) => amenity.trim()).filter(Boolean);
    }

    if (typeof amenities === "string") {
        return amenities
            .split(",")
            .map((amenity) => amenity.trim())
            .filter(Boolean);
    }

    return [];
}

function buildListingFilter(query) {
    const filter = {};

    const category = query.category?.trim();
    const minPrice = parseOptionalNumber(query.minPrice);
    const maxPrice = parseOptionalNumber(query.maxPrice);
    const capacity = parseOptionalNumber(query.capacity);
    const amenities = normalizeAmenities(query.amenities);

    if (category && category !== "All") {
        filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) {
            filter.price.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
            filter.price.$lte = maxPrice;
        }
    }

    if (capacity !== undefined) {
        filter.capacity = { $gte: capacity };
    }

    if (amenities.length > 0) {
        filter.amenities = { $all: amenities };
    }

    return filter;
}

function getUploadedFiles(req) {
    if (Array.isArray(req.files) && req.files.length > 0) {
        return req.files;
    }

    if (req.file) {
        return [req.file];
    }

    return [];
}

function mapGeoListings(listings) {
    return listings
        .filter((listing) => listing.geometry && Array.isArray(listing.geometry.coordinates))
        .map((listing) => ({
            type: "Feature",
            geometry: listing.geometry,
            properties: {
                id: String(listing._id),
                title: listing.title,
                location: listing.location,
                country: listing.country,
                price: listing.price,
                category: listing.category,
            },
        }));
}

module.exports.index = async (req, res) => {
    const searchQuery = (req.query.search || req.query.city || req.query.location || "").trim();
    const filter = buildListingFilter(req.query);

    let allListings = [];

    if (searchQuery) {
        const coordinates = await geocodeLocation({ query: searchQuery });

        if (coordinates) {
            const pipeline = [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates,
                        },
                        distanceField: "distanceMeters",
                        key: "geometry",
                        spherical: true,
                        query: filter,
                    },
                },
                {
                    $addFields: {
                        distanceKm: {
                            $round: [{ $divide: ["$distanceMeters", 1000] }, 2],
                        },
                    },
                },
                {
                    $sort: {
                        distanceMeters: 1,
                        price: 1,
                    },
                },
            ];

            allListings = await Listing.aggregate(pipeline);
        } else {
            const escapedSearch = escapeRegex(searchQuery);
            const pipeline = [
                {
                    $match: {
                        ...filter,
                        $or: [
                            { title: { $regex: escapedSearch, $options: "i" } },
                            { location: { $regex: escapedSearch, $options: "i" } },
                            { country: { $regex: escapedSearch, $options: "i" } },
                        ],
                    },
                },
                {
                    $sort: {
                        price: 1,
                        title: 1,
                    },
                },
            ];

            allListings = await Listing.aggregate(pipeline);
        }
    } else {
        const pipeline = [];

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
        }

        pipeline.push({
            $sort: {
                _id: -1,
            },
        });

        allListings = await Listing.aggregate(pipeline);
    }

    const mapListings = mapGeoListings(allListings);
    res.render("listings/index.ejs", {
        allListings,
        searchQuery,
        mapListings,
    });
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    const [listing, listingMessages] = await Promise.all([
        Listing.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner"),
        Message.find({ listing: id })
            .populate("sender", "username")
            .sort({ createdAt: 1 }),
    ]);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    const chatMessages = listingMessages.map((message) => ({
        _id: message._id,
        listing: message.listing,
        sender: {
            _id: message.sender?._id,
            username: message.sender?.username || "User",
        },
        body: message.body,
        createdAt: message.createdAt,
    }));

    res.render("listings/show.ejs", { listing, chatMessages });
};

module.exports.createListing = async (req, res, next) => {
    const files = getUploadedFiles(req);
    const { listing: listingInput } = req.body;

    if (files.length === 0) {
        throw new ExpressError(400, "Listing image is required");
    }

    if (!listingInput) {
        throw new ExpressError(400, "Listing details are required");
    }

    const listingDefaults = getListingDefaults(listingInput.category);
    const geometry = await geocodeLocation({
        location: listingInput?.location,
        country: listingInput?.country,
    });

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url: files[0].path,
        filename: files[0].filename,
    };
    newListing.images = files.map((file) => ({
        url: file.path,
        filename: file.filename,
    }));
    if (geometry) {
        newListing.geometry = {
            type: "Point",
            coordinates: geometry,
        };
    }
    newListing.capacity = listingInput?.capacity
        ? Number(listingInput.capacity)
        : listingDefaults.capacity;
    newListing.amenities = normalizeAmenities(listingInput?.amenities);
    if (newListing.amenities.length === 0) {
        newListing.amenities = [...listingDefaults.amenities];
    }
    await newListing.save();
    req.flash("success", "New Listing Created!!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    const files = getUploadedFiles(req);
    const { listing: listingInput } = req.body;

    if (!listingInput) {
        req.flash("error", "Listing details are required");
        return res.redirect(`/listings/${id}/edit`);
    }

    const geometry = await geocodeLocation({
        location: listingInput?.location || listing.location,
        country: listingInput?.country || listing.country,
    });

    Object.assign(listing, listingInput);

    if (files.length > 0) {
        listing.image = {
            url: files[0].path,
            filename: files[0].filename,
        };
        listing.images = files.map((file) => ({
            url: file.path,
            filename: file.filename,
        }));
    }

    if (geometry) {
        listing.geometry = {
            type: "Point",
            coordinates: geometry,
        };
    }

    if (listingInput?.capacity) {
        listing.capacity = Number(listingInput.capacity);
    }

    if (
        listingInput &&
        Object.prototype.hasOwnProperty.call(listingInput, "amenities")
    ) {
        listing.amenities = normalizeAmenities(listingInput.amenities);
    }

    await listing.save();

    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }

    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing you requested for does not exists!!");
        return res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted!!");
    res.redirect("/listings");
};
