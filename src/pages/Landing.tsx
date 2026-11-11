import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/ui'
import { useForms } from '../store'

const FEATURES = [
  {
    title: 'DOCUMENT-STYLE EDITING',
    bg: '#ffe600',
    tag: 'KEYBOARD NATIVE',
    desc: 'Write questions naturally like a Notion document. Press / for blocks, drag handles to reorder, and never touch a clumsy sidebar.',
  },
  {
    title: 'UNLIMITED FREE INTAKE',
    bg: '#5ce1e6',
    tag: 'ZERO PAYWALLS',
    desc: 'Collect 10 responses or 100,000 without hitting an artificial billing limit. Your data belongs to you, always.',
  },
  {
    title: 'CONDITIONAL LOGIC & JUMPS',
    bg: '#ff90e8',
    tag: 'SMART ROUTING',
    desc: 'Show or hide questions dynamically based on prior answers, or jump respondents directly to specific pages with instant logic.',
  },
  {
    title: 'VANITY URL PATHS',
    bg: '#00ef84',
    tag: 'CUSTOM SLUGS',
    desc: 'Claim clean, memorable links like /f/rsvp, /f/feedback, or /f/apply instead of random hexadecimal machine hashes.',
  },
  {
    title: 'CLIENT DRAFT RESTORE',
    bg: '#ff5a27',
    tag: 'LOCAL PERSISTENCE',
    desc: 'Respondents never lose half-typed answers if their connection drops or they refresh the tab. Automatic local draft recovery.',
  },
  {
    title: 'WEBHOOK DISPATCH & EXPORT',
    bg: '#a855f7',
    tag: 'OPEN TELEMETRY',
    desc: 'Real-time JSON signals sent straight to your webhooks, Supabase, Discord, or Slack, plus instant CSV exports anytime.',
  },
]

const FAQS = [
  {
    q: 'IS FOLLY REALLY COMPLETELY FREE?',
    a: 'Yes. Folly is built as an open-source, indie alternative to corporate form builders that charge $39 to $99 per month. Unlimited forms, unlimited questions, and unlimited responses.',
  },
  {
    q: 'HOW DOES LOGIC JUMPING WORK?',
    a: 'You can configure conditional rules on any question block. Choose "Show block if", "Hide block if", or "Jump to page if" based on respondent answers.',
  },
  {
    q: 'CAN I USE CUSTOM URLS?',
    a: 'Yes! In the form settings, you can define a custom slug like /f/my-event-rsvp or /f/user-research and share it directly.',
  },
  {
    q: 'DO YOU TRACK OR SELL RESPONDENT DATA?',
    a: 'Never. No surveillance cookies, no third-party ad pixels, and no analytics SDKs tracking your users across the web.',
  },
]

