import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AnswerValue, Block, Form } from '../types'
import { useForms } from '../store'
import { blockVisible, computeScore, formatWhen, getQuestionLabel, pipeText, splitIntoPages } from '../lib/logic'
import { rowLayout } from '../lib/layout'
import { embedInfo } from '../lib/embed'
import { FieldControl, getDefaultValue, isFilled } from '../components/fields'
import { RichText } from '../components/richtext'
import { LogoMark, themeFont } from '../components/ui'

const NON_ANSWER_TYPES = ['heading', 'heading2', 'heading3', 'label', 'paragraph', 'image', 'divider', 'embed', 'pageBreak', 'thankYou']

function notFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <LogoMark className="h-10 w-10" />
      <h1 className="text-2xl font-bold text-ink">This form is unavailable</h1>
      <p className="max-w-sm text-[15px] text-ink/50">
        It may have been deleted, or the link is missing a few characters.
      </p>
      <Link to="/" className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to Folly
      </Link>
    </div>
  )
}

function BlockView({
  form,
  block,
  answers,
  errors,
  onChange,
}: {
  form: Form
  block: Block
  answers: Record<string, AnswerValue>
  errors: Record<string, string>
  onChange: (blockId: string, v: AnswerValue) => void
}) {
  if (block.type === 'heading' || block.type === 'heading2' || block.type === 'heading3' || block.type === 'label') {
    const cls =
      block.type === 'label'
        ? 'text-[13px] font-bold uppercase tracking-wide opacity-60'
        : block.type === 'heading3'
          ? 'text-[19px] font-semibold leading-snug'
          : block.type === 'heading2'
            ? 'text-[24px] font-semibold leading-snug'
            : ''
    return (
      <div className={`py-1 ${cls}`}>
        <RichText
          text={pipeText(block.text, answers, form.blocks, form.settings.hiddenFields)}
        />
      </div>
    )
  }
  if (block.type === 'divider') {
    return <hr className="my-2 h-px w-full border-0 bg-current opacity-15" />
  }
  if (block.type === 'embed') {
    const info = embedInfo(block.embedUrl)
    if (!info) return null
    return (
      <div className="py-1">
        <div className="aspect-video w-full max-w-xl overflow-hidden rounded-2xl border border-black/10">
          <iframe src={info.src} title={block.text || info.provider} className="h-full w-full" allowFullScreen />
        </div>
        {block.text && <p className="mt-2 text-[13px] opacity-60">{block.text}</p>}
      </div>
    )
  }
  if (block.type === 'paragraph') {
    return (
      <p className="text-[18px] leading-relaxed">
        <RichText text={pipeText(block.text, answers, form.blocks, form.settings.hiddenFields)} />
      </p>
    )
  }
  if (block.type === 'image') {
    return (
      <div className="py-1">
        {block.imageUrl ? (
          <div>
            <img src={block.imageUrl} alt={block.text || 'image'} className="max-h-[340px] w-fit rounded-2xl border border-black/5" />
            {block.imageCaption && <p className="mt-2 text-[13px] italic">{block.imageCaption}</p>}
          </div>
        ) : (
          <div className="flex h-28 w-full max-w-md items-center justify-center rounded-2xl border border-dashed border-black/20 text-sm">
            Image
          </div>
        )}
      </div>
    )
  }
  if (block.type === 'pageBreak') return null
  if (block.type === 'thankYou') return null

  const questionStyle = block.type === 'longText' ? 'text-[20px]' : 'text-[19px]'
  const visibleIndex = (() => {
    let n = -1
    for (const b of form.blocks) {
      const isQ = !NON_ANSWER_TYPES.includes(b.type)
      if (!isQ || !blockVisible(b, answers)) continue
      n += 1
      if (b.id === block.id) return n
    }
    return n
  })()
  return (
    <div className="tally-question py-1">
      <label className={`mb-2.5 block font-medium leading-snug ${questionStyle}`}>
        <span className="mr-1.5 inline-block text-[14px] font-normal text-ink/35 align-1">
          {form.settings.showProgress ? `${visibleIndex + 1}.` : ''}
        </span>
        <RichText text={pipeText(block.text || getQuestionLabel(block), answers, form.blocks, form.settings.hiddenFields)} />
        {block.required && <span className="ml-1 text-brand-500">*</span>}
      </label>
      <div onClick={(e) => e.stopPropagation()}>
        <FieldControl
          block={block}
          value={block.type === 'score' ? computeScore(block, answers, form.blocks) : (answers[block.id] ?? getDefaultValue(block))}
          onChange={(v) => onChange(block.id, v)}
        />
      </div>
      {errors[block.id] && <p className="mt-1.5 text-[13px] font-medium text-brand-600">{errors[block.id]}</p>}
    </div>
  )
}

