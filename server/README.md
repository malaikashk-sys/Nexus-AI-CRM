# Nexus AI CRM

A small full-stack CRM application for managing contacts, deals, and activities, with an integrated AI Sales Copilot feature powered by Google Gemini.

Built as a take-home project for Digitalsofts.

**Live App:** https://nexus-ai-crm-q433.vercel.app
**Backend API:** https://nexus-ai-crm-pi.vercel.app

---

## Features

- **Authentication** — Register/Login with JWT-based auth, passwords hashed with bcrypt
- **Contacts** — Create, view, and delete contacts (leads)
- **Deals** — Create, view, and delete deals linked to a contact, with a pipeline stage (Lead, Qualified, Proposal Sent, Closed Won, Closed Lost)
- **Activities** — Log calls, emails, meetings, and notes against a contact
- **AI Sales Copilot** — Two AI-powered actions using Google Gemini:
  - **Draft Email** — generates a personalized follow-up email using the contact's deal and activity history
  - **Summarize History** — summarizes a contact's relationship history into key insights and recommended next steps

---

## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Axios
- React component state (`useState`/`useEffect`) for state management

**Backend:**
- Node.js + Express
- PostgreSQL (hosted on Supabase)
- Prisma ORM
- JWT authentication, bcrypt password hashing
- Google Gemini API for AI features

**Deployment:**
- Frontend: Vercel
- Backend: Vercel (serverless functions)
- Database: Supabase (PostgreSQL)

---

## Database Schema

Four related models, connected with foreign keys:

```
User
 └── Contact (one-to-many)
      ├── Deal (one-to-many)
      └── Activity (one-to-many)
```

- **User** — id, email, password (hashed), name
- **Contact** — id, userId (FK), name, email, phone, company
- **Deal** — id, contactId (FK), title, value, stage (enum)
- **Activity** — id, contactId (FK), type (enum: CALL, EMAIL, MEETING, NOTE), details

See `server/prisma/schema.prisma` for the full schema definition.

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database (e.g. a free Supabase project)
- A Google Gemini API key

### 1. Clone the repo
```bash
git clone https://github.com/malaikashk-sys/Nexus-AI-CRM.git
cd Nexus-AI-CRM
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in `server/` with:
```
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"
PORT=5000
```

Generate the Prisma client and push the schema:
```bash
npx prisma generate
npx prisma db push
```

Start the backend:
```bash
node index.js
```
The API will run on `http://localhost:5000`.

### 3. Frontend setup
```bash
cd ../client
npm install
```

In `client/src/api.js`, set `baseURL` to your backend URL (`http://localhost:5000/api` for local development).

Start the frontend:
```bash
npm run dev
```
The app will run on `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/contacts` | Get all contacts for the logged-in user |
| POST | `/api/contacts` | Create a contact |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact |
| GET | `/api/deals/contact/:contactId` | Get deals for a contact |
| POST | `/api/deals` | Create a deal |
| PUT | `/api/deals/:id` | Update a deal |
| DELETE | `/api/deals/:id` | Delete a deal |
| GET | `/api/activities/contact/:contactId` | Get activities for a contact |
| POST | `/api/activities` | Create an activity |
| DELETE | `/api/activities/:id` | Delete an activity |
| POST | `/api/ai/generate` | Generate AI content (`draft_email` or `summarize`) for a contact |

All endpoints except `/api/auth/*` require a `Bearer` token in the `Authorization` header.

---

## Build Log

See `BUILD_LOG.md` for a detailed account of the development process, including AI tool usage.