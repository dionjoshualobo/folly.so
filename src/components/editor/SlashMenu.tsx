import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const isMouseMoving = useRef(false)

  const displayedBlocks = useMemo(() => {
    const grouped = GROUPS.flatMap((group) => results.filter((b) => b.group === group))
    const others = results.filter((b) => !GROUPS.includes(b.group))
    return [...grouped, ...others]
  }, [results])

  const safeIndex = displayedBlocks.length > 0
    ? Math.min(Math.max(0, selectedIndex), displayedBlocks.length - 1)
    : -1

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [safeIndex])

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onMouse)
    return () => document.removeEventListener('mousedown', onMouse)
  }, [onClose])

  const selectedIndexRef = useRef(safeIndex)
  selectedIndexRef.current = safeIndex
  const displayedBlocksRef = useRef(displayedBlocks)
  displayedBlocksRef.current = displayedBlocks
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        isMouseMoving.current = false
        const total = displayedBlocksRef.current.length
        if (total > 0) {
          setSelectedIndex((prev) => (prev + 1) % total)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        isMouseMoving.current = false
        const total = displayedBlocksRef.current.length
        if (total > 0) {
          setSelectedIndex((prev) => (prev - 1 + total) % total)
        }
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        e.stopPropagation()
        const blocks = displayedBlocksRef.current
        const idx = selectedIndexRef.current
        if (blocks.length > 0 && idx >= 0 && idx < blocks.length) {
          onSelectRef.current(blocks[idx].type)
        } else {
          onCloseRef.current()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onCloseRef.current()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  const top = anchorRect ? Math.min(anchorRect.bottom + 4, window.innerHeight - 380) : 120
  const left = anchorRect ? Math.max(12, Math.min(anchorRect.left, window.innerWidth - 360)) : 24

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label="Slash commands"
      className="animate-pop fixed z-50 w-[340px] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-pop"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
      onMouseMove={() => {
        isMouseMoving.current = true
      }}
    >
      <div className="flex items-center gap-2 border-b border-ink/[0.06] px-3 py-2 text-[12px] text-ink/40">
        <span className="flex h-4 w-4 items-center justify-center rounded bg-ink/[0.06] font-mono text-[10px] font-bold text-ink/60">
          /
        </span>
        {query ? (
          <span>
            <span className="font-medium text-ink/70">‘{query}’</span>
            — no results? try another block
          </span>
        ) : (
          <span>Insert block</span>
        )}
      </div>
      <div className="max-h-[320px] overflow-y-auto p-1.5">
        {results.length === 0 && (
          <div className="px-3 py-6 text-center text-[13px] text-ink/40">Nothing matches “{query}”.</div>
        )}
        {GROUPS.map((group) => {
          const items = results.filter((b) => b.group === group)
          if (items.length === 0) return null
          return (
            <div key={group}>
              <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink/35">{group}</div>
              {items.map((b) => {
                const isSelected = safeIndex >= 0 && displayedBlocks[safeIndex]?.type === b.type
                return (
                  <button
                    key={b.type}
                    role="option"
                    aria-selected={isSelected}
                    ref={isSelected ? activeRef : undefined}
                    onMouseEnter={() => {
                      if (!isMouseMoving.current) return
                      const idx = displayedBlocks.findIndex((item) => item.type === b.type)
                      if (idx !== -1) setSelectedIndex(idx)
                    }}
                    onClick={() => onSelect(b.type)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                      isSelected ? 'bg-ink/[0.08]' : 'hover:bg-ink/[0.04]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink/70 transition ${
                        isSelected ? 'bg-white shadow-sm' : 'bg-ink/[0.04]'
                      }`}
                    >
                      <Icon name={b.type} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{b.label}</span>
                      <span className="block text-[12px] text-ink/45">{b.hint}</span>
                    </span>
                    {b.shortcut && (
                      <kbd
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition ${
                          isSelected ? 'bg-white/80 text-ink/60 shadow-sm' : 'bg-ink/[0.05] text-ink/40'
                        }`}
                      >
                        {b.shortcut}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="border-t border-ink/[0.06] px-3 py-2 text-[11px] text-ink/35">
        <kbd className="rounded bg-ink/[0.05] px-1 py-0.5 font-mono">↑↓</kbd> to navigate · <kbd className="rounded bg-ink/[0.05] px-1 py-0.5 font-mono">↵</kbd> to insert · <kbd className="rounded bg-ink/[0.05] px-1 py-0.5 font-mono">esc</kbd> to close
      </div>
    </div>
  )
}