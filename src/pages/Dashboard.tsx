import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/ui'
import { useForms } from '../store'
import { formatWhen } from '../lib/logic'
import { Icon } from '../blockCatalog'

export default function Dashboard() {
  const forms = useForms((s) => s.forms)
  const submissions = useForms((s) => s.submissions)
  const createForm = useForms((s) => s.createForm)
  const deleteForm = useForms((s) => s.deleteForm)
  const ready = useForms((s) => s.ready)
  const error = useForms((s) => s.error)
  const hydrate = useForms((s) => s.hydrate)
  const navigate = useNavigate()

  const createNew = () => {
    const f = createForm()
    navigate(`/editor/${f.id}`)
  }

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
                Couldn’t reach the server.
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
          <button
            onClick={createNew}
            className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-ink/15 transition hover:-translate-y-0.5 hover:bg-black"
          >
            <Icon name="plus" className="flex h-4 w-4 items-center" />
            New form
          </button>
        </div>

        {forms.length === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink/[0.05]">
              <Icon name="plus" className="flex h-7 w-7 items-center text-ink/40" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">No forms yet</h2>
            <p className="mt-1 max-w-sm text-[14px] text-ink/45">
              Create your first form and start typing — it's as easy as a text document.
            </p>
            <button
              onClick={createNew}
              className="mt-6 rounded-full bg-brand-500 px-6 py-3 text-[14px] font-bold text-white transition hover:bg-brand-600"
            >
              Create a form
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((f) => {
              const count = submissions.filter((s) => s.formId === f.id).length
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
                    <span
                      className="block w-12 rounded-full py-1 text-center text-[10px] font-bold"
                      style={{ background: f.settings.theme.button, color: f.settings.theme.buttonText }}
                    >
                      OPEN
                    </span>
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
                          deleteForm(f.id)
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
    </div>
  )
}