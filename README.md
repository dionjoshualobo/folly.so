# Folly.so

A fast, neo-brutalist, self-hostable form builder. Type your questions like you would in a document, hit `/` to insert blocks, and collect unlimited responses.

---

## Features

- **Document-Style Editor:** Write forms naturally like a Notion doc. Insert blocks with `/` slash commands, edit inline, and drag to reorder.
- **Rich Block Library:**
  - **Inputs:** Short & Long text, Email, Phone, Number, URL, Date, Time, Address.
  - **Choices & Scales:** Multiple Choice, Checkboxes, Dropdown, Multi-select, Star & Linear Ratings, NPS (Net Promoter Score), Opinion Scales, Matrix / Grid, and Drag-to-Rank.
  - **Content & Embeds:** Headings (H1–H3), Paragraphs, Captions, Dividers, Images, and rich embeds (YouTube, Vimeo, Figma, Loom, Spotify).
- **Conditional Logic & Page Jumps:** Show/hide questions based on respondent answers, branch across multi-page workflows, or jump straight to submit.
- **Dynamic Answer Piping:** Reference previous answers in any title or question prompt using `@mention` syntax.
- **Custom Scoring & Quizzes:** Assign point values to answers and calculate real-time scores or quiz results.
- **Custom CSS Engine:** Deep styling control with granular CSS classes (`.q`, `.q1`, `.q-multi`, `.q-option`, `.q-badge`, `.q-label`).
- **Form Controls:** Password protection, response limits, automated scheduling (close date/time), and draft auto-saving to local storage.
- **Submissions & Exports:** Clean response dashboard with detailed submission breakdown and one-click CSV export.
- **Self-Hostable:** Standalone lightweight container with PostgreSQL and Express.

---

## Quick Start (Docker Compose)

The fastest way to spin up Folly with PostgreSQL:

```bash
# 1. Clone repository
git clone https://github.com/dionjoshualobo/folly.so.git
cd folly.so

# 2. Launch with Docker Compose
docker compose up --build
```

Access the app at **`http://localhost:3001`**. Demo forms and sample responses are seeded automatically when launched for the first time.

---

## Local Development

Requirements: **Node.js 20+** and **Docker** (for PostgreSQL).

```bash
# Install dependencies
npm install

# Start the database and dev servers concurrently:
# (Spins up Postgres on :5440, API on :3001, and Vite on :5173)
npm run dev
```

Visit **`http://localhost:5173`** for hot-reloading frontend development (API requests are proxied to `:3001`).

### Production Build

```bash
npm run build    # Compiles TypeScript and builds Vite bundle to dist/
npm start        # Starts Express server serving static dist/ + /api on :3001
```

---

## Configuration

Settings can be customized via `.env`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://folly:folly@localhost:5440/folly` | PostgreSQL connection string |
| `PORT` | `3001` | Port for the API and static server |
| `SEED_DEMO` | `true` | Pre-populates sample forms if the database is empty |

---

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, Lucide-style icons
- **Backend:** Express 5, Node.js (`pg`), PostgreSQL (JSONB document store)
- **Styling:** Custom Neo-Brutalist design system with high-contrast borders and offset shadows

---

## License

MIT
