import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/ui'
import { useForms } from '../store'
import { CopyCommand, FormDemo, SlashDemo, btn } from './LandingDemos'

// Sections are scrolled to from buttons, not #anchors: the app uses HashRouter,
// so a plain href="#demo" would be read as a route.
const SECTIONS = [
  { id: 'demo', label: 'Live demo', hover: 'hover:bg-[#ffe600]' },
  { id: 'blocks', label: 'Slash menu', hover: 'hover:bg-[#5ce1e6]' },
  { id: 'self-host', label: 'Self-host', hover: 'hover:bg-[#00ef84]' },
]

const h2 = 'text-4xl font-black uppercase leading-[1.1] tracking-tight sm:text-5xl'
const lead = 'text-lg font-bold leading-relaxed text-neutral-700'

function jump(id: string) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
}

const FAQS = [
  {
    q: 'Is Folly really completely free?',
    a: 'Yes. Folly is an open-source alternative to form builders that charge $39 to $99 per month. Unlimited forms, unlimited questions and unlimited responses.',
  },
  {
    q: 'How does logic jumping work?',
    a: 'Add a rule to any question block: “Show block if”, “Hide block if” or “Jump to page if”, based on what the respondent answered earlier. The Logic tab in the demo above runs on the same rules.',
  },
  {
    q: 'Can I use custom URLs?',
    a: 'Yes. In the form settings, set a slug like /f/my-event-rsvp or /f/user-research and share that link.',
  },
  {
    q: 'What else is included?',
    a: 'Webhooks that send every response to your own endpoint as JSON, one-click CSV export, drafts that survive a refresh, and password protection, response limits and close dates for any form.',
  },
  {
    q: 'Do you track or sell respondent data?',
    a: 'Never. No surveillance cookies, no third-party ad pixels and no analytics SDKs following your respondents around the web.',
  },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const go = () => {
    useForms.getState().createForm()
    window.location.hash = '#/forms'
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] font-sans text-black selection:bg-[#ffe600] selection:text-black">
      <div className="flex items-center justify-between overflow-hidden border-b-2 border-black bg-[#ffe600] px-6 py-2 text-xs font-black uppercase tracking-wider">
        <span className="whitespace-nowrap">★ 100% free forever · Zero commissions · Unlimited responses · Open source ★</span>
        <span className="hidden font-mono md:inline">MIT licensed</span>
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-black bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="-rotate-2 border-2 border-black bg-[#ffe600] px-2.5 py-1 text-sm font-black shadow-[2px_2px_0px_#000]">
            FOLLY.SO
          </Link>

          <nav className="hidden items-center gap-2 text-sm font-bold uppercase tracking-wide lg:flex">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => jump(s.id)} className={`border-2 border-transparent px-2 py-1 uppercase transition hover:border-black ${s.hover}`}>
                {s.label}
              </button>
            ))}
            <Link to="/docs" className="border-2 border-transparent px-2 py-1 transition hover:border-black hover:bg-[#ff5a27]">
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/forms" className="hidden border-2 border-black px-4 py-2 text-xs font-black uppercase transition hover:bg-neutral-100 sm:inline-block">
              Dashboard
            </Link>
            <button onClick={go} className={`${btn} bg-[#ffe600] px-5 py-2.5 text-xs`}>
              Create form
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:hidden"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            className="absolute inset-x-0 top-full flex flex-col border-y-2 border-black bg-white text-sm font-black uppercase shadow-[0_6px_0px_#000] lg:hidden [&>*]:px-6"
          >
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setMenuOpen(false)
                  jump(s.id)
                }}
                className={`border-b-2 border-black px-4 py-3.5 text-left uppercase ${s.hover}`}
              >
                {s.label}
              </button>
            ))}
            <Link to="/docs" className="border-b-2 border-black px-4 py-3.5 hover:bg-[#ff5a27]">
              Docs
            </Link>
            <Link to="/forms" className="px-4 py-3.5 hover:bg-neutral-100">
              Dashboard
            </Link>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl space-y-28 px-6 pb-8 pt-12">
        <section className="mx-auto max-w-5xl space-y-7 text-center">
          <div className="inline-block -rotate-1 border-2 border-black bg-[#ff90e8] px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0px_#000]">
            Why pay $49/mo for 100 responses?
          </div>

          <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">
            Create forms
            <br />
            <span className="mt-3 inline-block -rotate-1 border-2 border-black bg-[#ffe600] px-4 py-1 shadow-[6px_6px_0px_#000] lg:whitespace-nowrap">that actually slap.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-bold leading-relaxed text-neutral-800">
            Write your questions like a doc, press <code className="border border-black bg-[#5ce1e6] px-1.5 py-0.5 font-mono">/</code> for blocks, and
            collect unlimited responses for $0. Everything below is the real form engine running in your browser, so go ahead and poke it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <button onClick={() => jump('demo')} className={`${btn} bg-[#ffe600] px-8 py-4 text-sm`}>
              Try the live demo ↓
            </button>
            <button onClick={go} className={`${btn} bg-white px-6 py-4 text-sm`}>
              Create a form
            </button>
          </div>
        </section>

        <section id="demo" className="scroll-mt-28 space-y-6">
          <FormDemo />
        </section>

        <section id="blocks" className="grid scroll-mt-28 items-start gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:sticky lg:top-28 lg:col-span-4">
            <h2 className="text-4xl font-black uppercase leading-[1.15] tracking-tight sm:text-5xl sm:leading-[1.15]">
              Type <span className="border-2 border-black bg-[#5ce1e6] px-2">/</span> to summon any block.
            </h2>
            <p className="text-base font-bold leading-relaxed text-neutral-800">
              No sidebar, no drag-and-drop wizard. This is a working slice of the editor: build something here, then carry it into the real thing.
            </p>
            <ul className="space-y-2 text-sm font-bold">
              {[
                ['/', 'opens the block menu'],
                ['/rat', 'filters it as you type'],
                ['↑ ↓ Enter', 'picks a block'],
                ['Enter', 'on plain text adds a question'],
              ].map(([key, what]) => (
                <li key={key} className="flex items-baseline gap-3">
                  <kbd className="shrink-0 border-2 border-black bg-white px-2 py-0.5 font-mono text-xs font-bold shadow-[2px_2px_0px_#000]">{key}</kbd>
                  <span>{what}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <SlashDemo />
          </div>
        </section>

        <div className="space-y-32 pt-4 lg:space-y-44 lg:pt-12">
          <section id="self-host" className="grid scroll-mt-28 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="min-w-0 space-y-7">
              <h2 className={h2}>Run it yourself.</h2>
              <p className={`${lead} max-w-md`}>
                The whole stack is one Compose file. Your forms and responses live in your own Postgres, on your own network.
              </p>
              <ul className="flex flex-wrap gap-3 text-xs font-black uppercase">
                {['Express server', 'Postgres', 'One container', 'MIT licensed'].map((t) => (
                  <li key={t} className="border-2 border-black bg-white px-3 py-1.5 shadow-[2px_2px_0px_#000]">
                    {t}
                  </li>
                ))}
              </ul>
              <Link to="/docs" className="inline-block text-sm font-black uppercase underline decoration-2 underline-offset-4 hover:bg-[#ffe600]">
                Read the docs
              </Link>
            </div>
            <div className="min-w-0 space-y-6">
              <CopyCommand lines={['git clone https://github.com/dionjoshualobo/folly.so.git', 'cd folly.so', 'docker compose up --build']} />
              <p className="text-sm font-bold leading-relaxed text-neutral-700">Then open http://localhost:3001. Demo forms are seeded on first launch.</p>
            </div>
          </section>

          <section className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-5 lg:col-span-4">
              <h2 className={h2}>Frequently asked questions</h2>
              <p className={lead}>
                Something else on your mind?{' '}
                <Link to="/docs" className="text-black underline decoration-2 underline-offset-4 hover:bg-[#ffe600]">
                  The docs go deeper.
                </Link>
              </p>
            </div>
            <div className="space-y-6 lg:col-span-8">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-6 text-base font-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:px-8 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black bg-[#ffe600] font-black">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="border-t-2 border-black bg-neutral-50 px-6 py-6 text-base font-bold leading-relaxed text-neutral-700 sm:px-8">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="space-y-9 border-2 border-black bg-[#ffe600] px-8 py-16 text-center shadow-[10px_10px_0px_#000] sm:px-14 sm:py-24">
            <h2 className="mx-auto max-w-3xl text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl">Stop wasting money on forms.</h2>
            <p className="mx-auto max-w-xl text-base font-bold leading-relaxed sm:text-lg">
              Build your first form in 30 seconds. No credit card, no email confirmation runaround.
            </p>
            <button onClick={go} className={`${btn} bg-black px-10 py-5 text-sm text-white shadow-[6px_6px_0px_#fff] hover:bg-[#ff90e8] hover:text-black sm:text-base`}>
              Create your first form
            </button>
          </section>
        </div>
      </main>

      <footer className="mt-20 border-t-2 border-black bg-white px-6 py-12 font-mono text-xs font-bold">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <LogoMark className="h-6 w-6" />
            <span className="text-sm font-black uppercase tracking-wider">Folly.so</span>
          </div>
          <div className="flex gap-6 uppercase text-neutral-600">
            <Link to="/docs/how-to-use" className="hover:text-black hover:underline">
              How to use
            </Link>
            <Link to="/docs" className="hover:text-black hover:underline">
              Docs
            </Link>
            <Link to="/forms" className="hover:text-black hover:underline">
              Dashboard
            </Link>
          </div>
          <span className="text-neutral-500">© 2026 Folly.so · MIT licensed</span>
        </div>
      </footer>
    </div>
  )
}
