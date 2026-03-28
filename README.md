# Tour & Travel Website

A tour and travel portal built with Express, EJS, MongoDB, and Tailwind-style components.

## Features

- Admin-managed content for countries, states, cities, attractions, activities, and tour packages
- Priority-based display ordering (1–9999) with latest updated tie-breaker
- Multi-page destination structure for:
  - country, state, city
  - attraction and activity pages
  - country/state/city-specific pages for things to do, places to visit, best time to visit, how to reach, and hotels
- SEO-friendly metadata and dynamic page rendering
- Admin file upload support for hero images via `multer`
- Package itinerary support with itinerary references to countries, states, cities, attractions, and activities

## Tech stack

- Node.js
- Express
- EJS
- MongoDB with Mongoose
- Tailwind-esque utility classes via CDN styling in EJS views
- Multer for image uploads

## Project structure

- `server.js` - app bootstrap, middleware, static assets, session handling
- `routes/web.js` - public website routes and page rendering
- `routes/admin.js` - admin CRUD routes for all content entities
- `models/` - Mongoose schemas for content types
- `views/` - EJS templates for pages and admin interface
- `public/uploads/` - uploaded hero images (ignored in git)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example` and set:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
SESSION_SECRET=your-session-secret
MONGODB_URI=mongodb://127.0.0.1:27017/tour-and-travel
SITE_URL=http://localhost:3000
```

3. Start the app:

```bash
npm start
```

4. Or run in development mode:

```bash
npm run dev
```

5. Open the site:

```text
http://localhost:3000
```

6. Admin interface:

```text
http://localhost:3000/admin/login
```

## Notes

- Uploaded files are saved under `public/uploads/`
- The project uses `heroImageFile` uploads and also allows `heroImageUrl` as a fallback
- `public/uploads/` is excluded from version control via `.gitignore`

## Adding content

Use the admin interface to manually create entries for:

- Countries
- States
- Cities
- Attractions
- Activities
- Packages

Packages support itinerary associations and are shown automatically on the homepage and destination pages.

## License

This project is provided as-is.
