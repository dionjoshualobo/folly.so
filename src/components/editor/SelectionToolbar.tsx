import { useEffect, useState } from 'react'

export function SelectionToolbar({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)

  useEffect(() => {
    const updatePosition = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setCoords(null)
        setSelectedRange(null)
        return
      }

      const text = sel.toString().trim()
      if (!text) {
        setCoords(null)
        setSelectedRange(null)
        return
      }

      const range = sel.getRangeAt(0)
      const container = containerRef.current
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setCoords(null)
        setSelectedRange(null)
        return
      }

      // Ensure the selection is inside a contentEditable node
      const anchorNode = sel.anchorNode
      const element = anchorNode?.nodeType === Node.ELEMENT_NODE ? (anchorNode as HTMLElement) : anchorNode?.parentElement
      if (!element || !element.isContentEditable) {
        setCoords(null)
        setSelectedRange(null)
        return
      }

      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setCoords(null)
        setSelectedRange(null)
        return
      }

      setSelectedRange(range)
      setCoords({
        top: Math.max(10, rect.top - 46),
        left: Math.max(10, rect.left + rect.width / 2),
      })
    }

    document.addEventListener('selectionchange', updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('selectionchange', updatePosition)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [containerRef])

  if (!coords || !selectedRange) return null

  const formatSelection = (wrapper: string, endWrapper = wrapper) => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    const text = range.toString()
    if (!text) return

    let nextText = ''
    if (text.startsWith(wrapper) && text.endsWith(endWrapper)) {
      nextText = text.slice(wrapper.length, text.length - endWrapper.length)
    } else {
      nextText = `${wrapper}${text}${endWrapper}`
    }

    range.deleteContents()
    const textNode = document.createTextNode(nextText)
    range.insertNode(textNode)

    // Re-select newly inserted formatted text
    const newRange = document.createRange()
    newRange.selectNodeContents(textNode)
    sel.removeAllRanges()
    sel.addRange(newRange)

    // Dispatch input to sync React state
    const el = textNode.parentElement
    if (el) {
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  const formatLink = () => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    const text = range.toString()
    if (!text) return

    const url = window.prompt('Enter link URL (e.g. https://example.com):', 'https://')
    if (!url || !url.trim() || url === 'https://') return

    const nextText = `[${text}](${url.trim()})`
    range.deleteContents()
    const textNode = document.createTextNode(nextText)
    range.insertNode(textNode)

    const newRange = document.createRange()
    newRange.selectNodeContents(textNode)
    sel.removeAllRanges()
    sel.addRange(newRange)

    const el = textNode.parentElement
    if (el) {
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  return (
    <div
      className="animate-pop fixed z-50 flex items-center gap-1 border-2 border-black bg-black px-2 py-1 text-white shadow-[4px_4px_0px_#ffe600] -translate-x-1/2 font-mono text-xs"
      style={{ top: coords.top, left: coords.left }}
      onMouseDown={(e) => {
        // Prevent clicking toolbar buttons from unfocusing / deselecting the text!
        e.preventDefault()
      }}
    >
      <button
        onClick={() => formatSelection('**')}
        className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-black hover:bg-[#ffe600] hover:text-black font-black transition"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        onClick={() => formatSelection('*')}
        className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-black hover:bg-[#ffe600] hover:text-black italic font-serif font-black transition"
        title="Italic (Ctrl+I)"
      >
        i
      </button>
      <button
        onClick={() => formatSelection('<u>', '</u>')}
        className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-black hover:bg-[#ffe600] hover:text-black underline font-black transition"
        title="Underline"
      >
        U
      </button>
      <button
        onClick={() => formatSelection('~~')}
        className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-black hover:bg-[#ffe600] hover:text-black line-through font-black transition"
        title="Strikethrough"
      >
        S
      </button>
      <button
        onClick={() => formatSelection('`')}
        className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-black hover:bg-[#ffe600] hover:text-black font-mono text-[10px] font-black transition"
        title="Inline code"
      >
        &lt;/&gt;
      </button>
      <button
        onClick={formatLink}
        className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-black hover:bg-[#ffe600] hover:text-black transition"
        title="Insert Link"
      >
        🔗
      </button>
    </div>
  )
}
