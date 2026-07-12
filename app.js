require("dotenv").config();

const http = require("http");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const { Server } = require("socket.io");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const { registerChatHandlers } = require("./sockets/chat.js");

const dbUrl =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/wanderlust";
const sessionSecret =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const port = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(sessionMiddleware);

app.use(flash());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = await User.findOne({ googleId: profile.id });

          if (!user && email) {
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              username: email ? email.split("@")[0] : profile.displayName,
              email: email || `${profile.id}@google.local`,
              googleId: profile.id,
              authProvider: "google",
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = "google";
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.searchQuery = "";
  next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/", userRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/listings", listingRoutes);
app.use("/bookings", bookingRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (err.name === "CastError" ? 400 : 500);
  const message = statusCode === 500 ? "Something went wrong" : err.message;
  const wantsJson = typeof req.get("accept") === "string" && req.get("accept").includes("application/json");

  if (statusCode === 500) {
    console.error(err);
  }

  if (wantsJson) {
    return res.status(statusCode).json({ message });
  }

  res.status(statusCode).send(message);
});

async function startServer() {
  await mongoose.connect(dbUrl);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : true,
      credentials: true,
    },
  });

  registerChatHandlers(io, sessionMiddleware);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
