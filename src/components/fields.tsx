import { useId, useRef, useState } from 'react'
import type { AddressValue, AnswerValue, Block, FilePayload, FormSettings, PaymentValue, SignatureData } from '../types'
import { RichText } from './richtext'

export function getDefaultValue(block: Block): AnswerValue {
  switch (block.type) {
    case 'checkbox':
    case 'multiSelect':
    case 'ranking':
      return []
    case 'signature':
      return []
    case 'matrix':
      return {}
    case 'address':
      return { street: '', apt: '', city: '', state: '', zip: '', country: '' } as AddressValue
    case 'rating':
    case 'nps':
    case 'linear':
    case 'csat':
    case 'fileUpload':
    case 'dropdown':
    case 'score':
    case 'payment':
      return null
    default:
      return ''
  }
}

export function isFilled(value: AnswerValue): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object' && 'name' in value) return true
  if (typeof value === 'object' && 'street' in value) {
    const a = value as AddressValue
    return Boolean(a.street?.trim() || a.city?.trim() || a.zip?.trim())
  }
  if (typeof value === 'object') {
    return Object.values(value).some((v) => v !== null && v !== undefined && String(v).trim().length > 0)
  }
  return String(value).trim().length > 0
}

function RatingIcon({ kind, filled }: { kind: Block['ratingIcon']; filled: boolean }) {
  const cls = `h-9 w-9 sm:h-10 sm:w-10 transition ${filled ? '' : 'opacity-45 hover:opacity-80'}`
  if (kind === 'heart')
    return (
      <svg viewBox="0 0 24 24" className={cls} fill={filled ? '#ff5470' : 'none'} stroke="#0b0f19" strokeWidth={1.6}>
        <path d="M12 20.5 4.2 12.7a5 5 0 0 1 7.1-7.1l.7.7.7-.7a5 5 0 0 1 7.1 7.1L12 20.5Z" />
      </svg>
    )
  if (kind === 'thumbs')
    return (
      <svg viewBox="0 0 24 24" className={cls} fill={filled ? '#ff5470' : 'none'} stroke="#0b0f19" strokeWidth={1.6}>
        <path d="M7 11 11 3a2.3 2.3 0 0 1 2.4 2.6L13 8h5.2a1.8 1.8 0 0 1 1.8 2.3l-1.8 7.2a2 2 0 0 1-2 1.5H7M7 11v9M4 11h3" transform="translate(1 -1)" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" className={cls} fill={filled ? '#ffb400' : 'none'} stroke="#0b0f19" strokeWidth={1.5}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />
    </svg>
  )
}

function RatingControl({ block, value, onChange }: { block: Block; value: number | null; onChange: (v: number) => void }) {
  const max = block.ratingMax ?? 5
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded-full p-1 transition hover:scale-110"
          aria-label={`${n} of ${max}`}
        >
          <RatingIcon kind={block.ratingIcon} filled={value !== null && n <= value} />
        </button>
      ))}
    </div>
  )
}

