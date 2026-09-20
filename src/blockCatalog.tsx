import type { ReactNode } from 'react'
import type { BlockType } from './types'

function Svg({ children, viewBox = '0 0 24 24' }: { children: ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
      {children}
    </svg>
  )
}

export function Icon({ name, className }: { name: BlockType | string; className?: string }) {
  return <span className={className}>{icons[name] ?? icons.shortText}</span>
}

export const icons: Record<string, ReactNode> = {
  heading: (
    <Svg>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h12" />
    </Svg>
  ),
  heading2: (
    <Svg>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h8" />
    </Svg>
  ),
  heading3: (
    <Svg>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h6" />
    </Svg>
  ),
  label: (
    <Svg>
      <path d="M5 8h14" />
      <path d="M5 12h14" />
      <path d="M5 16h8" />
    </Svg>
  ),
  divider: (
    <Svg>
      <path d="M4 12h16" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  embed: (
    <Svg>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="m9 10-2 2 2 2" />
      <path d="m15 10 2 2-2 2" />
    </Svg>
  ),
  paragraph: (
    <Svg>
      <path d="M7 5h10" />
      <path d="M7 9h7" />
      <path d="M7 13h10" />
      <path d="M7 17h5" />
    </Svg>
  ),
  shortText: (
    <Svg>
      <path d="M14 4.5 9.5 19" />
      <path d="M15.5 19 11 4.5" />
    </Svg>
  ),
  longText: (
    <Svg>
      <path d="M7 5h10" />
      <path d="M7 9h10" />
      <path d="M7 13h10" />
    </Svg>
  ),
  multiSelect: (
    <Svg>
      <rect x="4" y="6" width="16" height="12" rx="3" />
      <path d="M8.5 11.5 10 13l2.5-2.5" />
      <path d="M14 13h3" />
    </Svg>
  ),
  ranking: (
    <Svg>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
      <path d="M17 15.5l2 2 2.5-3.5" />
    </Svg>
  ),
  matrix: (
    <Svg>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 4v16" />
      <path d="M4 12h16" />
    </Svg>
  ),
  number: (
    <Svg>
      <path d="M7 6v12" />
      <path d="M17 6v12" />
      <path d="m5 11 14-3" />
      <path d="m5 15 14-3" />
    </Svg>
  ),
  email: (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </Svg>
  ),
  phone: (
    <Svg>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L17 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </Svg>
  ),
  date: (
    <Svg>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </Svg>
  ),
  time: (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Svg>
  ),
  csat: (
    <Svg>
      <path d="M4 18a8 8 0 0 1 16 0" />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  rating: (
    <Svg>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />
    </Svg>
  ),
  nps: (
    <Svg>
      <rect x="6" y="6" width="12" height="12" rx="2" transform="rotate(45 12 12)" />
      <path d="M9.5 15.5v-4M6.5 15.5v-2M12.5 15.5v-7M15.5 15.5v-2M18.5 15.5v-4" />
    </Svg>
  ),
  linear: (
    <Svg>
      <path d="M4 17 10 11" />
      <path d="M10 17 14 13" />
      <path d="M14 17 20 10" />
      <path d="M3 20h18" />
    </Svg>
  ),
  multipleChoice: (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  ),
  checkbox: (
    <Svg>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Svg>
  ),
  dropdown: (
    <Svg>
      <rect x="4" y="6" width="16" height="12" rx="3" />
      <path d="m9 10 3 3 3-3" />
    </Svg>
  ),
  fileUpload: (
    <Svg>
      <path d="M12 15V5" />
      <path d="m8 9 4-4 4 4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Svg>
  ),
  signature: (
    <Svg>
      <path d="M3 17c4-8 10-10 14-6 1.4 1.4 1.4 3.4 0 4.8-1.4 1.4-3.4 1.4-4.8 0-1.3-1.4-.8-3.4 1.2-4.4 2.6-1.3 5.5.4 6.6 2.6 1 2 0 4.5-2 6" />
    </Svg>
  ),
  score: (
    <Svg>
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M7 12h4" />
      <path d="m8 12 3 3 5-6" />
    </Svg>
  ),
  image: (
    <Svg>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m4 17 5-4 4 3 3.5-3 3.5 4" />
    </Svg>
  ),
  pageBreak: (
    <Svg>
      <path d="M7 12h10" />
      <path d="M5 3h14" />
      <circle cx="12" cy="21" r="0" />
    </Svg>
  ),
  thankYou: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </Svg>
  ),
  plus: (
    <Svg>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  dots: (
    <Svg viewBox="0 0 24 8">
      <circle cx="4" cy="4" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="20" cy="4" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  ),
  chevron: (
    <Svg>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  trash: (
    <Svg>
      <path d="M5 7h14" />
      <path d="M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
      <path d="M7 7l.6 12a2 2 0 0 0 2 1.9h4.8a2 2 0 0 0 2-1.9L17 7" />
      <path d="M10 11v6M14 11v6" />
    </Svg>
  ),
  duplicate: (
    <Svg>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Svg>
  ),
  moveUp: (
    <Svg>
      <path d="m5 10 7-6 7 6" />
      <path d="M12 4v16" />
    </Svg>
  ),
  moveDown: (
    <Svg>
      <path d="m5 14 7 6 7-6" />
      <path d="M12 20V4" />
    </Svg>
  ),
  gear: (
    <Svg>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.15-1.4l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.4-1.4L14 2.6h-4l-.15 2.1a7 7 0 0 0-2.4 1.4l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .15 1.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.4 1.4l.15 2.1h4l.15-2.1a7 7 0 0 0 2.4-1.4l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12Z" />
    </Svg>
  ),
  arrowUp: (
    <Svg>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </Svg>
  ),
  arrowDown: (
    <Svg>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </Svg>
  ),
  back: (
    <Svg>
      <path d="M15 19l-7-7 7-7" />
    </Svg>
  ),
  share: (
    <Svg>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </Svg>
  ),
  theme: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-3 2-4 4-4 1.4 0 2-.5 3-1.5a9 9 0 0 0-9-10.5Z" />
    </Svg>
  ),
  link: (
    <Svg>
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </Svg>
  ),
  copy: (
    <Svg>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Svg>
  ),
  check: (
    <Svg>
      <path d="m4.5 12.5 5 5 10-11" />
    </Svg>
  ),
  close: (
    <Svg>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  ),
  download: (
    <Svg>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </Svg>
  ),
}

export interface BlockDef {
  type: BlockType
  label: string
  hint: string
  group: string
  shortcut?: string
}

export const BLOCKS: BlockDef[] = [
  { type: 'heading', label: 'Heading', hint: 'Large heading text', group: 'Layout', shortcut: '# ' },
  { type: 'heading2', label: 'Heading 2', hint: 'Medium heading text', group: 'Layout', shortcut: '## ' },
  { type: 'heading3', label: 'Heading 3', hint: 'Small heading text', group: 'Layout', shortcut: '### ' },
  { type: 'label', label: 'Label', hint: 'Small bold label text', group: 'Layout', shortcut: 'label' },
  { type: 'paragraph', label: 'Text', hint: 'Paragraph of text', group: 'Layout', shortcut: 'txt' },
  { type: 'divider', label: 'Divider', hint: 'Horizontal divider line', group: 'Layout', shortcut: 'divider' },
  { type: 'image', label: 'Image / GIF', hint: 'Embed an image', group: 'Layout', shortcut: 'image' },
  { type: 'embed', label: 'YouTube, Vimeo or Maps', hint: 'Embed video, audio or maps', group: 'Layout', shortcut: 'embed' },
  { type: 'shortText', label: 'Short text', hint: 'One line of text', group: 'Inputs', shortcut: 'short' },
  { type: 'longText', label: 'Long text', hint: 'Multiple lines of text', group: 'Inputs', shortcut: 'long' },
  { type: 'number', label: 'Number', hint: 'Numeric input', group: 'Inputs', shortcut: 'number' },
  { type: 'email', label: 'Email', hint: 'Email address', group: 'Inputs', shortcut: 'email' },
  { type: 'phone', label: 'Phone', hint: 'Phone number', group: 'Inputs', shortcut: 'phone' },
  { type: 'link', label: 'Link', hint: 'Website / URL input', group: 'Inputs', shortcut: 'link' },
  { type: 'date', label: 'Date', hint: 'Date picker', group: 'Inputs', shortcut: 'date' },
  { type: 'time', label: 'Time', hint: 'Time picker', group: 'Inputs', shortcut: 'time' },
  { type: 'fileUpload', label: 'File upload', hint: 'Collect files from respondents', group: 'Inputs', shortcut: 'file' },
  { type: 'signature', label: 'Signature', hint: 'Collect a written signature', group: 'Inputs', shortcut: 'sign' },
  { type: 'multipleChoice', label: 'Multiple choice', hint: 'Pick one option from a list', group: 'Questions', shortcut: 'multiple [a]' },
  { type: 'checkbox', label: 'Checkbox', hint: 'Pick multiple options', group: 'Questions', shortcut: 'checkbox []' },
  { type: 'dropdown', label: 'Dropdown', hint: 'Choose one option from a dropdown', group: 'Questions', shortcut: 'dropdown [v]' },
  { type: 'multiSelect', label: 'Multi-select', hint: 'Pick multiple options from a searchable dropdown', group: 'Questions', shortcut: 'multi-select' },
  { type: 'ranking', label: 'Ranking', hint: 'Rank options in order of preference', group: 'Questions', shortcut: 'ranking' },
  { type: 'matrix', label: 'Matrix', hint: 'Grid of rows × columns (Likert scale)', group: 'Questions', shortcut: 'matrix' },
  { type: 'rating', label: 'Rating', hint: 'Rate with icons (1–10)', group: 'Rating & Scale', shortcut: 'rating' },
  { type: 'csat', label: 'CSAT', hint: 'Customer satisfaction scale (1–5)', group: 'Rating & Scale', shortcut: 'csat' },
  { type: 'linear', label: 'Linear scale', hint: 'Rate on a numeric scale', group: 'Rating & Scale', shortcut: 'linear' },
  { type: 'nps', label: 'NPS score', hint: 'Net promoter score (0–10)', group: 'Rating & Scale', shortcut: 'nps' },
  { type: 'score', label: 'Score / Calculation', hint: 'Compute a value from earlier answers', group: 'Rating & Scale', shortcut: 'calc' },
  { type: 'pageBreak', label: 'Page break', hint: 'Split the form into pages', group: 'Page', shortcut: 'page' },
  { type: 'thankYou', label: 'Thank you page', hint: 'Custom completion message', group: 'Page', shortcut: 'thank' },
]

export const GROUPS = ['Questions', 'Inputs', 'Rating & Scale', 'Layout', 'Page']

export function searchBlocks(query: string): BlockDef[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...BLOCKS]
  return BLOCKS.filter(
    (b) =>
      b.label.toLowerCase().includes(q) ||
      b.hint.toLowerCase().includes(q) ||
      (b.shortcut && b.shortcut.toLowerCase().includes(q)),
  )
}

export function defaultOptions(count = 3): string[] {
  return Array.from({ length: count }, (_, i) => `Option ${i + 1}`)
}