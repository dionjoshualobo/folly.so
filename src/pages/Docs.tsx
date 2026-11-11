import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LogoMark } from '../components/ui'
import { useForms } from '../store'

interface TocItem {
  id: string
  title: string
  depth: 2 | 3
}

interface DocPage {
  id: string
  title: string
  category: string
  desc: string
  badge?: string
  toc: TocItem[]
}

const DOC_PAGES: DocPage[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    category: 'OVERVIEW',
    desc: 'What is Folly, its core philosophy, and how it challenges paywalled form builders.',
    toc: [
      { id: 'what-is-folly', title: 'What is Folly?', depth: 2 },
      { id: 'core-philosophy', title: 'Core Philosophy', depth: 2 },
      { id: 'unlimited-intake', title: 'Unlimited Submissions', depth: 3 },
      { id: 'notion-editor', title: 'Document-First Canvas', depth: 3 },
      { id: 'quick-comparison', title: 'Folly vs. The Monopolies', depth: 2 },
    ],
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    category: 'OVERVIEW',
    badge: 'TECHNICAL',
    desc: 'Under the hood: React SPA, Zustand optimistic mutations, Express 5 API, and PostgreSQL JSONB.',
    toc: [
      { id: 'system-overview', title: 'High-Level System Overview', depth: 2 },
      { id: 'client-architecture', title: 'Client Architecture (SPA)', depth: 2 },
      { id: 'optimistic-persistence', title: 'Optimistic State & Debounce', depth: 3 },
      { id: 'hardened-state-machine', title: 'Respondent State Machine', depth: 3 },
      { id: 'backend-database', title: 'Backend & Database Architecture', depth: 2 },
      { id: 'jsonb-documents', title: 'JSONB Schema Storage', depth: 3 },
      { id: 'data-flow-diagram', title: 'End-to-End Data Flow', depth: 2 },
    ],
  },
  {
    id: 'how-to-use',
    title: 'Building Forms (How to Use)',
    category: 'USER GUIDE',
    desc: 'A complete handbook on drafting questions, using slash commands, and organizing form blocks.',
    toc: [
      { id: 'canvas-model', title: 'The Document Canvas', depth: 2 },
      { id: 'slash-menu', title: 'Slash Menu (/) & Shortcuts', depth: 2 },
      { id: 'keyboard-navigation', title: 'Keyboard Traversal', depth: 3 },
      { id: 'block-palette', title: 'Available Block Types', depth: 2 },
      { id: 'input-fields', title: 'Input & Text Fields', depth: 3 },
      { id: 'choice-selectors', title: 'Choices, Badges & Options', depth: 3 },
      { id: 'scales-ratings', title: 'Ratings, NPS & Drag-to-Rank', depth: 3 },
      { id: 'structural-media', title: 'Media, Embeds & Pages', depth: 3 },
      { id: 'multi-column-splits', title: 'Multi-Column Drag Splitting', depth: 2 },
    ],
  },
  {
    id: 'logic-and-routing',
    title: 'Logic, Jumps & Scoring',
    category: 'USER GUIDE',
    desc: 'Dynamic conditional visibility, multi-page jump branches, dynamic answer piping, and quiz point calculations.',
    toc: [
      { id: 'conditional-rules', title: 'Conditional Show / Hide Rules', depth: 2 },
      { id: 'page-jumps', title: 'Page Navigation & Jumps', depth: 2 },
      { id: 'empty-page-skipping', title: 'Empty Page Auto-Skipping', depth: 3 },
      { id: 'history-back-safety', title: 'Traversal History & Back Safety', depth: 3 },
      { id: 'answer-piping', title: 'Dynamic Answer Piping (@)', depth: 2 },
      { id: 'quiz-scoring', title: 'Quiz Scoring & Calculations', depth: 2 },
    ],
  },
  {
    id: 'custom-css',
    title: 'Custom CSS & Styling',
    category: 'USER GUIDE',
    desc: 'Target individual questions, choice cards, badges, and inputs using granular semantic CSS selectors.',
    toc: [
      { id: 'css-architecture', title: 'CSS Engine Architecture', depth: 2 },
      { id: 'question-selectors', title: 'Question-Level Selectors', depth: 2 },
      { id: 'all-questions', title: 'All Questions (.q)', depth: 3 },
      { id: 'numbered-questions', title: 'Numbered Questions (.q1, .q2)', depth: 3 },
      { id: 'options-and-badges', title: 'Options & Badges (.q-option)', depth: 3 },
      { id: 'copyable-recipes', title: 'Copyable Custom CSS Themes', depth: 2 },
    ],
  },
  {
    id: 'self-hosting',
    title: 'Self-Hosting & Operations',
    category: 'OPERATIONS',
    badge: 'DOCKER',
    desc: 'Run Folly on your own infrastructure in under 2 minutes with Docker Compose or Node.js.',
    toc: [
      { id: 'docker-compose', title: 'Docker Compose (Recommended)', depth: 2 },
      { id: 'local-node-setup', title: 'Local Node.js + Postgres Setup', depth: 2 },
      { id: 'env-variables', title: 'Environment Configuration', depth: 2 },
      { id: 'reverse-proxy', title: 'Reverse Proxy (Nginx / Cloudflare)', depth: 2 },
    ],
  },
  {
    id: 'api-reference',
    title: 'API & Data Model',
    category: 'DEVELOPERS',
    badge: 'REST',
    desc: 'Programmatic REST API endpoints, JSON schemas for form blocks, and submission payloads.',
    toc: [
      { id: 'api-overview', title: 'API Design & Philosophy', depth: 2 },
      { id: 'forms-endpoints', title: 'Forms Endpoints', depth: 2 },
      { id: 'form-json-schema', title: 'Form Block JSON Schema', depth: 3 },
      { id: 'submissions-endpoints', title: 'Submissions Endpoints', depth: 2 },
      { id: 'submission-payload', title: 'Submission Payload Format', depth: 3 },
    ],
  },
  {
    id: 'mcp-agents',
    title: 'AI Agents & MCP Server',
    category: 'DEVELOPERS',
    badge: 'NEW',
    desc: 'The Model Context Protocol (MCP) server allowing AI agents to generate and manage forms for users.',
    toc: [
      { id: 'mcp-overview', title: 'What is the Folly MCP Server?', depth: 2 },
      { id: 'agent-primitives', title: 'Agent Tool Primitives', depth: 2 },
      { id: 'conversational-flow', title: 'Conversational Form Creation Flow', depth: 3 },
      { id: 'connecting-clients', title: 'Connecting AI Clients (Claude / Cursor)', depth: 2 },
    ],
  },
]

