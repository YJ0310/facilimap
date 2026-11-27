# T04 — Backend initialization

Selected stack: **Node.js + Express**, with **SQLite** planned for T05/T06.
Use Node.js 22 or newer. The repository's existing top-level folders are unchanged.

## Run locally

Open a terminal in `facilimap/backend`:

```sh
npm ci
```

Copy `.env.example` to `.env`:

- Windows PowerShell: `Copy-Item .env.example .env`
- Windows Command Prompt: `copy .env.example .env`
- macOS/Linux: `cp .env.example .env`

Then start the API:

```sh
npm run dev
```

For a regular run without file watching, use `npm start`.
Open http://localhost:3000/api/health in a browser. Expected HTTP 200:

```json
{"status":"ok"}
```

Stop the server with Ctrl+C. Run `npm test` for automated checks.
Tests use an automatically allocated local port and do not create a database.

## Environment settings

| Name | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API listening port, 1–65535 |
| `DB_PATH` | `../database/facilimap.db` | Reserved SQLite location, resolved relative to `backend/` |
| `ADMIN_SECRET` | Empty | Reserved for later authentication; not used by the public health route |
| `CORS_ORIGIN` | `http://localhost:5173` | Exact allowed browser origin |

`.env` is loaded from `backend/` even if started from another directory.
Existing operating-system environment variables take precedence. No secrets or
database paths are returned by the API. The root `.gitignore` already excludes
real `.env` files and allows `.env.example`.

For Live Server, set `CORS_ORIGIN` to the actual frontend origin, for example
`http://127.0.0.1:5500`. `localhost` and `127.0.0.1` are different origins.
The frontend API base URL should be `http://localhost:3000/api` (adjust for `PORT`).
CORS controls browser access to responses; it is not authentication.

## Scope and next tasks

T04 provides the Express entry point, configuration loading/validation, CORS,
JSON parsing, health endpoint, JSON error responses and shutdown handling.
The health endpoint reports API liveness only, not database readiness.

SQLite connections, drivers, the five-table schema, indexes, seed data,
authentication and business endpoints are intentionally left for their assigned
tasks. No tables, uploaded files or administrator credentials are created here.
Generate a private local `ADMIN_SECRET` before later authentication work, e.g.
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
Do not put that value in source control or send it in a review message.

Submit this task on a feature branch with a PR targeting `dev`; the team reviews
and merges it according to the root README.
