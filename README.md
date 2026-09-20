# Folly

A free, self-hostable form builder — type your questions like you would in a doc, hit `/` to insert any block, and collect unlimited responses.

## Features

- Notion-like editor with slash commands, inline editing and drag-to-reorder
- Blocks: short/long text, email, number, multiple choice, checkbox, dropdown, rating, NPS, file upload, page breaks, thank-you pages and more
- Conditional logic, hidden fields, multi-page forms with progress bar
- Themes and design presets, description with inline formatting (`**bold**` / `*italic*`)
- Public form pages + a responses/submissions dashboard with CSV export
- Postgres-backed persistence, fully self-hostable via Docker Compose

## Quick start (Docker Compose)

Requires Docker. This builds the app, starts Postgres + the API/server, and serves everything on `http://localhost:3001`.

```bash
cp .env.example .env   # optional — customise DATABASE_URL / PORT / SEED_DEMO
docker compose up --build
```

Demo forms and sample responses are seeded automatically into an empty database (`SEED_DEMO=true` by default).

## Local development

Requires Node 20+ and a Postgres database.

```bash
npm install
cp .env.example .env   # defaults to postgres://folly:folly@localhost:5432/folly

# Terminal 1 — Postgres (Docker) + API server
npm run db:up          # start postgres:16 on :5432
npm run dev:api        # API + static server on :3001

# Terminal 2 — Vite dev server (hot reload, proxies /api to :3001)
npm run dev            # http://localhost:5173
```

### Production build

```bash
npm run build          # tsc + vite build into dist/
npm start              # serves dist/ + API on :3001 (reads .env)
```

## Configuration

| Variable      | Default                                 | Description                          |
| ------------- | --------------------------------------- | ------------------------------------ |
| `DATABASE_URL`| `postgres://folly:folly@localhost:5432/folly` | Postgres connection string   |
| `PORT`        | `3001`                                  | Port for the API + static server     |
| `SEED_DEMO`   | `true`                                  | Seed demo forms + responses when empty |

## Architecture

- `src/` — React SPA (Vite, React Router with hash routing, zustand store in `src/store.ts`)
- `src/lib/api.ts` — typed fetch client for the API
- `server/` — Express 5 + `pg`; stores each form/submission as a JSONB document keyed by id
- `vite.config.ts` — dev proxy of `/api` → `http://localhost:3001`

The client owns the data shape; the server is a thin persistence layer. All mutations are optimistic and saved to the API with a 350 ms debounce.