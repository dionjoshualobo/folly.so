import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark, NeoWindowHeader } from '../components/ui'
import { BLOCKS } from '../blockCatalog'
import { useForms } from '../store'

interface TocItem {
  id: string
  title: string
  depth: 2 | 3
}

const TOC_ITEMS: TocItem[] = [
  { id: 'quickstart', title: 'Quickstart & Mental Model', depth: 2 },
  { id: 'the-document-model', title: 'The Document Canvas', depth: 3 },
  { id: 'slash-commands', title: 'Slash Menu (/) & Shortcuts', depth: 3 },
  { id: 'block-palette', title: 'Comprehensive Block Catalog', depth: 2 },
  { id: 'input-blocks', title: 'Input & Text Fields', depth: 3 },
  { id: 'choice-blocks', title: 'Multiple Choice & Selectors', depth: 3 },
  { id: 'scale-rating-blocks', title: 'NPS, Ratings & Drag-to-Rank', depth: 3 },
  { id: 'media-embeds', title: 'Media, Embeds & Pages', depth: 3 },
  { id: 'logic-and-routing', title: 'Logic, Branching & Flows', depth: 2 },
  { id: 'conditional-rules', title: 'Conditional Show / Hide', depth: 3 },
  { id: 'page-jumps', title: 'Multi-Page Jumps & State Machine', depth: 3 },
  { id: 'answer-piping', title: 'Dynamic Answer Piping (@)', depth: 3 },
  { id: 'scoring-quizzes', title: 'Quiz Scoring & Calculations', depth: 3 },
  { id: 'custom-css-engine', title: 'Custom CSS & Styling Engine', depth: 2 },
  { id: 'css-classes-reference', title: 'Question-Level CSS Selectors', depth: 3 },
  { id: 'css-recipes', title: 'Copyable Custom CSS Themes', depth: 3 },
  { id: 'security-settings', title: 'Settings, Security & Controls', depth: 2 },
  { id: 'password-protection', title: 'Password Protection & PINs', depth: 3 },
  { id: 'limits-and-scheduling', title: 'Closing Dates & Response Caps', depth: 3 },
  { id: 'draft-persistence', title: 'Local Draft Auto-Recovery', depth: 3 },
  { id: 'publishing-integrations', title: 'Submissions & Self-Hosting', depth: 2 },
  { id: 'responses-and-csv', title: 'Viewing Submissions & CSV Export', depth: 3 },
  { id: 'custom-slugs', title: 'Vanity Slugs (/f/your-path)', depth: 3 },
  { id: 'self-hosting-docker', title: 'Self-Hosting via Docker Compose', depth: 3 },
]

const CSS_RECIPES = [
  {
    name: 'Cyberpunk Yellow Highlight',
    desc: 'Give questions an electrified yellow pop with heavy offset shadow',
    code: `/* Highlight all questions with heavy brutalist borders */
.q {
  background: #ffffff;
  border: 3px solid #000;
  padding: 1.25rem;
  box-shadow: 6px 6px 0px #000;
  margin-bottom: 2rem;
}

/* Make Question 1 stand out in bright yellow */
.q1 {
  background: #ffe600;
  box-shadow: 8px 8px 0px #000;
}`,
  },
  {
    name: 'Pill Buttons for Multiple Choice',
    desc: 'Turn multiple choice options into pill tags with tactile pressed animations',
    code: `/* Multi choice options as interactive pill cards */
.q-multi .q-option {
  border-radius: 9999px;
  padding: 0.6rem 1.4rem;
  box-shadow: 3px 3px 0px #000;
  transition: transform 0.1s ease;
}

.q-multi .q-option:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px #000;
}

.q-multi .q-badge {
  border-radius: 9999px;
  background: #000;
  color: #fff;
}`,
  },
  {
    name: 'Minimalist Clean Monochrome',
    desc: 'Strip back brutalism for a whisper-quiet, refined typography look',
    code: `/* Minimalist quiet form canvas */
.tally-form-title h1 {
  letter-spacing: -0.04em;
  font-weight: 800;
}

.q-option {
  border-width: 1px;
  box-shadow: none !important;
  background: #fafafa;
}

.q-option:hover {
  background: #f0f0f0;
}

.tally-submit-button {
  background: #000;
  color: #fff;
  border-radius: 6px;
  box-shadow: none;
}`,
  },
]

