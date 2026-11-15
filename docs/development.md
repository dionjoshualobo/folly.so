# Development

Requirements: **Node.js 20+** and **Docker** (for PostgreSQL).

```bash
# Install dependencies
npm install

# Start the database and dev servers concurrently:
# (Spins up Postgres on :5440, API on :3001, and Vite on :5173)
npm run dev
```

Visit **`http://localhost:5173`** for hot-reloading frontend development (API requests are proxied to `:3001`).

Environment variables are described in [self-hosting](self-hosting.md#configuration).

## Tech stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, Lucide-style icons
- **Backend:** Express 5, Node.js (`pg`), PostgreSQL (JSONB document store)
- **Styling:** Custom Neo-Brutalist design system with high-contrast borders and offset shadows
