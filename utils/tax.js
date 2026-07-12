const taxRules = [
    { match: /India/i, rate: 0.18 },
    { match: /United States|USA/i, rate: 0.12 },
    { match: /United Kingdom|UK/i, rate: 0.2 },
    { match: /Canada/i, rate: 0.13 },
    { match: /Switzerland/i, rate: 0.077 },
    { match: /Norway/i, rate: 0.25 },
    { match: /Iceland/i, rate: 0.24 },
    { match: /Thailand/i, rate: 0.07 },
    { match: /Japan/i, rate: 0.1 },
    { match: /Mexico/i, rate: 0.16 },
    { match: /United Arab Emirates|UAE/i, rate: 0.05 },
    { match: /Indonesia/i, rate: 0.11 },
    { match: /Greece/i, rate: 0.24 },
    { match: /Tanzania/i, rate: 0.18 },
    { match: /Netherlands/i, rate: 0.21 },
    { match: /New Zealand/i, rate: 0.15 },
];

function getTaxRateForListing(listing) {
    const region = `${listing.country || ""} ${listing.location || ""}`.trim();
    const rule = taxRules.find((taxRule) => taxRule.match.test(region));
    return rule ? rule.rate : 0.1;
}

function calculateBookingTotals({ listing, nights }) {
    const taxRate = getTaxRateForListing(listing);
    const subtotal = Number(listing.price || 0) * Number(nights || 1);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return {
        taxRate,
        subtotal,
        taxAmount,
        totalAmount,
    };
}

module.exports = {
    getTaxRateForListing,
    calculateBookingTotals,
};