function getUrlQueryParams(): Record<string, string> {
  const params: Record<string, string> = {}
  try {
    const fullSearch = window.location.search
    const hashParts = window.location.hash.split('?')
    const hashSearch = hashParts[1]
    const searchParams = new URLSearchParams(fullSearch || '')
    searchParams.forEach((val, key) => {
      params[key] = val
    })
    if (hashSearch) {
      const hashParams = new URLSearchParams(`?${hashSearch}`)
      hashParams.forEach((val, key) => {
        params[key] = val
      })
    }
  } catch (err) {
    console.error('Error parsing query params:', err)
  }
  return params
}

export default function PublicForm() {
  const { formId = '' } = useParams()
  const form = useForms((s) => s.forms.find((f) => f.id === formId))
  const addSubmission = useForms((s) => s.addSubmission)
  const ensureForm = useForms((s) => s.ensureForm)

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [visited, setVisited] = useState(false)
  const [formFailed, setFormFailed] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    if (!form) {
      setFormFailed(false)
      ensureForm(formId).then((ok) => {
        if (mounted) setFormFailed(!ok)
      })
    } else {
      setFormFailed(false)
    }
    return () => {
      mounted = false
    }
  }, [formId, form, ensureForm])

  const pages = useMemo(() => (form ? splitIntoPages(form.blocks, answers) : []), [form, answers])
  const safePage = Math.min(currentPage, Math.max(0, pages.length - 1))
  const visibleHere = pages[safePage] ?? []

  useEffect(() => {
    setVisited(true)
  }, [])

  useEffect(() => {
    const qParams = getUrlQueryParams()
    const initialAnswers: Record<string, AnswerValue> = {}
    if (form?.settings.hiddenFields) {
      for (const field of form.settings.hiddenFields) {
        if (qParams[field] !== undefined) {
          initialAnswers[field] = qParams[field]
        }
      }
    }
    setAnswers(initialAnswers)
    setErrors({})
    setCurrentPage(0)
    setSubmitted(false)
  }, [formId, form?.settings.hiddenFields])

  useEffect(() => {
    const css = form?.settings.customCss?.trim()
    if (!css) return
    const el = document.createElement('style')
    el.setAttribute('data-folly-custom-css', '')
    el.textContent = css
    document.head.appendChild(el)
    return () => {
      document.head.removeChild(el)
    }
  }, [form?.settings.customCss])

  if (formFailed) return notFound()

  if (!form) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink/40">Loading…</div>
  }

  const theme = form.settings.theme
  const font = themeFont(theme.font)
  const accent = theme.button
  const dark = theme.darkMode

  const pageCount = pages.length

  const changeAnswer = (blockId: string, v: AnswerValue) => {
    const next = { ...answers, [blockId]: v }
    setAnswers(next)
    setErrors((e) => ({ ...e, [blockId]: '' }))
  }

  const validateVisible = (scopePage?: number): boolean => {
    const errs: Record<string, string> = {}
    const scope =
      scopePage === undefined
        ? form.blocks
        : (pages[scopePage] ?? []).flatMap((b) => (b.type === 'pageBreak' ? [] : [b]))
    for (const block of scope) {
      if (block.type === 'thankYou') continue
      if (!blockVisible(block, answers)) continue
      if (!block.required) continue
      if (!isFilled(answers[block.id])) {
        errs[block.id] = 'Field is required'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => {
    if (!validateVisible(currentPage)) return
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentPage((p) => Math.min(p + 1, pageCount - 1))
  }

  const submit = () => {
    if (!validateVisible()) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const scorePatch: Record<string, number> = {}
    for (const b of form.blocks) {
      if (b.type !== 'score') continue
      const seen = new Set(b.scoreSourceIds ?? [])
      if (seen.has(b.id)) continue
      scorePatch[b.id] = computeScore(b, answers, form.blocks)
    }
    const collected: Record<string, AnswerValue> = { ...scorePatch }
    for (const b of form.blocks) {
      if (NON_ANSWER_TYPES.includes(b.type)) continue
      if (b.type === 'score') continue
      if (b.type !== 'fileUpload') {
        const v = answers[b.id]
        if (Array.isArray(v) && v.length === 0) collected[b.id] = null
        else collected[b.id] = v ?? null
      }
    }
    if (form.settings.hiddenFields) {
      for (const field of form.settings.hiddenFields) {
        const v = answers[field]
        if (v !== undefined && v !== null) {
          collected[field] = v
        }
      }
    }
    addSubmission(form.id, collected)
    setAnswers((a) => ({ ...a, ...scorePatch }))

    // Redirect logic:
    if (form.settings.thankYouRedirectUrl && form.settings.thankYouRedirectUrl.trim() !== '') {
      const redirectUrl = sanitizeUrl(form.settings.thankYouRedirectUrl)
      if (redirectUrl) {
        window.location.replace(redirectUrl)
        return
      }
    }

    // keep file names off the persisted summary to keep localStorage tidy
    setSubmitted(true)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (submitted) {
    const ctaText = form.settings.thankYouButtonText?.trim()
    const ctaUrl = form.settings.thankYouButtonUrl?.trim()

    return (
      <div
        className="tally-app flex min-h-screen flex-col"
        style={{ background: theme.background, fontFamily: font, color: dark ? '#f5f5f5' : '#0b0f19' }}
      >
        {form.settings.coverImageUrl && (
          <div className="w-full h-[180px] sm:h-[260px] overflow-hidden relative">
            <img src={form.settings.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-16 pt-12 text-center">
          <div className="my-auto flex w-full flex-col items-center">
          {form.settings.logoUrl && (
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 shadow-sm ${
                form.settings.coverImageUrl ? '-mt-22 sm:-mt-24 mb-8 z-10 relative' : 'mb-8'
              }`}
              style={{ borderColor: theme.background }}
            >
              <img src={form.settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="w-full max-w-xl animate-pop flex flex-col items-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: theme.button, color: theme.buttonText }}
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8">
                <path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
              {pipeText(form.settings.thankYouMessage, answers, form.blocks, form.settings.hiddenFields)}
            </h1>
            {visited && <p className="mt-3 text-[14px] opacity-50">Response recorded</p>}
            {ctaText && ctaUrl && (
              <div className="mt-8">
                <a
                  href={sanitizeUrl(ctaUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full px-6 py-3 text-[14px] font-bold shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{ background: theme.button, color: theme.buttonText }}
                >
                  {ctaText}
                </a>
              </div>
            )}
          </div>
          {form.settings.poweredBy && <PoweredBy dark={dark} font={font} />}
          </div>
        </main>
      </div>
    )
  }

  const progress = (pageCount > 1 ? (safePage + 1) / pageCount : 1) * 100

  return (
    <div ref={topRef} className="tally-app flex min-h-screen flex-col" style={{ background: theme.background, fontFamily: font, color: dark ? '#f5f5f5' : '#0b0f19' }}>
      <div className="h-1 w-full" style={{ background: 'transparent' }}>
        <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: theme.button }} />
      </div>

      {form.settings.coverImageUrl && (
        <div className="w-full h-[180px] sm:h-[260px] overflow-hidden relative">
          <img src={form.settings.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-end px-6 text-[13px]" style={{ opacity: 0.5 }}>
          {safePage + 1} / {pageCount}
        </div>
      )}

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-16 pt-10">
        <div className="my-auto w-full">
          {form.settings.logoUrl && (
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 shadow-sm ${
                form.settings.coverImageUrl ? '-mt-20 sm:-mt-22 mb-6 z-10 relative' : 'mb-6'
              }`}
              style={{ borderColor: theme.background }}
            >
              <img src={form.settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="tally-form-title mb-10">
          <div className="text-[38px] font-semibold leading-[1.15] tracking-tight sm:text-[44px]" style={{ color: dark ? '#fff' : '#1c1c1e' }}>
            <RichText text={pipeText(form.settings.title, answers, form.blocks, form.settings.hiddenFields)} />
          </div>
          {form.settings.description && (
            <p className="mt-3 text-[17px] leading-relaxed" style={{ opacity: 0.6 }}>
              <RichText text={pipeText(form.settings.description, answers, form.blocks, form.settings.hiddenFields)} />
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (safePage < pageCount - 1) goNext()
            else submit()
          }}
          className="tally-form space-y-8"
        >
          {rowLayout(visibleHere).map((row) => {
            const n = row.blocks.length
            const rendered = row.blocks.map((block) => (
              <div key={block.id} className="tally-block">
                <BlockView
                  form={form}
                  block={block}
                  answers={answers}
                  errors={errors}
                  onChange={changeAnswer}
                />
              </div>
            ))
            if (n === 1) return rendered[0]
            return (
              <div key={row.key} className="col-split gap-x-8 gap-y-7" style={{ ['--cols' as never]: n }}>
                {rendered}
              </div>
            )
          })}

          <div className="flex items-center justify-between pt-2">
            {safePage > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="rounded-full px-5 py-3 text-[15px] font-medium transition"
                style={{ color: dark ? '#f5f5f5' : '#3a3a3c' }}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="tally-submit-button rounded-full px-8 py-3.5 text-[15px] font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              style={{ background: accent, color: theme.buttonText }}
            >
              {safePage < pageCount - 1 ? 'Next' : 'Submit'}
            </button>
          </div>
        </form>
        </div>
      </main>

      {form.settings.poweredBy && <PoweredBy dark={dark} font={font} />}
    </div>
  )
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed
  }
  return `https://${trimmed}`
}

function PoweredBy({ dark, font }: { dark: boolean; font: string }) {
  return (
    <footer
      className="tally-footer flex w-full items-center justify-center gap-2 py-8 text-[13px]"
      style={{ opacity: 0.45, fontFamily: font }}
    >
      <LogoMark className="h-4 w-4" />
      <span style={{ color: dark ? '#fff' : '#0b0f19' }}>
        Powered by <span className="font-semibold">Folly</span>
      </span>
    </footer>
  )
}