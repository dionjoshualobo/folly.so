import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { config, initDb, pool } from './db.mjs'
import { seedIfEmpty } from './seed.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json({ limit: '15mb' }))

async function rowToForm(id) {
  const { rows } = await pool.query('SELECT data FROM forms WHERE id = $1', [id])
  return rows[0]?.data ?? null
}

// ---- API routes -------------------------------------------------------

app.get('/api/health', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 AS ok')
    res.json({ ok: rows[0].ok === 1 })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err.message || err) })
  }
})

app.get('/api/forms', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT f.data, COUNT(s.id)::int AS count
      FROM forms f
      LEFT JOIN submissions s ON s.form_id = f.id
      GROUP BY f.id, f.data
      ORDER BY (f.data->>'updatedAt')::bigint DESC NULLS LAST
    `)
    res.json({ forms: rows.map((r) => ({ ...r.data, submissionCount: r.count })) })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.post('/api/forms', async (req, res) => {
  try {
    const form = req.body?.form
    if (!form?.id) return res.status(400).json({ error: 'form.id is required' })
    await pool.query(
      'INSERT INTO forms (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
      [form.id, JSON.stringify(form)],
    )
    res.status(201).json({ form })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await rowToForm(req.params.id)
    if (!form) return res.status(404).json({ error: 'Not found' })
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM submissions WHERE form_id = $1', [req.params.id])
    form.submissionCount = rows[0]?.count ?? 0
    res.json({ form })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.patch('/api/forms/:id', async (req, res) => {
  try {
    const form = req.body?.form
    if (!form?.id || form.id !== req.params.id) return res.status(400).json({ error: 'matching form.id is required' })
    await pool.query(
      'INSERT INTO forms (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
      [form.id, JSON.stringify(form)],
    )
    res.json({ form })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.delete('/api/forms/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM forms WHERE id = $1', [req.params.id])
    res.json({ ok: rowCount > 0 })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.get('/api/forms/:id/submissions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT data FROM submissions WHERE form_id = $1 ORDER BY (data->>\'submittedAt\')::bigint DESC', [req.params.id])
    res.json({ submissions: rows.map((r) => r.data) })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.post('/api/forms/:id/submissions', async (req, res) => {
  try {
    const submission = req.body?.submission
    if (!submission?.id || submission.formId !== req.params.id) {
      return res.status(400).json({ error: 'submission.id and matching formId are required' })
    }

    const form = await rowToForm(req.params.id)
    if (!form) return res.status(404).json({ error: 'Form not found' })

    if (form.settings?.closedAt && Date.now() > form.settings.closedAt) {
      return res.status(403).json({ error: 'This form has reached its closing date and is closed.' })
    }

    if (form.settings?.maxResponses && form.settings.maxResponses > 0) {
      const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM submissions WHERE form_id = $1', [req.params.id])
      const count = rows[0]?.count ?? 0
      if (count >= form.settings.maxResponses) {
        return res.status(403).json({ error: 'This form has reached its maximum response limit and is now closed.' })
      }
    }

    await pool.query('INSERT INTO submissions (id, form_id, data) VALUES ($1, $2, $3::jsonb)', [
      submission.id,
      submission.formId,
      JSON.stringify(submission),
    ])

    if (form.settings?.webhookUrl) {
      fetch(form.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'response.created',
          formId: form.id,
          formTitle: form.settings.title,
          submittedAt: submission.submittedAt,
          answers: submission.answers,
        }),
      }).catch((err) => {
        console.error('[folly] Webhook error:', err.message || err)
      })
    }

    res.status(201).json({ submission })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

app.post('/api/test-webhook', async (req, res) => {
  const { url, payload } = req.body || {}
  if (!url) return res.status(400).json({ ok: false, error: 'url is required' })
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || { test: true }),
    })
    res.json({ ok: upstream.ok, status: upstream.status })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err.message || err) })
  }
})

// ---- static SPA -------------------------------------------------------

const distDir = join(__dirname, '..', 'dist')
app.use(express.static(distDir))

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  const indexFile = join(distDir, 'index.html')
  if (!existsSync(indexFile)) {
    return res.status(404).json({ error: 'Client not built. Run `npm run build` first, or use the dev server.' })
  }
  res.sendFile(indexFile)
})

// ---- boot -------------------------------------------------------------

initDb()
  .then(async () => {
    if (config.seedDemo) await seedIfEmpty(pool)
    app.listen(config.port, () => {
      console.log(`[folly] API + static server listening on http://localhost:${config.port}`)
      console.log(`[folly] Postgres: ${config.databaseUrl}`)
    })
  })
  .catch((err) => {
    console.error('[folly] Failed to start:', err.message || err)
    process.exit(1)
  })

pool.on('error', (err) => {
  console.error('[folly] Postgres pool error:', err.message || err)
})

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    await pool.end().catch(() => {})
    process.exit(0)
  })
}