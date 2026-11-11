import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, NeoWindowHeader } from '../components/ui'
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
    <div className="flex min-h-screen flex-col bg-[#fffdfa] text-black">
      {/* Top Banner */}
      <div className="bg-[#ffe600] text-black font-black uppercase text-xs py-1.5 px-6 border-b-2 border-black flex justify-between items-center tracking-wider font-mono">
        <span>★ DASHBOARD // FOLLY NEO-BRUTALIST SUITE ★</span>
        <span className="hidden sm:inline">100% UNLIMITED INTAKE</span>
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-black bg-white px-6 py-3.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#ffe600] text-xs font-black shadow-[2px_2px_0px_#000]">
              D
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {!ready ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#ffe600] shadow-[4px_4px_0px_#000]">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
            </div>
            {error && (
              <p className="mt-4 max-w-sm text-sm font-bold text-red-600">
                Server connection failed.{' '}
                <button
                  onClick={() => hydrate()}
                  className="underline font-black text-black hover:bg-[#ffe600]"
                >
                  Retry
                </button>
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Header Title & Top Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-6">
              <div>
                <div className="inline-block bg-[#ff90e8] text-black border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider -rotate-1 shadow-[2px_2px_0px_#000] mb-2">
                  WORKSPACE DIRECTORY
                </div>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black">
                  My Forms
                </h1>
                <p className="mt-1 font-mono text-xs font-bold text-neutral-600 uppercase">
                  {forms.length} FORM{forms.length === 1 ? '' : 'S'} CREATED · {submissions.length} TOTAL INTAKE RESPONSES
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  Templates
                </button>
                <button
                  onClick={createNew}
                  className="flex items-center gap-2 border-2 border-black bg-[#ffe600] text-black px-5 py-2.5 text-xs font-black uppercase shadow-[4px_4px_0px_#000] hover:bg-[#facc15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <Icon name="plus" className="flex h-4 w-4 items-center" />
                  New form +
                </button>
              </div>
            </div>

            {/* Search & Sort Bar */}
            {forms.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="search"
                    placeholder="SEARCH FORMS BY TITLE..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-2 border-black bg-white px-4 py-2.5 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#000] outline-none placeholder:text-neutral-400 focus:shadow-[5px_5px_0px_#000]"
                  />
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold uppercase text-neutral-500 mr-1">SORT:</span>
                  {(['updatedAt', 'createdAt', 'responses', 'name'] as SortKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setSort(k)}
                      className={`border-2 border-black px-3 py-1 font-bold uppercase transition ${
                        sort === k
                          ? 'bg-black text-white shadow-[2px_2px_0px_#ffe600]'
                          : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
                      }`}
                    >
                      {{ updatedAt: 'MODIFIED', createdAt: 'CREATED', responses: 'RESPONSES', name: 'TITLE' }[k]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Forms Grid */}
            {filtered.length === 0 && forms.length === 0 ? (
              <div className="mt-12 border-2 border-dashed border-black p-12 text-center bg-white shadow-[6px_6px_0px_#000]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-black bg-[#ffe600] shadow-[4px_4px_0px_#000] text-2xl font-black mb-4">
                  +
                </div>
                <h2 className="text-2xl font-black uppercase">No forms created yet</h2>
                <p className="mt-1 font-bold text-xs text-neutral-600 max-w-sm mx-auto">
                  Start from a clean canvas or jumpstart your questions with pre-built community templates.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={createNew}
                    className="bg-[#ffe600] text-black font-black uppercase text-xs px-6 py-3 border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-[#facc15] transition"
                  >
                    Blank form +
                  </button>
                  <button
                    onClick={() => setTemplateModalOpen(true)}
                    className="bg-white text-black font-black uppercase text-xs px-6 py-3 border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-neutral-50 transition"
                  >
                    Browse templates
                  </button>
                </div>
              </div>
            ) : filtered.length === 0 && search ? (
              <div className="mt-16 text-center border-2 border-black bg-white p-8 shadow-[6px_6px_0px_#000] max-w-md mx-auto">
                <h2 className="text-lg font-black uppercase">No forms match "{search}"</h2>
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-xs font-bold uppercase underline hover:bg-[#ffe600]"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((f) => {
                  const count = responseCount(f.id)
                  const isClosed = !!(
                    (f.settings.maxResponses && count >= f.settings.maxResponses) ||
                    (f.settings.closedAt && Date.now() > f.settings.closedAt)
                  )
                  return (
                    <div
                      key={f.id}
                      onClick={() => navigate(`/editor/${f.id}`)}
                      className="group border-2 border-black bg-white shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      {/* Window Header */}
                      <div>
                        <div className="border-b-2 border-black bg-black text-white px-3 py-1.5 flex justify-between items-center font-mono text-[11px] font-bold">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full border border-black ${isClosed ? 'bg-red-400' : 'bg-[#00ef84]'}`} />
                            <span>{isClosed ? 'STATUS: CLOSED' : 'STATUS: LIVE'}</span>
                          </div>
                          <span>FORM #{f.id.slice(0, 6)}</span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5">
                          <h3 className="text-lg font-black uppercase tracking-tight line-clamp-2">
                            {f.settings.title || 'Untitled form'}
                          </h3>
                          <div className="mt-3 flex items-center gap-2 font-mono text-[11px]">
                            <span className="bg-[#ffe600] text-black border border-black px-2 py-0.5 font-bold uppercase">
                              {count} RESPONSE{count === 1 ? '' : 'S'}
                            </span>
                            <span className="text-neutral-500 font-bold">
                              {formatWhen(f.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="border-t-2 border-black bg-neutral-50 px-4 py-2.5 flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-neutral-600 text-[11px]">CLICK TO EDIT</span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => window.location.hash = `#/r/${f.id}`}
                            className="border-2 border-black bg-white p-1 hover:bg-[#ffe600] shadow-[2px_2px_0px_#000] transition"
                            title="Open public form"
                          >
                            <Icon name="share" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const copy = duplicateForm(f.id)
                              if (copy) navigate(`/editor/${copy.id}`)
                            }}
                            className="border-2 border-black bg-white p-1 hover:bg-[#5ce1e6] shadow-[2px_2px_0px_#000] transition"
                            title="Duplicate form"
                          >
                            <Icon name="duplicate" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this form and all its responses permanently?')) {
                                deleteForm(f.id)
                              }
                            }}
                            className="border-2 border-black bg-white p-1 hover:bg-[#ff5470] hover:text-white shadow-[2px_2px_0px_#000] transition"
                            title="Delete form"
                          >
                            <Icon name="trash" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Create Form Action Box */}
                <button
                  onClick={createNew}
                  className="border-2 border-dashed border-black bg-[#fafafa] p-8 min-h-[170px] shadow-[4px_4px_0px_#000] hover:bg-[#ffe600]/30 hover:border-solid hover:shadow-[6px_6px_0px_#000] transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer text-black"
                >
                  <span className="h-10 w-10 border-2 border-black bg-white flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000] group-hover:bg-[#ffe600]">
                    +
                  </span>
                  <span className="font-black text-sm uppercase tracking-wide">
                    Create new form
                  </span>
                </button>
              </div>
            )}

            {/* Pro Tip Sticky Note */}
            <div className="mt-14 border-2 border-black bg-[#ffe600] p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex items-start gap-4">
                <span className="h-8 w-8 border-2 border-black bg-black text-[#ffe600] flex items-center justify-center font-black text-lg shrink-0 shadow-[2px_2px_0px_#000]">
                  !
                </span>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    PRO TIP // SLASH COMMAND POWER
                  </h3>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-neutral-900">
                    Press <kbd className="border-2 border-black bg-white px-2 py-0.5 font-mono text-xs font-black shadow-[1px_1px_0px_#000]">/</kbd> on any empty line in the editor to summon Short Text, Multi-Choice, File Uploads, Ratings, and Logic Jumps. Zero clicking around sidebars.
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col border-3 border-black bg-white shadow-[12px_12px_0px_#000] overflow-hidden">
        {/* Retro Window Header */}
        <div className="border-b-2 border-black bg-[#ffe600] px-4 py-3 flex items-center justify-between font-mono text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400 border border-black" />
            <span className="h-3 w-3 rounded-full bg-yellow-400 border border-black" />
            <span className="h-3 w-3 rounded-full bg-green-400 border border-black" />
            <span className="ml-2 font-black">TEMPLATES_CATALOG.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-2 py-0.5 text-xs font-black hover:bg-red-500 hover:text-white"
          >
            [ X ]
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 border-b-2 border-black px-6 py-3 overflow-x-auto bg-[#fafafa]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`border-2 border-black px-3.5 py-1 text-xs font-black uppercase transition ${
                selectedCategory === c
                  ? 'bg-black text-white shadow-[2px_2px_0px_#ffe600]'
                  : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fffdfa]">
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                    <span className="bg-[#5ce1e6] border border-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                      {t.category}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-neutral-600">
                      {t.blocks.length} BLOCKS
                    </span>
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight">{t.title}</h3>
                  <p className="mt-1 text-xs font-bold text-neutral-600 leading-relaxed">
                    {t.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[10px]">1-CLICK INSTALL</span>
                  <button
                    onClick={() => onSelect(t)}
                    className="border-2 border-black bg-[#ffe600] text-black px-3 py-1 font-black uppercase text-xs shadow-[2px_2px_0px_#000] hover:bg-[#facc15] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    USE TEMPLATE →
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
