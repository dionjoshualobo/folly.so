import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForms } from '../store'
import { formatAnswer, formatWhen, getQuestionLabel } from '../lib/logic'
import { Icon } from '../blockCatalog'
import { LogoMark } from '../components/ui'
import type { AnswerValue, Block, Submission } from '../types'

function average(nums: number[]): string | null {
  if (nums.length === 0) return null
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  return avg.toFixed(1)
}

export default function Submissions() {
  const { formId = '' } = useParams()
  const ready = useForms((s) => s.ready)
  const form = useForms((s) => s.forms.find((f) => f.id === formId))
  const allSubmissions = useForms((s) => s.submissions)
  const deleteSubmission = useForms((s) => s.deleteSubmission)
  const submissions = useMemo(() => allSubmissions.filter((x) => x.formId === formId), [allSubmissions, formId])

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/40">Loading…</div>
  }

  if (!form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white">
        <LogoMark className="h-10 w-10" />
        <p className="text-[15px] text-ink/50">Form not found.</p>
        <Link to="/forms" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Back to forms
        </Link>
      </div>
    )
  }

  const questions = form.blocks.filter((b) => !['heading', 'paragraph', 'image', 'pageBreak', 'thankYou'].includes(b.type))

  const ratingVals = (qid: string) =>
    submissions
      .map((s) => (typeof s.answers[qid] === 'number' ? (s.answers[qid] as number) : null))
      .filter((v): v is number => v !== null && v !== undefined)

  const ratingBlock = form.blocks.find((b) => b.type === 'rating')
  const npsBlock = form.blocks.find((b) => b.type === 'nps')
  const scoreBlock = form.blocks.find((b) => b.type === 'score')
  const ratingAvg = ratingBlock ? average(ratingVals(ratingBlock.id)) : null
  const npsAvg = npsBlock ? average(ratingVals(npsBlock.id)) : null
  const scoreAvg = scoreBlock ? average(ratingVals(scoreBlock.id)) : null

  const exportToCSV = () => {
    if (submissions.length === 0) return
    const hiddenFields = form.settings.hiddenFields ?? []
    const headers = ['Submission ID', 'Submitted At', ...questions.map(q => getQuestionLabel(q)), ...hiddenFields]
    const rows = submissions.map(s => [
      s.id,
      new Date(s.submittedAt).toISOString(),
      ...questions.map(q => {
        const val = s.answers[q.id]
        if (val === undefined || val === null) return ''
        if (Array.isArray(val)) {
          if (val.length > 0 && typeof val[0] !== 'string') {
            const sig = val as Array<{ points: unknown[] }>
            const n = sig.filter((s) => s.points.length > 1).length
            return `Signature (${n} stroke${n === 1 ? '' : 's'})`
          }
          return val.join('; ')
        }
        if (typeof val === 'object' && 'name' in val && 'size' in val) {
          const f = val as { name: string; size: number }
          return `${f.name} (${(f.size / 1024).toFixed(1)} KB)`
        }
        if (typeof val === 'object' && 'street' in val) {
          const a = val as { street?: string; apt?: string; city?: string; state?: string; zip?: string; country?: string }
          return [a.street, a.apt, a.city, a.state, a.zip, a.country].filter(Boolean).join(', ')
        }
        if (typeof val === 'object') {
          return Object.entries(val)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ')
        }
        return String(val)
      }),
      ...hiddenFields.map(field => {
        const val = s.answers[field]
        if (val === undefined || val === null) return ''
        return String(val)
      })
    ])

    const formatCell = (val: string) => {
      const clean = val.replace(/"/g, '""')
      if (clean.includes(',') || clean.includes('\n') || clean.includes('\r') || clean.includes('"')) {
        return `"${clean}"`
      }
      return clean
    }

    const csvContent = [
      headers.map(formatCell).join(','),
      ...rows.map(r => r.map(formatCell).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `folly_submissions_${form.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    if (submissions.length === 0) return
    const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `folly_submissions_${form.id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = [
    { label: 'Total responses', value: String(submissions.length) },
    ...(ratingAvg ? [{ label: 'Avg rating', value: `★ ${ratingAvg}` }] : []),
    ...(npsAvg ? [{ label: 'Avg NPS', value: `${npsAvg} / 10` }] : []),
    ...(scoreAvg ? [{ label: 'Avg score', value: String(scoreAvg) }] : []),
    { label: 'Questions', value: String(questions.length) },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafb]">
      <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/editor/${form.id}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink/50 transition hover:bg-ink/[0.05] hover:text-ink"
              title="Back to editor"
            >
              <Icon name="back" />
            </Link>
            <span className="truncate text-[14px] font-semibold text-ink/90">{form.settings.title} — Responses</span>
          </div>
          <div className="flex items-center gap-2">
            {submissions.length > 0 && (
              <>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 rounded-full border border-ink/12 px-3.5 py-1.5 text-[13px] font-semibold text-ink/60 transition hover:border-ink/30 hover:text-ink"
                  title="Download as CSV spreadsheet"
                >
                  <Icon name="download" className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-1.5 rounded-full border border-ink/12 px-3.5 py-1.5 text-[13px] font-semibold text-ink/60 transition hover:border-ink/30 hover:text-ink"
                  title="Download raw responses JSON"
                >
                  <Icon name="download" className="h-4 w-4" />
                  JSON
                </button>
              </>
            )}
            <Link
              to={`/r/${form.id}`}
              target="_blank"
              className="rounded-full border border-ink/12 px-3.5 py-1.5 text-[13px] font-semibold text-ink/60 transition hover:border-ink/30 hover:text-ink"
            >
              View live form
            </Link>
            <Link
              to={`/editor/${form.id}`}
              className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              Edit form
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
              <div className="text-[16px] font-bold text-ink">{s.value}</div>
              <div className="mt-0.5 text-[12px] font-medium text-ink/45">{s.label}</div>
            </div>
          ))}
        </div>

        {submissions.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/[0.05]">
              <Icon name="paragraph" className="flex h-6 w-6 items-center text-ink/40" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">Waiting for the first response</h2>
            <p className="mt-1 max-w-sm text-[14px] text-ink/45">
              Submit your form once via its shared link, or watch responses land here in real time.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-ink/10 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-ink/[0.02] border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-ink/50 whitespace-nowrap">Submitted At</th>
                    <th className="px-4 py-3 font-semibold text-ink/50 whitespace-nowrap">ID</th>
                    {questions.map((q) => (
                      <th key={q.id} className="px-4 py-3 font-semibold text-ink/80 whitespace-nowrap max-w-xs truncate" title={getQuestionLabel(q)}>
                        {getQuestionLabel(q)}
                      </th>
                    ))}
                    {(form.settings.hiddenFields ?? []).map((field) => (
                      <th key={field} className="px-4 py-3 font-semibold text-brand-600/70 whitespace-nowrap">
                        {field} <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50 px-1 py-0.5 rounded">Hidden</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-semibold text-ink/50 whitespace-nowrap" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.04]">
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSubmission(s)}
                      className="cursor-pointer hover:bg-ink/[0.03] transition"
                    >
                      <td className="px-4 py-3 text-ink/60 whitespace-nowrap">{formatWhen(s.submittedAt)}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink/40 whitespace-nowrap">{s.id.slice(0, 8)}</td>
                      {questions.map((q) => {
                        const value = s.answers[q.id] as AnswerValue | undefined
                        const hasValue =
                          value !== undefined &&
                          value !== null &&
                          value !== '' &&
                          !(Array.isArray(value) && value.length === 0)
                        return (
                          <td key={q.id} className={`px-4 py-3 max-w-sm truncate ${hasValue ? 'text-ink' : 'italic text-ink/35'}`} title={hasValue ? formatAnswer(value) : ''}>
                            {hasValue ? formatAnswer(value) : '—'}
                          </td>
                        )
                      })}
                      {(form.settings.hiddenFields ?? []).map((field) => {
                        const value = s.answers[field] as AnswerValue | undefined
                        const hasValue = value !== undefined && value !== null && value !== ''
                        return (
                          <td key={field} className={`px-4 py-3 max-w-sm truncate bg-brand-50/10 ${hasValue ? 'text-ink' : 'italic text-ink/35'}`} title={hasValue ? formatAnswer(value) : ''}>
                            {hasValue ? formatAnswer(value) : '—'}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-right text-ink/30 text-[12px]">
                        Inspect →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          formTitle={form.settings.title}
          questions={questions}
          hiddenFields={form.settings.hiddenFields ?? []}
          onClose={() => setSelectedSubmission(null)}
          onDelete={() => {
            if (window.confirm('Delete this submission permanently?')) {
              deleteSubmission(selectedSubmission.id)
              setSelectedSubmission(null)
            }
          }}
        />
      )}
    </div>
  )
}

function SubmissionDetailModal({
  submission,
  formTitle,
  questions,
  hiddenFields,
  onClose,
  onDelete,
}: {
  submission: Submission
  formTitle: string
  questions: Block[]
  hiddenFields: string[]
  onClose: () => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-pop relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/[0.08] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Response Details</h2>
            <p className="text-[12px] text-ink/45">
              Submitted {new Date(submission.submittedAt).toLocaleString()} · ID: <span className="font-mono">{submission.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/[0.05] hover:text-ink"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-2xl border border-ink/10 bg-[#fafafb] p-4 text-[13px] text-ink/60">
            Form: <span className="font-semibold text-ink">{formTitle}</span>
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const val = submission.answers[q.id]
              const hasVal = val !== undefined && val !== null && val !== ''
              return (
                <div key={q.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
                  <div className="text-[12px] font-bold text-ink/50 uppercase tracking-wider mb-1.5">
                    {getQuestionLabel(q)}
                  </div>
                  <div className={`text-[15px] leading-relaxed ${hasVal ? 'text-ink font-medium' : 'italic text-ink/35'}`}>
                    {hasVal ? formatAnswer(val) : 'No response provided'}
                  </div>
                </div>
              )
            })}

            {hiddenFields.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ink/[0.08]">
                <div className="text-[12px] font-bold uppercase tracking-wider text-brand-600 mb-2">Hidden URL Fields</div>
                <div className="grid grid-cols-2 gap-2">
                  {hiddenFields.map((h) => (
                    <div key={h} className="rounded-xl border border-brand-200 bg-brand-50/40 p-3">
                      <div className="text-[11px] font-bold text-brand-700">{h}</div>
                      <div className="text-[14px] text-ink">{String(submission.answers[h] ?? '—')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink/[0.08] px-6 py-3.5 bg-ink/[0.01]">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            <Icon name="trash" /> Delete response
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-ink px-5 py-2 text-[13px] font-bold text-white transition hover:bg-black"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}