import { Fragment, type ReactNode } from 'react'

export function RichText({ text }: { text: string }) {
  if (!text) return null

  // Supports Markdown & inline HTML formatting:
  // 1. Markdown Links: [label](url)
  // 2. HTML Links: <a href="url">label</a>
  // 3. Bold: **text**, <b>text</b>, <strong>text</strong>
  // 4. Strikethrough: ~~text~~, <s>text</s>, <del>text</del>, <strike>text</strike>
  // 5. Code: `code`, <code>code</code>
  // 6. Underline: <u>text</u>, __text__
  // 7. Highlight: <mark>text</mark>, ==text==
  // 8. Italic: *text*, _text_, <i>text</i>, <em>text</em>
  const regex = /(\[[^\]]+\]\([^)]+\)|<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>|\*\*[^*]+\*\*|<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>|~~[^~]+~~|<s>[\s\S]*?<\/s>|<del>[\s\S]*?<\/del>|<strike>[\s\S]*?<\/strike>|`[^`]+`|<code>[\s\S]*?<\/code>|<u>[\s\S]*?<\/u>|__[^_]+__|==[^=]+==|<mark>[\s\S]*?<\/mark>|\*[^*]+\*|<i>[\s\S]*?<\/i>|<em>[\s\S]*?<\/em>)/gi
  const parts: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    }
    const token = m[0]
    const lower = token.toLowerCase()

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
          className="text-black font-bold underline decoration-2 underline-offset-2 hover:bg-[#ffe600] transition-colors"
        >
          {label}
        </a>,
      )
    } else if (lower.startsWith('<a ') && lower.endsWith('</a>')) {
      const hrefMatch = token.match(/href=["']([^"']*)["']/i)
      const contentMatch = token.match(/>([\s\S]*?)<\/a>/i)
      const url = hrefMatch ? hrefMatch[1] : '#'
      const label = contentMatch ? contentMatch[1] : url
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-black font-bold underline decoration-2 underline-offset-2 hover:bg-[#ffe600] transition-colors"
        >
          {label}
        </a>,
      )
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key++} className="font-black text-current">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (lower.startsWith('<b>') && lower.endsWith('</b>')) {
      parts.push(
        <strong key={key++} className="font-black text-current">
          {token.slice(3, -4)}
        </strong>,
      )
    } else if (lower.startsWith('<strong>') && lower.endsWith('</strong>')) {
      parts.push(
        <strong key={key++} className="font-black text-current">
          {token.slice(8, -9)}
        </strong>,
      )
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      parts.push(
        <span key={key++} className="line-through decoration-2 opacity-75">
          {token.slice(2, -2)}
        </span>,
      )
    } else if (lower.startsWith('<s>') && lower.endsWith('</s>')) {
      parts.push(
        <span key={key++} className="line-through decoration-2 opacity-75">
          {token.slice(3, -4)}
        </span>,
      )
    } else if (lower.startsWith('<del>') && lower.endsWith('</del>')) {
      parts.push(
        <span key={key++} className="line-through decoration-2 opacity-75">
          {token.slice(5, -6)}
        </span>,
      )
    } else if (lower.startsWith('<strike>') && lower.endsWith('</strike>')) {
      parts.push(
        <span key={key++} className="line-through decoration-2 opacity-75">
          {token.slice(8, -9)}
        </span>,
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={key++} className="border border-black bg-[#ffe600]/30 px-1.5 py-0.5 font-mono text-[0.88em] font-bold text-black">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (lower.startsWith('<code>') && lower.endsWith('</code>')) {
      parts.push(
        <code key={key++} className="border border-black bg-[#ffe600]/30 px-1.5 py-0.5 font-mono text-[0.88em] font-bold text-black">
          {token.slice(6, -7)}
        </code>,
      )
    } else if (lower.startsWith('<u>') && lower.endsWith('</u>')) {
      parts.push(
        <u key={key++} className="underline underline-offset-3 decoration-2">
          {token.slice(3, -4)}
        </u>,
      )
    } else if (token.startsWith('__') && token.endsWith('__')) {
      parts.push(
        <u key={key++} className="underline underline-offset-3 decoration-2">
          {token.slice(2, -2)}
        </u>,
      )
    } else if (lower.startsWith('<mark>') && lower.endsWith('</mark>')) {
      parts.push(
        <mark key={key++} className="bg-[#ffe600] text-black font-bold px-1 border border-black shadow-[1px_1px_0px_#000]">
          {token.slice(6, -7)}
        </mark>,
      )
    } else if (token.startsWith('==') && token.endsWith('==')) {
      parts.push(
        <mark key={key++} className="bg-[#ffe600] text-black font-bold px-1 border border-black shadow-[1px_1px_0px_#000]">
          {token.slice(2, -2)}
        </mark>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={key++} className="italic font-serif">
          {token.slice(1, -1)}
        </em>,
      )
    } else if (lower.startsWith('<i>') && lower.endsWith('</i>')) {
      parts.push(
        <em key={key++} className="italic font-serif">
          {token.slice(3, -4)}
        </em>,
      )
    } else if (lower.startsWith('<em>') && lower.endsWith('</em>')) {
      parts.push(
        <em key={key++} className="italic font-serif">
          {token.slice(4, -5)}
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
