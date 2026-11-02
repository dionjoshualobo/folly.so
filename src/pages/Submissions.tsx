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
    return <div className="flex min-h-screen items-center justify-center font-mono text-sm font-bold">LOADING INTAKE ENGINE…</div>
  }

  if (!form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fffdfa] p-6 text-center">
        <LogoMark className="h-12 w-12" />
        <h2 className="text-2xl font-black uppercase">Form Not Found</h2>
        <Link to="/forms" className="border-2 border-black bg-[#ffe600] px-6 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000]">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  const questions = form.blocks.filter((b) => !['heading', 'heading2', 'heading3', 'label', 'paragraph', 'image', 'pageBreak', 'thankYou', 'divider'].includes(b.type))

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

    const formatCell = (raw: string) => {
      // Respondent input starting with = + - @ (or tab/CR) would run as a
      // formula in Excel/Sheets; a leading apostrophe forces plain text.
      const val = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
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

    // BOM so Excel detects UTF-8 instead of mangling accents and emoji.
    const blob = new Blob([String.fromCharCode(0xfeff) + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `folly_submissions_${form.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    { label: 'TOTAL RESPONSES', value: String(submissions.length), color: '#ffe600' },
    ...(ratingAvg ? [{ label: 'AVERAGE RATING', value: `★ ${ratingAvg}`, color: '#ff90e8' }] : []),
    ...(npsAvg ? [{ label: 'NPS SCORE', value: `${npsAvg} / 10`, color: '#5ce1e6' }] : []),
    ...(scoreAvg ? [{ label: 'AVERAGE SCORE', value: String(scoreAvg), color: '#00ef84' }] : []),
    { label: 'QUESTIONS INTAKE', value: String(questions.length), color: '#fafafa' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa] text-black">
      {/* Top Banner */}
      <div className="bg-[#ffe600] text-black font-black uppercase text-xs py-1.5 px-6 border-b-2 border-black flex justify-between items-center tracking-wider font-mono">
        <span>★ RESPONSES & TELEMETRY // {form.settings.title || 'UNTITLED FORM'} ★</span>
        <span>STATUS: LIVE</span>
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-black bg-white px-6 py-3.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/editor/${form.id}`}
              className="border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_#000] hover:bg-[#ffe600] transition"
              title="Back to editor"
            >
              <Icon name="back" className="h-4 w-4" />
            </Link>
            <span className="truncate font-black uppercase text-sm sm:text-base">
              {form.settings.title || 'Untitled form'} <span className="text-neutral-500 font-mono text-xs">/ RESPONSES</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {submissions.length > 0 && (
              <>
                <button
                  onClick={exportToCSV}
                  className="border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-[#ffe600] transition flex items-center gap-1.5"
                  title="Download CSV"
                >
                  <Icon name="download" className="h-3.5 w-3.5" />
                  CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-[#5ce1e6] transition flex items-center gap-1.5"
                  title="Download JSON"
                >
                  <Icon name="download" className="h-3.5 w-3.5" />
                  JSON
                </button>
              </>
            )}
            <Link
              to={`/r/${form.id}`}
              target="_blank"
              className="border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-neutral-100 transition hidden sm:inline-block"
            >
              Live form ↗
            </Link>
            <Link
              to={`/editor/${form.id}`}
              className="border-2 border-black bg-[#ffe600] text-black px-4 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:bg-[#facc15] transition"
            >
              Edit form →
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div
                className="inline-block border border-black font-mono text-[10px] font-black uppercase px-2 py-0.5 w-fit shadow-[1px_1px_0px_#000]"
                style={{ backgroundColor: s.color }}
              >
                {s.label}
              </div>
              <div className="text-3xl font-black mt-3">{s.value}</div>
            </div>
          ))}
        </div>

        {submissions.length === 0 ? (
          <div className="mt-16 border-2 border-dashed border-black bg-white p-12 text-center shadow-[6px_6px_0px_#000] max-w-lg mx-auto">
            <span className="text-3xl block mb-3">📡</span>
            <h2 className="text-xl font-black uppercase">Waiting for first response</h2>
            <p className="mt-2 text-xs font-bold text-neutral-600 max-w-sm mx-auto">
              Share your live form link with respondents, or submit a test response yourself to see it stream here in real time.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to={`/r/${form.id}`}
                target="_blank"
                className="border-2 border-black bg-[#ffe600] text-black px-6 py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:bg-[#facc15] transition"
              >
                Open live form ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 border-2 border-black bg-white shadow-[6px_6px_0px_#000] overflow-hidden">
            {/* Table Window Header */}
            <div className="border-b-2 border-black bg-black text-white px-4 py-2 flex justify-between items-center font-mono text-xs font-bold">
              <span>RESPONSES_LOG.CSV // {submissions.length} ROWS</span>
              <span>[ REALTIME SYNC ]</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#fafafa] border-b-2 border-black font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 border-r-2 border-black whitespace-nowrap">DATE</th>
                    <th className="px-4 py-3 border-r-2 border-black whitespace-nowrap">ID</th>
                    {questions.map((q) => (
                      <th key={q.id} className="px-4 py-3 border-r-2 border-black whitespace-nowrap max-w-xs truncate" title={getQuestionLabel(q)}>
                        {getQuestionLabel(q)}
                      </th>
                    ))}
                    {(form.settings.hiddenFields ?? []).map((field) => (
                      <th key={field} className="px-4 py-3 border-r-2 border-black whitespace-nowrap text-[#ff5a27]">
                        {field} (HIDDEN)
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 border-black divide-black">
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSubmission(s)}
                      className="cursor-pointer hover:bg-[#ffe600]/25 transition"
                    >
                      <td className="px-4 py-3 border-r-2 border-black whitespace-nowrap font-bold">{formatWhen(s.submittedAt)}</td>
                      <td className="px-4 py-3 border-r-2 border-black whitespace-nowrap text-neutral-500 font-bold">{s.id.slice(0, 8)}</td>
                      {questions.map((q) => {
                        const value = s.answers[q.id] as AnswerValue | undefined
                        const hasValue =
                          value !== undefined &&
                          value !== null &&
                          value !== '' &&
                          !(Array.isArray(value) && value.length === 0)
                        return (
                          <td key={q.id} className={`px-4 py-3 border-r-2 border-black max-w-sm truncate ${hasValue ? 'font-bold text-black' : 'italic text-neutral-400'}`}>
                            {hasValue ? formatAnswer(value) : '—'}
                          </td>
                        )
                      })}
                      {(form.settings.hiddenFields ?? []).map((field) => {
                        const value = s.answers[field] as AnswerValue | undefined
                        const hasValue = value !== undefined && value !== null && value !== ''
                        return (
                          <td key={field} className="px-4 py-3 border-r-2 border-black max-w-sm truncate font-bold text-[#ff5a27]">
                            {hasValue ? formatAnswer(value) : '—'}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-right font-black uppercase text-xs underline">
                        INSPECT →
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col border-3 border-black bg-white shadow-[12px_12px_0px_#000] overflow-hidden">
        {/* Retro Window Header */}
        <div className="border-b-2 border-black bg-[#ffe600] px-4 py-3 flex items-center justify-between font-mono text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400 border border-black" />
            <span className="h-3 w-3 rounded-full bg-yellow-400 border border-black" />
            <span className="h-3 w-3 rounded-full bg-green-400 border border-black" />
            <span className="ml-2 font-black">RESPONSE_{submission.id.slice(0, 8)}.TXT</span>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-2 py-0.5 text-xs font-black hover:bg-red-500"
          >
            [ X ]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fffdfa]">
          <div className="border-2 border-black bg-white p-3 font-mono text-xs font-bold shadow-[2px_2px_0px_#000]">
            FORM: <span className="uppercase text-black font-black">{formTitle || 'UNTITLED'}</span> · TIMESTAMP: {new Date(submission.submittedAt).toLocaleString()}
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const val = submission.answers[q.id]
              const hasVal = val !== undefined && val !== null && val !== ''
              return (
                <div key={q.id} className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                  <div className="font-mono text-[11px] font-black uppercase text-neutral-600 mb-1">
                    {getQuestionLabel(q)}
                  </div>
                  <div className={`text-sm ${hasVal ? 'font-bold text-black' : 'italic text-neutral-400'}`}>
                    {hasVal ? formatAnswer(val) : 'No answer provided'}
                  </div>
                </div>
              )
            })}

            {hiddenFields.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="font-mono text-xs font-black uppercase text-[#ff5a27] mb-2">HIDDEN URL PARAMS</div>
                <div className="grid grid-cols-2 gap-2">
                  {hiddenFields.map((h) => (
                    <div key={h} className="border-2 border-black bg-[#ff5a27]/10 p-3 shadow-[2px_2px_0px_#000]">
                      <div className="font-mono text-[10px] font-black uppercase text-[#ff5a27]">{h}</div>
                      <div className="font-bold text-sm text-black">{String(submission.answers[h] ?? '—')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t-2 border-black px-6 py-3.5 bg-neutral-50 font-mono text-xs">
          <button
            onClick={onDelete}
            className="border-2 border-black bg-white text-red-600 font-black uppercase px-3 py-1.5 shadow-[2px_2px_0px_#000] hover:bg-red-500 hover:text-white transition"
          >
            Delete response 🗑
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="border-2 border-black bg-[#5ce1e6] text-black font-black uppercase px-3.5 py-1.5 shadow-[2px_2px_0px_#000] hover:bg-[#ffe600] active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              Print / PDF 🖨
            </button>
            <button
              onClick={onClose}
              className="border-2 border-black bg-black text-white font-black uppercase px-5 py-1.5 shadow-[2px_2px_0px_#ffe600] hover:bg-[#ffe600] hover:text-black transition"
            >
              Close window
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
