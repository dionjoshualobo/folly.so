#!/usr/bin/env node

/**
 * Folly MCP Server
 * Model Context Protocol server enabling AI agents (Claude Code, Cursor, Antigravity, Gemini)
 * to programmatically build, update, and manage forms on Folly.so.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import pg from 'pg'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env if present
try {
  const envPath = join(__dirname, '..', '.env')
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
} catch {}

const API_BASE = (process.env.FOLLY_API_URL || 'http://localhost:3001').replace(/\/$/, '')
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://folly:folly@localhost:5440/folly'

// PostgreSQL pool fallback for when the API server is offline
let pgPool = null
function getPgPool() {
  if (!pgPool) {
    pgPool = new pg.Pool({ connectionString: DATABASE_URL })
  }
  return pgPool
}

function uid() {
  return Math.random().toString(36).slice(2, 8)
}

function makeDefaultSettings(title = 'Untitled form', description = '', slug = '') {
  return {
    title,
    description,
    slug: slug.trim() || undefined,
    thankYouMessage: 'Your response has been recorded. Thank you!',
    showProgress: true,
    poweredBy: true,
    accent: '#ffe600',
    theme: {
      background: '#ffffff',
      button: '#ffe600',
      buttonText: '#000000',
      font: 'system',
      darkMode: false,
    },
  }
}

// Data access: tries HTTP API first, falls back to direct Postgres query
async function apiGetForms() {
  try {
    const res = await fetch(`${API_BASE}/api/forms`)
    if (res.ok) {
      const data = await res.json()
      return data.forms || []
    }
  } catch {}

  const pool = getPgPool()
  const { rows } = await pool.query(`
    SELECT f.data, COUNT(s.id)::int AS count
    FROM forms f
    LEFT JOIN submissions s ON s.form_id = f.id
    GROUP BY f.id, f.data
    ORDER BY (f.data->>'updatedAt')::bigint DESC NULLS LAST
  `)
  return rows.map((r) => ({ ...r.data, submissionCount: r.count }))
}

async function apiGetForm(idOrSlug) {
  try {
    const res = await fetch(`${API_BASE}/api/forms/${encodeURIComponent(idOrSlug)}`)
    if (res.ok) {
      const data = await res.json()
      return data.form
    }
  } catch {}

  const pool = getPgPool()
  const { rows } = await pool.query(
    "SELECT data FROM forms WHERE id = $1 OR lower(data->'settings'->>'slug') = lower($1)",
    [idOrSlug]
  )
  if (!rows[0]) return null
  const form = rows[0].data
  const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM submissions WHERE form_id = $1', [form.id])
  form.submissionCount = countRes.rows[0]?.count ?? 0
  return form
}

async function apiSaveForm(form) {
  try {
    const res = await fetch(`${API_BASE}/api/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.form
    }
  } catch {}

  const pool = getPgPool()
  await pool.query(
    'INSERT INTO forms (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
    [form.id, JSON.stringify(form)]
  )
  return form
}

async function apiDeleteForm(formId) {
  try {
    const res = await fetch(`${API_BASE}/api/forms/${encodeURIComponent(formId)}`, {
      method: 'DELETE',
    })
    if (res.ok) return true
  } catch {}

  const pool = getPgPool()
  const { rowCount } = await pool.query('DELETE FROM forms WHERE id = $1', [formId])
  return rowCount > 0
}

async function apiGetSubmissions(formId) {
  try {
    const res = await fetch(`${API_BASE}/api/forms/${encodeURIComponent(formId)}/submissions`)
    if (res.ok) {
      const data = await res.json()
      return data.submissions || []
    }
  } catch {}

  const pool = getPgPool()
  const { rows } = await pool.query(
    "SELECT data FROM submissions WHERE form_id = $1 ORDER BY (data->>'submittedAt')::bigint DESC",
    [formId]
  )
  return rows.map((r) => r.data)
}

// Initialize MCP Server
const server = new Server(
  {
    name: 'folly-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
)

// List MCP Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'folly://forms',
        name: 'All Forms',
        description: 'JSON list of all forms in Folly with metadata and submission totals.',
        mimeType: 'application/json',
      },
    ],
  }
})

// Read MCP Resources
server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const uri = req.params.uri
  if (uri === 'folly://forms') {
    const forms = await apiGetForms()
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(forms, null, 2),
        },
      ],
    }
  }

  const formMatch = uri.match(/^folly:\/\/forms\/([a-zA-Z0-9_-]+)$/)
  if (formMatch) {
    const form = await apiGetForm(formMatch[1])
    if (!form) throw new Error(`Form not found: ${formMatch[1]}`)
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(form, null, 2),
        },
      ],
    }
  }

  const subMatch = uri.match(/^folly:\/\/submissions\/([a-zA-Z0-9_-]+)$/)
  if (subMatch) {
    const submissions = await apiGetSubmissions(subMatch[1])
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(submissions, null, 2),
        },
      ],
    }
  }

  throw new Error(`Resource not recognized: ${uri}`)
})

// List MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_forms',
        description: 'List all forms created in Folly with their IDs, titles, custom slugs, and submission counts.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_form',
        description: 'Get the complete definition of a form by its ID or custom slug, including all blocks, questions, settings, and logic.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The unique ID or custom URL slug of the form.',
            },
          },
          required: ['formId'],
        },
      },
      {
        name: 'create_form',
        description: 'Create a new blank form on Folly with title, description, and optional slug.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the form.',
            },
            description: {
              type: 'string',
              description: 'Optional introductory text or description for respondents.',
            },
            slug: {
              type: 'string',
              description: 'Optional vanity URL slug (e.g. "team-feedback" for /f/team-feedback).',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'add_blocks',
        description: 'Append one or more question, choice, or layout blocks to an existing form.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The ID or custom slug of the form.',
            },
            blocks: {
              type: 'array',
              description: 'Array of block definitions to add.',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Block type: shortText, longText, number, email, phone, multipleChoice, checkbox, dropdown, rating, nps, date, address, pageBreak, heading, paragraph',
                  },
                  text: {
                    type: 'string',
                    description: 'Question prompt or text content.',
                  },
                  required: {
                    type: 'boolean',
                    description: 'Whether answering this question is required.',
                  },
                  placeholder: {
                    type: 'string',
                    description: 'Optional input placeholder text.',
                  },
                  options: {
                    type: 'array',
                    description: 'Choice options for multipleChoice, checkbox, or dropdown.',
                    items: { type: 'string' },
                  },
                },
                required: ['type', 'text'],
              },
            },
          },
          required: ['formId', 'blocks'],
        },
      },
      {
        name: 'generate_form',
        description: 'Convenience tool: generate a complete form with multiple questions and settings in a single call.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the form.',
            },
            description: {
              type: 'string',
              description: 'Introductory description for respondents.',
            },
            slug: {
              type: 'string',
              description: 'Vanity URL slug (e.g. "hackathon-signup").',
            },
            questions: {
              type: 'array',
              description: 'List of questions to include in the form.',
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'Question prompt.',
                  },
                  type: {
                    type: 'string',
                    description: 'Field type: shortText, longText, number, email, phone, multipleChoice, checkbox, dropdown, rating, nps, date, address.',
                  },
                  required: {
                    type: 'boolean',
                    description: 'Whether field is mandatory (default: false).',
                  },
                  placeholder: {
                    type: 'string',
                    description: 'Placeholder text.',
                  },
                  options: {
                    type: 'array',
                    description: 'List of choices (for multipleChoice, checkbox, dropdown).',
                    items: { type: 'string' },
                  },
                },
                required: ['text', 'type'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      },
      {
        name: 'update_form_settings',
        description: 'Update settings on a form, including title, description, custom CSS, password gate, response limits, or closing deadline.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The ID of the form to update.',
            },
            title: { type: 'string' },
            description: { type: 'string' },
            slug: { type: 'string' },
            password: { type: 'string', description: 'Access code/password required to view the form.' },
            customCss: { type: 'string', description: 'Custom CSS injected into the form (.q, .q1, etc.).' },
            maxResponses: { type: 'number', description: 'Cap total submissions allowed.' },
            closedAt: { type: 'number', description: 'Unix timestamp (ms) after which the form closes.' },
          },
          required: ['formId'],
        },
      },
      {
        name: 'list_submissions',
        description: 'Retrieve respondent submissions and answers collected for a form.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The ID or custom slug of the form.',
            },
          },
          required: ['formId'],
        },
      },
      {
        name: 'delete_form',
        description: 'Delete a form and all of its associated submissions permanently.',
        inputSchema: {
          type: 'object',
          properties: {
            formId: {
              type: 'string',
              description: 'The unique ID of the form to delete.',
            },
          },
          required: ['formId'],
        },
      },
    ],
  }
})

// Call MCP Tool
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params

  switch (name) {
    case 'list_forms': {
      const forms = await apiGetForms()
      const summary = forms.map((f) => ({
        id: f.id,
        title: f.settings?.title || 'Untitled form',
        slug: f.settings?.slug || null,
        url: f.settings?.slug ? `/f/${f.settings.slug}` : `/r/${f.id}`,
        blocksCount: f.blocks?.length || 0,
        submissionCount: f.submissionCount || 0,
        updatedAt: f.updatedAt ? new Date(f.updatedAt).toISOString() : null,
      }))
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      }
    }

    case 'get_form': {
      const form = await apiGetForm(args.formId)
      if (!form) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Form '${args.formId}' not found.` }],
        }
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(form, null, 2) }],
      }
    }

    case 'create_form': {
      const id = uid()
      const now = Date.now()
      const form = {
        id,
        settings: makeDefaultSettings(args.title, args.description || '', args.slug || ''),
        blocks: [
          {
            id: uid(),
            type: 'shortText',
            text: 'Your Name',
            required: true,
          },
        ],
        createdAt: now,
        updatedAt: now,
      }
      const saved = await apiSaveForm(form)
      return {
        content: [
          {
            type: 'text',
            text: `Form created successfully!\nID: ${saved.id}\nURL: ${saved.settings.slug ? `/f/${saved.settings.slug}` : `/r/${saved.id}`}\nEdit: /editor/${saved.id}`,
          },
        ],
      }
    }

    case 'add_blocks': {
      const form = await apiGetForm(args.formId)
      if (!form) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Form '${args.formId}' not found.` }],
        }
      }

      const newBlocks = args.blocks.map((b) => {
        const blockId = b.id || uid()
        const opts = (b.options || []).map((opt) =>
          typeof opt === 'string' ? { id: uid(), label: opt } : { id: opt.id || uid(), label: opt.label || '' }
        )
        return {
          id: blockId,
          type: b.type,
          text: b.text || '',
          required: Boolean(b.required),
          placeholder: b.placeholder || undefined,
          helpText: b.helpText || undefined,
          options: opts.length > 0 ? opts : undefined,
          showIf: b.showIf || undefined,
          jumpRules: b.jumpRules || undefined,
          ratingMax: b.ratingMax,
          ratingIcon: b.ratingIcon,
          linearMax: b.linearMax,
          linearMinLabel: b.linearMinLabel,
          linearMaxLabel: b.linearMaxLabel,
          npsMinLabel: b.npsMinLabel,
          npsMaxLabel: b.npsMaxLabel,
          matrixRows: b.matrixRows,
          matrixColumns: b.matrixColumns,
          scoreSourceIds: b.scoreSourceIds,
          imageUrl: b.imageUrl,
          imageCaption: b.imageCaption,
          embedUrl: b.embedUrl,
          colId: b.colId,
          colWidth: b.colWidth,
        }
      })

      form.blocks = [...(form.blocks || []), ...newBlocks]
      form.updatedAt = Date.now()
      await apiSaveForm(form)

      return {
        content: [
          {
            type: 'text',
            text: `Added ${newBlocks.length} block(s) to form '${form.settings.title}'. Total blocks: ${form.blocks.length}.`,
          },
        ],
      }
    }

    case 'generate_form': {
      const id = uid()
      const now = Date.now()
      const blocks = (args.questions || []).map((q) => {
        const opts = (q.options || []).map((opt) =>
          typeof opt === 'string' ? { id: uid(), label: opt } : { id: opt.id || uid(), label: opt.label || '' }
        )
        return {
          id: q.id || uid(),
          type: q.type || 'shortText',
          text: q.text || '',
          required: Boolean(q.required),
          placeholder: q.placeholder || undefined,
          helpText: q.helpText || undefined,
          options: opts.length > 0 ? opts : undefined,
          showIf: q.showIf || undefined,
          jumpRules: q.jumpRules || undefined,
          ratingMax: q.ratingMax,
          ratingIcon: q.ratingIcon,
          linearMax: q.linearMax,
          linearMinLabel: q.linearMinLabel,
          linearMaxLabel: q.linearMaxLabel,
          npsMinLabel: q.npsMinLabel,
          npsMaxLabel: q.npsMaxLabel,
          matrixRows: q.matrixRows,
          matrixColumns: q.matrixColumns,
          scoreSourceIds: q.scoreSourceIds,
          imageUrl: q.imageUrl,
          imageCaption: q.imageCaption,
          embedUrl: q.embedUrl,
          colId: q.colId,
          colWidth: q.colWidth,
        }
      })

      const form = {
        id,
        settings: makeDefaultSettings(args.title, args.description || '', args.slug || ''),
        blocks: blocks.length > 0 ? blocks : [{ id: uid(), type: 'shortText', text: 'Name', required: true }],
        createdAt: now,
        updatedAt: now,
      }

      if (args.customCss) form.settings.customCss = args.customCss
      if (args.hiddenFields) form.settings.hiddenFields = args.hiddenFields
      if (args.password) form.settings.password = args.password
      if (args.maxResponses) form.settings.maxResponses = args.maxResponses

      const saved = await apiSaveForm(form)
      const publicUrl = saved.settings.slug ? `/f/${saved.settings.slug}` : `/r/${saved.id}`
      return {
        content: [
          {
            type: 'text',
            text: `Form '${saved.settings.title}' generated successfully!\nID: ${saved.id}\nQuestions: ${saved.blocks.length}\nPublic Link: ${publicUrl}\nEditor: /editor/${saved.id}`,
          },
        ],
      }
    }

    case 'update_form_settings': {
      const form = await apiGetForm(args.formId)
      if (!form) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Form '${args.formId}' not found.` }],
        }
      }

      if (args.title !== undefined) form.settings.title = args.title
      if (args.description !== undefined) form.settings.description = args.description
      if (args.slug !== undefined) form.settings.slug = args.slug.trim() || undefined
      if (args.password !== undefined) form.settings.password = args.password.trim() || undefined
      if (args.customCss !== undefined) form.settings.customCss = args.customCss
      if (args.maxResponses !== undefined) form.settings.maxResponses = args.maxResponses
      if (args.closedAt !== undefined) form.settings.closedAt = args.closedAt

      form.updatedAt = Date.now()
      await apiSaveForm(form)

      return {
        content: [
          {
            type: 'text',
            text: `Updated settings for form '${form.settings.title}' (${form.id}).`,
          },
        ],
      }
    }

    case 'list_submissions': {
      const submissions = await apiGetSubmissions(args.formId)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(submissions, null, 2),
          },
        ],
      }
    }

    case 'delete_form': {
      const ok = await apiDeleteForm(args.formId)
      if (!ok) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to delete form '${args.formId}'.` }],
        }
      }
      return {
        content: [{ type: 'text', text: `Form '${args.formId}' deleted successfully.` }],
      }
    }

    default:
      throw new Error(`Tool not found: ${name}`)
  }
})

// Start stdio transport
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write('Folly MCP Server running on stdio.\n')
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`)
  process.exit(1)
})
