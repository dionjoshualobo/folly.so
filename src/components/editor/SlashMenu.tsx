import { useEffect, useRef } from 'react'
import { GROUPS, Icon, searchBlocks } from '../../blockCatalog'
import type { BlockType } from '../../types'

export function SlashMenu({
  query,
  onSelect,
  onClose,
  anchorRect,
}: {
  query: string
  onSelect: (type: BlockType) => void
  onClose: () => void
  anchorRect: DOMRect | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const results = searchBlocks(query)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [query, results.length])

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onMouse)
    return () => document.removeEventListener('mousedown', onMouse)
  }, [onClose])

  const top = anchorRect ? Math.min(anchorRect.bottom + 4, window.innerHeight - 380) : 120
  const left = anchorRect ? Math.max(12, Math.min(anchorRect.left, window.innerWidth - 360)) : 24

  return (
    <div
      ref={ref}
      className="animate-pop fixed z-50 w-[350px] overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0px_#000]"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between border-b-2 border-black bg-[#ffe600] px-3.5 py-2 font-mono text-xs font-black uppercase text-black">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center border border-black bg-white font-mono text-xs font-black shadow-[1px_1px_0px_#000]">
            /
          </span>
          <span>{query ? `SEARCH: "${query}"` : 'INSERT BLOCK'}</span>
        </div>
        <span className="text-[10px] text-neutral-600">[ ESC TO CLOSE ]</span>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-2 bg-[#fffdfa]">
        {results.length === 0 && (
          <div className="px-3 py-6 text-center font-mono text-xs font-bold text-neutral-500">
            NO BLOCKS MATCH “{query}”.
          </div>
        )}
        {GROUPS.map((group) => {
          const items = results.filter((b) => b.group === group)
          if (items.length === 0) return null
          return (
            <div key={group} className="mb-2">
              <div className="px-2 pb-1 pt-2 font-mono text-[10px] font-black uppercase tracking-wider text-neutral-500">
                {group}
              </div>
              <div className="space-y-1">
                {items.map((b) => (
                  <button
                    key={b.type}
                    ref={b.type === results[0]?.type ? activeRef : undefined}
                    onClick={() => onSelect(b.type)}
                    className="flex w-full items-center gap-3 border border-transparent p-2 text-left transition hover:border-black hover:bg-[#ffe600]/30 hover:shadow-[2px_2px_0px_#000]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-white text-black shadow-[1px_1px_0px_#000]">
                      <Icon name={b.type} className="h-4 w-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-black uppercase tracking-tight text-black">{b.label}</span>
                      <span className="block text-[11px] font-medium text-neutral-600 truncate">{b.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
