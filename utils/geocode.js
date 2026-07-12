const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const fallbackCoordinates = {
    "Malibu": [-118.7798, 34.0259],
    "Malibu, United States": [-118.7798, 34.0259],
    "New York City": [-74.006, 40.7128],
    "New York City, United States": [-74.006, 40.7128],
    "Aspen": [-106.8175, 39.1911],
    "Aspen, United States": [-106.8175, 39.1911],
    "Florence": [11.2558, 43.7696],
    "Florence, Italy": [11.2558, 43.7696],
    "Portland": [-122.6765, 45.5231],
    "Portland, United States": [-122.6765, 45.5231],
    "Cancun": [-86.8515, 21.1619],
    "Cancun, Mexico": [-86.8515, 21.1619],
    "Lake Tahoe": [-120.045, 39.0968],
    "Lake Tahoe, United States": [-120.045, 39.0968],
    "Los Angeles": [-118.2437, 34.0522],
    "Los Angeles, United States": [-118.2437, 34.0522],
    "Verbier": [7.2286, 46.1005],
    "Verbier, Switzerland": [7.2286, 46.1005],
    "Serengeti National Park": [34.6857, -2.3333],
    "Serengeti National Park, Tanzania": [34.6857, -2.3333],
    "Amsterdam": [4.9041, 52.3676],
    "Amsterdam, Netherlands": [4.9041, 52.3676],
    "Fiji": [178.065, -17.7134],
    "Fiji, Fiji": [178.065, -17.7134],
    "Cotswolds": [-1.7805, 51.833],
    "Cotswolds, United Kingdom": [-1.7805, 51.833],
    "Boston": [-71.0589, 42.3601],
    "Boston, United States": [-71.0589, 42.3601],
    "Bali": [115.1889, -8.4095],
    "Bali, Indonesia": [115.1889, -8.4095],
    "Banff": [-115.5708, 51.1784],
    "Banff, Canada": [-115.5708, 51.1784],
    "Miami": [-80.1918, 25.7617],
    "Miami, United States": [-80.1918, 25.7617],
    "Phuket": [98.3381, 7.8804],
    "Phuket, Thailand": [98.3381, 7.8804],
    "Scottish Highlands": [-4.0, 57.0],
    "Scottish Highlands, United Kingdom": [-4.0, 57.0],
    "Dubai": [55.2708, 25.2048],
    "Dubai, United Arab Emirates": [55.2708, 25.2048],
    "Montana": [-110.3626, 46.8797],
    "Montana, United States": [-110.3626, 46.8797],
    "Mykonos": [25.369, 37.4467],
    "Mykonos, Greece": [25.369, 37.4467],
    "Costa Rica": [-84.0, 9.7489],
    "Costa Rica, Costa Rica": [-84.0, 9.7489],
    "Charleston": [-79.9311, 32.7765],
    "Charleston, United States": [-79.9311, 32.7765],
    "Tokyo": [139.6917, 35.6895],
    "Tokyo, Japan": [139.6917, 35.6895],
    "New Hampshire": [-71.5724, 43.1939],
    "New Hampshire, United States": [-71.5724, 43.1939],
    "Maldives": [73.2207, 3.2028],
    "Maldives, Maldives": [73.2207, 3.2028],
    "Tromsø": [18.9553, 69.6492],
    "Tromsø, Norway": [18.9553, 69.6492],
    "Reykjavík": [-21.9426, 64.1466],
    "Reykjavík, Iceland": [-21.9426, 64.1466],
    "Reykjavik": [-21.9426, 64.1466],
    "Reykjavik, Iceland": [-21.9426, 64.1466],
};

const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mapboxToken
    ? mbxGeocoding({ accessToken: mapboxToken })
    : null;

function buildLocationCandidates({ location, country, query }) {
    const candidates = [];

    if (query) {
        candidates.push(query.trim());
    }

    if (location && country) {
        candidates.push(`${location.trim()}, ${country.trim()}`);
    }

    if (location) {
        candidates.push(location.trim());
    }

    if (country) {
        candidates.push(country.trim());
    }

    return [...new Set(candidates.filter(Boolean))];
}

async function geocodeLocation({ location, country, query } = {}) {
    const candidates = buildLocationCandidates({ location, country, query });

    for (const candidate of candidates) {
        if (fallbackCoordinates[candidate]) {
            return fallbackCoordinates[candidate];
        }
    }

    if (!geocodingClient || candidates.length === 0) {
        return null;
    }

    for (const candidate of candidates) {
        try {
            const response = await geocodingClient
                .forwardGeocode({
                    query: candidate,
                    limit: 1,
                })
                .send();

            const feature = response.body.features?.[0];
            if (feature?.geometry?.coordinates?.length === 2) {
                return feature.geometry.coordinates;
            }
        } catch (error) {
            continue;
        }
    }

    return null;
}

module.exports = {
    geocodeLocation,
};
