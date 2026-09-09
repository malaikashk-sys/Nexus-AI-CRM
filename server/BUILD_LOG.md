# Build Log — Nexus AI CRM

This log documents how the project was built, including AI tool usage, as requested in the project brief.

---

## Overview

The goal was to build a small CRM (contacts, deals, activities) with a relational database, authentication, a REST API, and one integrated LLM feature. I used AI tools throughout the process, as explicitly permitted in the project brief, and have documented where and how below.

---

## Tech Stack Decisions

- **Database:** PostgreSQL, hosted on Supabase (free tier, cloud-hosted, no local setup needed)
- **ORM:** Prisma — chosen for clean schema definition and type-safe queries
- **Backend:** Node.js + Express (my existing area of experience, from a prior MERN internship project)
- **Frontend:** React (Vite) + Tailwind CSS
- **AI feature:** Google Gemini API, used for two contact-level actions — drafting a follow-up email and summarizing a contact's relationship history

## Database Schema Design

Designed a relational schema with four models:
- `User` → has many `Contact`
- `Contact` → has many `Deal` and `Activity`
- `Deal` and `Activity` both belong to a `Contact` via foreign keys

Used Prisma enums (`Stage` for deals, `ActivityType` for activities) to keep values constrained and consistent, and cascade deletes so removing a contact cleans up its related deals/activities automatically.

---

## AI Tool Usage

**I used Google Gemini as an AI coding assistant** throughout the build, in an iterative, hands-on way rather than a single one-shot generation:

- Gemini generated the initial project scaffold: the Express route files (`auth.js`, `contacts.js`, `deals.js`, `activities.js`, `ai.js`), the Prisma schema, and the React frontend (`Auth.jsx`, `Dashboard.jsx`) with Tailwind styling.
- I reviewed the generated code, tested it end-to-end myself, and identified and fixed several gaps and bugs that Gemini's first pass missed or got wrong:
  - The initial frontend only had a Contacts UI — no way to add or view Deals or Activities, even though the backend routes existed. I had Gemini add the missing Dashboard sections and wired them up.
  - The `deals.js` and `activities.js` routes were missing `GET /contact/:contactId` (fetch by contact) and `DELETE /:id` endpoints entirely — the frontend was calling endpoints that didn't exist, causing 404 errors. I identified this by comparing the frontend's API calls against the actual backend route files, then added the missing routes.
  - `auth.js` only had a `/register` route — `/login` was missing entirely, which I added myself (with bcrypt password comparison and JWT signing, matching the pattern already used in `/register`).
  - Deploying the backend to Vercel initially crashed with a `PrismaClientInitializationError`, because Vercel caches `node_modules` and skips Prisma's client generation step. Fixed by adding a `postinstall: "prisma generate"` script to `package.json`.
  - A token-storage bug: the login page stored the JWT in `sessionStorage` when "Remember Me" was unchecked, but the API client only checked `localStorage`, causing valid logins to fail with 401 errors on subsequent requests. Fixed by having the API client check both storage locations.
  - An initial hardcoded Gemini model name in `ai.js` needed verification/testing against the live API before it worked reliably.
- I tested every feature manually end-to-end (register, login, contact/deal/activity CRUD, both AI actions) both locally and on the live deployed URLs before considering it complete.

**In short:** Gemini accelerated the initial code generation significantly, but the working final product required me to test, debug, and fix real integration gaps between the frontend and backend that the AI-generated code did not handle correctly on its own.

---

## Deployment

- **Frontend:** Deployed to Vercel, connected to the GitHub repo's `main` branch for auto-deployment.
- **Backend:** Also deployed to Vercel (as a serverless Node/Express app), after resolving the Prisma build-cache issue above.
- **Database:** Supabase PostgreSQL (free tier), connected via `DATABASE_URL`.

## Challenges

The main challenges were integration-level, not conceptual:
- Catching frontend/backend endpoint mismatches (the AI-generated frontend and backend code weren't always written to match each other exactly).
- Vercel-specific deployment quirks with Prisma (build caching skipping client generation).
- A subtle auth bug (storage location mismatch) that only appeared under specific conditions (unchecked "Remember Me"), which required tracing through the actual browser console errors rather than just reading the code.

These were resolved through iterative testing — deploying, checking browser console/server logs for the exact error, and fixing the root cause rather than guessing.