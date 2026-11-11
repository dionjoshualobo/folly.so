import { Link } from 'react-router-dom'
import type { FormTheme } from '../types'

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center border-2 border-black bg-[#ffe600] text-black font-black shadow-[2px_2px_0px_#000000] text-sm ${className}`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      aria-hidden
    >
      f/
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
    <Link to={to} className={`flex items-center gap-2.5 group ${className}`}>
      <LogoMark />
      <span
        className={`text-[20px] font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        folly<span className="text-[#ff5470]">.so</span>
      </span>
    </Link>
  )
}

export function NeoWindowHeader({
  title,
  subtitle,
  actions,
  bgColor = 'bg-black',
  textColor = 'text-white',
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  bgColor?: string
  textColor?: string
}) {
  return (
    <div className={`border-b-2 border-black ${bgColor} ${textColor} px-3.5 py-2 flex items-center justify-between font-mono text-xs font-bold select-none`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-black bg-[#ff5470] inline-block shadow-[1px_1px_0px_#000]" />
          <span className="h-3 w-3 rounded-full border border-black bg-[#ffe600] inline-block shadow-[1px_1px_0px_#000]" />
          <span className="h-3 w-3 rounded-full border border-black bg-[#00ef84] inline-block shadow-[1px_1px_0px_#000]" />
        </div>
        <span className="ml-2 truncate uppercase tracking-wider">{title}</span>
        {subtitle && <span className="opacity-60 text-[10px] hidden sm:inline">{subtitle}</span>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function themeFont(font: FormTheme['font']): string {
  if (font === 'serif') return 'Georgia, "Times New Roman", serif'
  if (font === 'playful') return "'Space Grotesk', ui-monospace, monospace"
  if (font === 'classic') return "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif"
  if (font === 'rounded') return "'SF Pro Rounded', 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif"
  if (font === 'geometric') return "Futura, 'Century Gothic', 'Avenir Next', 'Trebuchet MS', sans-serif"
  if (font === 'typewriter') return "ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  if (font === 'custom') return '"CustomFont", system-ui, -apple-system, sans-serif'
  return "'Inter', system-ui, -apple-system, sans-serif"
}