export default function Docs() {
  const [activeId, setActiveId] = useState<string>(TOC_ITEMS[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  // Track scroll positions for TOC scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      for (let i = TOC_ITEMS.length - 1; i >= 0; i--) {
        const item = TOC_ITEMS[i]
        const el = document.getElementById(item.id)
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(item.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setActiveId(id)
    setMobileTocOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Filtered block catalogue for the interactive explorer
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return BLOCKS
    const q = searchQuery.toLowerCase()
    return BLOCKS.filter(
      (b) =>
        b.label.toLowerCase().includes(q) ||
        b.hint.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Generate SVG path for the "Troughs and Valleys" right rail
  // Item vertical spacing is ~38px.
  // Depth 2 (H2) has X = 10, Depth 3 (H3) has X = 26 (indent into a valley).
  const ITEM_HEIGHT = 38
  const pathData = useMemo(() => {
    if (TOC_ITEMS.length === 0) return ''
    let d = ''
    TOC_ITEMS.forEach((item, i) => {
      const x = item.depth === 2 ? 10 : 26
      const y = i * ITEM_HEIGHT + 18
      if (i === 0) {
        d += `M ${x} ${y}`
      } else {
        const prevItem = TOC_ITEMS[i - 1]
        const prevX = prevItem.depth === 2 ? 10 : 26
        const prevY = (i - 1) * ITEM_HEIGHT + 18
        if (prevX === x) {
          d += ` L ${x} ${y}`
        } else {
          // Smooth bezier curve into or out of the trough
          const midY = (prevY + y) / 2
          d += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`
        }
      }
    })
    return d
  }, [])

  // Position of active indicator circle on the trough path
  const activeIndex = Math.max(
    0,
    TOC_ITEMS.findIndex((t) => t.id === activeId)
  )
  const activeX = TOC_ITEMS[activeIndex]?.depth === 2 ? 10 : 26
  const activeY = activeIndex * ITEM_HEIGHT + 18

  const startNewForm = () => {
    useForms.getState().createForm()
    window.location.hash = '#/forms'
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] text-black font-sans selection:bg-[#ffe600] selection:text-black">
      {/* Top Warning Ribbon */}
      <div className="bg-[#ffe600] text-black font-black uppercase text-xs py-2 px-6 border-b-2 border-black flex justify-between items-center tracking-wider overflow-hidden">
        <span className="whitespace-nowrap">★ FOLLY.SO USER MANUAL // DOCUMENTATION & ARCHITECTURAL REFERENCE ★</span>
        <span className="hidden md:inline font-mono">COMPLETE GUIDE // V2.0</span>
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-[#ffe600] text-black border-2 border-black px-2.5 py-1 text-sm font-black -rotate-2 shadow-[2px_2px_0px_#000]">
                FOLLY.SO
              </span>
            </Link>
            <span className="hidden sm:inline font-mono text-xs font-black uppercase bg-black text-white px-2 py-0.5">
              DOCS & HOW-TO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="xl:hidden flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 font-bold uppercase text-xs shadow-[2px_2px_0px_#000]"
            >
              <span>📑</span>
              <span>INDEX</span>
            </button>
            <Link
              to="/forms"
              className="text-xs font-black uppercase px-4 py-2 border-2 border-black hover:bg-neutral-100 transition hidden sm:inline-block"
            >
              DASHBOARD
            </Link>
            <button
              onClick={startNewForm}
              className="bg-[#ffe600] text-black font-black text-xs uppercase px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#facc15] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              CREATE FORM ⚡
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Table of Contents */}
      {mobileTocOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-80 max-w-[85vw] bg-white border-l-3 border-black h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b-2 border-black mb-4">
              <span className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2 py-0.5 border border-black">
                TABLE OF CONTENTS
              </span>
              <button
                onClick={() => setMobileTocOpen(false)}
                className="font-mono font-bold text-sm border-2 border-black px-2 py-0.5 hover:bg-black hover:text-white"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1">
              {TOC_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left py-2 px-3 text-xs font-bold uppercase transition flex items-center gap-2 ${
                    item.depth === 3 ? 'pl-6 text-neutral-600' : 'text-black'
                  } ${
                    activeId === item.id
                      ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  {item.depth === 3 && <span className="text-neutral-400">└─</span>}
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Hero Banner for Docs */}
      <section className="border-b-2 border-black bg-white px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="inline-block bg-[#00ef84] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase rotate-[-1deg] shadow-[3px_3px_0px_#000] mb-4">
            HANDBOOK & RECIPES
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-tight max-w-4xl">
            HOW TO BUILD FORMS <br />
            <span className="bg-[#ffe600] px-3 sm:px-4 py-1 border-2 border-black shadow-[5px_5px_0px_#000] inline-block -rotate-1 mt-2">
              WITHOUT THE USUAL HEADACHES.
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg font-bold text-neutral-800 max-w-2xl leading-relaxed">
            Everything you need to know about Folly: from drafting questions with slash commands, configuring multi-page jump logic, scoring quiz outcomes, to styling with question-level Custom CSS.
          </p>

          {/* Flow Stepper Preview */}
          <div className="mt-12 border-2 border-black bg-[#fffdfa] p-5 sm:p-7 shadow-[6px_6px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block w-fit">
                THE 4-STAGE FORM LIFECYCLE
              </span>
              <span className="font-mono text-xs font-bold text-neutral-500">
                Click a stage below to explore
              </span>
            </div>

            {/* Stage Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                { num: '01', title: 'DRAFT', desc: 'Type like a doc, slash menu, drag reorder', color: '#ffe600' },
                { num: '02', title: 'BRANCH', desc: 'Conditionals, page jumps, quiz scoring', color: '#5ce1e6' },
                { num: '03', title: 'STYLE', desc: 'Custom CSS engine, palettes, brutalist cards', color: '#ff90e8' },
                { num: '04', title: 'COLLECT', desc: 'Vanity links, draft restore, CSV export', color: '#00ef84' },
              ].map((step, idx) => (
                <button
                  key={step.num}
                  onClick={() => {
                    setActiveStep(idx)
                    const targetIds = ['quickstart', 'logic-and-routing', 'custom-css-engine', 'publishing-integrations']
                    scrollTo(targetIds[idx])
                  }}
                  className={`text-left border-2 border-black p-4 transition ${
                    activeStep === idx
                      ? 'shadow-[4px_4px_0px_#000] -translate-y-1'
                      : 'hover:bg-neutral-50 shadow-[2px_2px_0px_#000]'
                  }`}
                  style={{ backgroundColor: activeStep === idx ? step.color : '#ffffff' }}
                >
                  <div className="font-mono text-xs font-black opacity-60">{step.num} // STAGE</div>
                  <div className="text-lg font-black uppercase mt-1">{step.title}</div>
                  <div className="text-xs font-bold text-neutral-700 mt-1 line-clamp-2">{step.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation Body with Right-Side Sticky "Troughs and Valleys" TOC */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
          
          {/* Main Content (8 cols on XL) */}
          <article className="xl:col-span-8 space-y-20 min-w-0">

            {/* CHAPTER 1: QUICKSTART & MENTAL MODEL */}
            <section id="quickstart" className="space-y-8 scroll-mt-24">
              <div className="border-b-3 border-black pb-4">
                <span className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 01
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-3">
                  Quickstart & Mental Model
                </h2>
                <p className="mt-2 text-sm sm:text-base font-bold text-neutral-700">
                  Folly flips the traditional form-building script: no rigid sidebars, no multi-tab confusion. You write forms directly on a clean document canvas.
                </p>
              </div>

              {/* Sub-section: Document Model */}
              <div id="the-document-model" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ffe600] border border-black inline-block" />
                  The Document Canvas
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Traditional form tools force you to configure each question in an isolated sidebar inspector. In Folly, the entire form is an editable page. You click anywhere, type prompts directly, insert inline formatting, and immediately see what your respondents will experience.
                </p>
                <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-3">
                  <div className="font-mono text-xs font-black uppercase bg-black text-white px-2 py-1 w-fit">
                    CORE CANVAS PRINCIPLES
                  </div>
                  <ul className="space-y-2 text-sm font-bold text-neutral-800">
                    <li className="flex items-start gap-2">
                      <span className="text-[#00ef84]">✔</span>
                      <span><strong>Optimistic Auto-Save:</strong> All changes to questions, options, settings, and themes are automatically saved with debouncing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00ef84]">✔</span>
                      <span><strong>Drag to Reorder:</strong> Hover over the left edge of any block to reveal the 6-dot drag handle to reorder questions in real time.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00ef84]">✔</span>
                      <span><strong>Multi-Column Layout:</strong> Drag blocks horizontally beside another question to split the row into 2 or 3 responsive columns automatically.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sub-section: Slash Commands */}
              <div id="slash-commands" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#5ce1e6] border border-black inline-block" />
                  Slash Menu (/) & Keyboard Shortcuts
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Pressing <code className="bg-[#ffe600] text-black px-1.5 py-0.5 border border-black font-mono font-bold text-xs">/</code> anywhere on an empty line opens the block picker. You can filter blocks by typing letters (e.g. <code className="font-mono bg-neutral-100 px-1 border border-black">/choice</code> or <code className="font-mono bg-neutral-100 px-1 border border-black">/nps</code>) and hit <kbd className="font-mono border border-black bg-white px-1.5 py-0.5 text-xs shadow-[1px_1px_0px_#000]">Enter</kbd> to insert.
                </p>

                <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000]">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-black text-white uppercase border-b-2 border-black">
                      <tr>
                        <th className="p-3">Shortcut</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Context</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y-2 divide-black font-bold">
                      <tr>
                        <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">/</kbd></td>
                        <td className="p-3">Open Slash Command Palette</td>
                        <td className="p-3 text-neutral-600">On any new line</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">Enter</kbd></td>
                        <td className="p-3">Create new question block below</td>
                        <td className="p-3 text-neutral-600">While typing</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">Backspace</kbd></td>
                        <td className="p-3">Delete empty block and jump up</td>
                        <td className="p-3 text-neutral-600">At start of empty block</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">**text**</kbd></td>
                        <td className="p-3">Format text as <strong>Bold</strong></td>
                        <td className="p-3 text-neutral-600">In titles or descriptions</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">*text*</kbd></td>
                        <td className="p-3">Format text as <em>Italic</em></td>
                        <td className="p-3 text-neutral-600">In titles or descriptions</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* CHAPTER 2: COMPREHENSIVE BLOCK CATALOG */}
            <section id="block-palette" className="space-y-8 scroll-mt-24">
              <div className="border-b-3 border-black pb-4">
                <span className="font-mono text-xs font-black uppercase bg-[#5ce1e6] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 02
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-3">
                  Comprehensive Block Catalog
                </h2>
                <p className="mt-2 text-sm sm:text-base font-bold text-neutral-700">
                  Folly features over 25+ specialized block types covering text capture, choice selectors, opinion scales, media embeds, and structural page breaks.
                </p>
              </div>

              {/* Interactive Search for Block Catalog */}
              <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row gap-3 items-center">
                <span className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2.5 py-1 border border-black">
                  SEARCH BLOCKS
                </span>
                <input
                  type="text"
                  placeholder="Type to filter e.g. 'choice', 'nps', 'embed', 'date'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 w-full border-2 border-black px-3 py-1.5 font-mono text-xs font-bold uppercase focus:outline-none focus:bg-[#fffbe6]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="border border-black px-2 py-1 text-xs font-mono font-bold hover:bg-neutral-100"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {searchQuery && (
                <div className="border-2 border-black bg-[#fffbe6] p-4 shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="font-mono text-xs font-black uppercase text-black">
                    FOUND {filteredBlocks.length} MATCHING BLOCKS:
                  </div>
                  {filteredBlocks.length === 0 ? (
                    <div className="text-xs font-bold text-neutral-500">No blocks found matching "{searchQuery}".</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {filteredBlocks.map((b) => (
                        <div key={b.type} className="border border-black bg-white p-2.5 shadow-[1px_1px_0px_#000]">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black uppercase text-black">{b.label}</span>
                            <span className="font-mono text-[10px] bg-neutral-100 border border-black px-1.5">{b.group}</span>
                          </div>
                          <div className="text-[11px] font-bold text-neutral-600 mt-1">{b.hint}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-section: Input Blocks */}
              <div id="input-blocks" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ffe600] border border-black inline-block" />
                  Input & Text Fields
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Collect free-form user answers with automatic type validation:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Short Text', desc: 'Single-line input for names, titles, and handles.' },
                    { name: 'Long Text', desc: 'Multi-line textarea for feedback, messages, and bios.' },
                    { name: 'Email', desc: 'Validates standard RFC email syntax before submission.' },
                    { name: 'Phone', desc: 'Formatted international telephone input with dialing code helper.' },
                    { name: 'Number', desc: 'Strict numeric validation with min, max, and step validation.' },
                    { name: 'Date & Time', desc: 'Native datepicker and hour:minute selector.' },
                    { name: 'Address', desc: 'Multi-field postal intake for street, city, state, zip.' },
                    { name: 'File Upload', desc: 'File attachment picker supporting images, documents, PDFs.' },
                  ].map((b) => (
                    <div key={b.name} className="border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000]">
                      <div className="font-mono text-xs font-black uppercase text-black">{b.name}</div>
                      <div className="text-xs font-bold text-neutral-600 mt-1">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-section: Choice Selectors */}
              <div id="choice-blocks" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ff90e8] border border-black inline-block" />
                  Multiple Choice & Selectors
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Offer single or multi-select choices with letter badges (A, B, C...) and optional "Other" write-in answers.
                </p>
                <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-4">
                  <div className="text-xs font-mono font-bold uppercase text-neutral-600">LIVE RENDER PREVIEW:</div>
                  <div className="space-y-2 max-w-sm">
                    <div className="flex items-center gap-3 border-2 border-black px-4 py-2.5 bg-[#ffe600] font-bold text-sm shadow-[3px_3px_0px_#000]">
                      <span className="h-5 w-5 border border-black bg-white font-mono text-[10px] font-black flex items-center justify-center">A</span>
                      <span>Multiple Choice (Single Select)</span>
                    </div>
                    <div className="flex items-center gap-3 border-2 border-black px-4 py-2.5 bg-white font-bold text-sm shadow-[2px_2px_0px_#000]">
                      <span className="h-5 w-5 border border-black bg-white font-mono text-[10px] font-black flex items-center justify-center">B</span>
                      <span>Checkboxes (Multiple Select)</span>
                    </div>
                    <div className="flex items-center gap-3 border-2 border-black px-4 py-2.5 bg-white font-bold text-sm shadow-[2px_2px_0px_#000]">
                      <span className="h-5 w-5 border border-black bg-white font-mono text-[10px] font-black flex items-center justify-center">C</span>
                      <span>Dropdown Select Menu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-section: Scales & Ratings */}
              <div id="scale-rating-blocks" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#00ef84] border border-black inline-block" />
                  NPS, Ratings & Drag-to-Rank
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Capture customer sentiment and prioritization using interactive scales:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                    <div className="font-mono text-xs font-black uppercase bg-[#00ef84] px-2 py-0.5 border border-black w-fit mb-2">
                      NET PROMOTER SCORE (NPS)
                    </div>
                    <p className="text-xs font-bold text-neutral-700">
                      Standard 0 to 10 scale categorized into Detractors (0–6), Passives (7–8), and Promoters (9–10).
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                    <div className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2 py-0.5 border border-black w-fit mb-2">
                      DRAG-TO-RANK
                    </div>
                    <p className="text-xs font-bold text-neutral-700">
                      Let respondents order a set of options from top to bottom preference using touch-friendly drag handles.
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                    <div className="font-mono text-xs font-black uppercase bg-[#5ce1e6] px-2 py-0.5 border border-black w-fit mb-2">
                      STAR & LINEAR RATING
                    </div>
                    <p className="text-xs font-bold text-neutral-700">
                      Configurable 1–5 or 1–10 star scales with custom min and max labels (e.g. "Terrible" to "Outstanding").
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                    <div className="font-mono text-xs font-black uppercase bg-[#ff90e8] px-2 py-0.5 border border-black w-fit mb-2">
                      MATRIX / GRID
                    </div>
                    <p className="text-xs font-bold text-neutral-700">
                      Evaluate multiple rows across shared scale columns (e.g. Strongly Disagree to Strongly Agree).
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-section: Media & Pages */}
              <div id="media-embeds" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-black border border-black inline-block" />
                  Media, Embeds & Pages
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Enhance your form structure with structural content and interactive media:
                </p>
                <ul className="space-y-2 text-sm font-bold text-neutral-800">
                  <li className="flex items-center gap-2">
                    <span className="bg-[#ffe600] border border-black px-1.5 py-0.2 font-mono text-[10px]">PAGE BREAK</span>
                    <span>Partitions questions into multi-step pages with an automated progress bar.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-[#5ce1e6] border border-black px-1.5 py-0.2 font-mono text-[10px]">THANK YOU PAGE</span>
                    <span>Customized post-submission screen with optional redirect URL.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-[#ff90e8] border border-black px-1.5 py-0.2 font-mono text-[10px]">LIVE EMBED</span>
                    <span>Paste any link from YouTube, Vimeo, Figma, Loom, Google Maps, or Spotify to render rich interactive media.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* CHAPTER 3: LOGIC, BRANCHING & FLOWS */}
            <section id="logic-and-routing" className="space-y-8 scroll-mt-24">
              <div className="border-b-3 border-black pb-4">
                <span className="font-mono text-xs font-black uppercase bg-[#ff90e8] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 03
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-3">
                  Logic, Branching & Flows
                </h2>
                <p className="mt-2 text-sm sm:text-base font-bold text-neutral-700">
                  Build dynamic, personalized flows that adapt in real time to respondent choices.
                </p>
              </div>

              {/* Sub-section: Conditional Rules */}
              <div id="conditional-rules" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ffe600] border border-black inline-block" />
                  Conditional Show / Hide Rules
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Every question block has a <span className="font-mono font-bold bg-[#ffe600] px-1 border border-black text-xs">LOGIC</span> setting. You can specify:
                </p>
                <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] font-mono text-xs space-y-2">
                  <div className="font-bold text-neutral-500 uppercase">// RULE SYNTAX</div>
                  <div className="bg-neutral-50 p-3 border border-black space-y-1">
                    <div><span className="text-purple-600 font-bold">SHOW</span> block <span className="text-blue-600 font-bold">IF</span> [Question: "Are you attending in person?"] <span className="text-emerald-600 font-bold">EQUALS</span> "Yes"</div>
                    <div><span className="text-rose-600 font-bold">HIDE</span> block <span className="text-blue-600 font-bold">IF</span> [Question: "Company Size"] <span className="text-emerald-600 font-bold">LESS THAN</span> 10</div>
                  </div>
                </div>
              </div>

              {/* Sub-section: Page Jumps */}
              <div id="page-jumps" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#00ef84] border border-black inline-block" />
                  Multi-Page Jumps & State Machine
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Folly uses a hardened page state machine. When you configure page breaks:
                </p>
                <ul className="space-y-2 text-sm font-bold text-neutral-800">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00ef84]">✔</span>
                    <span><strong>Empty Page Skipping:</strong> If conditional rules hide every question on Page 2, clicking Next on Page 1 automatically skips straight to Page 3 without showing a blank page.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00ef84]">✔</span>
                    <span><strong>Jump to Page or Submit:</strong> Set rules like <em>"If user is under 18, jump to submit immediately"</em>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00ef84]">✔</span>
                    <span><strong>History Tracking:</strong> The Back button pops through exact traversal history so respondents never get trapped in jump loops.</span>
                  </li>
                </ul>
              </div>

              {/* Sub-section: Answer Piping */}
              <div id="answer-piping" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#5ce1e6] border border-black inline-block" />
                  Dynamic Answer Piping (@)
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Personalize the respondent experience by recalling their earlier answers. Type <code className="bg-[#ffe600] px-1.5 py-0.5 border border-black font-mono font-bold text-xs">@</code> in any title, description, or question prompt to select a previous field.
                </p>
                <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                  <div className="font-mono text-xs font-bold text-neutral-500 mb-1">EXAMPLE FORM FLOW:</div>
                  <div className="text-sm font-bold">
                    Question 1: "What is your name?" → Answer: <span className="bg-[#ffe600] px-1 border border-black">Sarah</span>
                  </div>
                  <div className="text-sm font-bold mt-2">
                    Question 2: "Thanks, <span className="bg-[#5ce1e6] px-1 border border-black">Sarah</span>! What can we help you build today?"
                  </div>
                </div>
              </div>

              {/* Sub-section: Quiz Scoring */}
              <div id="scoring-quizzes" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ff90e8] border border-black inline-block" />
                  Quiz Scoring & Calculations
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Assign numeric point values to choice options or evaluate numeric inputs to calculate real-time totals. Add a <strong>Score Block</strong> to display the respondent's final quiz result on the thank-you screen.
                </p>
              </div>
            </section>

            {/* CHAPTER 4: CUSTOM CSS ENGINE */}
            <section id="custom-css-engine" className="space-y-8 scroll-mt-24">
              <div className="border-b-3 border-black pb-4">
                <span className="font-mono text-xs font-black uppercase bg-[#00ef84] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 04
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-3">
                  Custom CSS & Styling Engine
                </h2>
                <p className="mt-2 text-sm sm:text-base font-bold text-neutral-700">
                  Never settle for cookie-cutter forms. Folly exposes clean semantic CSS classes on every element so you can write targeted styles directly in the Theme Drawer.
                </p>
              </div>

              {/* Sub-section: CSS Classes Reference */}
              <div id="css-classes-reference" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ffe600] border border-black inline-block" />
                  Question-Level CSS Selectors
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Every question block, input container, choice card, and letter badge receives deterministic classes:
                </p>

                <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000]">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-black text-white uppercase border-b-2 border-black">
                      <tr>
                        <th className="p-3">Selector</th>
                        <th className="p-3">Target Element</th>
                        <th className="p-3">Example Rule</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y-2 divide-black font-bold">
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q</code></td>
                        <td className="p-3">Every question block on the form</td>
                        <td className="p-3 font-mono text-neutral-600">border-left: 4px solid #000;</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q1</code>, <code className="text-blue-600">.q2</code></td>
                        <td className="p-3">Specific question by visible sequence number</td>
                        <td className="p-3 font-mono text-neutral-600">background: #ffe600;</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-multi</code></td>
                        <td className="p-3">All Multiple Choice questions</td>
                        <td className="p-3 font-mono text-neutral-600">margin-bottom: 2rem;</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-option</code></td>
                        <td className="p-3">Every choice card/pill</td>
                        <td className="p-3 font-mono text-neutral-600">box-shadow: 4px 4px 0px #000;</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-badge</code></td>
                        <td className="p-3">The letter badge (A, B, C...)</td>
                        <td className="p-3 font-mono text-neutral-600">border-radius: 9999px;</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-label</code></td>
                        <td className="p-3">The text label inside an option</td>
                        <td className="p-3 font-mono text-neutral-600">font-weight: 800;</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-neutral-50"><code className="text-blue-600">[data-block-id="..."]</code></td>
                        <td className="p-3">Exact block by internal unique ID</td>
                        <td className="p-3 font-mono text-neutral-600">display: none;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sub-section: Copyable CSS Recipes */}
              <div id="css-recipes" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#5ce1e6] border border-black inline-block" />
                  Copyable Custom CSS Themes
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Click any snippet below to copy it, then open the <strong>THEME</strong> drawer in your editor, paste into <strong>Custom CSS</strong>, and click save:
                </p>

                <div className="space-y-6">
                  {CSS_RECIPES.map((recipe, idx) => (
                    <div key={recipe.name} className="border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
                      <div className="bg-black text-white px-4 py-2 flex items-center justify-between font-mono text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#ffe600]" />
                          <span className="uppercase">{recipe.name}</span>
                        </div>
                        <button
                          onClick={() => copyCode(recipe.code, idx)}
                          className="bg-[#ffe600] text-black px-2.5 py-1 border border-black font-black uppercase text-[10px] hover:bg-white transition"
                        >
                          {copiedIndex === idx ? 'COPIED ✓' : 'COPY CSS 📋'}
                        </button>
                      </div>
                      <div className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
                        <pre>{recipe.code}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CHAPTER 5: SETTINGS, SECURITY & CONTROLS */}
            <section id="security-settings" className="space-y-8 scroll-mt-24">
              <div className="border-b-3 border-black pb-4">
                <span className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 05
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-3">
                  Settings, Security & Controls
                </h2>
                <p className="mt-2 text-sm sm:text-base font-bold text-neutral-700">
                  Protect sensitive forms, set automated expiration thresholds, and prevent respondent drop-off.
                </p>
              </div>

              {/* Sub-section: Password Protection */}
              <div id="password-protection" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ff90e8] border border-black inline-block" />
                  Password Protection & PINs
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Require respondents to enter a password or PIN before viewing the form. Perfect for internal team assessments, invite-only event RSVPs, or private client questionnaires.
                </p>
              </div>

              {/* Sub-section: Limits & Scheduling */}
              <div id="limits-and-scheduling" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#00ef84] border border-black inline-block" />
                  Closing Dates & Response Caps
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Automate form retirement without manual monitoring:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#000]">
                    <div className="font-mono text-xs font-black uppercase text-black">MAX RESPONSE CAP</div>
                    <p className="text-xs font-bold text-neutral-600 mt-1">
                      Set a maximum intake number (e.g. 50 respondents). Once reached, further submissions are automatically locked.
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#000]">
                    <div className="font-mono text-xs font-black uppercase text-black">SCHEDULED CLOSE DATE</div>
                    <p className="text-xs font-bold text-neutral-600 mt-1">
                      Set an exact closing timestamp. After the deadline passes, respondents see a clean "This form is closed" screen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-section: Draft Persistence */}
              <div id="draft-persistence" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#5ce1e6] border border-black inline-block" />
                  Local Draft Auto-Recovery
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Respondents never lose half-filled forms. Folly automatically mirrors answers in browser <code className="font-mono bg-neutral-100 px-1 border border-black text-xs font-bold">localStorage</code> so if their wifi drops or they accidentally reload, everything restores instantly.
                </p>
              </div>
            </section>

            {/* CHAPTER 6: SUBMISSIONS & SELF-HOSTING */}
            <section id="publishing-integrations" className="space-y-8 scroll-mt-24">
              <div className="border-b-3 border-black pb-4">
                <span className="font-mono text-xs font-black uppercase bg-[#5ce1e6] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 06
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-3">
                  Submissions & Self-Hosting
                </h2>
                <p className="mt-2 text-sm sm:text-base font-bold text-neutral-700">
                  Export your data anytime, claim custom URL slugs, and run Folly independently on your own server.
                </p>
              </div>

              {/* Sub-section: Responses & CSV */}
              <div id="responses-and-csv" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ffe600] border border-black inline-block" />
                  Viewing Submissions & CSV Export
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Click <strong>RESPONSES</strong> in your form editor to view a searchable spreadsheet of submissions. Click any row to expand a full inspection drawer, or hit <strong>DOWNLOAD CSV</strong> for instant spreadsheet export.
                </p>
              </div>

              {/* Sub-section: Custom Slugs */}
              <div id="custom-slugs" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#ff90e8] border border-black inline-block" />
                  Vanity Slugs (/f/your-path)
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Instead of sharing an ugly generated ID like <code className="font-mono bg-neutral-100 px-1 border border-black text-xs">/r/84f93a10</code>, define a custom slug in the Share Drawer to publish at <code className="bg-[#ffe600] font-mono px-1 border border-black text-xs font-bold">/f/product-survey</code> or <code className="bg-[#ffe600] font-mono px-1 border border-black text-xs font-bold">/f/beta-signup</code>.
                </p>
              </div>

              {/* Sub-section: Self-Hosting */}
              <div id="self-hosting-docker" className="space-y-4 scroll-mt-24">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <span className="h-3 w-3 bg-[#00ef84] border border-black inline-block" />
                  Self-Hosting via Docker Compose
                </h3>
                <p className="font-medium text-neutral-800 leading-relaxed">
                  Folly is completely self-contained. Run Postgres and the Node/Express server on any VPS with one command:
                </p>
                <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto shadow-[4px_4px_0px_#000]">
                  <pre>{`git clone https://github.com/dionjoshualobo/folly.so.git
cd folly.so
docker compose up -d --build`}</pre>
                </div>
                <p className="text-xs font-bold text-neutral-600">
                  Open <code>http://localhost:3001</code> to start creating forms on your self-hosted instance.
                </p>
              </div>
            </section>

          </article>

          {/* RIGHT SIDE: Table of Contents with "Troughs and Valleys" (4 cols on XL) */}
          <aside className="hidden xl:block xl:col-span-4 sticky top-24">
            <div className="border-3 border-black bg-white p-5 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#ffe600] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  ON THIS PAGE
                </span>
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                  ACTIVE OUTLINE
                </span>
              </div>

              {/* Interactive SVG Rail with Troughs and Valleys */}
              <div className="relative" style={{ height: TOC_ITEMS.length * ITEM_HEIGHT }}>
                {/* Background Connecting Path with Bezier Curves */}
                <svg
                  className="absolute top-0 left-0 h-full w-10 pointer-events-none"
                  style={{ overflow: 'visible' }}
                >
                  {/* Subtle grey baseline track */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Active black track */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Active Indicator traveling through the troughs and valleys */}
                  <g
                    style={{
                      transform: `translate(${activeX}px, ${activeY}px)`,
                      transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <circle
                      r="6.5"
                      fill="#ffe600"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <circle r="2" fill="#000000" />
                  </g>
                </svg>

                {/* TOC Link Labels */}
                <div className="relative flex flex-col">
                  {TOC_ITEMS.map((item) => {
                    const isActive = activeId === item.id
                    const isSubheader = item.depth === 3
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className={`text-left text-xs font-bold uppercase transition flex items-center group ${
                          isSubheader ? 'pl-9' : 'pl-6'
                        }`}
                        style={{ height: ITEM_HEIGHT }}
                      >
                        <span
                          className={`truncate transition-all ${
                            isActive
                              ? 'bg-[#ffe600] text-black border border-black px-2 py-0.5 shadow-[2px_2px_0px_#000] font-black'
                              : isSubheader
                              ? 'text-neutral-500 hover:text-black hover:translate-x-0.5'
                              : 'text-neutral-900 hover:text-black font-extrabold hover:translate-x-0.5'
                          }`}
                        >
                          {item.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Quick Action Box */}
              <div className="mt-6 pt-4 border-t-2 border-black space-y-2">
                <button
                  onClick={startNewForm}
                  className="w-full bg-[#ffe600] text-black font-black uppercase text-xs py-2.5 border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#facc15] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  START A NEW FORM ⚡
                </button>
                <Link
                  to="/"
                  className="block text-center font-mono text-[11px] font-bold uppercase text-neutral-600 hover:text-black py-1"
                >
                  ← BACK TO HOME
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-10 px-6 text-xs font-mono font-bold mt-20">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-6 w-6" />
            <span className="text-sm font-black uppercase tracking-wider">
              FOLLY.SO // HOW-TO & KNOWLEDGE BASE
            </span>
          </div>
          <div className="flex gap-6 uppercase text-neutral-600">
            <Link to="/" className="hover:text-black hover:underline">Home</Link>
            <Link to="/forms" className="hover:text-black hover:underline">Dashboard</Link>
            <a href="https://github.com/dionjoshualobo/folly.so" target="_blank" rel="noreferrer" className="hover:text-black hover:underline">GitHub</a>
          </div>
          <span className="text-neutral-500">© 2026 FOLLY.SO · OPEN SOURCE FORM REVOLUTION</span>
        </div>
      </footer>
    </div>
  )
}
