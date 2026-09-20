import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo, LogoMark } from '../components/ui'
import { icons } from '../blockCatalog'
import { useForms } from '../store'

function Art({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      {children}
    </svg>
  )
}

const FACE_INK = '#0b0f19'

type HairStyle = 'cap' | 'bang' | 'twin' | 'tuft'

function PersonFace({ hair, skin, hairStyle }: { hair: string; skin: string; hairStyle: HairStyle }) {
  return (
    <svg viewBox="0 0 24 24" className="h-14 w-14 drop-shadow-md sm:h-16 sm:w-16" aria-hidden>
      <circle cx="12" cy="13.4" r="9" fill={skin} />
      <path d="M3.4 9.8a8.6 8.6 0 0 1 17.2 0c0 1.3-1.1 2.4-2.4 2.4H5.8c-1.3 0-2.4-1.1-2.4-2.4Z" fill={hair} />
      {hairStyle === 'bang' && (
        <>
          <circle cx="7.6" cy="14.6" r="1.7" fill={skin} />
          <circle cx="10.6" cy="15.5" r="1.7" fill={skin} />
          <circle cx="13.6" cy="15.5" r="1.7" fill={skin} />
          <circle cx="16.5" cy="14.5" r="1.7" fill={skin} />
        </>
      )}
      {hairStyle === 'twin' && (
        <>
          <circle cx="7.5" cy="3.2" r="1.8" fill={hair} />
          <circle cx="16.5" cy="3.2" r="1.8" fill={hair} />
        </>
      )}
      {hairStyle === 'tuft' && (
        <path d="M10.6 4.6c.8-1.5 2.4-1.7 3.1-.6.5 1 .1 2-.6 2.4" fill="none" stroke={hair} strokeWidth="2.2" strokeLinecap="round" />
      )}
      <path d="M8.3 14.3h.02M15.7 14.3h.02" stroke={FACE_INK} strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d="M9.8 17.3c1.3.9 3.1.9 4.4 0" stroke={FACE_INK} strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Face({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={`pointer-events-none absolute select-none transition-transform duration-300 ease-out ${className ?? ''}`}
      style={style}
      aria-hidden
    >
      {children}
    </span>
  )
}

export interface PreviewTheme {
  label: string
  background: string
  accent: string
  buttonText: string
  font: 'system' | 'serif' | 'playful'
  darkMode: boolean
}

export const THEME_PRESETS: PreviewTheme[] = [
  { label: 'Clean', background: '#ffffff', accent: '#0b0f19', buttonText: '#ffffff', font: 'system', darkMode: false },
  { label: 'Midnight', background: '#0b0f19', accent: '#ff5470', buttonText: '#ffffff', font: 'system', darkMode: true },
  { label: 'Paper', background: '#fdf6ef', accent: '#1a7f5a', buttonText: '#ffffff', font: 'serif', darkMode: false },
]

const NAV = [
  { label: 'Pricing', href: '#' },
  { label: 'Templates', href: '#' },
  { label: 'Integrations', href: '#' },
  { label: 'Help', href: '#' },
]

const COMPANIES = ['Acme', 'Notionette', 'Kite', 'Rakutenly', 'Glover', 'Brush&Co']

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.08 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}

const FAQ = [
  {
    q: 'Is Folly really free?',
    a: 'Yes. Born out of frustration with pay-per-response form builders, Folly offers unlimited forms and unlimited submissions for free, forever. Upgrade only if you want to remove branding or use custom CSS.',
  },
  {
    q: 'Why does it work like a text document?',
    a: 'Because form building should feel like writing, not wiring together widgets. Click into any block and keep typing. Hit / to insert any question type — same model as Notion.',
  },
  {
    q: 'Can I make forms adapt to the respondent?',
    a: 'Yes. Conditional logic lets you show or hide questions based on earlier answers, split forms into multiple pages, and calculate values with formulas.',
  },
  {
    q: 'What happens to my data?',
    a: 'It lives entirely in your browser. There is no tracking, no cookies, and nothing leaves your machine unless you share a form link. GDPR-friendly by construction.',
  },
]

function Hero() {
  const go = () => {
    useForms.getState().createForm()
    window.location.hash = '#/forms'
  }

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const x = (clientX - window.innerWidth / 2) / 25
    const y = (clientY - window.innerHeight / 2) / 25
    setMouseOffset({ x, y })
  }

  return (
    <section className="relative overflow-hidden" onMouseMove={handleMouseMove}>
      <div className="dot-bg absolute inset-0 -z-10 opacity-60 animate-fade" />
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <Face className="left-[8%] top-24 hidden md:block" style={{ transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px) rotate(-8deg)` }}>
          <PersonFace hair="#0b0f19" skin="#ffe5cf" hairStyle="cap" />
        </Face>
        <Face className="right-[10%] top-40 hidden md:block" style={{ transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px) rotate(10deg)` }}>
          <PersonFace hair="#f43f5e" skin="#ffdbc4" hairStyle="bang" />
        </Face>
        <Face className="left-[16%] top-[70%] hidden md:block" style={{ transform: `translate(${mouseOffset.x * -0.4}px, ${mouseOffset.y * -0.4}px) rotate(6deg)` }}>
          <PersonFace hair="#be123c" skin="#fad1b6" hairStyle="twin" />
        </Face>
        <Face className="right-[14%] top-[64%] hidden md:block" style={{ transform: `translate(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px) rotate(-6deg)` }}>
          <PersonFace hair="#f59e0b" skin="#ffe7d0" hairStyle="tuft" />
        </Face>

        <a
          href="#/"
          onClick={go}
          className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-4 py-1.5 text-sm font-medium text-ink/70 shadow-sm transition hover:border-brand-300 hover:text-ink"
        >
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          Try it now — no signup required
          <span className="transition group-hover:translate-x-0.5">→</span>
        </a>

        <h1 className="mt-7 text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-7xl">
          The simplest way to
          <br />
          create <span className="highlight italic">beautiful</span> forms
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
          Say goodbye to boring forms. Folly is the free, intuitive form builder you’ve been looking for
          — type your questions like you would in a doc.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={go}
            className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 hover:bg-black"
          >
            Create a free form
          </button>
          <Link
            to="/forms"
            className="rounded-full border border-ink/15 bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition hover:border-ink/30"
          >
            Browse the builder
          </Link>
        </div>
        <p className="mt-3 text-sm text-ink/40">No account needed · Unlimited forms &amp; submissions</p>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-ink/35">
          <span className="text-[13px] font-semibold uppercase tracking-widest">
            Powering <span className="font-bold text-ink/60">500,000+</span> teams
          </span>
          {COMPANIES.map((c) => (
            <span key={c} className="text-lg font-bold tracking-tight opacity-75">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function MiniEditor({ theme }: { theme: PreviewTheme }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [searchText, setSearchText] = useState('')

  const fontStyle =
    theme.font === 'serif'
      ? "'Fraunces', Georgia, serif"
      : theme.font === 'playful'
      ? "'Space Grotesk', monospace"
      : "'Inter', sans-serif"

  const textCol = theme.darkMode ? '#f3f4f6' : '#0b0f19'
  const subTextCol = theme.darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,15,25,0.45)'
  const borderCol = theme.darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(11,15,25,0.08)'

  if (submitted) {
    return (
      <div
        className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border shadow-pop transition-all duration-300"
        style={{ background: theme.background, color: textCol, borderColor: borderCol, fontFamily: fontStyle }}
      >
        <div className="flex items-center gap-2 border-b px-5 py-3.5" style={{ borderColor: borderCol }}>
          <span className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-300" />
          <span className="ml-3 rounded-md bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 text-xs font-semibold" style={{ color: subTextCol }}>
            Live preview
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center animate-pop">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 shadow-md"
            style={{ background: theme.accent, color: theme.buttonText }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h3 className="mt-5 text-xl font-bold leading-tight">Thank you!</h3>
          <p className="mt-1.5 text-[14px]" style={{ color: subTextCol }}>
            Response recorded in simulator
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setSelectedOption(null)
              setSearchText('')
            }}
            className="mt-6 text-[12px] font-bold transition hover:opacity-85"
            style={{ color: theme.accent }}
          >
            ← Fill again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border shadow-pop transition-all duration-300"
      style={{ background: theme.background, color: textCol, borderColor: borderCol, fontFamily: fontStyle }}
    >
      <div className="flex items-center gap-2 border-b px-5 py-3.5" style={{ borderColor: borderCol }}>
        <span className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-300" />
        <span className="ml-3 rounded-md bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 text-xs font-semibold" style={{ color: subTextCol }}>
          Live preview
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
        }}
        className="space-y-4 px-6 py-6"
      >
        <div className="text-[20px] font-bold leading-snug">
          How did you hear about us?
        </div>
        <div className="space-y-2">
          {['Word of mouth', 'Google search', 'Social media', 'Read a blog post'].map((o) => {
            const isSelected = selectedOption === o
            return (
              <button
                key={o}
                type="button"
                onClick={() => setSelectedOption(o)}
                className="flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[14px] transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                style={{
                  borderColor: isSelected ? theme.accent : borderCol,
                  background: isSelected ? `${theme.accent}12` : 'transparent',
                }}
              >
                <span
                  className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition"
                  style={{ borderColor: isSelected ? theme.accent : borderCol }}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />}
                </span>
                <span className="font-semibold text-[14px]" style={{ color: isSelected ? textCol : subTextCol }}>
                  {o}
                </span>
              </button>
            )
          })}
        </div>

        {selectedOption === 'Google search' && (
          <div className="space-y-1.5 pt-1.5 animate-pop">
            <label className="block text-[13px] font-bold" style={{ color: subTextCol }}>
              What search term did you use?
            </label>
            <input
              type="text"
              required
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="e.g. clean form builder"
              className="w-full rounded-xl border bg-transparent px-3.5 py-2 text-[14px] outline-none transition"
              style={{ borderColor: borderCol, color: textCol }}
            />
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[12px] italic opacity-40">“Type / for any block”</span>
          <button
            type="submit"
            className="rounded-full px-5 py-2 text-[13px] font-bold shadow-md transition hover:-translate-y-0.5"
            style={{ background: theme.accent, color: theme.buttonText }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

function Features({ theme }: { theme: PreviewTheme }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <ScrollReveal>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">A form builder like no other</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Fill it out the way you <span className="highlight italic">think</span>
          </h2>
          <p className="mt-4 text-lg text-ink/55">
            Folly makes it simple for anyone to build free online forms. No code needed — just type your
            questions like you would in a doc, and hit <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-sm">/</code> to insert any question type.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-center rounded-3xl border border-ink/10 bg-ink/[0.02] p-8">
          <h3 className="text-3xl font-bold tracking-tight text-ink">Nothing to learn.</h3>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink/55">
            The editor works like Notion. Enter to drop a new question, <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[13px]">/</code> for the
            block picker, <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[13px]">⋮⋮</code> to drag, reorder and configure each block.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Drag & reorder', 'Inline editing', 'Slash commands', 'Format shortcuts'].map((t) => (
              <span key={t} className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[13px] font-medium text-ink/70">
                {t}
              </span>
            ))}
          </div>
        </div>
        <MiniEditor theme={theme} />
      </ScrollReveal>
    </section>
  )
}

