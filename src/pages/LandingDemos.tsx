import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BLOCKS, Icon, defaultOptions, searchBlocks, type BlockDef } from '../blockCatalog'
import { FieldControl, getDefaultValue, isFilled } from '../components/fields'
import { RichText } from '../components/richtext'
import { blockVisible, computeScore, formatAnswer, getQuestionLabel, isAnswerBlock, pipeText } from '../lib/logic'
import { useForms } from '../store'
import { makeBlock, makeForm, makeOption, type AnswerValue, type Block, type BlockType, type Form } from '../types'

export const btn =
  'border-2 border-black font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'

type Answers = Record<string, AnswerValue>

export function CopyCommand({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-start gap-3 border-2 border-black bg-black p-4 text-left font-mono text-[13px] font-bold text-white shadow-[5px_5px_0px_#ffe600]">
      <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre leading-relaxed">
        {lines.map((l) => (
          <div key={l}>
            <span className="select-none text-[#ffe600]">$ </span>
            {l}
          </div>
        ))}
      </pre>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(lines.join('\n')).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
        }}
        className="shrink-0 border-2 border-white bg-[#ffe600] px-2.5 py-1 text-[11px] font-black uppercase text-black hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Live form demo: real blocks, real logic, real piping, real scoring. */
/* ------------------------------------------------------------------ */

// makeBlock always mints a new id; the demos need stable ones for logic, piping and scoring to point at.
const mk = (id: string, partial: Parameters<typeof makeBlock>[0]): Block => ({ ...makeBlock(partial), id })
const opts = (...labels: string[]) => labels.map((l) => makeOption(l))
const YES = 'Yes, I’ll be there'
const NO = 'Can’t make it'

const DEMOS: Array<{ tab: string; title: string; body: string; form: Form }> = [
  {
    tab: 'Answer',
    title: 'Fill in a real form',
    body: 'These are the same blocks your respondents get. Watch the response build on the right as you answer, then save it.',
    form: makeForm({
      name: 'Product feedback',
      blocks: [
        mk('fb-name', { type: 'shortText', text: 'What’s your name?', required: true, placeholder: 'Ada Lovelace' }),
        mk('fb-rating', { type: 'rating', text: 'How was your experience?', required: true }),
        mk('fb-fix', { type: 'multipleChoice',
          text: 'What should we fix first?',
          options: opts('Onboarding', 'Pricing page', 'Speed', 'Nothing, it’s great'),
        }),
        mk('fb-nps', { type: 'nps', text: 'How likely are you to recommend us?' }),
      ],
    }),
  },
  {
    tab: 'Logic',
    title: 'Questions that react to answers',
    body: 'Pick an answer and the form changes. Each follow-up carries a “show if” rule, so nobody sees a question that doesn’t apply to them.',
    form: makeForm({
      name: 'Meetup RSVP',
      blocks: [
        mk('rs-attend', { type: 'multipleChoice', text: 'Are you coming to the meetup?', required: true, options: opts(YES, NO) }),
        mk('rs-guests', { type: 'number',
          text: 'How many guests are you bringing?',
          showIf: [{ fieldId: 'rs-attend', op: 'equals', value: YES }],
        }),
        mk('rs-bring', { type: 'checkbox',
          text: 'What can you bring?',
          options: opts('Snacks', 'Drinks', 'A speaker', 'Just myself'),
          showIf: [{ fieldId: 'rs-attend', op: 'equals', value: YES }],
        }),
        mk('rs-why', { type: 'longText',
          text: 'Sorry to miss you. Should we invite you to the next one?',
          showIf: [{ fieldId: 'rs-attend', op: 'equals', value: NO }],
        }),
      ],
    }),
  },
  {
    tab: 'Piping',
    title: 'Reuse answers in later questions',
    body: 'Type a name and a project. The next question quotes them back. In the editor you @mention any earlier question to pipe its answer in.',
    form: makeForm({
      name: 'Onboarding',
      blocks: [
        mk('pp-name', { type: 'shortText', text: 'What should we call you?', placeholder: 'Sam' }),
        mk('pp-project', { type: 'shortText', text: 'What are you building?', placeholder: 'A coffee subscription' }),
        mk('pp-when', { type: 'multipleChoice',
          text: 'Nice to meet you, {{pp-name}}. When does {{pp-project}} launch?',
          options: opts('This month', 'This quarter', 'No idea yet'),
        }),
      ],
    }),
  },
  {
    tab: 'Score',
    title: 'Add up answers as people type',
    body: 'A score block totals earlier answers live. Use it for quizzes, lead scoring or a quick self-assessment.',
    form: makeForm({
      name: 'Form-pain check',
      blocks: [
        mk('sc-pain', { type: 'rating', text: 'How painful is your current form tool?' }),
        mk('sc-volume', { type: 'multipleChoice',
          text: 'How many responses do you collect a month?',
          options: opts('Under 100', '100 to 1,000', 'More than 1,000'),
        }),
        mk('sc-total', { type: 'score', text: 'Your form-pain score', scoreSourceIds: ['sc-pain', 'sc-volume'] }),
      ],
    }),
  },
]

const valueOf = (block: Block, answers: Answers, form: Form): AnswerValue =>
  block.type === 'score' ? computeScore(block, answers, form.blocks) : (answers[block.id] ?? getDefaultValue(block))

export function FormDemo() {
  const [active, setActive] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Answers>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<number, string[]>>({})
  const [done, setDone] = useState<Record<number, boolean>>({})

  const { form, title, body } = DEMOS[active]
  const current = answers[active] ?? {}
  const visible = form.blocks.filter((b) => blockVisible(b, current))
  const hidden = form.blocks.length - visible.length
  const rows = visible.filter((b) => isAnswerBlock(b.type))
  const responses = saved[active] ?? []

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const missing: Record<string, string> = {}
    for (const b of visible) if (b.required && !isFilled(current[b.id] ?? null)) missing[b.id] = 'Answer this one to save the response.'
    setErrors(missing)
    if (Object.keys(missing).length) return
    const summary = rows.map((b) => formatAnswer(valueOf(b, current, form))).join(' / ')
    setSaved((s) => ({ ...s, [active]: [summary, ...(s[active] ?? [])] }))
    setAnswers((a) => ({ ...a, [active]: {} }))
    setDone((d) => ({ ...d, [active]: true }))
  }

  return (
    <div className="border-2 border-black bg-white shadow-[8px_8px_0px_#000]">
      <div role="tablist" aria-label="Form demos" className="flex flex-wrap gap-2 border-b-2 border-black bg-[#ffe600] p-2.5">
        {DEMOS.map((d, i) => (
          <button
            key={d.tab}
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              setActive(i)
              setErrors({})
            }}
            className={`border-2 border-black px-4 py-1.5 text-xs font-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              i === active ? 'bg-black text-white' : 'bg-white hover:bg-[#ff90e8]'
            }`}
          >
            {d.tab}
          </button>
        ))}
        <span className="ml-auto hidden self-center pr-1 font-mono text-xs font-bold sm:inline">{form.name}</span>
      </div>

      <div role="tabpanel" className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        {done[active] ? (
          <div className="flex min-h-[340px] flex-col items-start justify-center gap-4 p-6 sm:p-10">
            <h3 className="text-3xl font-black uppercase tracking-tight">Response saved.</h3>
            <p className="max-w-sm text-sm font-bold text-neutral-700">
              It’s in the list on the right. On your own Folly it lands in the responses table, ready to export as CSV.
            </p>
            <button onClick={() => setDone((d) => ({ ...d, [active]: false }))} className={`${btn} bg-[#5ce1e6] px-5 py-2.5 text-xs`}>
              Answer again
            </button>
          </div>
        ) : (
          <form onSubmit={save} noValidate className="space-y-7 p-6 sm:p-10">
            {visible.map((block) => (
              <div key={block.id} className="animate-fade">
                <p className="mb-2.5 text-[17px] font-black leading-snug">
                  <RichText text={pipeText(block.text, current, form.blocks)} />
                  {block.required && <span className="ml-1 text-[#ff5a27]">*</span>}
                </p>
                <FieldControl
                  block={block}
                  value={valueOf(block, current, form)}
                  onChange={(v) => {
                    setAnswers((a) => ({ ...a, [active]: { ...a[active], [block.id]: v } }))
                    setErrors((e) => ({ ...e, [block.id]: '' }))
                  }}
                  formSettings={form.settings}
                />
                {errors[block.id] && <p className="mt-2 text-xs font-black text-[#d33a0c]">{errors[block.id]}</p>}
              </div>
            ))}
            <button type="submit" className={`${btn} bg-black px-6 py-3 text-xs text-white hover:bg-[#ffe600] hover:text-black`}>
              Save response
            </button>
          </form>
        )}

        <aside className="border-t-2 border-black bg-[#fffdfa] lg:border-l-2 lg:border-t-0" aria-live="polite">
          <div className="border-b-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase text-white">Live response</div>
          <dl className="divide-y-2 divide-black/10 px-4">
            {rows.map((b) => (
              <div key={b.id} className="py-2.5">
                <dt className="truncate text-[11px] font-bold text-neutral-500">{pipeText(getQuestionLabel(b), current, form.blocks)}</dt>
                <dd className="mt-0.5 break-words text-sm font-black">{formatAnswer(valueOf(b, current, form))}</dd>
              </div>
            ))}
          </dl>
          {hidden > 0 && (
            <p className="mx-4 mb-3 border-2 border-dashed border-black px-3 py-2 text-[11px] font-bold">
              {hidden} {hidden === 1 ? 'question is' : 'questions are'} hidden by logic right now.
            </p>
          )}
          <div className="border-t-2 border-black px-4 py-3">
            <p className="font-mono text-[11px] font-bold uppercase">Saved responses: {responses.length}</p>
            <ol className="mt-2 space-y-1.5">
              {responses.slice(0, 3).map((r, i) => (
                <li key={responses.length - i} className="truncate border-2 border-black bg-[#00ef84] px-2 py-1 text-[11px] font-bold">
                  #{responses.length - i} {r}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[11px] font-bold text-neutral-500">Demo responses stay in this tab.</p>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-1 border-t-2 border-black bg-[#fffdfa] px-6 py-4 sm:flex-row sm:items-baseline sm:gap-5">
        <span className="shrink-0 whitespace-nowrap font-mono text-xs font-bold">
          {active + 1} / {DEMOS.length}
        </span>
        <p className="text-sm font-bold text-neutral-700">
          <span className="font-black uppercase text-black">{title}.</span> {body}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Slash-menu demo: build a form by typing, then open it in the editor. */
/* ------------------------------------------------------------------ */

const TEXT_BLOCKS: BlockType[] = ['heading', 'heading2', 'heading3', 'paragraph']
const WITH_OPTIONS: BlockType[] = ['multipleChoice', 'checkbox', 'dropdown', 'multiSelect', 'ranking']
// ponytail: blocks that need a URL, Stripe key or other blocks to mean anything are left out of the demo menu.
const SKIPPED: BlockType[] = ['label', 'image', 'embed', 'payment', 'pageBreak', 'thankYou', 'score']
const MENU_SIZE = 6

function newBlock(def: BlockDef, text = ''): Block {
  return makeBlock({
    type: def.type,
    text,
    options: WITH_OPTIONS.includes(def.type) ? defaultOptions().map((l) => makeOption(l)) : undefined,
  })
}

const byType = (type: BlockType) => BLOCKS.find((b) => b.type === type)!

export function SlashDemo() {
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState<Block[]>(() => [
    newBlock(byType('heading'), 'Beta signup'),
    newBlock(byType('shortText'), 'What’s your name?'),
    newBlock(byType('email'), 'Where can we reach you?'),
  ])
  const [answers, setAnswers] = useState<Answers>({})
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)

  const open = query.startsWith('/')
  const results = open ? searchBlocks(query.slice(1)).filter((b) => !SKIPPED.includes(b.type)).slice(0, MENU_SIZE) : []
  const picked = results[Math.min(index, results.length - 1)]

  const add = (block: Block) => {
    setBlocks((b) => [...b, block])
    setQuery('')
    setIndex(0)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setQuery('')
    else if (open && e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && picked) add(newBlock(picked))
      else if (!open && query.trim()) add(newBlock(byType('shortText'), query.trim()))
    }
  }

  const title = blocks.find((b) => b.type === 'heading')?.text || 'Untitled form'

  const openInEditor = () => {
    const form = useForms.getState().createFormFromTemplate({
      id: 'landing-demo',
      title,
      description: '',
      icon: '',
      category: 'Business',
      blocks,
    })
    navigate(`/editor/${form.id}`)
  }

  return (
    <div className="border-2 border-black bg-white shadow-[8px_8px_0px_#000]">
      <div className="flex items-center justify-between border-b-2 border-black bg-[#5ce1e6] px-4 py-2.5 font-mono text-xs font-bold uppercase">
        <span className="truncate">{title}</span>
        <span>
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </span>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        {blocks.map((block) => {
          const isText = TEXT_BLOCKS.includes(block.type)
          return (
            <div key={block.id} className="group relative animate-pop pr-9">
              {block.type === 'divider' ? (
                <hr className="border-0 border-t-2 border-black" />
              ) : (
                <input
                  value={block.text}
                  onChange={(e) => setBlocks((bs) => bs.map((b) => (b.id === block.id ? { ...b, text: e.target.value } : b)))}
                  placeholder={isText ? byType(block.type).label : 'Type a question'}
                  aria-label={isText ? byType(block.type).label : 'Question'}
                  className={`w-full bg-transparent font-black outline-none placeholder:text-neutral-400 focus:bg-[#ffe600]/40 ${
                    block.type === 'heading'
                      ? 'text-3xl uppercase tracking-tight'
                      : block.type === 'heading2'
                        ? 'text-2xl'
                        : block.type === 'heading3'
                          ? 'text-xl'
                          : block.type === 'paragraph'
                            ? 'text-sm font-bold text-neutral-700'
                            : 'mb-2.5 text-[17px]'
                  }`}
                />
              )}
              {!isText && block.type !== 'divider' && (
                <FieldControl
                  block={block}
                  value={answers[block.id] ?? getDefaultValue(block)}
                  onChange={(v) => setAnswers((a) => ({ ...a, [block.id]: v }))}
                />
              )}
              <button
                type="button"
                onClick={() => setBlocks((bs) => bs.filter((b) => b.id !== block.id))}
                aria-label={`Remove ${byType(block.type).label} block`}
                className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center border-2 border-black bg-white text-xs font-black opacity-40 hover:bg-[#ff5a27] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          )
        })}

        <div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIndex(0)
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls="slash-menu"
            aria-activedescendant={picked ? `slash-${picked.type}` : undefined}
            aria-label="Add a block"
            placeholder="Type / for blocks, or write a question and press Enter"
            className="w-full border-2 border-dashed border-black bg-[#fffdfa] px-4 py-3 text-[15px] font-bold outline-none placeholder:text-neutral-500 focus:border-solid focus:shadow-[4px_4px_0px_#000]"
          />
          {open && (
            <ul id="slash-menu" role="listbox" aria-label="Blocks" className="mt-2 border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
              {results.map((def) => (
                <li
                  key={def.type}
                  id={`slash-${def.type}`}
                  role="option"
                  aria-selected={def === picked}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    add(newBlock(def))
                  }}
                  onMouseEnter={() => setIndex(results.indexOf(def))}
                  className={`flex cursor-pointer items-center gap-3 border-b-2 border-black/10 px-3 py-2 last:border-b-0 ${
                    def === picked ? 'bg-[#ffe600]' : ''
                  }`}
                >
                  <Icon name={def.type} />
                  <span className="text-sm font-black">{def.label}</span>
                  <span className="hidden truncate text-xs font-bold text-neutral-600 sm:inline">{def.hint}</span>
                </li>
              ))}
              {results.length === 0 && <li className="px-3 py-2 text-xs font-bold">No block matches “{query.slice(1)}”. Try /rating or /date.</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t-2 border-black bg-[#fffdfa] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold text-neutral-700">Happy with it? Carry these blocks into the full editor and publish.</p>
        <button onClick={openInEditor} disabled={blocks.length === 0} className={`${btn} shrink-0 bg-[#ffe600] px-5 py-2.5 text-xs disabled:opacity-40`}>
          Open in the editor
        </button>
      </div>
    </div>
  )
}