export default function Landing() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const go = () => {
    useForms.getState().createForm()
    window.location.hash = '#/forms'
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] text-black font-sans selection:bg-[#ffe600] selection:text-black">
      {/* Top Warning Ribbon */}
      <div className="bg-[#ffe600] text-black font-black uppercase text-xs py-2 px-6 border-b-2 border-black flex justify-between items-center tracking-wider overflow-hidden">
        <span className="whitespace-nowrap">★ 100% FREE FOREVER · ZERO COMMISSIONS · UNLIMITED RESPONSES · OPEN SOURCE CRAFT ★</span>
        <span className="hidden md:inline font-mono">NEOBRUTALIST REVOLUTION // V.2.0</span>
      </div>

      {/* Retro Window Navigation Header */}
      <header className="border-b-2 border-black bg-white px-6 py-4 sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-[#ffe600] text-black border-2 border-black px-2.5 py-1 text-sm font-black -rotate-2 shadow-[2px_2px_0px_#000]">
                FOLLY.SO
              </span>
            </Link>
            <span className="text-xs font-mono font-bold uppercase hidden sm:inline bg-black text-white px-2 py-0.5">
              NO SUBSCRIPTIONS
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-bold text-sm uppercase tracking-wide">
            <a href="#features" className="hover:bg-[#ffe600] px-2 py-1 transition border-2 border-transparent hover:border-black">
              Features
            </a>
            <a href="#comparison" className="hover:bg-[#5ce1e6] px-2 py-1 transition border-2 border-transparent hover:border-black">
              Vs Monopoly
            </a>
            <a href="#faq" className="hover:bg-[#ff90e8] px-2 py-1 transition border-2 border-transparent hover:border-black">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/forms"
              className="text-xs font-black uppercase px-4 py-2 border-2 border-black hover:bg-neutral-100 transition hidden sm:inline-block"
            >
              Sign In
            </Link>
            <button
              onClick={go}
              className="bg-[#ffe600] text-black font-black text-xs uppercase px-5 py-2.5 border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            >
              CREATE FORM ⚡
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-14 space-y-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-[#ff90e8] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase rotate-[-1deg] shadow-[3px_3px_0px_#000]">
              WHY PAY $49/MO FOR 100 RESPONSES?
            </div>

            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight text-black leading-none">
              CREATE FORMS <br />
              <span className="bg-[#ffe600] px-4 py-1 border-2 border-black shadow-[5px_5px_0px_#000] inline-block -rotate-1 mt-2">
                THAT ACTUALLY SLAP.
              </span>
            </h1>

            <p className="text-lg font-bold text-neutral-800 max-w-lg leading-relaxed">
              No complex wizard drag-and-drop nonsense. Write your questions like a Notion doc,
              press slash <code className="bg-[#5ce1e6] px-1.5 py-0.5 border border-black font-mono font-bold">/</code> for blocks,
              and ship forms with unlimited responses for $0.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={go}
                className="bg-[#ffe600] text-black font-black uppercase text-sm px-8 py-4 border-2 border-black shadow-[5px_5px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all"
              >
                START CRUSHING IT (FREE) ⚡
              </button>
              <Link
                to="/forms"
                className="bg-white text-black font-black uppercase text-sm px-6 py-4 border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-neutral-50 transition"
              >
                OPEN WORKSPACE →
              </Link>
            </div>

            <div className="pt-6 border-t-2 border-black grid grid-cols-3 gap-4 font-mono text-xs font-bold">
              <div>
                <span className="text-2xl font-black block">$0.00</span>
                <span>NO SUBSCRIPTION</span>
              </div>
              <div>
                <span className="text-2xl font-black block">∞</span>
                <span>RESPONSES</span>
              </div>
              <div>
                <span className="text-2xl font-black block">100%</span>
                <span>DATA OWNERSHIP</span>
              </div>
            </div>
          </div>

          {/* Sticky Notes & Interactive Simulator */}
          <div className="lg:col-span-5 space-y-6">
            {/* Retro OS Window Interactive Simulator */}
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
              <div className="bg-[#ffe600] border-b-2 border-black px-4 py-2.5 flex justify-between items-center font-mono text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400 border border-black" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400 border border-black" />
                  <span className="h-3 w-3 rounded-full bg-green-400 border border-black" />
                  <span className="ml-2">LIVE_DEMO.EXE</span>
                </div>
                <span>[ _ ][ 口 ][ X ]</span>
              </div>

              <div className="p-6">
                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <span className="text-4xl block">🔥</span>
                    <h3 className="text-2xl font-black uppercase">BOOM! RESPONSE RECORDED</h3>
                    <p className="text-xs font-bold text-neutral-600">
                      You just tested the live form engine. Fast, punchy, zero friction.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false)
                        setSelectedOption(null)
                      }}
                      className="mt-4 bg-[#5ce1e6] text-black font-black px-4 py-2 text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#ffe600] transition"
                    >
                      TRY AGAIN ↺
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (selectedOption) setSubmitted(true)
                    }}
                    className="space-y-4"
                  >
                    <label className="block text-base sm:text-lg font-black uppercase text-black">
                      WHICH THING ANNOYS YOU MOST ABOUT MODERN FORMS?
                    </label>

                    <div className="space-y-2 pt-1">
                      {[
                        'Subscriptions that charge per response',
                        'Complex wizards that take 10 clicks per block',
                        'Sneaky tracking pixels and surveillance cookies',
                        'Ugly randomized URL slugs with no vanity names',
                      ].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full text-left p-3 border-2 border-black font-bold text-xs transition ${
                            selectedOption === opt
                              ? 'bg-[#ffe600] shadow-[3px_3px_0px_#000]'
                              : 'bg-white hover:bg-[#ff90e8]/20'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="pt-3 flex justify-between items-center border-t-2 border-black">
                      <span className="font-mono text-[11px] font-bold text-neutral-500">PICK AN ANSWER</span>
                      <button
                        type="submit"
                        disabled={!selectedOption}
                        className="bg-black text-white font-black uppercase px-5 py-2.5 border-2 border-black shadow-[3px_3px_0px_#000] disabled:opacity-40 hover:bg-[#ffe600] hover:text-black transition text-xs"
                      >
                        SUBMIT TEST →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sticker Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#5ce1e6] border-2 border-black p-4 shadow-[4px_4px_0px_#000] rotate-1">
                <span className="font-mono text-[10px] font-bold uppercase block text-black/70">STICKER // #01</span>
                <span className="text-base font-black uppercase block mt-1">ZERO FEES</span>
                <span className="text-xs font-bold text-black/80 mt-1 block">Free forever. No card required.</span>
              </div>
              <div className="bg-[#ff90e8] border-2 border-black p-4 shadow-[4px_4px_0px_#000] -rotate-1">
                <span className="font-mono text-[10px] font-bold uppercase block text-black/70">STICKER // #02</span>
                <span className="text-base font-black uppercase block mt-1">SLASH MENU</span>
                <span className="text-xs font-bold text-black/80 mt-1 block">Type / to summon any block.</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: FEATURE CARDS GRID */}
        <section id="features" className="pt-12">
          <div className="border-b-2 border-black pb-4 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="bg-black text-white px-2 py-0.5 text-xs font-mono font-bold uppercase">
                TOOLKIT ARCHITECTURE
              </span>
              <h2 className="text-4xl font-black uppercase tracking-tight mt-2">
                BUILT FOR MAXIMUM VELOCITY
              </h2>
            </div>
            <span className="font-mono text-xs font-bold">6 CORE WEAPONS INCLUDED</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="border-2 border-black bg-white shadow-[6px_6px_0px_#000] flex flex-col justify-between hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div
                    className="border-b-2 border-black px-4 py-2 flex justify-between items-center font-mono text-xs font-bold"
                    style={{ backgroundColor: feat.bg }}
                  >
                    <span>{feat.tag}</span>
                    <span>★</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black uppercase tracking-tight">{feat.title}</h3>
                    <p className="mt-3 text-xs font-bold text-neutral-700 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t-2 border-black bg-neutral-50 font-mono text-[10px] font-bold flex justify-between">
                  <span>STATUS: ACTIVATED</span>
                  <span>FOLLY ENGINE</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: CORPORATE MONOPOLY COMPARISON */}
        <section id="comparison" className="pt-12">
          <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">
            <div className="border-b-2 border-black pb-4 mb-6">
              <span className="bg-[#ff5a27] text-white px-2 py-0.5 text-xs font-mono font-bold uppercase">
                THE HARD TRUTH
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight mt-2">
                CORPORATE MONOPOLIES VS. FOLLY
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="border-2 border-black p-5 bg-[#fafafa] space-y-3">
                <span className="font-black uppercase text-sm block border-b-2 border-black pb-2 text-neutral-600">
                  THEIR WAY (TYPEFORM / JOTFORM)
                </span>
                <div className="flex justify-between py-1 border-b border-black/10 font-bold">
                  <span>MONTHLY RETAINER</span>
                  <span className="text-red-600">$39 TO $99/MO</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/10 font-bold">
                  <span>RESPONSE CAP</span>
                  <span className="text-red-600">100 RESPONSES / MO</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/10 font-bold">
                  <span>WATERMARK REMOVAL</span>
                  <span className="text-red-600">PAID TIER ONLY</span>
                </div>
                <div className="flex justify-between py-1 font-bold">
                  <span>DATA PRIVACY</span>
                  <span className="text-red-600">TRACKING COOKIES ACTIVE</span>
                </div>
              </div>

              <div className="border-2 border-black p-5 bg-[#ffe600] space-y-3 shadow-[4px_4px_0px_#000]">
                <span className="font-black uppercase text-sm block border-b-2 border-black pb-2 text-black">
                  OUR WAY (FOLLY.SO)
                </span>
                <div className="flex justify-between py-1 border-b border-black/20 font-black">
                  <span>MONTHLY RETAINER</span>
                  <span className="text-black">$0.00 (ALWAYS FREE)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20 font-black">
                  <span>RESPONSE CAP</span>
                  <span className="text-black">UNLIMITED (NO CEILING)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20 font-black">
                  <span>WATERMARK REMOVAL</span>
                  <span className="text-black">FREE FOREVER</span>
                </div>
                <div className="flex justify-between py-1 font-black">
                  <span>DATA PRIVACY</span>
                  <span className="text-black">100% PRIVATE & UNTETHERED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FAQS */}
        <section id="faq" className="pt-12">
          <div className="border-b-2 border-black pb-4 mb-8">
            <span className="bg-[#ff90e8] text-black px-2 py-0.5 text-xs font-mono font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000]">
              QUESTIONS ANSWERED
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight mt-2">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-4 max-w-3xl">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] cursor-pointer"
              >
                <div className="p-4 flex justify-between items-center font-bold text-sm uppercase">
                  <span>{faq.q}</span>
                  <span className="h-6 w-6 border-2 border-black flex items-center justify-center font-black bg-[#ffe600]">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </div>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 pt-1 border-t-2 border-black text-xs font-bold text-neutral-700 bg-neutral-50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: BOTTOM CALL TO ACTION */}
        <section className="pt-8">
          <div className="border-2 border-black bg-[#ffe600] p-8 sm:p-14 shadow-[10px_10px_0px_#000] text-center space-y-6">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
              STOP WASTING MONEY ON FORMS.
            </h2>
            <p className="text-base sm:text-lg font-bold max-w-xl mx-auto">
              Build your first form in 30 seconds. No credit card, no email confirmation runaround.
            </p>
            <button
              onClick={go}
              className="bg-black text-white font-black uppercase text-sm sm:text-base px-10 py-5 border-2 border-black shadow-[6px_6px_0px_#fff] hover:bg-[#ff90e8] hover:text-black transition"
            >
              CREATE YOUR FIRST FORM NOW ⚡
            </button>
          </div>
        </section>
      </main>

      {/* Neo-brutalist Footer */}
      <footer className="border-t-2 border-black bg-white py-12 px-6 text-xs font-mono font-bold mt-20">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-6 w-6" />
            <span className="text-sm font-black uppercase tracking-wider">
              FOLLY.SO // NEO-BRUTALIST EDITION
            </span>
          </div>

          <div className="flex gap-6 uppercase text-neutral-600">
            <Link to="/forms" className="hover:text-black hover:underline">
              Dashboard
            </Link>
            <a href="#features" className="hover:text-black hover:underline">
              Features
            </a>
            <a href="#comparison" className="hover:text-black hover:underline">
              Vs Monopolies
            </a>
          </div>

          <span className="text-neutral-500">© 2026 FOLLY SO · UNLIMITED FORM FREEDOM</span>
        </div>
      </footer>
    </div>
  )
}
