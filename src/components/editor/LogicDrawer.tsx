import type { Form } from '../../types'
import { Icon } from '../../blockCatalog'
import { getQuestionLabel, questionOptions } from '../../lib/logic'

export function LogicDrawer({ form, onClose, onOpenSettings }: { form: Form; onClose: () => void; onOpenSettings: (blockId: string) => void }) {
  const questions = questionOptions(form)
  const logicBlocks = form.blocks.filter((b) => b.showIf && b.showIf.length > 0)

  return (
    <div className="animate-fade fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="animate-pop absolute right-0 top-0 flex h-full w-[340px] flex-col bg-white shadow-pop sm:w-[400px]">
        <div className="flex items-center justify-between border-b border-ink/[0.06] px-5 py-3.5">
          <div className="text-[15px] font-bold text-ink">Logic Map</div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-ink/40 hover:bg-ink/[0.05] hover:text-ink">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {logicBlocks.length === 0 ? (
             <div className="text-center text-ink/40 text-[13px] mt-10">
               No logic rules have been set yet. <br/> Open a block's settings to add branching logic.
             </div>
          ) : (
             <div className="space-y-4">
                {logicBlocks.map(block => (
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
                           const target = questions.find(q => q.id === cond.fieldId)
                           const opLabel = {
                              equals: 'is',
                              notEquals: 'is not',
                              contains: 'contains',
                              notContains: 'does not contain',
                              greaterThan: '>',
                              lessThan: '<'
                           }[cond.op]
                           return (
                              <div key={i} className="flex items-center gap-1.5 text-[12px] bg-ink/[0.02] rounded px-2 py-1.5 border border-ink/5 overflow-hidden">
                                 <span className="font-semibold text-ink/70 truncate shrink-0 max-w-[120px]" title={target?.label}>{target?.label ?? 'Unknown'}</span>
                                 <span className="text-ink/40 shrink-0">{opLabel}</span>
                                 <span className="font-mono text-[11px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded truncate min-w-0">{cond.value}</span>
                              </div>
                           )
                        })}
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
