const listingDefaults = {
    Trending: { capacity: 2, amenities: ["wifi", "self check-in"] },
    Rooms: { capacity: 2, amenities: ["wifi", "workspace"] },
    "Iconic Cities": { capacity: 2, amenities: ["wifi", "city view"] },
    Mountains: { capacity: 4, amenities: ["fireplace", "parking", "wifi"] },
    Castles: { capacity: 6, amenities: ["parking", "wifi", "breakfast"] },
    "Amazing pools": { capacity: 4, amenities: ["pool", "wifi", "air conditioning"] },
    Camping: { capacity: 4, amenities: ["campfire", "parking", "wifi"] },
    Farms: { capacity: 4, amenities: ["wifi", "kitchen", "parking"] },
    Arctic: { capacity: 3, amenities: ["heating", "wifi", "aurora view"] },
    Domes: { capacity: 2, amenities: ["heating", "wifi", "firepit"] },
    Boats: { capacity: 4, amenities: ["waterfront", "deck", "wifi"] },
    Beach: { capacity: 4, amenities: ["beach access", "wifi", "air conditioning"] },
};

function getListingDefaults(category) {
    return listingDefaults[category] || {
        capacity: 2,
        amenities: ["wifi"],
    };
}

module.exports = {
    getListingDefaults,
};
