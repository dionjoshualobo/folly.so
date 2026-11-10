import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/ui'
import { useForms } from '../store'
import { formatWhen } from '../lib/logic'
import { Icon } from '../blockCatalog'
import { TEMPLATES, type FormTemplate } from '../lib/templates'

type SortKey = 'updatedAt' | 'createdAt' | 'responses' | 'name'

export default function Dashboard() {
  const forms = useForms((s) => s.forms)
  const submissions = useForms((s) => s.submissions)
  const createForm = useForms((s) => s.createForm)
  const createFormFromTemplate = useForms((s) => s.createFormFromTemplate)
  const deleteForm = useForms((s) => s.deleteForm)
  const duplicateForm = useForms((s) => s.duplicateForm)
  const ready = useForms((s) => s.ready)
  const error = useForms((s) => s.error)
  const hydrate = useForms((s) => s.hydrate)
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('updatedAt')
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  const createNew = () => {
    const f = createForm()
    navigate(`/editor/${f.id}`)
  }

  const applyTemplate = (t: FormTemplate) => {
    const f = createFormFromTemplate(t)
    setTemplateModalOpen(false)
    navigate(`/editor/${f.id}`)
  }

  const responseCount = (formId: string) => submissions.filter((s) => s.formId === formId).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = q
      ? forms.filter((f) => f.settings.title.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
      : [...forms]
    switch (sort) {
      case 'name':
        list = list.sort((a, b) => a.settings.title.localeCompare(b.settings.title))
        break
      case 'createdAt':
        list = list.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'responses':
        list = list.sort((a, b) => responseCount(b.id) - responseCount(a.id))
        break
      default: // updatedAt
        list = list.sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return list
  }, [forms, submissions, search, sort])

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafb]">
      <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.06] text-[13px] font-bold text-ink/60">
              D
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {!ready ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink/[0.05]">
              <span className="flex h-5 w-5 animate-spin items-center justify-center rounded-full border-2 border-ink/15 border-t-ink" />
            </div>
            {error && (
              <p className="mt-4 max-w-sm text-[14px] text-ink/45">
                Couldn't reach the server.
                <button
                  onClick={() => hydrate()}
                  className="ml-1.5 font-semibold text-brand-600 hover:underline"
                >
                  Retry
                </button>
              </p>
            )}
          </div>
        ) : (
        <>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">My forms</h1>
            <p className="mt-1 text-[14px] text-ink/45">
              {forms.length} form{forms.length === 1 ? '' : 's'} · {submissions.length} total response{submissions.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-[14px] font-semibold text-ink/75 transition hover:border-ink/30 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-ink/50">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              Templates
            </button>
            <button
              onClick={createNew}
              className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-ink/15 transition hover:-translate-y-0.5 hover:bg-black"
            >
              <Icon name="plus" className="flex h-4 w-4 items-center" />
              New form
            </button>
          </div>
        </div>

        {forms.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" aria-hidden>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search forms…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-[14px] text-ink outline-none transition placeholder:text-ink/35 focus:border-ink/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-ink/40">Sort:</span>
              {(['updatedAt', 'createdAt', 'responses', 'name'] as SortKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${sort === k ? 'bg-ink text-white' : 'bg-white border border-ink/15 text-ink/55 hover:border-ink/30 hover:text-ink'}`}
                >
                  {{ updatedAt: 'Modified', createdAt: 'Created', responses: 'Responses', name: 'Name' }[k]}
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && forms.length === 0 ? (
          <div className="mt-12 flex flex-col items-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/[0.05]">
                <Icon name="plus" className="flex h-6 w-6 items-center text-ink/40" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-ink">No forms yet</h2>
              <p className="mt-1 max-w-sm text-[14px] text-ink/45">
                Start from a blank canvas or jumpstart with a pre-built template.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={createNew}
                  className="rounded-full bg-ink px-6 py-2.5 text-[14px] font-bold text-white transition hover:bg-black"
                >
                  Blank form
                </button>
                <button
                  onClick={() => setTemplateModalOpen(true)}
                  className="rounded-full border border-ink/20 bg-white px-6 py-2.5 text-[14px] font-bold text-ink transition hover:border-ink/40"
                >
                  Browse templates
                </button>
              </div>
            </div>

            <div className="mt-12 w-full">
              <div className="mb-4 text-[12px] font-bold uppercase tracking-wider text-ink/40">Popular Templates</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TEMPLATES.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink/50">
                          {t.category}
                        </span>
                        <span className="text-[12px] font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
                          Use →
                        </span>
                      </div>
                      <h3 className="mt-3 text-[15px] font-bold text-ink">{t.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink/50">{t.description}</p>
                    </div>
                    <div className="mt-4 text-[11px] font-medium text-ink/35">
                      {t.blocks.length} blocks included
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/[0.05]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-ink/40" aria-hidden>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">No results for "{search}"</h2>
            <button onClick={() => setSearch('')} className="mt-3 text-[14px] font-semibold text-brand-600 hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => {
              const count = responseCount(f.id)
              const isClosed = !!(
                (f.settings.maxResponses && count >= f.settings.maxResponses) ||
                (f.settings.closedAt && Date.now() > f.settings.closedAt)
              )
              return (
                <div
                  key={f.id}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card"
                  onClick={() => navigate(`/editor/${f.id}`)}
                >
                  <div
                    className="flex h-28 flex-col justify-between p-4"
                    style={{ background: f.settings.theme.darkMode ? '#0b0f19' : f.settings.theme.background === '#ffffff' ? '#f4f4f6' : f.settings.theme.background }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="block w-12 rounded-full py-1 text-center text-[10px] font-bold"
                        style={{ background: f.settings.theme.button, color: f.settings.theme.buttonText }}
                      >
                        {isClosed ? 'CLOSED' : 'OPEN'}
                      </span>
                      {isClosed && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">closed</span>
                      )}
                    </div>
                    <span
                      className="truncate text-[14px] font-semibold"
                      style={{ color: f.settings.theme.darkMode ? '#fff' : '#1c1c1e' }}
                    >
                      {f.settings.title || 'Untitled form'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-[12px] text-ink/45">
                      <span className="font-semibold text-ink/70">{count || '0'}</span> response{count === 1 ? '' : 's'} · Updated {formatWhen(f.updatedAt)}
                    </div>
                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.hash = `#/r/${f.id}`
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink/45 transition hover:bg-ink/[0.05] hover:text-ink"
                        title="Open published form"
                      >
                        <span className="flex items-center justify-center"><Icon name="share" /></span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const copy = duplicateForm(f.id)
                          if (copy) navigate(`/editor/${copy.id}`)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink/45 transition hover:bg-ink/[0.05] hover:text-ink"
                        title="Duplicate form"
                      >
                        <span className="flex items-center justify-center"><Icon name="duplicate" /></span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Delete this form and all its responses?')) deleteForm(f.id)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink/45 transition hover:bg-brand-50 hover:text-brand-600"
                        title="Delete form"
                      >
                        <span className="flex items-center justify-center"><Icon name="trash" /></span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <button
              onClick={createNew}
              className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 text-ink/40 transition hover:border-ink/40 hover:text-ink/70"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.04]">
                <Icon name="plus" className="flex h-5 w-5 items-center" />
              </span>
              <span className="text-[14px] font-semibold">Create a form</span>
            </button>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl">🪄</span>
            <div>
              <h3 className="text-[14px] font-bold text-ink/80">Pro tip</h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink/55">
                Open any form and hit <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] font-bold">/</kbd> to insert blocks — short text, choices, ratings, NPS, file uploads and more. Use the{' '}
                <span className="font-semibold">⋮⋮</span> settings of a block to add conditional logic.
              </p>
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {templateModalOpen && (
        <TemplateModal
          onClose={() => setTemplateModalOpen(false)}
          onSelect={applyTemplate}
        />
      )}
    </div>
  )
}

function TemplateModal({
  onClose,
  onSelect,
}: {
  onClose: () => void
  onSelect: (t: FormTemplate) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const categories = ['All', 'Business', 'Feedback', 'Events', 'HR', 'Sales']

  const filtered = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-pop relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/[0.08] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Form Templates</h2>
            <p className="text-[13px] text-ink/50">Choose a ready-to-use template or customize it as you like.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/[0.05] hover:text-ink"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex gap-1.5 border-b border-ink/[0.06] px-6 py-3 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-3.5 py-1 text-[12px] font-semibold transition ${
                selectedCategory === c
                  ? 'bg-ink text-white'
                  : 'bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08] hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-[#fafafb] p-5 transition hover:border-ink/30 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink/50">
                      {t.category}
                    </span>
                    <span className="text-[11px] font-medium text-ink/40">
                      {t.blocks.length} blocks
                    </span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-bold text-ink">{t.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink/55">{t.description}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-ink/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-ink/40 font-mono">1-click install</span>
                  <button
                    onClick={() => onSelect(t)}
                    className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-black"
                  >
                    Use template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}