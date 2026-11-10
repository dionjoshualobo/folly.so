import { Fragment, type ReactNode } from 'react'

export function RichText({ text }: { text: string }) {
  if (!text) return null

  // Regex matches:
  // 1. Markdown Links: [label](url)
  // 2. Bold: **text**
  // 3. Strikethrough: ~~text~~
  // 4. Inline Code: `code`
  // 5. Underline: <u>text</u> or __text__
  // 6. Italic: *text* or _text_
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|<u>[^<]+<\/u>|__[^_]+__|\*[^*]+\*)/g
  const parts: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    }
    const token = m[0]
    if (token.startsWith('[') && token.includes('](')) {
      const closeBracket = token.indexOf('](')
      const label = token.slice(1, closeBracket)
      const url = token.slice(closeBracket + 2, -1)
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-brand-600 underline font-medium hover:text-brand-700"
        >
          {label}
        </a>,
      )
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-current">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      parts.push(
        <span key={key++} className="line-through opacity-75">
          {token.slice(2, -2)}
        </span>,
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={key++} className="rounded bg-ink/[0.08] dark:bg-white/10 px-1 py-0.5 font-mono text-[0.88em]">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('<u>') && token.endsWith('</u>')) {
      parts.push(
        <u key={key++} className="underline underline-offset-2">
          {token.slice(3, -4)}
        </u>,
      )
    } else if (token.startsWith('__') && token.endsWith('__')) {
      parts.push(
        <u key={key++} className="underline underline-offset-2">
          {token.slice(2, -2)}
        </u>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    }
    last = m.index + token.length
  }

  if (last < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  }

  return <>{parts}</>
}
