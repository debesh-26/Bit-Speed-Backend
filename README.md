# Bitespeed Backend Task: Identity Reconciliation

![Status](https://img.shields.io/badge/status-deployed-success)
![Platform](https://img.shields.io/badge/platform-Render-blue)

This project is a backend service for Bitespeed designed to handle **Identity Reconciliation**. It provides a single API endpoint (`/identify`) that processes customer contact information (email and phone number) to identify and consolidate their identity across multiple interactions.

The service is built with a robust tech stack including Node.js, Express, TypeScript, and PostgreSQL, using Prisma as the ORM for type-safe database access.

---

## 🚀 Live API Endpoint

The API is hosted on Render and is publicly accessible.

**Base URL:** `(https://bit-speed-backend.onrender.com/)` 
<!-- 💡 IMPORTANT: Replace the URL above with your actual Render URL! -->

---

## 📝 API Documentation

### `POST /identify`

This is the primary endpoint for identifying a contact. It receives an email and/or a phone number and returns the consolidated contact information.

#### Request Body

The request body must be a JSON object containing either an `email`, a `phoneNumber`, or both.

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

#### Success Response (200 OK)

The response will contain a `contact` object with the primary contact ID, a consolidated list of emails and phone numbers, and a list of all secondary contact IDs.

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

#### Example Usage (cURL)

```bash
curl -X POST \
  https://bitespeed-task-m47z.onrender.com/identify \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
  }'
```
<!-- 💡 IMPORTANT: Replace the URL above with your actual Render URL! -->

---

## ✨ Core Logic & Features

The service implements the following identity reconciliation logic:

-   **New Primary Contact:** If no existing contacts match the request, a new `primary` contact is created.
-   **New Secondary Contact:** If the request contains new information linked to an existing contact, a new `secondary` contact is created and linked to the primary one.
-   **Identity Consolidation:** If the request links two previously separate primary contacts, the older contact remains `primary`, and the newer one is updated to become `secondary`, linking the two identity chains.
-   **Data Aggregation:** The API always returns the complete, consolidated view of a customer's identity, ensuring the primary contact's details are listed first.

---

## 🛠️ Tech Stack

-   **Backend:** Node.js, Express.js
-   **Language:** TypeScript
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Deployment:** Render

---

## 💻 Setup and Running Locally

To run this project on your local machine, follow these steps:

#### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   PostgreSQL database running locally or on a server

#### 1. Clone the repository

```bash
git clone https://github.com/debesh-26/Bit-Speed-Backend.git
cd Bit-Speed-Backend
```
<!-- 💡 IMPORTANT: Replace with your repository URL if different -->

#### 2. Install dependencies

```bash
npm install
```

#### 3. Set up environment variables

Create a `.env` file in the root of the project and add your database connection string:

```env
# PostgreSQL connection URL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/bitespeed_db?schema=public"

# Server Port
PORT=3000
```

#### 4. Run database migrations

Prisma will create the `Contact` table in your database based on the schema.

```bash
npx prisma migrate dev
```

#### 5. Start the development server

The server will start on `http://localhost:3000` with hot-reloading.

```bash
npm run dev
```

---

## 🗄️ Database Schema

The application uses a single table, `Contact`, to store identity information. The schema is defined in `prisma/schema.prisma`.

```prisma
model Contact {
  id              Int            @id @default(autoincrement())
  phoneNumber     String?
  email           String?
  linkedId        Int?
  linkPrecedence  LinkPrecedence // "primary" or "secondary"
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?
}
```

---

## 📂 Project Structure

```
.
├── prisma/
│   └── schema.prisma      # Database schema definition
├── src/
│   ├── controllers/
│   │   └── contact.controller.ts # Handles HTTP requests and responses
│   ├── routes/
│   │   └── contact.routes.ts     # Defines API routes
│   ├── services/
│   │   └── contact.service.ts    # Contains all business logic
│   └── index.ts           # Main server entry point
├── .env                 # Environment variables (not committed)
├── package.json
└── tsconfig.json          # TypeScript compiler options
```

---

## 🧑‍💻 Author

-   **Debesh Mohapatra**
-   [GitHub](https://github.com/debesh-26)
<!-- 💡 IMPORTANT: Update with your name and links -->
