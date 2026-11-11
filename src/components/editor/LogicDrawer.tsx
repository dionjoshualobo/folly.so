import type { Form } from '../../types'
import { Icon } from '../../blockCatalog'
import { getQuestionLabel, questionOptions } from '../../lib/logic'

export function LogicDrawer({ form, onClose, onOpenSettings }: { form: Form; onClose: () => void; onOpenSettings: (blockId: string) => void }) {
  const questions = questionOptions(form)
  const logicBlocks = form.blocks.filter((b) => b.showIf && b.showIf.length > 0)
  const jumpBlocks = form.blocks.filter((b) => b.jumpRules && b.jumpRules.length > 0)
  const totalRules = logicBlocks.length + jumpBlocks.length

  return (
    <div className="animate-fade fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="animate-pop absolute right-0 top-0 flex h-full w-[340px] flex-col border-l-3 border-black bg-white shadow-[-8px_0px_0px_#000] sm:w-[420px]">
        {/* Retro Window Header */}
        <div className="border-b-2 border-black bg-[#ffe600] px-4 py-3 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400 border border-black" />
            <span className="h-3 w-3 rounded-full bg-yellow-400 border border-black" />
            <span className="h-3 w-3 rounded-full bg-green-400 border border-black" />
            <span className="ml-1 font-black">LOGIC_GRAPH.EXE</span>
            {totalRules > 0 && (
              <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold">
                {totalRules} {totalRules === 1 ? 'RULE' : 'RULES'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-2 py-0.5 text-xs font-black hover:bg-red-500"
          >
            [ X ]
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {totalRules === 0 ? (
            <div className="text-center text-ink/40 text-[13px] mt-10">
              No logic rules have been set yet. <br /> Open a block's settings to add conditional visibility or page jumps.
            </div>
          ) : (
            <>
              {/* Show/Hide Rules */}
              {logicBlocks.length > 0 && (
                <div>
                  <div className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-ink/40">
                    Show / Hide Conditions ({logicBlocks.length})
                  </div>
                  <div className="space-y-3">
                    {logicBlocks.map((block) => (
                      <div key={block.id} className="rounded-xl border border-ink/15 bg-white shadow-sm p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-[13px] font-bold text-ink truncate pr-2">
                            {getQuestionLabel(block)}
                          </div>
                          <button
                            onClick={() => {
                              onClose()
                              onOpenSettings(block.id)
                            }}
                            className="shrink-0 rounded bg-ink/[0.05] px-2 py-1 text-[11px] font-semibold text-ink/60 hover:bg-ink/10"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="text-[11px] text-ink/50 mb-1">Shown when:</div>
                        <div className="space-y-1">
                          {block.showIf?.map((cond, i) => {
                            const target = questions.find((q) => q.id === cond.fieldId)
                            const opLabel = {
                              equals: 'is',
                              notEquals: 'is not',
                              contains: 'contains',
                              notContains: 'does not contain',
                              greaterThan: '>',
                              lessThan: '<',
                            }[cond.op]
                            return (
                              <div key={i} className="flex items-center gap-1.5 text-[12px] bg-ink/[0.02] rounded px-2 py-1.5 border border-ink/5 overflow-hidden">
                                <span className="font-semibold text-ink/70 truncate shrink-0 max-w-[120px]" title={target?.label}>
                                  {target?.label ?? 'Unknown'}
                                </span>
                                <span className="text-ink/40 shrink-0">{opLabel}</span>
                                <span className="font-mono text-[11px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded truncate min-w-0">
                                  {cond.value}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page Jump Rules */}
              {jumpBlocks.length > 0 && (
                <div>
                  <div className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-ink/40">
                    Page Jump Branching ({jumpBlocks.length})
                  </div>
                  <div className="space-y-3">
                    {jumpBlocks.map((block) => (
                      <div key={block.id} className="rounded-xl border border-ink/15 bg-white shadow-sm p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-[13px] font-bold text-ink truncate pr-2">
                            {block.type === 'pageBreak' ? 'Page Break' : getQuestionLabel(block)}
                          </div>
                          <button
                            onClick={() => {
                              onClose()
                              onOpenSettings(block.id)
                            }}
                            className="shrink-0 rounded bg-ink/[0.05] px-2 py-1 text-[11px] font-semibold text-ink/60 hover:bg-ink/10"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {block.jumpRules?.map((rule, i) => {
                            const target = questions.find((q) => q.id === rule.fieldId)
                            const opLabel = {
                              equals: 'is',
                              notEquals: 'is not',
                              contains: 'contains',
                              notContains: 'does not contain',
                              greaterThan: '>',
                              lessThan: '<',
                            }[rule.op]
                            const destLabel = rule.targetPage === 'submit' ? 'Submit form' : `Page ${Number(rule.targetPage) + 1}`
                            return (
                              <div key={i} className="flex flex-col gap-1 text-[12px] bg-ink/[0.02] rounded p-2 border border-ink/5">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <span className="text-ink/40 text-[10px] uppercase font-bold">If</span>
                                  <span className="font-semibold text-ink/70 truncate shrink-0 max-w-[120px]" title={target?.label}>
                                    {target?.label ?? 'Unknown'}
                                  </span>
                                  <span className="text-ink/40 shrink-0">{opLabel}</span>
                                  <span className="font-mono text-[11px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded truncate min-w-0">
                                    {rule.value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-ink/60 pt-0.5">
                                  <span className="text-ink/40 text-[10px] uppercase font-bold">Then Jump to:</span>
                                  <span className="font-bold text-brand-600">{destLabel}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
