import { Link } from 'react-router-dom'
import type { FormTheme } from '../types'

export function LogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[9px] bg-brand-500 text-white font-black ${className}`}
      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      aria-hidden
    >
      f
    </span>
  )
}

export function Logo({
  to = '/',
  dark = false,
  className = '',
}: {
  to?: string
  dark?: boolean
  className?: string
}) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span
        className={`text-[19px] font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        Folly
      </span>
    </Link>
  )
}

export function themeFont(font: FormTheme['font']): string {
  if (font === 'serif') return 'Georgia, "Times New Roman", serif'
  if (font === 'playful') return "'Space Grotesk', ui-monospace, monospace"
  if (font === 'custom') return '"CustomFont", system-ui, -apple-system, sans-serif'
  return "'Inter', system-ui, -apple-system, sans-serif"
}