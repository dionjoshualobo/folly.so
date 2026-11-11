import { useEffect, useMemo, useRef, useState } from 'react'
import { BLOCKS, GROUPS, Icon } from '../../blockCatalog'
import type { Block, BlockType, Form } from '../../types'
import { useForms } from '../../store'
import { answerOptionsFor, canHaveLogic, getFormPageLabels, getQuestionLabel, questionOptions, isAnswerBlock } from '../../lib/logic'

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
  const updateSettings = useForms((s) => s.updateSettings)
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
      className="animate-pop fixed z-50 w-[330px] overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0px_#000]"
      style={{ top, left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b-2 border-black bg-[#ffe600] px-3 py-2">
        <div className="flex gap-1.5 font-mono text-xs">
          <button
            onClick={() => setTab('type')}
            className={`border-2 border-black px-2.5 py-0.5 font-black uppercase transition ${
              tab === 'type' ? 'bg-black text-white shadow-[1px_1px_0px_#ffe600]' : 'bg-white text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            BLOCK TYPE
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`border-2 border-black px-2.5 py-0.5 font-black uppercase transition ${
              tab === 'settings' ? 'bg-black text-white shadow-[1px_1px_0px_#ffe600]' : 'bg-white text-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            SETTINGS
          </button>
        </div>
        <button
          onClick={onClose}
          className="border-2 border-black bg-black text-white px-1.5 py-0.5 text-xs font-black hover:bg-red-500"
        >
          [ X ]
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {tab === 'type' && (
          <div className="space-y-1.5 p-1">
            {GROUPS.map((group) => (
              <div key={group}>
                <div className="px-1.5 pb-1 pt-1.5 font-mono text-[10px] font-black uppercase text-neutral-500 tracking-wider">{group}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {BLOCKS.filter((b) => b.group === group).map((b) => (
                    <button
                      key={b.type}
                      onClick={() => tryType(b.type)}
                      className={`flex items-center gap-2 border-2 border-black p-1.5 text-left transition hover:bg-[#ffe600] active:translate-x-0.5 active:translate-y-0.5 ${
                        b.type === block.type ? 'bg-[#ffe600] shadow-[2px_2px_0px_#000]' : 'bg-white shadow-[1px_1px_0px_#000]'
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-black bg-white text-black shadow-[1px_1px_0px_#000]">
                        <Icon name={b.type} />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-tight text-black truncate">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-1">
            {isAnswerBlock(block.type) && (
              <Row label="Required" hint={block.required ? 'Required field' : ''}>
                <Toggle on={!!block.required} onChange={toggleRequired} />
              </Row>
            )}

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



            {block.type === 'address' && (
              <div className="space-y-1 py-1">
                <Row label="Include Apt / Unit field">
                  <Toggle
                    on={block.addressIncludeApt !== false}
                    onChange={() => updateBlock(formId, block.id, { addressIncludeApt: block.addressIncludeApt === false })}
                  />
                </Row>
                <Row label="Require country">
                  <Toggle
                    on={!!block.addressRequireCountry}
                    onChange={() => updateBlock(formId, block.id, { addressRequireCountry: !block.addressRequireCountry })}
                  />
                </Row>
              </div>
            )}

            {block.type === 'payment' && (
              <div className="space-y-3 px-1 py-1">
                <div className="rounded border-2 border-black bg-[#ffe600]/30 p-2 text-[11px] font-bold text-black">
                  <div className="font-black uppercase">Stripe Payment Block</div>
                  Collect payments, orders, or tips directly from respondents using Stripe.
                </div>

                <Row label="Currency">
                  <select
                    value={form.settings.paymentCurrency?.toLowerCase() || 'usd'}
                    onChange={(e) => updateSettings(formId, { paymentCurrency: e.target.value.toLowerCase() })}
                    className="rounded border-2 border-black bg-white px-2 py-1 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  >
                    <option value="usd">USD ($ — US Dollar)</option>
                    <option value="eur">EUR (€ — Euro)</option>
                    <option value="gbp">GBP (£ — British Pound)</option>
                    <option value="inr">INR (₹ — Indian Rupee)</option>
                    <option value="cad">CAD ($ — Canadian Dollar)</option>
                    <option value="aud">AUD ($ — Australian Dollar)</option>
                    <option value="jpy">JPY (¥ — Japanese Yen)</option>
                    <option value="chf">CHF (Fr — Swiss Franc)</option>
                    <option value="brl">BRL (R$ — Brazilian Real)</option>
                    <option value="sgd">SGD ($ — Singapore Dollar)</option>
                  </select>
                </Row>

                <Row label="Amount">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-black">
                      {form.settings.paymentCurrency?.toLowerCase() === 'inr'
                        ? '₹'
                        : form.settings.paymentCurrency?.toLowerCase() === 'eur'
                        ? '€'
                        : form.settings.paymentCurrency?.toLowerCase() === 'gbp'
                        ? '£'
                        : form.settings.paymentCurrency?.toLowerCase() === 'jpy'
                        ? '¥'
                        : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      value={typeof form.settings.paymentAmount === 'number' ? form.settings.paymentAmount : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        updateSettings(formId, { paymentAmount: isNaN(val) ? undefined : val })
                      }}
                      className="w-24 rounded border-2 border-black bg-white px-2 py-1 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                    />
                  </div>
                </Row>

                <div className="space-y-1">
                  <span className="block text-[11px] font-black uppercase text-black">Payment Description</span>
                  <input
                    type="text"
                    placeholder="e.g. Registration Fee / Coffee"
                    value={form.settings.paymentDescription || ''}
                    onChange={(e) => updateSettings(formId, { paymentDescription: e.target.value })}
                    className="w-full rounded border-2 border-black bg-white px-2 py-1 text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-black uppercase text-black">Stripe Publishable Key</span>
                  <input
                    type="text"
                    placeholder="pk_live_... or pk_test_..."
                    value={form.settings.stripePublishableKey || ''}
                    onChange={(e) => updateSettings(formId, { stripePublishableKey: e.target.value })}
                    className="w-full rounded border-2 border-black bg-white px-2 py-1 font-mono text-[11px] text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                  <span className="block text-[10px] text-neutral-500 font-mono">
                    Stripe Dashboard → Developers → API keys
                  </span>
                </div>
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
              <div className="space-y-3 px-2 py-2">
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1">Image Asset</label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-black bg-white hover:bg-[#ffe600] py-2 px-3 font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition">
                    <Icon name="image" className="h-4 w-4" />
                    <span>📁 UPLOAD IMAGE FILE</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          const res = ev.target?.result as string
                          if (res) updateBlock(formId, block.id, { imageUrl: res })
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                  </label>
                </div>
                <LabeledInput
                  label="Or Image URL"
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
              <div className="space-y-2 border-t-2 border-black bg-neutral-50 p-2.5">
                 <div className="font-mono text-xs font-black uppercase text-black">Score Sources</div>
                 <div className="text-[11px] font-bold text-neutral-600 mb-2">Select questions that contribute points to this calculation.</div>
                 <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                   {questions.filter(q => q.id !== block.id).map(q => (
                      <label key={q.id} className="flex items-start gap-2 border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-[#ffe600]/30 transition">
                         <input 
                           type="checkbox" 
                           checked={(block.scoreSourceIds ?? []).includes(q.id)}
                           onChange={(e) => {
                              const ids = new Set(block.scoreSourceIds ?? [])
                              if (e.target.checked) ids.add(q.id)
                              else ids.delete(q.id)
                              updateBlock(formId, block.id, { scoreSourceIds: Array.from(ids) })
                           }}
                           className="mt-0.5 h-4 w-4 border-2 border-black accent-[#ffe600]"
                         />
                         <span className="font-mono text-[11px] font-bold text-black leading-tight">{q.label}</span>
                      </label>
                   ))}
                   {questions.length === 0 && (
                      <div className="font-mono text-[11px] text-neutral-400 italic">No questions available.</div>
                   )}
                 </div>
              </div>
            )}

            {canHaveLogic(block) && (
              <div className="mt-2 border-t-2 border-black bg-[#fffdfa] p-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    Logic {block.showIf && block.showIf.length > 0 && <span className="ml-1 border border-black bg-[#ffe600] px-1.5 py-0.5 text-[10px] font-black">{block.showIf.length}</span>}
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
                    className="border-2 border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    + Condition
                  </button>
                </div>
                {block.showIf && block.showIf.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-neutral-600 font-mono">Show block when ALL match:</p>
                        {block.showIf.map((cond, i) => {
                          const target = form.blocks.find((b) => b.id === cond.fieldId)
                          const labels = target ? answerOptionsFor(target) : []
                          return (
                            <div key={i} className="flex items-center gap-1.5 border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_#000]">
                              <select
                                value={cond.fieldId}
                                onChange={(e) => {
                                  const rules = [...(block.showIf ?? [])]
                                  const target = form.blocks.find((b) => b.id === e.target.value)
                                  rules[i] = { ...rules[i], fieldId: e.target.value, value: target ? answerOptionsFor(target)[0] ?? '' : '' }
                                  updateBlock(formId, block.id, { showIf: rules })
                                }}
                                className="min-w-0 flex-1 truncate border border-black bg-white px-1.5 py-1 font-mono text-[11px] font-bold text-black outline-none"
                                title={getQuestionLabel(target ?? block)}
                              >
                                <option value="">question…</option>
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
                                className="border border-black bg-white px-1 py-1 font-mono text-[11px] font-bold text-black outline-none"
                              >
                                <option value="equals">is</option>
                                <option value="notEquals">is not</option>
                                <option value="contains">contains</option>
                                <option value="notContains">not contains</option>
                                <option value="greaterThan">&gt;</option>
                                <option value="lessThan">&lt;</option>
                              </select>
                              {labels.length > 0 ? (
                                <select
                                  value={cond.value}
                                  onChange={(e) => {
                                    const rules = [...(block.showIf ?? [])]
                                    rules[i] = { ...rules[i], value: e.target.value }
                                    updateBlock(formId, block.id, { showIf: rules })
                                  }}
                                  className="min-w-0 flex-1 truncate border border-black bg-white px-1.5 py-1 font-mono text-[11px] font-bold text-black outline-none"
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
                                  className="min-w-0 flex-1 border border-black bg-white px-1.5 py-1 font-mono text-[11px] font-bold text-black outline-none"
                                />
                              )}
                              <button
                                onClick={() => {
                                  const rules = (block.showIf ?? []).filter((_, j) => j !== i)
                                  updateBlock(formId, block.id, { showIf: rules })
                                }}
                                className="border border-black bg-neutral-100 px-1 py-0.5 font-mono text-[11px] font-black hover:bg-red-500 hover:text-white"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                        {block.showIf.length > 0 && (
                      <button
                        onClick={() => updateBlock(formId, block.id, { showIf: [] })}
                        className="font-mono text-[10px] font-black uppercase text-red-600 hover:underline"
                      >
                        [ CLEAR ALL LOGIC ]
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-[11px] font-bold text-neutral-500">No logic — block always visible.</p>
                )}
              </div>
            )}

            {(block.type === 'pageBreak' || isAnswerBlock(block.type)) && (
              <div className="mt-2 border-t-2 border-black bg-[#fffdfa] p-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    Page Jumps {block.jumpRules && block.jumpRules.length > 0 && (
                      <span className="ml-1 border border-black bg-[#ffe600] px-1.5 py-0.5 text-[10px] font-black">
                        {block.jumpRules.length}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      const rules = [...(block.jumpRules ?? [])]
                      const first = questions[0]
                      if (!first) return
                      const tb = form.blocks.find((b) => b.id === first.id)
                      const firstVal = tb ? (answerOptionsFor(tb)[0] ?? '') : ''
                      rules.push({
                        id: Math.random().toString(36).slice(2),
                        fieldId: first.id,
                        op: 'equals',
                        value: firstVal,
                        targetPage: 'submit',
                      })
                      updateBlock(formId, block.id, { jumpRules: rules })
                    }}
                    className="border-2 border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    + Jump Rule
                  </button>
                </div>
                {block.jumpRules && block.jumpRules.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-mono text-[11px] font-bold text-neutral-600">If condition matches, jump to:</p>
                    {block.jumpRules.map((rule, i) => {
                      const targetBlock = form.blocks.find((b) => b.id === rule.fieldId)
                      const labels = targetBlock ? answerOptionsFor(targetBlock) : []
                      return (
                        <div key={rule.id || i} className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000] space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-black uppercase text-black">IF</span>
                            <select
                              value={rule.fieldId}
                              onChange={(e) => {
                                const rules = [...(block.jumpRules ?? [])]
                                const tb = form.blocks.find((b) => b.id === e.target.value)
                                rules[i] = {
                                  ...rules[i],
                                  fieldId: e.target.value,
                                  value: tb ? answerOptionsFor(tb)[0] ?? '' : '',
                                }
                                updateBlock(formId, block.id, { jumpRules: rules })
                              }}
                              className="min-w-0 flex-1 truncate border border-black bg-white px-1.5 py-1 font-mono text-[11px] font-bold text-black outline-none"
                            >
                              {questions.map((q) => (
                                <option key={q.id} value={q.id}>{q.label}</option>
                              ))}
                            </select>
                            <select
                              value={rule.op}
                              onChange={(e) => {
                                const rules = [...(block.jumpRules ?? [])]
                                rules[i] = { ...rules[i], op: e.target.value as any }
                                updateBlock(formId, block.id, { jumpRules: rules })
                              }}
                              className="border border-black bg-white px-1 py-1 font-mono text-[11px] font-bold text-black outline-none"
                            >
                              <option value="equals">is</option>
                              <option value="notEquals">is not</option>
                              <option value="contains">contains</option>
                              <option value="notContains">not contains</option>
                              <option value="greaterThan">&gt;</option>
                              <option value="lessThan">&lt;</option>
                            </select>
                            <button
                              onClick={() => {
                                const rules = (block.jumpRules ?? []).filter((_, j) => j !== i)
                                updateBlock(formId, block.id, { jumpRules: rules })
                              }}
                              className="border border-black bg-neutral-100 px-1 py-0.5 font-mono text-[11px] font-black hover:bg-red-500 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            {labels.length > 0 ? (
                              <select
                                value={rule.value}
                                onChange={(e) => {
                                  const rules = [...(block.jumpRules ?? [])]
                                  rules[i] = { ...rules[i], value: e.target.value }
                                  updateBlock(formId, block.id, { jumpRules: rules })
                                }}
                                className="min-w-0 flex-1 truncate border border-black bg-white px-1.5 py-1 font-mono text-[11px] font-bold text-black outline-none"
                              >
                                {labels.map((o) => (
                                  <option key={o} value={o}>{o}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={rule.value}
                                onChange={(e) => {
                                  const rules = [...(block.jumpRules ?? [])]
                                  rules[i] = { ...rules[i], value: e.target.value }
                                  updateBlock(formId, block.id, { jumpRules: rules })
                                }}
                                placeholder="value…"
                                className="min-w-0 flex-1 border border-black bg-white px-1.5 py-1 font-mono text-[11px] font-bold text-black outline-none"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-1.5 border-t border-black/10">
                            <span className="font-mono text-[10px] font-black uppercase text-black">JUMP TO:</span>
                            <select
                              value={rule.targetPage === 'submit' ? 'submit' : String(rule.targetPage)}
                              onChange={(e) => {
                                const rules = [...(block.jumpRules ?? [])]
                                const val = e.target.value === 'submit' ? 'submit' : Number(e.target.value)
                                rules[i] = { ...rules[i], targetPage: val }
                                updateBlock(formId, block.id, { jumpRules: rules })
                              }}
                              className="flex-1 border-2 border-black bg-[#ffe600] px-2 py-1 font-mono text-[11px] font-black text-black outline-none shadow-[1px_1px_0px_#000]"
                            >
                              {getFormPageLabels(form).map((p) => (
                                <option key={p.pageIndex} value={p.pageIndex}>{p.label}</option>
                              ))}
                              <option value="submit">Submit form</option>
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-[11px] font-bold text-neutral-500">
                    {block.type === 'pageBreak'
                      ? 'No page jumps. Form advances linearly.'
                      : 'No page jumps configured.'}
                  </p>
                )}
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-1.5 border-t-2 border-black pt-3">
              <ActionBtn disabled={index === 0} onClick={() => moveBlock(form.id, index, index - 1)}>
                ↑ Move up
              </ActionBtn>
              <ActionBtn disabled={index === count - 1} onClick={() => moveBlock(form.id, index, index + 1)}>
                ↓ Move down
              </ActionBtn>
              <ActionBtn onClick={() => duplicateBlock(form.id, block.id)}>⧉ Duplicate</ActionBtn>
              {block.colId && (
                <ActionBtn
                  onClick={() => updateBlock(form.id, block.id, { colId: undefined, colWidth: undefined })}
                >
                  ⫴ Break out
                </ActionBtn>
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
    <div className="flex items-center justify-between gap-3 px-2 py-2 border-b border-black/10">
      <div>
        <div className="font-mono text-xs font-black uppercase text-black">{label}</div>
        {hint && <div className="text-[11px] font-bold text-neutral-500">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[11px] font-black uppercase text-black">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border-2 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
      />
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full border-2 border-black transition ${on ? 'bg-[#ffe600]' : 'bg-neutral-200'}`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full border border-black bg-white shadow-[1px_1px_0px_#000] transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
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
      className={`border-2 border-black px-2 py-1.5 font-mono text-[11px] font-black uppercase transition shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
        disabled
          ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-60 shadow-none'
          : danger
          ? 'bg-red-400 text-black hover:bg-red-500'
          : 'bg-white text-black hover:bg-[#ffe600]'
      }`}
    >
      {children}
    </button>
  )
}