const INPUT_TYPES = [
  { icon: 'shortText', label: 'Short text' },
  { icon: 'longText', label: 'Long text' },
  { icon: 'email', label: 'Email' },
  { icon: 'number', label: 'Numbers' },
  { icon: 'multipleChoice', label: 'Multiple choice' },
  { icon: 'checkbox', label: 'Checkbox' },
  { icon: 'dropdown', label: 'Dropdown' },
  { icon: 'rating', label: 'Rating' },
  { icon: 'signature', label: 'Signature' },
  { icon: 'date', label: 'Date & time' },
  { icon: 'link', label: 'Links' },
  { icon: 'fileUpload', label: 'File upload' },
  { icon: 'matrix', label: 'Matrix' },
  { icon: 'nps', label: 'NPS score' },
  { icon: 'payments', label: 'Payments' },
  { icon: 'embed', label: 'Embed video' },
]

function InputTypes() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">Simple but powerful</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Build any form <span className="highlight italic">in seconds</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/55">
            From contact info to payments, signatures and file uploads — collect any kind of data with a
            wide range of free input blocks. Everything from surveys to quizzes to lead generation forms.
          </p>
          <Link
            to="/forms"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black"
          >
            Start building <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INPUT_TYPES.map((t) => (
            <div
              key={t.label}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-ink/10 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/[0.04] text-ink transition group-hover:bg-brand-50 group-hover:text-brand-600">
                <span className="[&_svg]:h-[22px] [&_svg]:w-[22px]">{icons[t.icon]}</span>
              </span>
              <span className="text-[12px] font-medium leading-tight text-ink/60">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const SMART = [
  {
    icon: (
      <Art>
        <circle cx="12" cy="4.5" r="2" />
        <circle cx="5" cy="19.5" r="2" />
        <circle cx="19" cy="19.5" r="2" />
        <path d="M12 6.5v1a3 3 0 0 1-3 3H7a3 3 0 0 0-3 3v2" />
        <path d="M12 6.5v1a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3v2" />
      </Art>
    ),
    title: 'Conditional logic',
    desc: 'Build dynamic forms that adapt to answers — show, hide and skip questions based on prior input.',
  },
  {
    icon: (
      <Art>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 7.5h8" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" />
      </Art>
    ),
    title: 'Calculator',
    desc: 'Use variables to create dynamic content, scores and prices. Compute values as respondents type.',
  },
  {
    icon: (
      <Art>
        <path d="M3 12.5s3.1-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3.1 5.5-8.5 5.5-8.5-5.5-8.5-5.5Z" />
        <circle cx="11.5" cy="12.5" r="2.6" />
        <path d="M19.5 5.5 16.5 8.5M19.5 5.5H16V8" />
      </Art>
    ),
    title: 'Hidden fields',
    desc: 'Pass data through your form URL. Pre-fill fields and pipe answers into later questions.',
  },
  {
    icon: (
      <Art>
        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
        <path d="m4 12 8 4.5 8-4.5" />
        <path d="m4 16.5 8 4.5 8-4.5" />
      </Art>
    ),
    title: 'Multi-page forms',
    desc: 'Split long surveys into pages with a gentle progress bar. One tap per section.',
  },
]

function Smart() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-400">Craft intelligent forms</p>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Forms that think <span className="italic text-brand-400">ahead</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SMART.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400/15 text-brand-300 transition group-hover:bg-brand-400/25 group-hover:text-brand-200 [&_svg]:h-6 [&_svg]:w-6">
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Themes({
  activeTheme,
  onChange,
}: {
  activeTheme: PreviewTheme
  onChange: (t: PreviewTheme) => void
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <ScrollReveal className="grid items-center gap-14 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-3 gap-4">
            {THEME_PRESETS.map((t) => {
              const isSelected = activeTheme.label === t.label
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => onChange(t)}
                  className={`overflow-hidden text-left rounded-2xl border transition-all duration-300 ${
                    isSelected ? 'border-ink ring-4 ring-ink/5 shadow-md -translate-y-1' : 'border-ink/10 hover:border-ink/20 hover:scale-102'
                  }`}
                >
                  <div className="p-4" style={{ background: t.background }}>
                    <div className="h-2 w-2/3 rounded-full" style={{ background: t.accent }} />
                    <div className="mt-2 h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-2 h-1.5 w-4/5 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-3 flex justify-end">
                      <span className="h-5 w-9 rounded-full text-[8px] font-bold leading-5 text-center" style={{ background: t.accent, color: t.buttonText }}>
                        OK
                      </span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border-t border-ink/5 px-4 py-2.5 text-[12px] font-bold text-ink/70">
                    {t.label} {isSelected && '✓'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">Make forms uniquely yours</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Pick a theme, or craft <span className="highlight italic">your own</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/55">
            Choose a background, a button color, and a typeface. Add a logo, cover image or embedded video.
            Column layouts, custom fonts and even full custom CSS — all without touching code. Click presets here to test themes live!
          </p>
        </div>
      </ScrollReveal>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', t: 'Start typing', d: 'Open the builder and write your first question. Press Enter for the next one.' },
    { n: '02', t: 'Add magic', d: 'Hit / for blocks, set up conditional logic and split into pages with a page break.' },
    { n: '03', t: 'Share & collect', d: 'Grab your Folly link, embed it anywhere, and watch submissions roll in — unlimited.' },
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">Roll up your sleeves</p>
        <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Build stunning forms, free.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink/55">
          It’s as simple as one-two-three — and you don’t even need an account to try it.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-3xl border border-ink/10 p-8 shadow-sm transition hover:shadow-card">
            <span className="text-sm font-black tracking-widest text-brand-500">{s.n}</span>
            <h3 className="mt-3 text-xl font-bold text-ink">{s.t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/55">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          to="/forms"
          className="rounded-full bg-ink px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 hover:bg-black"
        >
          Create a free form
        </Link>
      </div>
    </section>
  )
}

function FAQSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-10 text-center text-4xl font-extrabold tracking-tight text-ink">Questions &amp; answers</h2>
      <div className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white shadow-sm">
        {FAQ.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="shrink-0 text-ink/30 transition group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="overflow-hidden rounded-[2rem] bg-brand-500 px-8 py-16 text-center text-white sm:px-16">
        <LogoMark className="mx-auto h-10 w-10" />
        <h2 className="mx-auto mt-6 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Say goodbye to boring forms
        </h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-white/85">
          Free forever. Unlimited forms. Unlimited submissions.
        </p>
        <Link
          to="/forms"
          className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-[15px] font-bold text-brand-600 shadow-lg transition hover:-translate-y-0.5"
        >
          Create a free form →
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Product', ['Pricing', 'Features', 'Templates', 'Changelog', 'API docs']],
    ['Help', ['Get started', 'Help center', 'Contact support', 'Feedback']],
    ['Company', ['About us', 'Blog', 'Status', 'Security']],
    ['Compare', ['Typeform alternative', 'Jotform alternative', 'Google Forms alternative']],
  ]
  return (
    <footer className="border-t border-ink/10 bg-ink/[0.02]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/50">
              The free form builder for people who can’t stand form builders.
            </p>
            <p className="mt-6 text-xs text-ink/35">
              Made with{' '}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="inline h-3.5 w-3.5 -translate-y-[1px] text-brand-500"
                aria-hidden
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>{' '}
              · Runs entirely in your browser
            </p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-ink/45">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer text-sm text-ink/60 transition hover:text-brand-500">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 text-xs text-ink/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Folly BV — Built as an MVP clone of tally.so</span>
          <div className="flex gap-5">
            {['X', 'Reddit', 'LinkedIn', 'Instagram', 'Bluesky'].map((s) => (
              <span key={s} className="cursor-pointer hover:text-ink/70">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  const [activeTheme, setActiveTheme] = useState<PreviewTheme>(THEME_PRESETS[0])

  const goCreate = () => {
    useForms.getState().createForm()
    window.location.hash = '#/forms'
  }

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-[14px] font-medium text-ink/60 md:flex">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="transition hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/forms" className="hidden text-[14px] font-medium text-ink/60 transition hover:text-ink sm:block">
              Sign in
            </Link>
            <button
              onClick={goCreate}
              className="rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              Create form
            </button>
          </div>
        </div>
      </header>

      <Hero />
      <Features theme={activeTheme} />
      
      <ScrollReveal>
        <InputTypes />
      </ScrollReveal>
      
      <ScrollReveal>
        <Smart />
      </ScrollReveal>
      
      <Themes activeTheme={activeTheme} onChange={setActiveTheme} />
      
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      
      <ScrollReveal>
        <FAQSection />
      </ScrollReveal>
      
      <ScrollReveal>
        <CTA />
      </ScrollReveal>
      
      <Footer />
    </div>
  )
}