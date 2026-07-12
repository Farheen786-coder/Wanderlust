function buildAvailabilityQuery(listingId, checkIn, checkOut) {
    return {
        listing: listingId,
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
    };
}

function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const millisecondsPerNight = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((end - start) / millisecondsPerNight));
}

module.exports = {
    buildAvailabilityQuery,
    calculateNights,
};
