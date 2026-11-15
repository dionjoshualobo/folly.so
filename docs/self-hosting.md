# Self-hosting

## Docker Compose

The fastest way to spin up Folly with PostgreSQL:

```bash
git clone https://github.com/dionjoshualobo/folly.so.git
cd folly.so
docker compose up --build
```

Access the app at **`http://localhost:3001`**. Demo forms and sample responses are seeded automatically when launched for the first time.

## Configuration

Settings can be customized via `.env` (copy `.env.example` to get started):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://folly:folly@localhost:5440/folly` | PostgreSQL connection string. Its port must match `DB_PORT` |
| `DB_PORT` | `5440` | Host port the Docker Postgres container is published on. If you change it, update the port in `DATABASE_URL` too |
| `PORT` | `3001` | Port for the API and static server |
| `SEED_DEMO` | `true` | Pre-populates sample forms if the database is empty |

## Production build without Docker

```bash
npm run build    # Compiles TypeScript and builds Vite bundle to dist/
npm start        # Starts Express server serving static dist/ + /api on :3001
```
