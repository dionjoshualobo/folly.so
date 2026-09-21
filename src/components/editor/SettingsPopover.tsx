import { useEffect, useMemo, useRef, useState } from 'react'
import { BLOCKS, GROUPS, Icon } from '../../blockCatalog'
import type { Block, BlockType, Form } from '../../types'
import { useForms } from '../../store'
import { answerOptionsFor, canHaveLogic, getQuestionLabel, questionOptions, isAnswerBlock } from '../../lib/logic'

export function SettingsPopover({
  form,
  blockId,
  anchorRect,
  onClose,
  index,
  count,
}: {
  form: Form
  blockId: string
  anchorRect: DOMRect | null
  onClose: () => void
  index: number
  count: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<'type' | 'settings'>('settings')
  const formId = form.id
  const block = form.blocks.find((b) => b.id === blockId)
  const updateBlock = useForms((s) => s.updateBlock)
  const removeBlock = useForms((s) => s.removeBlock)
  const duplicateBlock = useForms((s) => s.duplicateBlock)
  const moveBlock = useForms((s) => s.moveBlock)

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onMouse)
    return () => document.removeEventListener('mousedown', onMouse)
  }, [onClose])

  const questions = useMemo(() => questionOptions(form), [form])

  if (!block) return null

  const top = anchorRect ? Math.min(anchorRect.top - 8, window.innerHeight - 520) : 80
  const left = anchorRect ? Math.max(8, Math.min(anchorRect.left - 250, window.innerWidth - 330)) : 8

  const toggleRequired = () => updateBlock(formId, block.id, { required: !block.required })
  const tryType = (type: BlockType) => {
    const patch: Partial<Block> = { type }
    if (['multipleChoice', 'checkbox', 'dropdown', 'multiSelect', 'ranking'].includes(type)) {
      if (!block.options || block.options.length === 0) {
        patch.options = ['Option 1', 'Option 2', 'Option 3'].map((label) => ({ id: Math.random().toString(36).slice(2), label }))
      }
    }
    if (type === 'matrix') {
      patch.matrixRows = block.matrixRows ?? ['Row 1', 'Row 2']
      patch.matrixColumns = block.matrixColumns ?? ['Column 1', 'Column 2']
    }
    if (type === 'rating') patch.ratingMax = block.ratingMax ?? 5
    if (type === 'linear') patch.linearMax = block.linearMax ?? 5
    if (type === 'csat') {
      patch.csatMinLabel = block.csatMinLabel ?? 'Very unsatisfied'
      patch.csatMaxLabel = block.csatMaxLabel ?? 'Very satisfied'
    }
    if (type === 'nps') {
      patch.npsMinLabel = block.npsMinLabel ?? 'Not at all likely'
      patch.npsMaxLabel = block.npsMaxLabel ?? 'Extremely likely'
    }
    updateBlock(formId, block.id, patch)
    setTab('settings')
    onClose()
  }

  return (
    <div
      ref={ref}
      className="animate-pop fixed z-50 w-[320px] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-pop"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between border-b border-ink/[0.06] px-3 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('type')}
            className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${tab === 'type' ? 'bg-ink text-white' : 'text-ink/50 hover:bg-ink/[0.05]'}`}
          >
            Type
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${tab === 'settings' ? 'bg-ink text-white' : 'text-ink/50 hover:bg-ink/[0.05]'}`}
          >
            Settings
          </button>
        </div>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-ink/40 hover:bg-ink/[0.05] hover:text-ink">
          <Icon name="close" />
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {tab === 'type' && (
          <div className="space-y-0.5">
            {GROUPS.map((group) => (
              <div key={group}>
                <div className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink/35">{group}</div>
                <div className="grid grid-cols-2 gap-0.5">
                  {BLOCKS.filter((b) => b.group === group).map((b) => (
                    <button
                      key={b.type}
                      onClick={() => tryType(b.type)}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-ink/[0.05] ${b.type === block.type ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-ink/[0.05] text-ink/70">
                        <Icon name={b.type} />
                      </span>
                      <span className="text-[12px] font-semibold leading-tight text-ink/80">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-1">
            <Row label="Required" hint={block.required ? 'Required field' : ''}>
              <Toggle on={!!block.required} onChange={toggleRequired} />
            </Row>

            {isAnswerBlock(block.type) && (
              <div className="px-2 py-2">
                <LabeledInput
                  label="Help text"
                  value={block.helpText ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { helpText: v })}
                />
              </div>
            )}

            {['shortText', 'longText', 'number', 'email', 'phone', 'link'].includes(block.type) && (
              <div className="px-2 pb-2">
                <LabeledInput
                  label="Placeholder"
                  value={block.placeholder ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { placeholder: v })}
                />
              </div>
            )}

            {['multipleChoice', 'checkbox'].includes(block.type) && (
              <Row label="Allow multiple answers">
                <Toggle
                  on={!!block.allowMultiple}
                  onChange={() => updateBlock(formId, block.id, { allowMultiple: !block.allowMultiple })}
                />
              </Row>
            )}
            {['multipleChoice', 'checkbox', 'multiSelect', 'ranking'].includes(block.type) && (
              <Row label="Allow ‘other’ option">
                <Toggle
                  on={!!block.allowOther}
                  onChange={() => updateBlock(formId, block.id, { allowOther: !block.allowOther })}
                />
              </Row>
            )}

            {['checkbox', 'multiSelect'].includes(block.type) && (
              <div className="space-y-2 px-2 py-2 border-y border-ink/[0.06]">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="mb-1 text-[11px] font-semibold text-ink/45">Min choices</div>
                    <input
                      type="number"
                      min={0}
                      value={block.minChoices ?? ''}
                      onChange={(e) => updateBlock(formId, block.id, { minChoices: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-[13px] outline-none focus:border-ink"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-[11px] font-semibold text-ink/45">Max choices</div>
                    <input
                      type="number"
                      min={0}
                      value={block.maxChoices ?? ''}
                      onChange={(e) => updateBlock(formId, block.id, { maxChoices: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-[13px] outline-none focus:border-ink"
                    />
                  </div>
                </div>
              </div>
            )}

            {block.type === 'rating' && (
              <Row label="Maximum rating">
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={block.ratingMax ?? 5}
                  onChange={(e) => updateBlock(formId, block.id, { ratingMax: Math.max(2, Math.min(10, Number(e.target.value) || 5)) })}
                  className="w-16 rounded-lg border border-ink/15 px-2 py-1 text-[13px] outline-none focus:border-ink"
                />
              </Row>
            )}

            {block.type === 'linear' && (
              <div className="space-y-2 px-2 py-2">
                <Row label="Scale steps">
                  <input
                    type="number"
                    min={3}
                    max={10}
                    value={block.linearMax ?? 5}
                    onChange={(e) => updateBlock(formId, block.id, { linearMax: Math.max(3, Math.min(10, Number(e.target.value) || 5)) })}
                    className="w-16 rounded-lg border border-ink/15 px-2 py-1 text-[13px] outline-none focus:border-ink"
                  />
                </Row>
                <LabeledInput
                  label="Min label"
                  value={block.linearMinLabel ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { linearMinLabel: v })}
                />
                <LabeledInput
                  label="Max label"
                  value={block.linearMaxLabel ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { linearMaxLabel: v })}
                />
              </div>
            )}

            {block.type === 'nps' && (
              <div className="space-y-2 px-2 py-2">
                <LabeledInput
                  label="Min label (0)"
                  value={block.npsMinLabel ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { npsMinLabel: v })}
                />
                <LabeledInput
                  label="Max label (10)"
                  value={block.npsMaxLabel ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { npsMaxLabel: v })}
                />
              </div>
            )}

            {block.type === 'csat' && (
              <div className="space-y-2 px-2 py-2">
                <LabeledInput
                  label="Min label (1)"
                  value={block.csatMinLabel ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { csatMinLabel: v })}
                />
                <LabeledInput
                  label="Max label (5)"
                  value={block.csatMaxLabel ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { csatMaxLabel: v })}
                />
              </div>
            )}



            {block.type === 'embed' && (
              <div className="space-y-2 px-2 py-2">
                <LabeledInput
                  label="Embed URL"
                  value={block.embedUrl ?? ''}
                  onChange={(v) => updateBlock(formId, block.id, { embedUrl: v })}
                />
                <LabeledInput
                  label="Caption / title"
                  value={block.text}
                  onChange={(v) => updateBlock(formId, block.id, { text: v })}
                />
              </div>
            )}

            {block.type === 'fileUpload' && (
              <Row label="Max file size (MB)">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={block.maxSizeMb ?? 10}
                  onChange={(e) => updateBlock(formId, block.id, { maxSizeMb: Math.max(1, Math.min(100, Number(e.target.value) || 10)) })}
                  className="w-16 rounded-lg border border-ink/15 px-2 py-1 text-[13px] outline-none focus:border-ink"
                />
              </Row>
            )}

            {block.type === 'image' && (
              <div className="space-y-2 px-2 py-2">
                <LabeledInput
                  label="Image URL"
                  value={block.imageUrl ?? ''}
                  onChange={(v) => {
                    updateBlock(formId, block.id, { imageUrl: v })
                    block.imageUrl = v
                    void block.imageUrl
                  }}
                />
                <LabeledInput
                  label="Alt text / caption"
                  value={block.text}
                  onChange={(v) => updateBlock(formId, block.id, { text: v })}
                />
              </div>
            )}

            {block.type === 'score' && (
              <div className="space-y-2 px-2 py-2 bg-ink/[0.02] border-t border-ink/[0.06]">
                 <div className="text-[12px] font-bold text-ink/70">Score Sources</div>
                 <div className="text-[11px] text-ink/40 mb-2">Select which questions contribute points to this calculation.</div>
                 <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                   {questions.filter(q => q.id !== block.id).map(q => (
                      <label key={q.id} className="flex items-start gap-2 p-1.5 hover:bg-ink/[0.04] rounded cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={(block.scoreSourceIds ?? []).includes(q.id)}
                           onChange={(e) => {
                              const ids = new Set(block.scoreSourceIds ?? [])
                              if (e.target.checked) ids.add(q.id)
                              else ids.delete(q.id)
                              updateBlock(formId, block.id, { scoreSourceIds: Array.from(ids) })
                           }}
                           className="mt-0.5 rounded text-brand-500 focus:ring-brand-500 border-ink/20"
                         />
                         <span className="text-[12px] text-ink/80 leading-tight">{q.label}</span>
                      </label>
                   ))}
                   {questions.length === 0 && (
                      <div className="text-[11px] text-ink/40 italic">No questions available.</div>
                   )}
                 </div>
              </div>
            )}

            {canHaveLogic(block) && (
              <div className="mt-1 border-t border-ink/[0.06] px-2 pb-2 pt-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-ink/70">
                    Logic {block.showIf && block.showIf.length > 0 && <span className="ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">{block.showIf.length}</span>}
                  </span>
                  <button
                    onClick={() => {
                      const rules = block.showIf ?? []
                      const first = questions[0]
                      if (!first) return
                      const tb = form.blocks.find((b) => b.id === first.id)
                      const firstVal = tb ? (answerOptionsFor(tb)[0] ?? '') : ''
                      rules.push({ fieldId: first.id, op: 'equals', value: firstVal })
                      updateBlock(formId, block.id, { showIf: rules })
                    }}
                    className="rounded-md bg-ink px-2 py-1 text-[11px] font-semibold text-white hover:bg-black"
                  >
                    + Add condition
                  </button>
                </div>
                {block.showIf && block.showIf.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-ink/40">Show this block when all of the following match:</p>
                        {block.showIf.map((cond, i) => {
                          const target = form.blocks.find((b) => b.id === cond.fieldId)
                          const labels = target ? answerOptionsFor(target) : []
                          return (
                            <div key={i} className="flex items-center gap-1">
                              <select
                                value={cond.fieldId}
                                onChange={(e) => {
                                  const rules = [...(block.showIf ?? [])]
                                  const target = form.blocks.find((b) => b.id === e.target.value)
                                  rules[i] = { ...rules[i], fieldId: e.target.value, value: target ? answerOptionsFor(target)[0] ?? '' : '' }
                                  updateBlock(formId, block.id, { showIf: rules })
                                }}
                                className="min-w-0 flex-1 truncate rounded-md border border-ink/15 px-1.5 py-1 text-[11px] outline-none focus:border-ink"
                                title={getQuestionLabel(target ?? block)}
                              >
                                <option value="">select question…</option>
                                {questions.map((q) => (
                                  <option key={q.id} value={q.id}>
                                    {q.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={cond.op}
                                onChange={(e) => {
                                  const rules = [...(block.showIf ?? [])]
                                  rules[i] = { ...rules[i], op: e.target.value as 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' }
                                  updateBlock(formId, block.id, { showIf: rules })
                                }}
                                className="rounded-md border border-ink/15 px-1.5 py-1 text-[11px] outline-none focus:border-ink"
                              >
                                <option value="equals">is</option>
                                <option value="notEquals">is not</option>
                                <option value="contains">contains</option>
                                <option value="notContains">does not contain</option>
                                <option value="greaterThan">greater than</option>
                                <option value="lessThan">less than</option>
                              </select>
                              {labels.length > 0 ? (
                                <select
                                  value={cond.value}
                                  onChange={(e) => {
                                    const rules = [...(block.showIf ?? [])]
                                    rules[i] = { ...rules[i], value: e.target.value }
                                    updateBlock(formId, block.id, { showIf: rules })
                                  }}
                                  className="min-w-0 flex-1 truncate rounded-md border border-ink/15 px-1.5 py-1 text-[11px] outline-none focus:border-ink"
                                >
                                  {labels.map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  value={cond.value}
                                  onChange={(e) => {
                                    const rules = [...(block.showIf ?? [])]
                                    rules[i] = { ...rules[i], value: e.target.value }
                                    updateBlock(formId, block.id, { showIf: rules })
                                  }}
                                  placeholder="value…"
                                  className="min-w-0 flex-1 rounded-md border border-ink/15 px-1.5 py-1 text-[11px] outline-none focus:border-ink"
                                />
                              )}
                              <button
                                onClick={() => {
                                  const rules = (block.showIf ?? []).filter((_, j) => j !== i)
                                  updateBlock(formId, block.id, { showIf: rules })
                                }}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink/40 hover:bg-ink/[0.05] hover:text-brand-600"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                        {block.showIf.length > 0 && (
                      <button
                        onClick={() => updateBlock(formId, block.id, { showIf: [] })}
                        className="text-[11px] font-medium text-ink/40 hover:text-ink"
                      >
                        Clear all rules
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-ink/40">No logic yet — add a condition to show this block based on an earlier answer.</p>
                )}
              </div>
            )}

            <div className="mt-1 grid grid-cols-2 gap-1 border-t border-ink/[0.06] pt-2">
              <ActionBtn disabled={index === 0} onClick={() => moveBlock(form.id, index, index - 1)}>
                ↑ Move up
              </ActionBtn>
              <ActionBtn disabled={index === count - 1} onClick={() => moveBlock(form.id, index, index + 1)}>
                ↓ Move down
              </ActionBtn>
              <ActionBtn onClick={() => duplicateBlock(form.id, block.id)}>⧉ Duplicate</ActionBtn>
              {block.colId && (
                <ActionBtn onClick={() => updateBlock(form.id, block.id, { colId: undefined })}>⫴ Split column</ActionBtn>
              )}
              <ActionBtn danger onClick={() => removeBlock(form.id, block.id)}>
                ✕ Delete
              </ActionBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2">
      <div>
        <div className="text-[13px] font-semibold text-ink/80">{label}</div>
        {hint && <div className="text-[11px] text-ink/40">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold text-ink/45">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-[13px] outline-none focus:border-ink"
      />
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-ink' : 'bg-ink/15'}`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  )
}

function ActionBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-2 py-1.5 text-[12px] font-semibold transition ${
        disabled ? 'cursor-not-allowed text-ink/20' : danger ? 'text-brand-600 hover:bg-brand-50' : 'text-ink/60 hover:bg-ink/[0.05]'
      }`}
    >
      {children}
    </button>
  )
}