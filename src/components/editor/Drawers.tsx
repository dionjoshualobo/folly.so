import { useMemo, useState } from 'react'
import type { Form, FormTheme } from '../../types'
import { useForms } from '../../store'
import { Icon } from '../../blockCatalog'
import { themeFont } from '../ui'

const PRESETS: Array<{ name: string; theme: FormTheme }> = [
  { name: 'Clean', theme: { background: '#ffffff', button: '#0b0f19', buttonText: '#ffffff', font: 'system', darkMode: false } },
  { name: 'Midnight', theme: { background: '#0b0f19', button: '#ff5470', buttonText: '#ffffff', font: 'system', darkMode: true } },
  { name: 'Paper', theme: { background: '#fdf6ef', button: '#1a7f5a', buttonText: '#ffffff', font: 'serif', darkMode: false } },
  { name: 'Blush', theme: { background: '#fff5f6', button: '#ff5470', buttonText: '#ffffff', font: 'system', darkMode: false } },
  { name: 'Mint', theme: { background: '#effaf3', button: '#0b0f19', buttonText: '#ffffff', font: 'system', darkMode: false } },
  { name: 'Powder', theme: { background: '#eef3fb', button: '#3143b8', buttonText: '#ffffff', font: 'system', darkMode: false } },
]

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-medium text-ink/70">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-ink/45">{value}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-ink/10 bg-transparent p-0.5" />
      </span>
    </label>
  )
}

