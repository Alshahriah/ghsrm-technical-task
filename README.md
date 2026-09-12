# Task Manager API

A complete CRUD REST API for task management built with **Node.js**, **Express**, and **MongoDB (MongoDB Atlas)** — with a built-in frontend UI and interactive Swagger documentation.

## Features

- **Create** — add tasks with title, description, status, and due date
- **Read** — fetch all tasks, filter by title (fuzzy search) or status, get a task by ID
- **Update** — modify any task field, validated on every write
- **Delete** — remove tasks by ID
- **Web UI** — a single-page frontend served at the root, no build step
- **Swagger UI** — interactive, try-it-from-the-browser API docs at `/api-docs`
- **Centralized error handling** — consistent JSON errors (400 / 404 / 500)

## Quick Start

```bash
npm install
# .env must contain:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.../?appName=...
node server.js
```

Open:

| URL | What |
|---|---|
| http://localhost:3000 | Task Manager UI |
| http://localhost:3000/api-docs | Swagger UI |
| http://localhost:3000/api/tasks | JSON API |

## Project Structure

```
├── server.js           # Express app, DB connection, middleware, error handlers
├── models/Task.js      # Mongoose schema + validation
├── routes/tasks.js     # All CRUD routes under /api/tasks
├── docs/swagger.js     # OpenAPI 3.0 spec served by Swagger UI
├── public/index.html   # The entire frontend (one file)
└── .env                # MongoSRV connection URI
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | All tasks. Optional: `?title=` (fuzzy), `?status=` |
| `GET` | `/api/tasks/:id` | Single task by ID |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task (partial body allowed) |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Task shape

```json
{
  "title": "Buy milk",            // required
  "description": "2L whole",      // optional
  "status": "todo",               // todo | in-progress | done (default: todo)
  "dueDate": "2026-12-31"         // optional, ISO date
}
```

`createdAt` / `updatedAt` timestamps are added automatically.

### Error handling

- **400** — validation failures (missing title, invalid status enum, bad date). Returned as `{ "error": "..." }` from a single Express error middleware.
- **404** — task not found *or* malformed ID (`CastError` is caught and mapped to 404 per route).
- **404** — unknown routes via a catch-all handler.
- **500** — anything unexpected, logged server-side, generic message to the client.

## How It's Built

### Backend & data layer
The stack is deliberately small: Express, Mongoose, `dotenv`, and `swagger-ui-express`. Validation lives in the Mongoose schema (`required` title, `enum` status, `Date` type) so every write path — create and update via `runValidators: true` — gets the same rules for free, with no duplicated validator code. Routes are a single Express router; each handler wraps its work in try/catch and forwards to one central error middleware that maps `ValidationError` → 400 and unexpected errors → 500. Connection is established once in `server.js`; the DB name (`tasksdb`) is appended to the `MONGO_URI` env var, so Atlas connectivity was verified before any code was written.

### Swagger
Rather than code-first generation or comments-based tooling, the OpenAPI 3.0 spec is one hand-written file (`docs/swagger.js`) — ~90 lines covering all five endpoints, query parameters, request bodies, response codes, and a shared `TaskInput` schema. It's mounted with two lines: `swagger-ui-express` at `/api-docs`. Keeping the spec as a plain JS module means it's versioned with the code and zero build tooling.

### Frontend (UI)
The whole UI is a single `public/index.html` served by `express.static('public')` — no template engine, no frontend framework, no build step. Styling is Tailwind CSS via CDN. All data flows through `fetch()` against the same REST API above, so the UI and Postman exercise identical endpoints:

- **List & read** — `load()` fetches `GET /api/tasks` and renders task cards; empty state included.
- **Create** — the header form submits to `POST /api/tasks`; server validation errors are surfaced in an error line above the form.
- **Edit** — clicking a task's *Edit* button loads its values into the same form (reused for create/edit), swaps Add → Save, and PUTs the update. A Cancel button restores create mode.
- **Status change** — the pill-shaped dropdown on each card fires `PUT` with the new status immediately.
- **Delete** — the ✕ button calls `DELETE` and re-renders.

All user-supplied content is HTML-escaped before rendering (XSS-safe `innerHTML`), and status badges get distinct Tailwind colors (slate / amber / emerald).

## Testing

All endpoints were smoke-tested end-to-end against the live Atlas cluster (create → read all → read by ID → search by title → update → validation rejection → invalid ID 404 → delete → deleted ID 404). Postman or the Swagger UI's **Try it out** buttons cover the same flow.
