import { useEffect, useRef, useState } from 'react'

export function SelectionToolbar({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  const updatePosition = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setCoords(null)
      setHasSelection(false)
      return
    }

    const text = sel.toString().trim()
    if (!text) {
      setCoords(null)
      setHasSelection(false)
      return
    }

    const range = sel.getRangeAt(0)
    const container = containerRef.current
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setCoords(null)
      setHasSelection(false)
      return
    }

    // Ensure the selection is inside a contentEditable node
    let node: Node | null = range.startContainer
    let isEditable = false
    while (node && node !== container) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).isContentEditable) {
        isEditable = true
        break
      }
      node = node.parentNode
    }

    if (!isEditable) {
      setCoords(null)
      setHasSelection(false)
      return
    }

    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setCoords(null)
      setHasSelection(false)
      return
    }

    savedRangeRef.current = range.cloneRange()
    setHasSelection(true)
    setCoords({
      top: Math.max(10, rect.top - 52),
      left: Math.max(12, rect.left + rect.width / 2),
    })
  }

  useEffect(() => {
    document.addEventListener('selectionchange', updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('selectionchange', updatePosition)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [containerRef])

  const formatSelection = (wrapper: string, endWrapper = wrapper) => {
    let range = savedRangeRef.current
    const sel = window.getSelection()

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0)
    }

    if (!range) return
    const text = range.toString()
    if (!text) return

    let nextText = ''
    if (text.startsWith(wrapper) && text.endsWith(endWrapper)) {
      nextText = text.slice(wrapper.length, text.length - endWrapper.length)
    } else {
      nextText = `${wrapper}${text}${endWrapper}`
    }

    // Use document.execCommand('insertText') if supported to preserve undo stack,
    // otherwise manual DOM node replacement
    let inserted = false
    try {
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(range)
        inserted = document.execCommand('insertText', false, nextText)
      }
    } catch {
      inserted = false
    }

    let targetEl: HTMLElement | null = null

    if (!inserted) {
      range.deleteContents()
      const textNode = document.createTextNode(nextText)
      range.insertNode(textNode)

      const newRange = document.createRange()
      newRange.selectNodeContents(textNode)
      sel?.removeAllRanges()
      sel?.addRange(newRange)
      savedRangeRef.current = newRange.cloneRange()
      targetEl = textNode.parentElement
    } else {
      const activeSel = window.getSelection()
      if (activeSel && activeSel.rangeCount > 0) {
        savedRangeRef.current = activeSel.getRangeAt(0).cloneRange()
        targetEl = activeSel.anchorNode?.parentElement ?? null
      }
    }

    // Traverse up to the closest contentEditable element and dispatch input event
    while (targetEl && !targetEl.isContentEditable && targetEl !== document.body) {
      targetEl = targetEl.parentElement
    }

    if (targetEl) {
      targetEl.dispatchEvent(new Event('input', { bubbles: true }))
      targetEl.dispatchEvent(new Event('change', { bubbles: true }))
    }

    updatePosition()
  }

  const formatLink = () => {
    let range = savedRangeRef.current
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0)
    }
    if (!range) return
    const text = range.toString()
    if (!text) return

    const url = window.prompt('Enter link URL:', 'https://')
    if (!url || !url.trim() || url === 'https://') return

    const nextText = `[${text}](${url.trim()})`

    let inserted = false
    try {
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(range)
        inserted = document.execCommand('insertText', false, nextText)
      }
    } catch {
      inserted = false
    }

    let targetEl: HTMLElement | null = null

    if (!inserted) {
      range.deleteContents()
      const textNode = document.createTextNode(nextText)
      range.insertNode(textNode)

      const newRange = document.createRange()
      newRange.selectNodeContents(textNode)
      sel?.removeAllRanges()
      sel?.addRange(newRange)
      savedRangeRef.current = newRange.cloneRange()
      targetEl = textNode.parentElement
    } else {
      const activeSel = window.getSelection()
      if (activeSel && activeSel.rangeCount > 0) {
        savedRangeRef.current = activeSel.getRangeAt(0).cloneRange()
        targetEl = activeSel.anchorNode?.parentElement ?? null
      }
    }

    while (targetEl && !targetEl.isContentEditable && targetEl !== document.body) {
      targetEl = targetEl.parentElement
    }

    if (targetEl) {
      targetEl.dispatchEvent(new Event('input', { bubbles: true }))
      targetEl.dispatchEvent(new Event('change', { bubbles: true }))
    }

    updatePosition()
  }

  // Keyboard shortcut listener for Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const container = containerRef.current
      if (!container) return

      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) return

      const range = sel.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) return

      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toLowerCase()
        if (key === 'b') {
          e.preventDefault()
          formatSelection('**')
        } else if (key === 'i') {
          e.preventDefault()
          formatSelection('*')
        } else if (key === 'u') {
          e.preventDefault()
          formatSelection('<u>', '</u>')
        } else if (key === 'k') {
          e.preventDefault()
          formatLink()
        } else if (key === 'e') {
          e.preventDefault()
          formatSelection('`')
        } else if (key === 'h') {
          e.preventDefault()
          formatSelection('==')
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!coords || !hasSelection) return null

  return (
    <div
      className="animate-pop fixed z-50 flex items-center gap-1 border-2 border-black bg-white px-1.5 py-1 text-black shadow-[4px_4px_0px_#000] -translate-x-1/2 font-mono text-xs"
      style={{ top: coords.top, left: coords.left }}
      onMouseDown={(e) => {
        // Prevent clicking toolbar buttons from unfocusing / deselecting the text!
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => formatSelection('**')}
        className="flex h-7 w-7 items-center justify-center border border-black bg-white hover:bg-[#ffe600] font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => formatSelection('*')}
        className="flex h-7 w-7 items-center justify-center border border-black bg-white hover:bg-[#5ce1e6] italic font-serif font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Italic (Ctrl+I)"
      >
        i
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => formatSelection('<u>', '</u>')}
        className="flex h-7 w-7 items-center justify-center border border-black bg-white hover:bg-[#ff90e8] underline font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Underline (Ctrl+U)"
      >
        U
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => formatSelection('~~')}
        className="flex h-7 w-7 items-center justify-center border border-black bg-white hover:bg-[#ff5a27] hover:text-white line-through font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Strikethrough"
      >
        S
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => formatSelection('==')}
        className="flex h-7 w-7 items-center justify-center border border-black bg-[#ffe600] hover:bg-yellow-300 font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Highlight (Ctrl+H)"
      >
        ★
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => formatSelection('`')}
        className="flex h-7 w-7 items-center justify-center border border-black bg-white hover:bg-neutral-100 font-mono text-[10px] font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Inline code (Ctrl+E)"
      >
        &lt;/&gt;
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={formatLink}
        className="flex h-7 w-7 items-center justify-center border border-black bg-white hover:bg-[#00ef84] shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        title="Insert Link (Ctrl+K)"
      >
        🔗
      </button>
    </div>
  )
}