export function ThemeDrawer({ form, onClose }: { form: Form; onClose: () => void }) {
  const updateTheme = useForms((s) => s.updateTheme)
  const updateSettings = useForms((s) => s.updateSettings)
  const [tab, setTab] = useState<'theme' | 'form' | 'css'>('theme')
  const t = form.settings.theme

  const preview = useMemo(
    () => (
      <div
        className="mx-3 mt-3 overflow-hidden rounded-xl border border-black/5"
        style={{ background: t.background, fontFamily: themeFont(t.font) }}
      >
        <div className="px-4 pb-4 pt-5" style={{ color: t.darkMode ? '#f5f5f5' : '#1c1c1e' }}>
          <div className="text-[17px] font-semibold">Sample question?</div>
          <div className="mt-2 h-2 w-2/3 rounded-full" style={{ background: t.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
          <div className="mt-1.5 h-2 w-1/2 rounded-full" style={{ background: t.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
          <div className="mt-3 flex justify-end">
            <span
              className="rounded-full px-5 py-2 text-[13px] font-semibold shadow-md"
              style={{ background: t.button, color: t.buttonText }}
            >
              Submit
            </span>
          </div>
        </div>
      </div>
    ),
    [t],
  )

  return (
    <div className="animate-fade fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="animate-pop absolute right-0 top-0 flex h-full w-[340px] flex-col bg-white shadow-pop sm:w-[380px]">
        <div className="flex items-center justify-between border-b border-ink/[0.06] px-5 py-3.5">
          <div className="flex gap-1">
            <button
              onClick={() => setTab('theme')}
              className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${tab === 'theme' ? 'bg-ink text-white' : 'text-ink/50 hover:bg-ink/[0.05]'}`}
            >
              Appearance
            </button>
            <button
              onClick={() => setTab('form')}
              className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${tab === 'form' ? 'bg-ink text-white' : 'text-ink/50 hover:bg-ink/[0.05]'}`}
            >
              Form settings
            </button>
            <button
              onClick={() => setTab('css')}
              className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${tab === 'css' ? 'bg-ink text-white' : 'text-ink/50 hover:bg-ink/[0.05]'}`}
            >
              Custom CSS
            </button>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-ink/40 hover:bg-ink/[0.05] hover:text-ink">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'theme' ? (
            <>
              {preview}
              <div className="mt-5">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Presets</div>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => updateTheme(form.id, p.theme)}
                      className={`overflow-hidden rounded-xl border text-center transition ${
                        t.background === p.theme.background && t.button === p.theme.button && t.font === p.theme.font
                          ? 'border-ink ring-2 ring-ink/10'
                          : 'border-ink/10 hover:border-ink/30'
                      }`}
                    >
                      <span className="block h-8 w-full" style={{ background: p.theme.background }}>
                        <span
                          className="mx-auto mt-2.5 block h-3 w-8 rounded-full"
                          style={{ background: p.theme.button }}
                        />
                      </span>
                      <span className="block bg-white py-1.5 text-[12px] font-semibold text-ink/70">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Colors</div>
                <ColorField label="Background" value={t.background} onChange={(v) => updateTheme(form.id, { background: v })} />
                <ColorField label="Button" value={t.button} onChange={(v) => updateTheme(form.id, { button: v })} />
                <ColorField label="Button text" value={t.buttonText} onChange={(v) => updateTheme(form.id, { buttonText: v })} />
              </div>

              <div className="mt-6">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Typography</div>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { k: 'system', label: 'Modern', cls: 'font-sans' },
                      { k: 'serif', label: 'Serif', cls: 'font-form-serif' },
                      { k: 'playful', label: 'Mono', cls: 'font-mono' },
                      { k: 'custom', label: 'Custom', cls: 'font-sans' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.k}
                      onClick={() => updateTheme(form.id, { font: f.k })}
                      className={`rounded-xl border py-2.5 text-[14px] ${f.cls} font-semibold transition ${
                        t.font === f.k ? 'border-ink bg-ink/[0.03]' : 'border-ink/10 hover:border-ink/30'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {t.font === 'custom' && (
                  <div className="mt-3 p-3 rounded-xl border border-ink/10 bg-ink/[0.02]">
                    <div className="mb-1.5 text-[11px] font-medium text-ink/50">Upload Font File (TTF, OTF, WOFF)</div>
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          updateTheme(form.id, { customFontBase64: reader.result as string })
                        }
                        reader.readAsDataURL(file)
                      }}
                      className="w-full text-[12px] file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-ink/[0.05] file:px-2 file:py-1 file:text-[11px] file:font-semibold hover:file:bg-ink/10"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-ink/[0.06] pt-5 space-y-3">
                <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Header Media</div>
                <div>
                  <div className="mb-1 text-[11px] font-medium text-ink/50">Logo URL</div>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={form.settings.logoUrl ?? ''}
                    onChange={(e) => updateSettings(form.id, { logoUrl: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px] text-ink outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-medium text-ink/50">Cover Image URL</div>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={form.settings.coverImageUrl ?? ''}
                    onChange={(e) => updateSettings(form.id, { coverImageUrl: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[13px] text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>
            </>
          ) : tab === 'form' ? (
            <>
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 text-[13px] font-semibold text-ink/70">Thank you message</div>
                  <textarea
                    rows={3}
                    value={form.settings.thankYouMessage}
                    onChange={(e) => updateSettings(form.id, { thankYouMessage: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <div className="mb-1.5 text-[13px] font-semibold text-ink/70">Thank you redirect URL</div>
                  <input
                    type="url"
                    placeholder="https://example.com/thanks"
                    value={form.settings.thankYouRedirectUrl ?? ''}
                    onChange={(e) => updateSettings(form.id, { thankYouRedirectUrl: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[14px] text-ink outline-none focus:border-ink"
                  />
                  <p className="mt-1 text-[11px] text-ink/40">Redirects the user immediately after submitting the form.</p>
                </div>
                <div className="border-t border-ink/[0.06] pt-3">
                  <div className="mb-1.5 text-[13px] font-bold text-ink/75">Thank You Call-To-Action Button</div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 text-[11px] font-medium text-ink/50">Button Label</div>
                      <input
                        type="text"
                        placeholder="Visit our website"
                        value={form.settings.thankYouButtonText ?? ''}
                        onChange={(e) => updateSettings(form.id, { thankYouButtonText: e.target.value })}
                        className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[14px] text-ink outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-[11px] font-medium text-ink/50">Button Redirect Link</div>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={form.settings.thankYouButtonUrl ?? ''}
                        onChange={(e) => updateSettings(form.id, { thankYouButtonUrl: e.target.value })}
                        className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[14px] text-ink outline-none focus:border-ink"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-ink/[0.06] pt-3">
                  <div className="mb-1.5 text-[13px] font-bold text-ink/75">URL Hidden Fields</div>
                  <input
                    type="text"
                    placeholder="utm_source, userId, referral"
                    value={(form.settings.hiddenFields ?? []).join(', ')}
                    onChange={(e) => {
                      const list = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                      updateSettings(form.id, { hiddenFields: list })
                    }}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2 text-[14px] text-ink outline-none focus:border-ink"
                  />
                  <p className="mt-1.5 text-[11px] text-ink/40">
                    Specify URL query variables to capture automatically from the page load (comma-separated).
                  </p>
                </div>
                <ToggleRow
                  label="Show progress & question numbers"
                  on={!!form.settings.showProgress}
                  onChange={(v) => updateSettings(form.id, { showProgress: v })}
                />
                <ToggleRow
                  label="‘Powered by Folly’ badge"
                  on={!!form.settings.poweredBy}
                  onChange={(v) => updateSettings(form.id, { poweredBy: v })}
                />
              </div>
            </>
          ) : (
            <div>
              <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Custom CSS</div>
              <p className="mb-3 text-[12px] leading-relaxed text-ink/45">
                Add custom styles for your published form. Tally-style hooks are available:{' '}
                <code className="rounded bg-ink/[0.05] px-1">.tally-app</code>,{' '}
                <code className="rounded bg-ink/[0.05] px-1">.tally-form-title</code>,{' '}
                <code className="rounded bg-ink/[0.05] px-1">.tally-block</code>,{' '}
                <code className="rounded bg-ink/[0.05] px-1">.tally-question</code>,{' '}
                <code className="rounded bg-ink/[0.05] px-1">.tally-submit-button</code>,{' '}
                <code className="rounded bg-ink/[0.05] px-1">.tally-footer</code>.
              </p>
              <textarea
                rows={16}
                spellCheck={false}
                value={form.settings.customCss ?? ''}
                onChange={(e) => updateSettings(form.id, { customCss: e.target.value })}
                placeholder={'.tally-submit-button {\n  border-radius: 6px;\n  letter-spacing: 0.02em;\n}'}
                className="w-full rounded-xl border border-ink/15 bg-ink/[0.02] p-3 font-mono text-[12.5px] leading-relaxed text-ink outline-none focus:border-ink"
              />
              <button
                onClick={() => updateSettings(form.id, { customCss: '' })}
                className="mt-2 text-[12px] font-medium text-ink/40 hover:text-ink"
              >
                Clear CSS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ShareDrawer({ form, onClose }: { form: Form; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const publicUrl = `${window.location.origin}${window.location.pathname}#/r/${form.id}`
  const embed = `<iframe src="${publicUrl}" width="100%" height="640" frameborder="0" marginheight="0" marginwidth="0" title="${form.settings.title}"></iframe>`
  const [embedCopied, setEmbedCopied] = useState(false)

  const copy = async (text: string, which: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    if (which === 'link') setCopied(true)
    else setEmbedCopied(true)
    setTimeout(() => {
      setCopied(false)
      setEmbedCopied(false)
    }, 1800)
  }

  return (
    <div className="animate-fade fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="animate-pop absolute right-0 top-0 flex h-full w-[340px] flex-col bg-white shadow-pop sm:w-[400px]">
        <div className="flex items-center justify-between border-b border-ink/[0.06] px-5 py-3.5">
          <div className="text-[15px] font-bold text-ink">Share form</div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-ink/40 hover:bg-ink/[0.05] hover:text-ink">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Folly link</div>
          <div className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink/80">{publicUrl}</span>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="shrink-0 text-ink/50 transition hover:text-ink" title="Open form">
              <Icon name="share" />
            </a>
            <button
              onClick={() => copy(publicUrl, 'link')}
              className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-black"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>

          <div className="mt-6 mb-2 text-[12px] font-bold uppercase tracking-wider text-ink/40">Embed on your site</div>
          <div className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink/50">{embed}</span>
            <button
              onClick={() => copy(embed, 'embed')}
              className="shrink-0 rounded-lg border border-ink/15 px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-ink/[0.04]"
            >
              {embedCopied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink/45">
            Paste the code snippet anywhere — WordPress, Webflow, Notion, or good old HTML. No signup required to respond.
          </p>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-medium text-ink/70">{label}</span>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-ink' : 'bg-ink/15'}`}
        role="switch"
        aria-checked={on}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}