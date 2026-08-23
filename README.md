# 🌍 WanderLust

> **Explore. Book. Experience.** <br>
> A full-stack travel stay listing project inspired by vacation rental platforms, enabling users to seamlessly browse, publish, and manage property listings.

**🚀 [Live Demo](https://wanderlust-4ics.onrender.com)**

<img width="1872" height="975" alt="Screenshot 2026-08-24 011533" src="https://github.com/user-attachments/assets/b764414e-9aae-4eb2-9eed-07e662639885" />

WanderLust is engineered with a scalable MVC backend architecture, integrating secure cloud-based media storage and providing a dynamic, interactive user experience for travelers and hosts alike.

## ✨ Core Features

### 🔍 Dynamic Search & Category Filtering
Users can easily navigate through listings using intuitive category filters or the dedicated destination search bar.
- Calculates and toggles total prices including taxes in real-time.
- Server-rendered UI using EJS templates for fast destination retrieval.

**Category Filtering:**
<img width="1799" height="896" alt="Screenshot 2026-08-24 011558" src="https://github.com/user-attachments/assets/a8f42972-3265-4634-ba15-1810a0348d7f" />

**Destination Search:**
<img width="1909" height="899" alt="Screenshot 2026-08-24 011642" src="https://github.com/user-attachments/assets/6264242b-18e3-4d5d-a240-f8a4d50fa71f" />

### 🏡 Comprehensive Listing Management
Property pages provide rich details, pricing, location data, and owner information. 
- Integrated with **Cloudinary API** for secure, optimized cloud-based media storage and dynamic image delivery.
- Role-based authorization ensures only listing owners can edit or delete their properties.

<img width="1881" height="910" alt="Screenshot 2026-08-24 011717" src="https://github.com/user-attachments/assets/1d0bcfb2-7718-4edc-959a-9ba2ab0a76ca" />

### ⭐ User-Generated Reviews & Booking
A fully authenticated review system allows users to leave ratings and comments on their stays.
- Protects routes with robust authentication middleware (Passport.js & `passport-local-mongoose`) to secure user data.
- Users can seamlessly leave reviews, manage their own comments, and interact with the booking widget.

<img width="1898" height="908" alt="Screenshot 2026-08-24 011759" src="https://github.com/user-attachments/assets/c71f4c32-95cd-4599-83c8-83abea4c77c7" />

---

## 🛠️ Tech Stack & Architecture

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Cloud Storage:** Cloudinary API
- **Authentication & Security:** Passport.js, Express Sessions, Joi (Schema Validation)
- **Frontend:** EJS (Embedded JavaScript templates), Bootstrap, CSS

---

## 📁 Project Structure

```text
Wanderlust/
├─ controllers/     # Route controller logic
├─ models/          # Mongoose schemas
├─ routes/          # Express route modules
├─ views/           # EJS templates
├─ public/          # Static CSS and client-side JS
├─ init/            # Database seed files
├─ utils/           # Helper utilities
└─ app.js           # Current local app entrypoint

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Farheen786-coder/Wanderlust.git
cd Wanderlust
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB

Make sure MongoDB is running locally on:

```text
mongodb://127.0.0.1:27017/wanderlust
```

### 4. Seed the database

```bash
node init/index.js
```

### 5. Run the app

```bash
node app.js
```

Then open:

```text
http://localhost:8080/listings
```

## Environment Variables

The current `app.js` entrypoint runs with the local MongoDB connection above. If you use the Cloudinary upload flow included in the route/controller setup, create a `.env` file with:

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

## Notes

- The repository already includes modular routes, controllers, authentication models, review logic, and upload configuration for a more complete MVC version of the app.
- The Mapbox integration is present in commented form and can be enabled later if location mapping is needed.
- There are currently no automated tests configured in `package.json`.

## Author

Farheen Rahman