function NpsControl({ block, value, onChange }: { block: Block; value: number | null; onChange: (v: number) => void }) {
  const nums = Array.from({ length: 11 }, (_, i) => i)
  return (
    <div>
      <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`border-2 border-black py-2.5 text-[13px] font-black transition ${
              value === n ? 'bg-[#ffe600] text-black shadow-[3px_3px_0px_#000]' : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[12px] font-mono font-bold uppercase text-black">
        <span>{block.npsMinLabel || 'Not at all likely'}</span>
        <span>{block.npsMaxLabel || 'Extremely likely'}</span>
      </div>
      {(block.npsMinLabel || block.npsMaxLabel) && (
        <div className="flex justify-between text-[12px] font-mono font-bold uppercase text-black sm:hidden">
          <span>{block.npsMinLabel}</span>
          <span>{block.npsMaxLabel}</span>
        </div>
      )}
    </div>
  )
}

function LinearControl({ block, value, onChange }: { block: Block; value: number | null; onChange: (v: number) => void }) {
  const max = block.linearMax ?? 5
  const nums = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <div className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(32px,1fr))] gap-2">
          {nums.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`aspect-square border-2 border-black text-[14px] font-black transition ${
                value === n ? 'bg-[#ffe600] text-black shadow-[3px_3px_0px_#000]' : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {(block.linearMinLabel || block.linearMaxLabel) && (
        <div className="mt-2 flex justify-between text-[12px] font-mono font-bold uppercase text-black">
          <span>{block.linearMinLabel}</span>
          <span>{block.linearMaxLabel}</span>
        </div>
      )}
    </div>
  )
}

function ChoiceControl({
  block,
  value,
  onChange,
  preview,
}: {
  block: Block
  value: string | string[]
  onChange: (v: string | string[]) => void
  preview?: boolean
}) {
  const options = block.options ?? []
  const multiple = block.type === 'checkbox' || block.allowMultiple

  const toggle = (label: string) => {
    if (multiple) {
      const arr = (Array.isArray(value) ? value : []) as string[]
      const next = arr.includes(label) ? arr.filter((x) => x !== label) : [...arr, label]
      onChange(next)
    } else {
      onChange(label)
    }
  }

  const isChecked = (label: string) =>
    multiple ? (Array.isArray(value) ? (value as string[]).includes(label) : false) : value === label

  const otherIndex = options.findIndex((o) => o.label === '__other__')
  const list = otherIndex >= 0 ? options.filter((_, i) => i !== otherIndex) : options
  const otherActive = Array.isArray(value) ? false : value === '__other__'

  return (
    <div className="q-options space-y-2.5">
      {list.map((o, idx) => {
        const letter = String.fromCharCode(65 + idx)
        return multiple ? (
          <label
            key={o.id}
            className={`q-option q-check-option flex w-fit cursor-pointer items-center gap-3 border-2 border-black px-4 py-3 transition font-bold ${
              isChecked(o.label) ? 'bg-[#ffe600] text-black shadow-[4px_4px_0px_#000]' : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_#000]'
            }`}
            onClick={(e) => {
              if (preview) e.preventDefault()
            }}
          >
            <span className="q-badge flex h-5 w-5 items-center justify-center border border-black bg-white font-mono text-[10px] font-black text-black shadow-[1px_1px_0px_#000]">
              {letter}
            </span>
            <input
              type="checkbox"
              className="h-[18px] w-[18px] border-2 border-black accent-black"
              checked={isChecked(o.label)}
              onChange={() => toggle(o.label)}
              disabled={preview}
            />
            <span className="q-label text-[15px]"><RichText text={o.label} /></span>
          </label>
        ) : (
          <label
            key={o.id}
            className={`q-option q-multi-option flex w-fit cursor-pointer items-center gap-3 border-2 border-black px-4 py-3 transition font-bold ${
              isChecked(o.label) ? 'bg-[#ffe600] text-black shadow-[4px_4px_0px_#000]' : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_#000]'
            }`}
            onClick={(e) => {
              if (preview) e.preventDefault()
            }}
          >
            <span className="q-badge flex h-5 w-5 items-center justify-center border border-black bg-white font-mono text-[10px] font-black text-black shadow-[1px_1px_0px_#000]">
              {letter}
            </span>
            <input
              type="radio"
              name={block.id}
              className="h-[18px] w-[18px] border-2 border-black accent-black"
              checked={isChecked(o.label)}
              onChange={() => onChange(o.label)}
              disabled={preview}
            />
            <span className="q-label text-[15px]"><RichText text={o.label} /></span>
          </label>
        )
      })}
      {block.allowOther && (
        <div className="flex items-center gap-3">
          {multiple ? (
            <div className="flex w-fit items-center gap-3 border-2 border-black bg-white px-4 py-2.5 shadow-[2px_2px_0px_#000]">
              <input type="checkbox" className="h-[18px] w-[18px] accent-black" disabled={preview} onChange={() => {}} />
              <input
                className="bg-transparent text-[15px] text-black font-bold outline-none placeholder:text-neutral-400"
                placeholder="Other…"
                onChange={(e) => {
                  if (multiple) onChange([...(Array.isArray(value) ? value : []), e.target.value].filter(Boolean))
                }}
                disabled={preview}
              />
            </div>
          ) : (
            <div className="flex w-fit items-center gap-3 border-2 border-black bg-white px-4 py-2.5 shadow-[2px_2px_0px_#000]">
              <input type="radio" className="h-[18px] w-[18px] accent-black" checked={otherActive} disabled={preview} onChange={() => {}} />
              <input
                className="bg-transparent text-[15px] text-black font-bold outline-none placeholder:text-neutral-400"
                placeholder="Other…"
                onChange={(e) => onChange(e.target.value)}
                disabled={preview}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DropdownControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: string | null
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className="relative w-fit min-w-[240px]">
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-2xl border border-ink/20 bg-white dark:bg-white/10 px-4 py-3 pr-10 text-[15px] text-ink dark:text-white outline-none transition hover:border-ink/40 focus:border-ink"
      >
        <option value="" disabled>
          Select an option…
        </option>
        {(block.options ?? []).map((o) => (
          <option key={o.id} value={o.label}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink dark:text-white/40">
        <svg viewBox="0 0 16 16" className="h-4 w-4">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  )
}

function FileControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: FilePayload | null
  onChange: (v: FilePayload | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const maxMb = block.maxSizeMb ?? 10
  const [tooBig, setTooBig] = useState(false)

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-ink/15 bg-ink/[0.02] dark:border-white/15 dark:bg-white/[0.04] px-4 py-3">
          <span className="text-xl">📎</span>
          <span className="flex-1 truncate text-[14px] text-ink dark:text-white/80">{value.name}</span>
          <span className="text-[12px] text-ink dark:text-white/40">{(value.size / 1024).toFixed(1)} KB</span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = ''
              onChange(null)
            }}
            className="text-[13px] font-medium text-brand-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-fit items-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 bg-ink/[0.02] dark:border-white/25 dark:bg-white/[0.04] px-5 py-3.5 text-[15px] font-medium text-ink dark:text-white/60 transition hover:border-ink/40 hover:text-ink dark:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M12 15V5m0 0L8 9m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload a file
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={block.fileTypes?.join(',')}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (!f) return
          if (f.size > maxMb * 1024 * 1024) {
            setTooBig(true)
            onChange(null)
            return
          }
          setTooBig(false)
          onChange({ name: f.name, size: f.size })
        }}
      />
      <p className="mt-2 text-[12px] text-ink dark:text-white/40">
        {block.fileTypes?.slice(0, 4).join(', ')} — up to {maxMb} MB
      </p>
      {tooBig && <p className="mt-1 text-[12px] font-medium text-brand-600">That file is larger than {maxMb} MB.</p>}
    </div>
  )
}

function SignatureControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: SignatureData | null
  onChange: (v: SignatureData) => void
}) {
  const padRef = useRef<HTMLDivElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [live, setLive] = useState<Array<[number, number]> | null>(null)
  const current = useRef<Array<[number, number]>>([])
  const strokes = value ?? []
  const visible = live ? [...strokes, { points: live }] : strokes

  const pointFrom = (clientX: number, clientY: number): [number, number] => {
    const rect = padRef.current!.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    return [x, y]
  }

  return (
    <div>
      <div
        ref={padRef}
        className={`relative h-44 w-full touch-none select-none cursor-crosshair overflow-hidden rounded-2xl border ${
          drawing ? 'border-ink/40' : 'border-ink/20'
        } bg-white dark:bg-white/10`}
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          setDrawing(true)
          current.current = [pointFrom(e.clientX, e.clientY)]
          setLive(current.current)
        }}
        onPointerMove={(e) => {
          if (!drawing) return
          current.current.push(pointFrom(e.clientX, e.clientY))
          setLive(current.current.slice())
        }}
        onPointerUp={() => {
          if (current.current.length > 1) onChange([...strokes, { points: current.current.slice() }])
          setLive(null)
          setDrawing(false)
          current.current = []
        }}
        onPointerCancel={() => {
          setLive(null)
          setDrawing(false)
          current.current = []
        }}
      >
        {visible.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-ink dark:text-white/25">
            Draw your signature above
          </div>
        )}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {visible.map((s, i) => (
            <polyline
              key={i}
              fill="none"
              stroke="#0b0f19"
              strokeWidth="0.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={s.points.map((p) => `${(p[0] * 100).toFixed(2)},${(p[1] * 100).toFixed(2)}`).join(' ')}
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between px-1">
        <span className="text-[12px] text-ink dark:text-white/35">
          {visible.length === 0 ? 'Use your mouse or finger to sign' : `${visible.length} stroke${visible.length === 1 ? '' : 's'}`}
        </span>
        {strokes.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-[13px] font-medium text-brand-600 hover:underline">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function ScoreControl({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex w-fit items-center gap-4 rounded-2xl border border-ink/15 bg-ink/[0.02] dark:border-white/15 dark:bg-white/[0.04] px-5 py-3">
      <span className="text-4xl font-bold tabular-nums text-ink dark:text-white">{value}</span>
      <span className="text-[13px] leading-tight text-ink dark:text-white/45">
        {count === 0 ? 'No questions selected' : count === 1 ? 'Based on 1 answer' : `Based on ${count} answers`}
      </span>
    </div>
  )
}

function CsatControl({ block, value, onChange }: { block: Block; value: number | null; onChange: (v: number) => void }) {
  const nums = [1, 2, 3, 4, 5]
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <div className="grid flex-1 grid-cols-5 gap-1.5">
          {nums.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`rounded-lg py-2.5 text-[13px] font-semibold transition ${
                value === n ? 'bg-ink text-white shadow-md dark:bg-white dark:text-ink' : 'bg-ink/[0.05] text-ink dark:bg-white/10 dark:text-white/70 hover:bg-ink/10 dark:hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-ink dark:text-white/45">
        <span>{block.csatMinLabel || 'Very unsatisfied'}</span>
        <span>{block.csatMaxLabel || 'Very satisfied'}</span>
      </div>
    </div>
  )
}

function MultiSelectControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const options = block.options ?? []
  const selected = Array.isArray(value) ? value : []
  const filtered = options.filter((o) => o.label.trim().toLowerCase().includes(query.trim().toLowerCase()))

  const toggle = (label: string) => {
    onChange(selected.includes(label) ? selected.filter((x) => x !== label) : [...selected, label])
  }

  return (
    <div className="relative max-w-xl" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setQuery('')
        }}
        className="flex w-full min-h-[50px] cursor-pointer items-center gap-2 rounded-2xl border border-ink/20 bg-white dark:bg-white/10 px-3 py-2 text-left transition hover:border-ink/40"
      >
        {selected.length === 0 ? (
          <span className="px-1 text-[15px] text-ink dark:text-white/35">Select options</span>
        ) : (
          <span className="flex flex-wrap gap-1.5">
            {selected.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 rounded-full bg-ink/[0.06] dark:bg-white/10 px-2.5 py-1 text-[12px] font-medium text-ink dark:text-white/80"
              >
                {s}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle(s)
                  }}
                  className="text-ink dark:text-white/40 hover:text-ink dark:text-white"
                  aria-label={`Remove ${s}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </span>
        )}
        <svg
          viewBox="0 0 16 16"
          className={`ml-auto h-4 w-4 shrink-0 text-ink dark:text-white/40 transition ${open ? 'rotate-180' : ''}`}
        >
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-ink/15 bg-white dark:bg-white/10 shadow-pop">
          <div className="border-b border-ink/[0.06] p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search options…"
              className="w-full rounded-lg bg-ink/[0.04] dark:bg-white/[0.06] px-3 py-2 text-[13px] text-ink dark:text-white outline-none placeholder:text-ink dark:text-white/35"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-ink dark:text-white/40">No options match.</div>}
            {filtered.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-ink/[0.04] dark:hover:bg-white/[0.06]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-ink"
                  checked={selected.includes(o.label)}
                  onChange={() => toggle(o.label)}
                />
                <span className="text-[14px] text-ink dark:text-white/85"><RichText text={o.label} /></span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RankingControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: string[]
  onChange: (v: string[]) => void
}) {
  const options = (block.options ?? []).filter((o) => o.label.trim())
  const order = Array.isArray(value) ? value.filter((v) => options.some((o) => o.label === v)) : []

  const move = (i: number, dir: -1 | 1) => {
    const next = [...order]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const select = (label: string) => {
    const next = order.filter((x) => x !== label)
    next.push(label)
    onChange(next)
  }

  const rankOf = (label: string) => {
    const idx = order.indexOf(label)
    return idx === -1 ? null : idx + 1
  }

  return (
    <div className="max-w-xl space-y-1.5">
      {options.map((o) => {
        const rank = rankOf(o.label)
        const placed = rank !== null
        return (
          <div
            key={o.id}
            className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition ${
              placed ? 'border-ink/40 bg-ink/[0.03]' : 'border-ink/15 hover:border-ink/30'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                placed ? 'bg-ink text-white' : 'bg-ink/[0.06] text-ink dark:text-white/40'
              }`}
            >
              {rank ?? '·'}
            </span>
            <span className="flex-1 text-[15px] text-ink dark:text-white/85"><RichText text={o.label} /></span>
            <button
              type="button"
              disabled={!placed}
              onClick={() => {
                const i = order.indexOf(o.label)
                move(i, -1)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink dark:text-white/40 transition hover:bg-ink/[0.05] hover:text-ink dark:text-white disabled:opacity-20"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => select(o.label)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                placed ? 'text-ink dark:text-white/40 hover:bg-ink/[0.05]' : 'bg-ink text-white hover:bg-black'
              }`}
              title={placed ? 'Move to end' : 'Add to ranking'}
            >
              {placed ? '→ end' : '+ rank'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function MatrixControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  const rows = block.matrixRows ?? []
  const columns = block.matrixColumns ?? []
  if (rows.length === 0 || columns.length === 0) return null
  const current = value && typeof value === 'object' ? value : {}

  return (
    <div className="max-w-xl overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2" />
            {columns.map((c) => (
              <th key={c} className="p-2 text-center text-[13px] font-semibold text-ink dark:text-white/70">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="p-2 text-[15px] text-ink dark:text-white/85">{row}</td>
              {columns.map((col) => (
                <td key={col} className="p-2 text-center">
                  <input
                    type="radio"
                    name={`matrix-${block.id}-${row}`}
                    className="h-4 w-4 accent-ink"
                    checked={current[row] === col}
                    onChange={() => onChange({ ...current, [row]: col })}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function FieldControl({
  block,
  value,
  onChange,
  preview = false,
  formSettings,
}: {
  block: Block
  value: AnswerValue
  onChange: (v: AnswerValue) => void
  preview?: boolean
  formSettings?: FormSettings
}) {
  switch (block.type) {
    case 'shortText':
    case 'email':
    case 'phone':
    case 'link':
      return (
        <input
          type={block.type === 'email' ? 'email' : block.type === 'phone' ? 'tel' : block.type === 'link' ? 'url' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={block.placeholder ?? (block.type === 'email' ? 'you@example.com' : block.type === 'link' ? 'https://…' : 'Type your answer')}
          disabled={preview}
          className="w-full max-w-xl border-2 border-black bg-white px-4 py-3 text-[15px] font-bold text-black outline-none transition placeholder:text-neutral-400 shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000]"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={block.placeholder ?? '0'}
          className="w-full max-w-xl border-2 border-black bg-white px-4 py-3 text-[15px] font-bold text-black outline-none transition placeholder:text-neutral-400 shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000]"
        />
      )
    case 'date':
    case 'time':
      return (
        <input
          type={block.type}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-xl border-2 border-black bg-white px-4 py-3 text-[15px] font-bold text-black outline-none transition shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000]"
        />
      )
    case 'longText':
      return (
        <textarea
          rows={value ? Math.max(2, Math.min(6, String(value).split('\n').length + 1)) : 2}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={block.placeholder ?? 'Write a longer answer…'}
          disabled={preview}
          className="w-full max-w-xl border-2 border-black bg-white px-4 py-3 text-[15px] font-bold leading-relaxed text-black outline-none transition placeholder:text-neutral-400 shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000]"
        />
      )
    case 'rating':
      return <RatingControl block={block} value={typeof value === 'number' ? value : null} onChange={(v) => onChange(v)} />
    case 'csat':
      return <CsatControl block={block} value={typeof value === 'number' ? value : null} onChange={(v) => onChange(v)} />
    case 'nps':
      return <NpsControl block={block} value={typeof value === 'number' ? value : null} onChange={(v) => onChange(v)} />
    case 'linear':
      return <LinearControl block={block} value={typeof value === 'number' ? value : null} onChange={(v) => onChange(v)} />
    case 'multipleChoice':
    case 'checkbox':
      return (
        <ChoiceControl
          block={block}
          value={value as string | string[]}
          onChange={(v) => onChange(v)}
          preview={preview}
        />
      )
    case 'dropdown':
      return <DropdownControl block={block} value={value as string | null} onChange={(v) => onChange(v)} />
    case 'multiSelect':
      return <MultiSelectControl block={block} value={(value as string[]) ?? []} onChange={(v) => onChange(v)} />
    case 'ranking':
      return <RankingControl block={block} value={(value as string[]) ?? []} onChange={(v) => onChange(v)} />
    case 'matrix':
      return <MatrixControl block={block} value={(value as Record<string, string>) ?? {}} onChange={(v) => onChange(v)} />
    case 'fileUpload':
      return <FileControl block={block} value={value as FilePayload | null} onChange={(v) => onChange(v)} />
    case 'signature':
      return <SignatureControl block={block} value={(value as SignatureData) ?? []} onChange={(v) => onChange(v)} />
    case 'score':
      return (
        <ScoreControl
          value={typeof value === 'number' && !isNaN(value) ? value : 0}
          count={(block.scoreSourceIds ?? []).length}
        />
      )
    case 'address':
      return <AddressControl block={block} value={value as AddressValue | null} onChange={(v) => onChange(v)} />
    case 'payment':
      return (
        <PaymentControl
          block={block}
          value={value}
          onChange={(v) => onChange(v)}
          formSettings={formSettings}
        />
      )
    default:
      return null
  }
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India',
  'Japan', 'Brazil', 'Mexico', 'South Korea', 'Netherlands', 'Switzerland', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Singapore', 'New Zealand', 'South Africa', 'Other',
]

function AddressControl({
  block,
  value,
  onChange,
}: {
  block: Block
  value: AddressValue | null
  onChange: (v: AddressValue) => void
}) {
  const addr: AddressValue = value ?? { street: '', apt: '', city: '', state: '', zip: '', country: '' }
  const set = (patch: Partial<AddressValue>) => onChange({ ...addr, ...patch })
  const cls = 'w-full rounded-xl border border-ink/20 bg-white dark:bg-white/10 px-3 py-2.5 text-[15px] text-ink dark:text-white outline-none transition placeholder:text-ink/35 dark:placeholder:text-white/35 hover:border-ink/40 focus:border-ink focus:ring-4 focus:ring-ink/[0.06]'
  return (
    <div className="flex max-w-xl flex-col gap-2.5">
      <input
        type="text"
        placeholder="Street address"
        value={addr.street}
        onChange={(e) => set({ street: e.target.value })}
        className={cls}
      />
      {block.addressIncludeApt !== false && (
        <input
          type="text"
          placeholder="Apt, suite, unit (optional)"
          value={addr.apt ?? ''}
          onChange={(e) => set({ apt: e.target.value })}
          className={cls}
        />
      )}
      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="text"
          placeholder="City"
          value={addr.city}
          onChange={(e) => set({ city: e.target.value })}
          className={cls}
        />
        <input
          type="text"
          placeholder="State / Province"
          value={addr.state}
          onChange={(e) => set({ state: e.target.value })}
          className={cls}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="text"
          placeholder="Zip / Postal code"
          value={addr.zip}
          onChange={(e) => set({ zip: e.target.value })}
          className={cls}
        />
        <select
          value={addr.country}
          onChange={(e) => set({ country: e.target.value })}
          className={`${cls} cursor-pointer`}
        >
          <option value="">Country</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}

function PaymentControl({
  block,
  value,
  onChange,
  formSettings,
}: {
  block: Block
  value: AnswerValue
  onChange: (val: AnswerValue) => void
  formSettings?: FormSettings
}) {
  const amountStr =
    typeof formSettings?.paymentAmount === 'number'
      ? `${Number(formSettings.paymentAmount).toFixed(2)} ${(formSettings.paymentCurrency ?? 'USD').toUpperCase()}`
      : null

  const isPaid = Boolean(value && typeof value === 'object' && 'paid' in value && (value as PaymentValue).paid)

  return (
    <div className="max-w-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#ffe600] text-black shadow-[1px_1px_0px_#000]">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <div>
            <div className="text-[14px] font-black uppercase text-black">
              {block.text || 'Payment'}
            </div>
            <div className="text-[12px] font-mono font-bold text-neutral-600">
              {amountStr ? `${amountStr} — ${formSettings?.paymentDescription || 'Secure payment via Stripe'}` : 'Stripe payment'}
            </div>
          </div>
        </div>
        {amountStr && (
          <span className="border-2 border-black bg-[#5ce1e6] px-3 py-1 font-mono text-[12px] font-black text-black shadow-[2px_2px_0px_#000]">
            {amountStr}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-black">
        {formSettings?.stripePublishableKey ? (
          isPaid ? (
            <div className="flex items-center gap-2 border-2 border-black bg-[#00ef84] px-4 py-3 text-[14px] font-black text-black shadow-[3px_3px_0px_#000]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
                <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              PAYMENT COMPLETED ({amountStr})
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-black bg-white px-3 py-2 text-[13px] font-mono font-bold text-black shadow-[2px_2px_0px_#000] flex items-center justify-between">
                <span>•••• •••• •••• 4242</span>
                <span className="text-[12px] text-neutral-500">12/28 · CVC</span>
              </div>
              <button
                type="button"
                onClick={() => onChange({ paid: true, amount: formSettings.paymentAmount, currency: formSettings.paymentCurrency, at: Date.now() })}
                className="w-full border-2 border-black bg-[#ffe600] py-2.5 text-[14px] font-black uppercase text-black shadow-[3px_3px_0px_#000] hover:bg-[#facc15] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                PAY {amountStr ?? 'NOW'} ⚡
              </button>
            </div>
          )
        ) : (
          <div className="border-2 border-black bg-amber-100 p-3 font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000]">
            ⚠ Payment key not configured yet. Set your Stripe Publishable Key in block settings (gear icon) or Form settings → Integrations.
          </div>
        )}
      </div>
    </div>
  )
}