# Wanderlust

[Live Demo](https://wanderlust-4ics.onrender.com)

Wanderlust is a full-stack travel stay listing project inspired by vacation rental platforms. It is built with Node.js, Express, MongoDB, EJS, and Bootstrap, and focuses on creating, viewing, editing, and deleting property listings with a clean MVC-style structure.

## Features

- Create, read, update, and delete stay listings
- Server-rendered UI using EJS templates
- MongoDB data storage with Mongoose models
- Category-based listing filters in the UI
- Search listings by title or location in the controller layer
- Review model and review routes for user feedback
- User authentication modules using Passport and `passport-local-mongoose`
- Cloudinary storage configuration for image uploads
- Seed script for loading starter listing data

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS and EJS-Mate
- Bootstrap
- Passport.js
- Cloudinary
- Joi

## Project Structure

```text
controllers/   Route controller logic
models/        Mongoose schemas
routes/        Express route modules
views/         EJS templates
public/        Static CSS and client-side JS
init/          Database seed files
utils/         Helper utilities
app.js         Current local app entrypoint
```

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