const CSS_RECIPES = [
  {
    name: 'Cyberpunk Neon Highlight',
    desc: 'Electrified yellow cards with heavy brutalist borders and offset drop shadows',
    code: `/* Style all questions as high-contrast brutalist cards */
.q {
  background: #ffffff;
  border: 3px solid #000;
  padding: 1.5rem;
  box-shadow: 6px 6px 0px #000;
  margin-bottom: 2rem;
}

/* Highlight Question 1 with vibrant yellow */
.q1 {
  background: #ffe600;
  box-shadow: 8px 8px 0px #000;
}`,
  },
  {
    name: 'Pill Buttons for Multiple Choice',
    desc: 'Transform rectangular choice cards into tactile pill badges with hover lifts',
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
    name: 'Quiet Monochrome Minimalist',
    desc: 'A refined, stripped-back aesthetic for formal enterprise surveys',
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
  const { pageId } = useParams<{ pageId?: string }>()
  const navigate = useNavigate()

  // Select the current document page (defaults to 'introduction' if invalid or missing)
  const currentPage = useMemo(() => {
    return DOC_PAGES.find((p) => p.id === pageId) || DOC_PAGES[0]
  }, [pageId])

  const [activeHeadingId, setActiveHeadingId] = useState<string>(currentPage.toc[0]?.id || '')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  // Sync active heading to the first heading whenever the page changes
  useEffect(() => {
    setActiveHeadingId(currentPage.toc[0]?.id || '')
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [currentPage.id])

  // Track scroll position to update active TOC heading
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 130
      for (let i = currentPage.toc.length - 1; i >= 0; i--) {
        const item = currentPage.toc[i]
        const el = document.getElementById(item.id)
        if (el && el.offsetTop <= scrollPos) {
          setActiveHeadingId(item.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage])

  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 85
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const copySnippet = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Calculate SVG curve path for the right-side "Troughs & Valleys" rail
  // Item vertical spacing is ~38px.
  // Depth 2 (H2) has X = 10, Depth 3 (H3) has X = 26 (indent into a valley).
  const ITEM_HEIGHT = 38
  const pathData = useMemo(() => {
    if (currentPage.toc.length === 0) return ''
    let d = ''
    currentPage.toc.forEach((item, i) => {
      const x = item.depth === 2 ? 10 : 26
      const y = i * ITEM_HEIGHT + 19
      if (i === 0) {
        d += `M ${x} ${y}`
      } else {
        const prevItem = currentPage.toc[i - 1]
        const prevX = prevItem.depth === 2 ? 10 : 26
        const prevY = (i - 1) * ITEM_HEIGHT + 19
        if (prevX === x) {
          d += ` L ${x} ${y}`
        } else {
          // Smooth cubic bezier curve connecting parent header into or out of the trough
          const midY = (prevY + y) / 2
          d += ` C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`
        }
      }
    })
    return d
  }, [currentPage.toc])

  // Active indicator circle coordinates
  const activeIndex = Math.max(
    0,
    currentPage.toc.findIndex((t) => t.id === activeHeadingId)
  )
  const activeX = currentPage.toc[activeIndex]?.depth === 2 ? 10 : 26
  const activeY = activeIndex * ITEM_HEIGHT + 19

  // Next & previous page pagination
  const currentIdx = DOC_PAGES.findIndex((p) => p.id === currentPage.id)
  const prevPage = currentIdx > 0 ? DOC_PAGES[currentIdx - 1] : null
  const nextPage = currentIdx < DOC_PAGES.length - 1 ? DOC_PAGES[currentIdx + 1] : null

  // Group pages by category for the sidebar
  const categories = useMemo(() => {
    const map: Record<string, DocPage[]> = {}
    DOC_PAGES.forEach((p) => {
      if (!map[p.category]) map[p.category] = []
      map[p.category].push(p)
    })
    return map
  }, [])

  const startNewForm = () => {
    useForms.getState().createForm()
    window.location.hash = '#/forms'
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] text-black font-sans selection:bg-[#ffe600] selection:text-black">
      {/* Top Banner Ribbon */}
      <div className="bg-[#ffe600] text-black font-black uppercase text-xs py-2 px-6 border-b-2 border-black flex justify-between items-center tracking-wider overflow-hidden">
        <span className="whitespace-nowrap">★ FOLLY.SO DOCUMENTATION // ARCHITECTURE, GUIDES & API REFERENCE ★</span>
        <span className="hidden md:inline font-mono">DOCS V2.0 // OPEN SOURCE CRAFT</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-[#ffe600] text-black border-2 border-black px-2.5 py-1 text-sm font-black -rotate-2 shadow-[2px_2px_0px_#000]">
                FOLLY.SO
              </span>
            </Link>
            <span className="hidden sm:inline font-mono text-xs font-black uppercase bg-black text-white px-2 py-0.5">
              DOCS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 font-bold uppercase text-xs shadow-[2px_2px_0px_#000]"
            >
              <span>📑</span>
              <span>MENU</span>
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

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-80 max-w-[85vw] bg-white border-r-3 border-black h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b-2 border-black mb-4">
              <span className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2 py-0.5 border border-black">
                DOCS NAVIGATION
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono font-bold text-sm border-2 border-black px-2 py-0.5 hover:bg-black hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6">
              {Object.entries(categories).map(([cat, pages]) => (
                <div key={cat} className="space-y-1">
                  <div className="font-mono text-[10px] font-black uppercase text-neutral-500 tracking-wider mb-1">
                    {cat}
                  </div>
                  {pages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/docs/${p.id}`)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full text-left py-2 px-3 text-xs font-bold uppercase transition flex items-center justify-between ${
                        currentPage.id === p.id
                          ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                          : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      {p.badge && (
                        <span className="font-mono text-[9px] bg-black text-white px-1 py-0.2 border border-black">
                          {p.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Column Documentation Grid: Sidebar (3 cols) | Content (6 cols) | TOC (3 cols) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
          
          {/* LEFT SIDEBAR: Categories & Page Links */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            <div className="border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-6">
              
              {/* Quick Search in Docs */}
              <div>
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full border-2 border-black px-2.5 py-1.5 font-mono text-xs font-bold uppercase focus:outline-none focus:bg-[#fffbe6]"
                />
              </div>

              {/* Navigation Grouping */}
              <nav className="space-y-6">
                {Object.entries(categories).map(([category, pages]) => {
                  const filtered = pages.filter((p) =>
                    p.title.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  if (filtered.length === 0) return null
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="font-mono text-[10px] font-black uppercase text-neutral-500 tracking-wider">
                        // {category}
                      </div>
                      <div className="space-y-1">
                        {filtered.map((p) => {
                          const isActive = currentPage.id === p.id
                          return (
                            <Link
                              key={p.id}
                              to={`/docs/${p.id}`}
                              className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase transition border ${
                                isActive
                                  ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black'
                                  : 'border-transparent text-neutral-700 hover:text-black hover:bg-neutral-100'
                              }`}
                            >
                              <span className="truncate">{p.title}</span>
                              {p.badge && (
                                <span className={`font-mono text-[9px] px-1 py-0.2 border ${
                                  isActive ? 'bg-black text-white border-black' : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                                }`}>
                                  {p.badge}
                                </span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </nav>

              {/* Quick GitHub / Source Link */}
              <div className="pt-4 border-t-2 border-black font-mono text-xs">
                <a
                  href="https://github.com/dionjoshualobo/folly.so"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-neutral-600 hover:text-black font-bold uppercase"
                >
                  <span>GITHUB REPO</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </aside>

          {/* CENTER: Main Content for Current Selected Page */}
          <main className="lg:col-span-6 xl:col-span-6 space-y-10 min-w-0">
            
            {/* Page Header */}
            <div className="border-b-3 border-black pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-black uppercase bg-[#ffe600] px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000]">
                  {currentPage.category}
                </span>
                {currentPage.badge && (
                  <span className="font-mono text-xs font-black uppercase bg-black text-white px-2 py-0.5">
                    {currentPage.badge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-tight">
                {currentPage.title}
              </h1>
              <p className="mt-3 text-base sm:text-lg font-bold text-neutral-700 leading-relaxed">
                {currentPage.desc}
              </p>
            </div>

            {/* DYNAMIC PAGE CONTENT BASED ON currentPage.id */}
            {currentPage.id === 'introduction' && <IntroductionDoc />}
            {currentPage.id === 'architecture' && <ArchitectureDoc />}
            {currentPage.id === 'how-to-use' && <HowToUseDoc />}
            {currentPage.id === 'logic-and-routing' && <LogicAndRoutingDoc />}
            {currentPage.id === 'custom-css' && <CustomCssDoc onCopy={copySnippet} copiedIdx={copiedIndex} />}
            {currentPage.id === 'self-hosting' && <SelfHostingDoc />}
            {currentPage.id === 'api-reference' && <ApiReferenceDoc />}
            {currentPage.id === 'mcp-agents' && <McpAgentsDoc />}

            {/* Bottom Next / Previous Page Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t-3 border-black">
              {prevPage ? (
                <Link
                  to={`/docs/${prevPage.id}`}
                  className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] hover:bg-neutral-50 transition text-left group"
                >
                  <div className="font-mono text-[10px] font-black uppercase text-neutral-500">
                    ← PREVIOUS PAGE
                  </div>
                  <div className="font-bold text-sm uppercase text-black mt-1 group-hover:text-black">
                    {prevPage.title}
                  </div>
                </Link>
              ) : <div />}

              {nextPage && (
                <Link
                  to={`/docs/${nextPage.id}`}
                  className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] hover:bg-[#ffe600] transition text-right group"
                >
                  <div className="font-mono text-[10px] font-black uppercase text-neutral-500">
                    NEXT PAGE →
                  </div>
                  <div className="font-bold text-sm uppercase text-black mt-1">
                    {nextPage.title}
                  </div>
                </Link>
              )}
            </div>

          </main>

          {/* RIGHT RAIL: "On this page" TOC with Troughs and Valleys */}
          <aside className="hidden xl:block xl:col-span-3 sticky top-24">
            <div className="border-3 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
                <span className="font-mono text-[11px] font-black uppercase tracking-wider bg-[#ffe600] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                  ON THIS PAGE
                </span>
                <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">
                  OUTLINE
                </span>
              </div>

              {/* The SVG Troughs and Valleys Track */}
              <div className="relative" style={{ minHeight: currentPage.toc.length * ITEM_HEIGHT }}>
                <svg
                  className="absolute top-0 left-0 h-full w-10 pointer-events-none"
                  style={{ overflow: 'visible' }}
                >
                  {/* Subtle track background line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Black track line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Active Indicator sliding along the troughs and valleys */}
                  <g
                    style={{
                      transform: `translate(${activeX}px, ${activeY}px)`,
                      transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <circle
                      r="6"
                      fill="#ffe600"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <circle r="1.8" fill="#000000" />
                  </g>
                </svg>

                {/* Headings List */}
                <div className="relative flex flex-col">
                  {currentPage.toc.map((item) => {
                    const isActive = activeHeadingId === item.id
                    const isSub = item.depth === 3
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`text-left text-xs font-bold uppercase transition flex items-center group ${
                          isSub ? 'pl-9' : 'pl-6'
                        }`}
                        style={{ height: ITEM_HEIGHT }}
                      >
                        <span
                          className={`truncate transition-all ${
                            isActive
                              ? 'bg-[#ffe600] text-black border border-black px-2 py-0.5 shadow-[2px_2px_0px_#000] font-black'
                              : isSub
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

              {/* Action Box at bottom of TOC */}
              <div className="mt-6 pt-4 border-t-2 border-black space-y-2">
                <button
                  onClick={startNewForm}
                  className="w-full bg-[#ffe600] text-black font-black uppercase text-xs py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#facc15] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  NEW FORM ⚡
                </button>
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
              FOLLY.SO // DOCS & HOW-TO
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

/* =========================================================================
   SUB-PAGE COMPONENTS (Clean, modular, and focused)
   ========================================================================= */

function IntroductionDoc() {
  return (
    <div className="space-y-12">
      <section id="what-is-folly" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          What is Folly?
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed">
          <strong>Folly</strong> is a free, self-hostable, neo-brutalist form builder. Instead of wrestling with rigid sidebar inspectors, multi-tab forms, and artificial response billing tiers, you compose questions directly on a clean document canvas—just like writing in a Notion document.
        </p>
      </section>

      <section id="core-philosophy" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Core Philosophy
        </h2>
        
        <div id="unlimited-intake" className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-2 scroll-mt-24">
          <div className="font-mono text-xs font-black uppercase bg-[#00ef84] text-black px-2 py-0.5 border border-black w-fit">
            PRINCIPLE 01 // UNLIMITED RESPONSES
          </div>
          <h3 className="text-lg font-black uppercase">Zero Paywalls on Submissions</h3>
          <p className="text-sm font-medium text-neutral-700 leading-relaxed">
            Most commercial form platforms cap free accounts at 10 to 100 responses before locking submissions behind a $39–$99/month subscription. Folly never caps responses. Whether you collect 5 responses or 500,000, your intake remains 100% free.
          </p>
        </div>

        <div id="notion-editor" className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-2 scroll-mt-24">
          <div className="font-mono text-xs font-black uppercase bg-[#ffe600] text-black px-2 py-0.5 border border-black w-fit">
            PRINCIPLE 02 // KEYBOARD NATIVE
          </div>
          <h3 className="text-lg font-black uppercase">Document-First Canvas</h3>
          <p className="text-sm font-medium text-neutral-700 leading-relaxed">
            Building forms shouldn't feel like filling out tax software. Type <code className="bg-neutral-100 px-1 border border-black font-mono font-bold">/</code> on any line to summon inputs, drag question handles to reorder, and split rows into columns side-by-side naturally.
          </p>
        </div>
      </section>

      <section id="quick-comparison" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          Folly vs. The Monopolies
        </h2>
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black text-white uppercase border-b-2 border-black">
              <tr>
                <th className="p-3">Feature</th>
                <th className="p-3 bg-neutral-800">Folly.so</th>
                <th className="p-3">Typeform</th>
                <th className="p-3">Tally Free</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black font-bold">
              <tr>
                <td className="p-3 bg-neutral-50">Response Limit</td>
                <td className="p-3 bg-[#ffe600] text-black">UNLIMITED</td>
                <td className="p-3 text-red-600">10 / month</td>
                <td className="p-3">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50">Custom CSS</td>
                <td className="p-3 bg-[#ffe600] text-black">FREE (.q, .q1, etc.)</td>
                <td className="p-3 text-red-600">Enterprise ($99/mo)</td>
                <td className="p-3 text-red-600">Pro ($29/mo)</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50">Self-Hostable</td>
                <td className="p-3 bg-[#ffe600] text-black">YES (Docker Compose)</td>
                <td className="p-3 text-red-600">No</td>
                <td className="p-3 text-red-600">No</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50">Password Protection</td>
                <td className="p-3 bg-[#ffe600] text-black">INCLUDED</td>
                <td className="p-3 text-red-600">Plus ($59/mo)</td>
                <td className="p-3 text-red-600">Pro ($29/mo)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ArchitectureDoc() {
  return (
    <div className="space-y-12">
      <section id="system-overview" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          High-Level System Overview
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed">
          Folly follows a modern <strong>client-owned data model</strong>: the browser holds full structural authority over the form graph, while the backend serves as a high-speed, lightweight JSONB persistence layer.
        </p>

        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] font-mono text-xs space-y-4">
          <div className="font-bold text-neutral-500 uppercase">// SYSTEM TOPOLOGY</div>
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="border-2 border-black bg-[#ffe600] p-3 shadow-[2px_2px_0px_#000]">
              <div className="font-black">CLIENT (VITE + REACT)</div>
              <div className="text-[10px] mt-1 font-bold">Zustand State Store + Optimistic Mutations</div>
            </div>
            <div className="border-2 border-black bg-[#5ce1e6] p-3 shadow-[2px_2px_0px_#000]">
              <div className="font-black">API (EXPRESS 5)</div>
              <div className="text-[10px] mt-1 font-bold">Node.js Server + Static Delivery (:3001)</div>
            </div>
            <div className="border-2 border-black bg-[#ff90e8] p-3 shadow-[2px_2px_0px_#000]">
              <div className="font-black">STORAGE (POSTGRESQL)</div>
              <div className="text-[10px] mt-1 font-bold">JSONB Document Engine (Port 5440)</div>
            </div>
          </div>
        </div>
      </section>

      <section id="client-architecture" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Client Architecture (SPA)
        </h2>

        <div id="optimistic-persistence" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Optimistic State & 350ms Debounced Sync</h3>
          <p className="font-medium text-neutral-800 text-sm leading-relaxed">
            Every keystroke, block addition, and theme change updates the in-memory Zustand store instantly (<code className="font-mono bg-neutral-100 px-1 border border-black">src/store.ts</code>). Changes are mirrored to the Express API with an automatic 350ms debounce timer, ensuring zero input lag on typing while maintaining continuous persistence.
          </p>
        </div>

        <div id="hardened-state-machine" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Respondent State Machine</h3>
          <p className="font-medium text-neutral-800 text-sm leading-relaxed">
            In public forms (<code className="font-mono bg-neutral-100 px-1 border border-black">src/pages/PublicForm.tsx</code>), page navigation uses a hardened state machine:
          </p>
          <ul className="space-y-2 text-sm font-bold text-neutral-800">
            <li className="flex items-start gap-2">
              <span className="text-[#00ef84]">✔</span>
              <span><strong>Canonical Partitioning:</strong> Pages are split stably via <code className="font-mono bg-neutral-100 px-1 border border-black">splitBlocksByPage()</code> so page jumps never desync when blocks are conditionally hidden.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ef84]">✔</span>
              <span><strong>Empty Page Skipping:</strong> If conditional rules hide all questions on an intermediate page, the navigator auto-advances to the next visible page or transitions directly to submit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ef84]">✔</span>
              <span><strong>History Stack:</strong> A dedicated <code className="font-mono bg-neutral-100 px-1 border border-black">pageHistory</code> array records each jump, enabling safe, non-cyclic Back button navigation.</span>
            </li>
          </ul>
        </div>
      </section>

      <section id="backend-database" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#00ef84] border-2 border-black inline-block" />
          Backend & Database Architecture
        </h2>

        <div id="jsonb-documents" className="space-y-3 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">PostgreSQL JSONB Document Storage</h3>
          <p className="font-medium text-neutral-800 text-sm leading-relaxed">
            Instead of managing dozens of fragile relational tables (blocks, options, conditions, settings), Folly stores each form and submission as a first-class <strong>JSONB document</strong> in PostgreSQL.
          </p>
          <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto">
            <pre>{`-- Core Database Tables (server/index.mjs)
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>
      </section>

      <section id="data-flow-diagram" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          End-to-End Data Flow
        </h2>
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] font-mono text-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="border-2 border-black px-2 py-1 bg-[#ffe600] font-black">CREATOR</span>
            <span>→</span>
            <span className="border-2 border-black px-2 py-1 bg-white font-bold">Vite Canvas Editor</span>
            <span>→</span>
            <span className="border-2 border-black px-2 py-1 bg-[#5ce1e6] font-bold">PUT /api/forms/:id</span>
            <span>→</span>
            <span className="border-2 border-black px-2 py-1 bg-[#00ef84] font-bold">Postgres JSONB</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t-2 border-black">
            <span className="border-2 border-black px-2 py-1 bg-[#ff90e8] font-black">RESPONDENT</span>
            <span>→</span>
            <span className="border-2 border-black px-2 py-1 bg-white font-bold">PublicForm (/r/:id)</span>
            <span>→</span>
            <span className="border-2 border-black px-2 py-1 bg-[#5ce1e6] font-bold">POST /api/submissions/:id</span>
            <span>→</span>
            <span className="border-2 border-black px-2 py-1 bg-[#00ef84] font-bold">Postgres JSONB</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function HowToUseDoc() {
  return (
    <div className="space-y-12">
      <section id="canvas-model" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          The Document Canvas
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed">
          The editor in Folly functions like a live, interactive document. You click any line to begin writing your question prompt, customize descriptions, or press <kbd className="font-mono border border-black bg-white px-1.5 py-0.5 text-xs shadow-[1px_1px_0px_#000] font-bold">/</kbd> to insert any block.
        </p>
      </section>

      <section id="slash-menu" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Slash Menu (/) & Shortcuts
        </h2>
        <p className="font-medium text-neutral-800 text-sm leading-relaxed">
          Pressing slash <code className="bg-[#ffe600] text-black px-1 border border-black font-mono font-bold text-xs">/</code> summons the block picker menu right at your cursor. You can filter by typing keywords (e.g. <code className="font-mono bg-neutral-100 px-1 border border-black">/choice</code>, <code className="font-mono bg-neutral-100 px-1 border border-black">/date</code>, <code className="font-mono bg-neutral-100 px-1 border border-black">/nps</code>) and hit Enter.
        </p>

        <div id="keyboard-navigation" className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000] scroll-mt-24">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black text-white uppercase border-b-2 border-black">
              <tr>
                <th className="p-3">Key</th>
                <th className="p-3">Function</th>
                <th className="p-3">Behavior</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black font-bold">
              <tr>
                <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">/</kbd></td>
                <td className="p-3">Trigger Palette</td>
                <td className="p-3 text-neutral-600">Opens block inserter</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">Enter</kbd></td>
                <td className="p-3">New Question Block</td>
                <td className="p-3 text-neutral-600">Appends next field below</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">Backspace</kbd></td>
                <td className="p-3">Remove Block</td>
                <td className="p-3 text-neutral-600">Deletes current empty block</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50"><kbd className="border border-black px-1.5 py-0.5 bg-white shadow-[1px_1px_0px_#000]">**text**</kbd></td>
                <td className="p-3">Bold Text</td>
                <td className="p-3 text-neutral-600">Converts inline to bold</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="block-palette" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#00ef84] border-2 border-black inline-block" />
          Available Block Types
        </h2>

        <div id="input-fields" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Input & Text Fields</h3>
          <p className="text-sm font-medium text-neutral-700">
            <strong>Short Text</strong> (names/titles), <strong>Long Text</strong> (paragraphs/feedback), <strong>Email</strong> (RFC syntax checked), <strong>Phone</strong> (international dial codes), <strong>Number</strong> (min/max range), <strong>Date & Time</strong>, <strong>Address</strong>, and <strong>File Upload</strong>.
          </p>
        </div>

        <div id="choice-selectors" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Choices, Badges & Options</h3>
          <p className="text-sm font-medium text-neutral-700">
            <strong>Multiple Choice</strong> (radio-style single select), <strong>Checkboxes</strong> (multi-select), and <strong>Dropdown</strong> menus. Each item includes auto-generated letter badges (A, B, C...) and an optional write-in "Other" option.
          </p>
        </div>

        <div id="scales-ratings" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Ratings, NPS & Drag-to-Rank</h3>
          <p className="text-sm font-medium text-neutral-700">
            <strong>Star Rating</strong> (1–5 or 1–10 stars), <strong>Net Promoter Score (NPS)</strong> (0–10 Detractor to Promoter scale), <strong>Opinion Scale</strong>, <strong>Matrix Grid</strong> (evaluate rows against scale columns), and <strong>Drag-to-Rank</strong> (drag options to prioritize).
          </p>
        </div>

        <div id="structural-media" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Media, Embeds & Pages</h3>
          <p className="text-sm font-medium text-neutral-700">
            <strong>Headings (H1–H3)</strong>, <strong>Paragraphs</strong>, <strong>Dividers</strong>, <strong>Image Uploads</strong>, <strong>Page Breaks</strong> (for multi-step flows), <strong>Thank You Pages</strong>, and <strong>Live Embeds</strong> (YouTube, Vimeo, Figma, Loom, Spotify).
          </p>
        </div>
      </section>

      <section id="multi-column-splits" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          Multi-Column Drag Splitting
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Want First Name and Last Name on the same horizontal row? Grab the 6-dot drag handle on any block, drag it towards the left or right edge of an adjacent question, and drop it when the blue column guide lights up. Folly automatically creates responsive CSS Grid multi-column rows.
        </p>
      </section>
    </div>
  )
}

function LogicAndRoutingDoc() {
  return (
    <div className="space-y-12">
      <section id="conditional-rules" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          Conditional Show / Hide Rules
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Click the <span className="font-mono font-bold bg-[#ffe600] px-1 border border-black text-xs">LOGIC</span> button in the top action bar to define routing rules.
        </p>
        <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] font-mono text-xs space-y-2">
          <div className="font-bold text-neutral-500 uppercase">// EXAMPLE CONDITIONAL RULES</div>
          <div className="bg-neutral-50 p-3 border border-black space-y-1">
            <div><span className="text-purple-600 font-bold">SHOW</span> "T-Shirt Size" <span className="text-blue-600 font-bold">IF</span> "Will you attend in person?" <span className="text-emerald-600 font-bold">EQUALS</span> "Yes"</div>
            <div><span className="text-rose-600 font-bold">HIDE</span> "Parent Consent" <span className="text-blue-600 font-bold">IF</span> "Age" <span className="text-emerald-600 font-bold">GREATER THAN</span> 18</div>
          </div>
        </div>
      </section>

      <section id="page-jumps" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Page Navigation & Jumps
        </h2>

        <div id="empty-page-skipping" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Empty Page Auto-Skipping</h3>
          <p className="font-medium text-neutral-800 text-sm leading-relaxed">
            In multi-page forms, if user answers cause all questions on Page 2 to become hidden, Folly detects this automatically and advances straight to Page 3 (or triggers form submission if no visible questions remain).
          </p>
        </div>

        <div id="history-back-safety" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Traversal History & Back Safety</h3>
          <p className="font-medium text-neutral-800 text-sm leading-relaxed">
            When respondents click "Back", Folly pops the exact page from an internal history stack rather than blindly doing <code className="font-mono bg-neutral-100 px-1 border border-black">currentPage - 1</code>. This prevents respondents from getting stuck in branching loops.
          </p>
        </div>
      </section>

      <section id="answer-piping" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#00ef84] border-2 border-black inline-block" />
          Dynamic Answer Piping (@)
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Type <code className="bg-[#ffe600] px-1.5 py-0.5 border border-black font-mono font-bold text-xs">@</code> anywhere in a question title or description to recall an answer given earlier.
        </p>
        <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] text-sm font-bold">
          "Welcome <span className="bg-[#5ce1e6] px-1 border border-black">@Name</span>! How many people are on your team?"
        </div>
      </section>

      <section id="quiz-scoring" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          Quiz Scoring & Point Calculations
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Assign point values to options (e.g. Correct = 10, Wrong = 0). Add a <strong>Score Block</strong> to calculate sums or evaluate final scores for pass/fail thank-you messages.
        </p>
      </section>
    </div>
  )
}

function CustomCssDoc({ onCopy, copiedIdx }: { onCopy: (code: string, idx: number) => void; copiedIdx: number | null }) {
  return (
    <div className="space-y-12">
      <section id="css-architecture" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          CSS Engine Architecture
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Folly injects custom styles into a scoped stylesheet within the form runner. Every question block, input wrapper, choice card, and letter badge receives deterministic CSS classes and data attributes.
        </p>
      </section>

      <section id="question-selectors" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Question-Level Selectors
        </h2>

        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black text-white uppercase border-b-2 border-black">
              <tr>
                <th className="p-3">Selector</th>
                <th className="p-3">Target Element</th>
                <th className="p-3">Sample CSS Rule</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black font-bold">
              <tr id="all-questions" className="scroll-mt-24">
                <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q</code></td>
                <td className="p-3">Every question wrapper on form</td>
                <td className="p-3 font-mono text-neutral-600">border-left: 4px solid #000;</td>
              </tr>
              <tr id="numbered-questions" className="scroll-mt-24">
                <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q1</code>, <code className="text-blue-600">.q2</code></td>
                <td className="p-3">Target by question number (1, 2...)</td>
                <td className="p-3 font-mono text-neutral-600">background: #ffe600;</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-multi</code></td>
                <td className="p-3">All Multiple Choice questions</td>
                <td className="p-3 font-mono text-neutral-600">margin-bottom: 2rem;</td>
              </tr>
              <tr id="options-and-badges" className="scroll-mt-24">
                <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-option</code></td>
                <td className="p-3">Choice option cards</td>
                <td className="p-3 font-mono text-neutral-600">box-shadow: 4px 4px 0px #000;</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-badge</code></td>
                <td className="p-3">The letter badge ('A', 'B')</td>
                <td className="p-3 font-mono text-neutral-600">border-radius: 9999px;</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50"><code className="text-blue-600">.q-label</code></td>
                <td className="p-3">The text inside an option</td>
                <td className="p-3 font-mono text-neutral-600">font-weight: 800;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="copyable-recipes" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          Copyable Custom CSS Themes
        </h2>
        <p className="font-medium text-neutral-800 text-sm leading-relaxed">
          Open the <strong>THEME</strong> drawer in your form editor, paste any snippet into <strong>Custom CSS</strong>, and hit save:
        </p>

        <div className="space-y-4">
          {CSS_RECIPES.map((recipe, idx) => (
            <div key={recipe.name} className="border-2 border-black bg-white shadow-[3px_3px_0px_#000]">
              <div className="bg-black text-white px-4 py-2 flex items-center justify-between font-mono text-xs font-bold">
                <span className="uppercase">{recipe.name}</span>
                <button
                  onClick={() => onCopy(recipe.code, idx)}
                  className="bg-[#ffe600] text-black px-2 py-0.5 border border-black font-black uppercase text-[10px] hover:bg-white transition"
                >
                  {copiedIdx === idx ? 'COPIED ✓' : 'COPY CSS 📋'}
                </button>
              </div>
              <div className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
                <pre>{recipe.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SelfHostingDoc() {
  return (
    <div className="space-y-12">
      <section id="docker-compose" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          Docker Compose (Recommended)
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Run Folly on any VPS or local machine with Docker:
        </p>
        <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto shadow-[3px_3px_0px_#000]">
          <pre>{`git clone https://github.com/dionjoshualobo/folly.so.git
cd folly.so
docker compose up -d --build`}</pre>
        </div>
        <p className="text-xs font-bold text-neutral-600">
          Everything is served on <code>http://localhost:3001</code>. PostgreSQL runs on port 5440.
        </p>
      </section>

      <section id="local-node-setup" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Local Node.js + Postgres Setup
        </h2>
        <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto shadow-[3px_3px_0px_#000]">
          <pre>{`npm install
cp .env.example .env
npm run dev   # Starts Postgres on :5440, API on :3001, Vite dev on :5173`}</pre>
        </div>
      </section>

      <section id="env-variables" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#00ef84] border-2 border-black inline-block" />
          Environment Configuration
        </h2>
        <div className="overflow-x-auto border-2 border-black shadow-[3px_3px_0px_#000]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black text-white uppercase border-b-2 border-black">
              <tr>
                <th className="p-3">Variable</th>
                <th className="p-3">Default</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black font-bold">
              <tr>
                <td className="p-3 bg-neutral-50">DATABASE_URL</td>
                <td className="p-3 text-neutral-600">postgres://folly:folly@localhost:5440/folly</td>
                <td className="p-3">PostgreSQL connection string</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50">PORT</td>
                <td className="p-3 text-neutral-600">3001</td>
                <td className="p-3">Express API & static file port</td>
              </tr>
              <tr>
                <td className="p-3 bg-neutral-50">SEED_DEMO</td>
                <td className="p-3 text-neutral-600">true</td>
                <td className="p-3">Auto-seed sample forms if empty</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="reverse-proxy" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          Reverse Proxy (Nginx / Cloudflare)
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Point your domain's reverse proxy (e.g. Nginx or Cloudflare Tunnel) to port <code>3001</code> with standard WebSocket and HTTP proxy headers.
        </p>
      </section>
    </div>
  )
}

function ApiReferenceDoc() {
  return (
    <div className="space-y-12">
      <section id="api-overview" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          API Design & Philosophy
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          Folly provides a minimalist JSON REST API under <code className="font-mono bg-neutral-100 px-1 border border-black">/api</code>. All mutations operate atomically on full JSONB documents.
        </p>
      </section>

      <section id="forms-endpoints" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Forms Endpoints
        </h2>
        <div className="space-y-3 font-mono text-xs">
          <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_#000]">
            <span className="bg-[#00ef84] text-black px-2 py-0.5 border border-black font-black mr-2">GET</span>
            <span className="font-bold">/api/forms</span>
            <div className="text-[11px] text-neutral-600 mt-1">Returns all created forms metadata and blocks.</div>
          </div>
          <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_#000]">
            <span className="bg-[#ffe600] text-black px-2 py-0.5 border border-black font-black mr-2">POST</span>
            <span className="font-bold">/api/forms</span>
            <div className="text-[11px] text-neutral-600 mt-1">Create or duplicate a new form JSON document.</div>
          </div>
          <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_#000]">
            <span className="bg-[#5ce1e6] text-black px-2 py-0.5 border border-black font-black mr-2">PUT</span>
            <span className="font-bold">/api/forms/:id</span>
            <div className="text-[11px] text-neutral-600 mt-1">Update form blocks, themes, or settings document.</div>
          </div>
        </div>

        <div id="form-json-schema" className="mt-4 space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Form Block JSON Schema</h3>
          <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto">
            <pre>{`{
  "id": "block_8f3a1",
  "type": "multipleChoice",
  "text": "What is your preferred deployment?",
  "required": true,
  "options": [
    { "id": "opt_1", "label": "Docker Compose" },
    { "id": "opt_2", "label": "Cloudflare Pages" }
  ],
  "conditional": {
    "action": "show",
    "fieldId": "block_prev",
    "operator": "equals",
    "value": "Yes"
  }
}`}</pre>
          </div>
        </div>
      </section>

      <section id="submissions-endpoints" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#00ef84] border-2 border-black inline-block" />
          Submissions Endpoints
        </h2>
        <div className="space-y-3 font-mono text-xs">
          <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_#000]">
            <span className="bg-[#00ef84] text-black px-2 py-0.5 border border-black font-black mr-2">GET</span>
            <span className="font-bold">/api/submissions/:formId</span>
            <div className="text-[11px] text-neutral-600 mt-1">Retrieve all submission responses for a form.</div>
          </div>
          <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_#000]">
            <span className="bg-[#ffe600] text-black px-2 py-0.5 border border-black font-black mr-2">POST</span>
            <span className="font-bold">/api/submissions/:formId</span>
            <div className="text-[11px] text-neutral-600 mt-1">Record a new respondent answer payload.</div>
          </div>
        </div>

        <div id="submission-payload" className="mt-4 space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Submission Payload Format</h3>
          <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto">
            <pre>{`{
  "answers": {
    "block_name": "Sarah Connor",
    "block_choice": "Docker Compose",
    "block_score": 100
  },
  "submittedAt": 1773412995000
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  )
}

function McpAgentsDoc() {
  return (
    <div className="space-y-12">
      <section id="mcp-overview" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ffe600] border-2 border-black inline-block" />
          What is the Folly MCP Server?
        </h2>
        <p className="font-medium text-neutral-800 leading-relaxed text-sm">
          The <strong>Model Context Protocol (MCP)</strong> is the open standard connecting AI coding assistants (like Claude, Cursor, and Gemini) to external tools and data sources. The Folly MCP Server enables AI agents to converse with users and directly build, configure, and inspect forms on their behalf.
        </p>
      </section>

      <section id="agent-primitives" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#5ce1e6] border-2 border-black inline-block" />
          Agent Tool Primitives
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="font-black text-black">create_form(title, description?)</div>
            <div className="text-[11px] text-neutral-600 mt-1">Initializes a new blank form canvas.</div>
          </div>
          <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="font-black text-black">add_block(formId, blockType, config)</div>
            <div className="text-[11px] text-neutral-600 mt-1">Appends any question, choice, or layout block.</div>
          </div>
          <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="font-black text-black">set_logic(formId, blockId, rule)</div>
            <div className="text-[11px] text-neutral-600 mt-1">Attaches conditional show/hide or jump rules.</div>
          </div>
          <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <div className="font-black text-black">export_submissions(formId, format)</div>
            <div className="text-[11px] text-neutral-600 mt-1">Exports answers as JSON or CSV stream.</div>
          </div>
        </div>

        <div id="conversational-flow" className="space-y-2 scroll-mt-24">
          <h3 className="text-lg font-black uppercase">Conversational Form Creation Flow</h3>
          <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] text-xs font-mono space-y-2">
            <div><strong>User:</strong> "Hey Claude, build me a 3-step customer onboarding survey with NPS and custom yellow CSS."</div>
            <div className="text-neutral-500">→ Agent invokes <code>create_form()</code>, calls <code>add_block()</code> for inputs & NPS, then sets theme styles.</div>
            <div className="text-emerald-600 font-bold">✔ Agent returns ready-to-share link: /f/customer-onboarding</div>
          </div>
        </div>
      </section>

      <section id="connecting-clients" className="space-y-4 scroll-mt-24">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-[#ff90e8] border-2 border-black inline-block" />
          Connecting AI Clients (Claude / Cursor)
        </h2>
        <div className="border-2 border-black bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto shadow-[3px_3px_0px_#000]">
          <pre>{`// Add to claude_desktop_config.json or cursor settings
{
  "mcpServers": {
    "folly": {
      "command": "node",
      "args": ["/path/to/folly.so/mcp/index.mjs"],
      "env": {
        "FOLLY_API_URL": "http://localhost:3001"
      }
    }
  }
}`}</pre>
        </div>
      </section>
    </div>
  )
}
