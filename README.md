# SkyPakistan Airways

A full-stack airline reservation platform for searching flights, selecting seats, booking journeys, processing mock payments, and generating professional electronic tickets.
Customers create their own account with an email and password, then manage their bookings through an authenticated experience.
Each confirmed booking can produce a branded PDF e-ticket with passenger details, airport names, customer email, QR code, barcode, PNR, and booking information.
The system also includes check-in, boarding-pass data, role-based access control, demo flight data, and RESTful backend services.

## Features

- Customer registration and login with JWT authentication
- Secure password hashing with bcrypt
- Flight search by origin, destination, and departure date
- Airport labels with city, full airport name, and IATA code
- Seat map with seat holding and availability checks
- Passenger details, baggage, and meal extras
- Mock payment creation, verification, and booking confirmation
- PNR assignment for confirmed bookings
- Professional PDF e-ticket generation
- QR code and Code 128 barcode on tickets
- Customer email shown on the ticket and included in boarding-pass data
- Booking lookup, cancellation, and check-in workflows
- Admin and role-based access control
- MongoDB with automatic in-memory fallback for local development

## Tech Stack and Languages

- Frontend: React 18, TypeScript, TSX, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB and Mongoose
- Authentication: JWT and bcrypt
- Documents: PDFKit
- Codes: QRCode and BWIP-JS barcode generation
- Testing: Playwright and Node.js RBAC tests
- Configuration: JavaScript, CommonJS, JSON, HTML, and CSS

## Project Structure

```text
Sky-Pakistan-Airline/
  backend/
    src/
      config/          Database connection
      controllers/     Authentication, flights, bookings, payments, tickets
      middleware/      JWT authentication middleware
      models/          Mongoose data models
      routes/          Express API routes
      services/        Demo data, mail, PNR, and audit services
      tests/           Backend access-control tests
    .env.example
    package.json
    tsconfig.json
  frontend/
    src/
      components/      Passenger form, payment modal, and seat map
      data/            Shared airport directory
      pages/            Home, login, register, search, booking, and management pages
      services/        API and booking service clients
      store/            Redux authentication state
    e2e/                Playwright end-to-end tests
    .env.example
    package.json
  .gitignore
  LICENSE
  README.md
```

## Requirements

- Node.js 18 or later
- npm
- MongoDB optional for local development because the backend can use MongoDB Memory Server as a fallback

## 1. Backend Setup

```bash
cd backend
npm install
```

Create a local environment file:

```bash
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

Start the backend in development mode:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

The backend creates demo flight, airport, fare, and admin data when it starts.

## 2. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux:

```bash
cp .env.example .env
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

If that port is already in use, Vite will choose another available port such as `5174`.

The frontend API URL is configured through `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:4000/api
```

## 3. How Customers Use the Website

1. Open **Register** and create an account using the customer's own name, email, and password.
2. Log in with that same email and password. Customers do not need the admin account.
3. Search for a route, date, and destination.
4. Select an available seat and enter passenger details.
5. Choose baggage or meal extras if required.
6. Complete the mock payment and confirm the booking.
7. The confirmed booking receives a PNR and a professional PDF e-ticket.
8. The ticket contains the customer's registered email, passenger name, route, full airport names, seat, QR code, barcode, and booking details.
9. Use **Manage Booking** for lookup, cancellation, and check-in.

## 4. Demo Admin Account

The development data service creates this demo administrator:

```text
Email: admin@skypakistan.test
Password: password
```

Change demo credentials and secrets before using the system in production.

## 5. Important API Routes

```text
POST /api/auth/register       Create a customer account
POST /api/auth/login          Log in with customer email and password
GET  /api/flights/search      Search available flights
POST /api/bookings/initiate   Hold seats and create a pending booking
POST /api/payments/create     Create a mock payment
POST /api/payments/verify     Verify the mock payment
POST /api/bookings/confirm    Confirm the booking and assign a PNR
POST /api/tickets/generate    Generate the PDF e-ticket
POST /api/checkin             Create boarding-pass data
GET  /api/manage/by-pnr       Look up a booking by PNR
```

Most booking, payment, ticket, and check-in routes require a JWT bearer token from customer login.

## 6. Ticket and Boarding Pass Details

The generated e-ticket includes:

- SkyPakistan Airways branding
- Flight number, route, and travel dates
- City, airport name, and IATA code for origin and destination
- Passenger name, seat, cabin, PNR, and ticket number
- Customer's registered email address
- Booking ID and total booking value
- QR code and Code 128 barcode
- Travel and check-in instructions

The PDF creates exactly one page per issued passenger ticket and does not intentionally add blank pages.

## 7. Development Commands

Backend:

```bash
cd backend
npm run dev       # Start the development API
npm run build     # Compile TypeScript
npm run start     # Start the compiled API
npm run seed      # Seed demo accounts and data
npm run test:rbac # Run RBAC tests
```

Frontend:

```bash
cd frontend
npm run dev       # Start the Vite development server
npm run build     # Build the production frontend
npm run preview   # Preview the production build
npm run e2e       # Run Playwright tests
```

## 8. Deployment Notes

- Frontend can be deployed to Vercel, Netlify, or another static hosting provider.
- Backend can be deployed to Render, Railway, Fly.io, or a Node.js server.
- MongoDB Atlas is recommended for production data storage.
- Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`, and mail/payment environment variables on the backend.
- Set `VITE_API_URL` to the deployed backend API on the frontend.
- Never commit `.env` files, passwords, JWT secrets, or payment credentials.
- Use HTTPS in production and replace the mock payment flow with a real payment provider before accepting real payments.

## License

This project is distributed under the Apache-2.0 license. See [LICENSE](LICENSE) for details.
