require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const { getListingDefaults } = require("../utils/listingDefaults.js");
const { geocodeLocation } = require("../utils/geocode.js");

const dbUrl =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/wanderlust";

const seedUserCredentials = {
  username: process.env.SEED_USER_USERNAME || "wanderlustadmin",
  email: process.env.SEED_USER_EMAIL || "admin@example.com",
  password:
    process.env.SEED_USER_PASSWORD || "change-me-before-production",
  isAdmin: process.env.SEED_USER_IS_ADMIN === "true",
};

async function main() {
  await mongoose.connect(dbUrl);
}

async function initDB() {
  let seedUser = await User.findOne({
    username: seedUserCredentials.username,
  });

  if (!seedUser) {
    seedUser = await User.register(
      new User({
        email: seedUserCredentials.email,
        username: seedUserCredentials.username,
        isAdmin: seedUserCredentials.isAdmin,
      }),
      seedUserCredentials.password
    );
  } else if (seedUser.isAdmin !== seedUserCredentials.isAdmin) {
    seedUser.isAdmin = seedUserCredentials.isAdmin;
    await seedUser.save();
  }

  for (const obj of initData.data) {
    const geometry = await geocodeLocation({
      location: obj.location,
      country: obj.country,
    });
    const extras = getListingDefaults(obj.category);
    const updateData = {
      owner: seedUser._id,
      title: obj.title,
      description: obj.description,
      image: obj.image,
      images: [obj.image],
      price: obj.price,
      location: obj.location,
      country: obj.country,
      category: obj.category,
      capacity: obj.capacity || extras.capacity,
      amenities: obj.amenities || [...extras.amenities],
    };

    if (geometry) {
      updateData.geometry = {
        type: "Point",
        coordinates: geometry,
      };
    }

    await Listing.updateOne(
      { title: obj.title },
      {
        $set: updateData,
        $setOnInsert: {
          reviews: [],
        },
      },
      { upsert: true }
    );
  }

  console.log("sample data synced");
}

main()
  .then(initDB)
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
