# Appointment Booking System · Server

TypeScript/Express API for a multi-organization appointment booking platform. Customers can browse services and rooms, request available appointment times, and manage bookings. Organization staff manage services, schedules, rooms, invitations, and customers through role-based access.

[Live client](https://appointment-booking-system-client.vercel.app/) · [Client source](https://github.com/Amjad-Adi/Appointment_Booking_System_Client)

## Features

- Appointment creation, availability validation, status changes, and customer cancellation.
- Organizations, services, categories, rooms, working hours, special days, and time blocks.
- Firebase identity verification with JWT access/refresh tokens in HTTP-only cookies.
- Role-based authorization for customers, organization staff, owners, and super admins.
- Email invitations using Nodemailer and React Email templates. This does not imply automatic appointment reminder emails.
- Cloudinary image uploads for application entities.
- Location coordinates stored using PostgreSQL/PostGIS for the client's map views.
- Customer favourites, reviews, invitations, and settings.
- Zod request validation, rate limiting, Helmet, request logging, and dependency health checks.

## Stack

Node.js, TypeScript, Express, PostgreSQL/PostGIS, `pg`, Firebase Admin, JWT, Cloudinary, Multer, Nodemailer, React Email, Zod, and Pino. The repository also contains Drizzle-related code, but the repositories use SQL through `pg`.

## Local setup

> Setup requires your own database, Firebase service account, email credentials, and Cloudinary account. A clean end-to-end server startup has not been verified from this checkout. The database exports need review before they can act as a reliable fresh-install migration.

### 1. Install

Use a current Node.js LTS release and npm.

```sh
git clone https://github.com/Amjad-Adi/Appointment_Booking_System_Server.git
cd Appointment_Booking_System_Server
npm ci
cp .env.example .env
```

### 2. Prepare PostgreSQL with PostGIS

Create a dedicated development database and enable PostGIS using an account allowed to install extensions:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

`schema.sql` is a schema reference, not a tested ordered migration: some tables reference tables declared later. `tables.sql` contains development scratch statements, including `DROP TABLE` and data updates. **Do not execute either file blindly against an existing database.** Use a reviewed schema/export from your development database, or first turn `schema.sql` into dependency-ordered migrations. The schema includes organizations, users, services, rooms, schedules, appointments, invitations, reviews, favourites, and token tables.

### 3. Configure the server

Edit `.env` with values for your own development services:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` locally |
| `SERVER_PORT` | API port, normally `3000`; falls back to `PORT`, then `3000` |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` | Local PostgreSQL connection |
| `JWT_SECRET` | Your own random signing secret |
| `FRONTEND_DEVELOPMENT_URL` | Exact client origin, normally `http://localhost:8080` |
| `SMTP_USER`, `SMTP_PASS` | Gmail SMTP credentials used by `src/config/nodemailer.ts` |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary configuration |

Important: the existing `.env.example` calls the SMTP password `SMTP_PASSWORD`, but the implementation reads **`SMTP_PASS`**. Set `SMTP_PASS` in your local `.env`.

For production, the code additionally uses `DATABASE_PRODUCTION_URL` and `FRONTEND_PRODUCTION_URL`. Do not use production credentials for local testing.

### 4. Add Firebase Admin credentials

Enable email/password authentication in your Firebase project. Place that project's Admin service-account JSON at:

```text
config/service-account-key.json
```

The `config/` directory is ignored by Git. Never commit this file. In production the current implementation reads `/etc/secrets/service-account-key.json`. The browser client must use the matching Firebase project.

### 5. Start the API

```sh
npm run dev
```

The API is mounted under `http://localhost:3000/api` with the default port. Start the client separately and ensure its origin exactly matches `FRONTEND_DEVELOPMENT_URL`.

```sh
npm run build
npm start
```

These compile TypeScript and run `dist/server`. The repository does not currently define an automated test script.

## API reference and structure

- Import `Appointment Booking System.postman_collection.json` into Postman for existing request examples. Review environments before sending any request.
- `ERD Design.svg`: entity relationship diagram.
- `src/routes`: API route groups.
- `src/controllers`: HTTP request handling and authentication.
- `src/services`: business rules and integrations.
- `src/repositories`: SQL persistence.
- `src/middlewares`: validation, authorization, error handling, and rate limits.
- `GET /api/health`: checks Node, PostgreSQL, Firebase, Cloudinary, and SMTP. A `503` can mean an external dependency is unavailable, not that the HTTP server failed to start.

## Scope

The linked demo is a portfolio deployment. The feature list is grounded in the source, not a claim that every external integration was tested live. Review credentials, database migrations, authorization, and deployment configuration before production use.
