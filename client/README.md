# Nexus AI CRM — Frontend

React (Vite) frontend for the Nexus AI CRM application.

**Live App:** https://nexus-ai-crm-q433.vercel.app

For the full project overview (features, tech stack, database schema, API endpoints), see the [root README](../README.md).

---

## Tech Stack

- React (Vite)
- Tailwind CSS
- Axios (for API calls, with a JWT auth interceptor)
- Component-level state management (`useState` / `useEffect`)

## Project Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Auth.jsx        # Login / Register page
│   │   └── Dashboard.jsx   # Main dashboard: contacts, deals, activities, AI copilot
│   ├── api.js              # Axios instance + JWT auth interceptor
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js
```

## Running Locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Connecting to a backend

In `src/api.js`, set `baseURL` to your backend's URL:

```js
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // or your deployed backend URL
});
```

## Building for Production

```bash
npm run build
```

Output is generated in the `dist/` folder.