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
    <label className="flex items-center justify-between gap-3 border-2 border-black bg-white p-2.5 shadow-[2px_2px_0px_#000] cursor-pointer">
      <span className="font-mono text-xs font-black uppercase text-black">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-black">{value}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer border-2 border-black bg-transparent p-0.5 shadow-[1px_1px_0px_#000]" />
      </span>
    </label>
  )
}

export function ThemeDrawer({ form, onClose }: { form: Form; onClose: () => void }) {
  const updateTheme = useForms((s) => s.updateTheme)
  const updateSettings = useForms((s) => s.updateSettings)
  const [tab, setTab] = useState<'theme' | 'form' | 'css' | 'integrations' | 'limits'>('theme')
  const [webhookTesting, setWebhookTesting] = useState(false)
  const [webhookResult, setWebhookResult] = useState<'ok' | 'err' | null>(null)
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="animate-pop absolute right-0 top-0 flex h-full w-[340px] flex-col border-l-3 border-black bg-white shadow-[-8px_0px_0px_#000] sm:w-[400px]">
        {/* Retro Window Header */}
        <div className="border-b-2 border-black bg-[#ffe600] px-4 py-3 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['theme', 'form', 'css', 'integrations', 'limits'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase transition ${
                  tab === t ? 'bg-black text-white shadow-[1px_1px_0px_#ffe600]' : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                }`}
              >
                {t === 'integrations' ? 'Integrations' : t === 'limits' ? 'Limits' : t === 'css' ? 'CSS' : t === 'form' ? 'Settings' : 'Theme'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-2 py-0.5 text-xs font-black hover:bg-red-500"
          >
            [ X ]
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
                      { k: 'playful', label: 'Grotesk', cls: 'font-mono' },
                      { k: 'classic', label: 'Classic', cls: 'font-classic' },
                      { k: 'rounded', label: 'Rounded', cls: 'font-rounded' },
                      { k: 'geometric', label: 'Geometric', cls: 'font-geometric' },
                      { k: 'typewriter', label: 'Typewriter', cls: 'font-typewriter' },
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
                  <div className="mt-3 p-3.5 rounded-2xl border border-ink/10 bg-ink/[0.02]">
                    <div className="mb-1 text-[12px] font-bold text-ink">Upload Font for Questions</div>
                    <p className="mb-2 text-[11px] text-ink/45">
                      Upload your brand's TTF, OTF, or WOFF font file. It will be applied to all questions and text.
                    </p>
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          updateTheme(form.id, {
                            font: 'custom',
                            customFontBase64: reader.result as string,
                            customFontName: file.name,
                          })
                        }
                        reader.readAsDataURL(file)
                      }}
                      className="w-full text-[12px] file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:file:bg-black"
                    />
                    {t.customFontBase64 && (
                      <div className="mt-3 pt-3 border-t border-ink/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            ✓ Font active: {t.customFontName || 'custom font'}
                          </span>
                          <button
                            onClick={() => updateTheme(form.id, { customFontBase64: undefined, customFontName: undefined, font: 'system' })}
                            className="text-[11px] text-brand-600 font-semibold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <div
                          className="mt-2 rounded-xl bg-white p-2.5 text-[14px] text-ink border border-ink/10"
                          style={{ fontFamily: '"CustomFont", sans-serif' }}
                        >
                          Preview: How questions will look with this font
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t-2 border-black pt-5 space-y-3">
                <div className="mb-2 font-mono text-xs font-black uppercase text-black">Header Media</div>
                <div>
                  <div className="mb-1 font-mono text-[11px] font-black uppercase text-black">Logo URL</div>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={form.settings.logoUrl ?? ''}
                    onChange={(e) => updateSettings(form.id, { logoUrl: e.target.value })}
                    className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>
                <div>
                  <div className="mb-1 font-mono text-[11px] font-black uppercase text-black">Cover Image URL</div>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={form.settings.coverImageUrl ?? ''}
                    onChange={(e) => updateSettings(form.id, { coverImageUrl: e.target.value })}
                    className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>
            </>
          ) : tab === 'form' ? (
            <>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 font-mono text-xs font-black uppercase text-black">Thank you message</div>
                  <textarea
                    rows={3}
                    value={form.settings.thankYouMessage}
                    onChange={(e) => updateSettings(form.id, { thankYouMessage: e.target.value })}
                    className="w-full rounded border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>
                <div>
                  <div className="mb-1 font-mono text-xs font-black uppercase text-black">Thank you redirect URL</div>
                  <input
                    type="url"
                    placeholder="https://example.com/thanks"
                    value={form.settings.thankYouRedirectUrl ?? ''}
                    onChange={(e) => updateSettings(form.id, { thankYouRedirectUrl: e.target.value })}
                    className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                  <p className="mt-1 text-[11px] font-bold text-neutral-500">Redirects the user immediately after submitting the form.</p>
                </div>
                <div className="border-t-2 border-black pt-3">
                  <div className="mb-2 font-mono text-xs font-black uppercase text-black">Thank You Call-To-Action Button</div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 font-mono text-[11px] font-black uppercase text-neutral-600">Button Label</div>
                      <input
                        type="text"
                        placeholder="Visit our website"
                        value={form.settings.thankYouButtonText ?? ''}
                        onChange={(e) => updateSettings(form.id, { thankYouButtonText: e.target.value })}
                        className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                      />
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] font-black uppercase text-neutral-600">Button Redirect Link</div>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={form.settings.thankYouButtonUrl ?? ''}
                        onChange={(e) => updateSettings(form.id, { thankYouButtonUrl: e.target.value })}
                        className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t-2 border-black pt-3">
                  <div className="mb-1 font-mono text-xs font-black uppercase text-black">Password Protection</div>
                  <input
                    type="text"
                    placeholder="Leave blank for public form"
                    value={form.settings.password ?? ''}
                    onChange={(e) => updateSettings(form.id, { password: e.target.value.trim() || undefined })}
                    className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                  <p className="mt-1 text-[11px] font-bold text-neutral-500">
                    If set, respondents must enter this access code to view and submit the form.
                  </p>
                </div>
                <div className="border-t-2 border-black pt-3">
                  <div className="mb-1 font-mono text-xs font-black uppercase text-black">URL Hidden Fields</div>
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
                    className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                  />
                  <p className="mt-1 text-[11px] font-bold text-neutral-500">
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
          ) : tab === 'integrations' ? (
            <div className="space-y-6">
              {/* Webhook */}
              <div>
                <div className="mb-1 font-mono text-xs font-black uppercase text-black">Webhook Destination</div>
                <p className="mb-2 text-[11px] font-bold text-neutral-600">
                  POST full submission payload (JSON) to this URL on every response.
                </p>
                <input
                  type="url"
                  placeholder="https://hooks.example.com/form"
                  value={form.settings.webhookUrl ?? ''}
                  onChange={(e) => updateSettings(form.id, { webhookUrl: e.target.value })}
                  className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                />
                {form.settings.webhookUrl && (
                  <button
                    disabled={webhookTesting}
                    onClick={async () => {
                      setWebhookTesting(true)
                      setWebhookResult(null)
                      try {
                        const payload = { test: true, formId: form.id, formTitle: form.settings.title, timestamp: Date.now() }
                        const res = await fetch('/api/test-webhook', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url: form.settings.webhookUrl, payload }),
                        }).catch(() => null)
                        if (res && res.ok) {
                          const json = await res.json()
                          setWebhookResult(json.ok ? 'ok' : 'err')
                          return
                        }
                        const direct = await fetch(form.settings.webhookUrl!, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                        setWebhookResult(direct.ok ? 'ok' : 'err')
                      } catch {
                        setWebhookResult('err')
                      } finally {
                        setWebhookTesting(false)
                      }
                    }}
                    className="mt-2.5 flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-3 py-1 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                  >
                    {webhookTesting ? 'SENDING…' : 'SEND TEST PAYLOAD ⚡'}
                    {webhookResult === 'ok' && <span className="ml-1 text-emerald-800">✓ OK</span>}
                    {webhookResult === 'err' && <span className="ml-1 text-red-600">✗ FAILED</span>}
                  </button>
                )}
              </div>

              {/* Email notification */}
              <div className="border-t-2 border-black pt-5">
                <div className="mb-1 font-mono text-xs font-black uppercase text-black">Email Notifications</div>
                <p className="mb-2 text-[11px] font-bold text-neutral-600">
                  Send notification email when a new response arrives (SMTP required).
                </p>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.settings.emailNotifyTo ?? ''}
                  onChange={(e) => updateSettings(form.id, { emailNotifyTo: e.target.value })}
                  className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>

              {/* Stripe payment */}
              <div className="border-t-2 border-black pt-5">
                <div className="mb-1 font-mono text-xs font-black uppercase text-black">Stripe Payments</div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 font-mono text-[11px] font-black uppercase text-neutral-600">Publishable Key</div>
                    <input
                      type="text"
                      placeholder="pk_live_…"
                      value={form.settings.stripePublishableKey ?? ''}
                      onChange={(e) => updateSettings(form.id, { stripePublishableKey: e.target.value })}
                      className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1 font-mono text-[11px] font-black uppercase text-neutral-600">Amount</div>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="10.00"
                        value={typeof form.settings.paymentAmount === 'number' ? form.settings.paymentAmount : ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          updateSettings(form.id, { paymentAmount: isNaN(val) ? undefined : val })
                        }}
                        className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                      />
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] font-black uppercase text-neutral-600">Currency</div>
                      <select
                        value={['usd', 'eur', 'gbp', 'inr', 'cad', 'aud', 'jpy', 'chf', 'brl', 'sgd'].includes(form.settings.paymentCurrency?.toLowerCase() ?? '') ? form.settings.paymentCurrency?.toLowerCase() : 'other'}
                        onChange={(e) => {
                          if (e.target.value !== 'other') {
                            updateSettings(form.id, { paymentCurrency: e.target.value })
                          }
                        }}
                        className="w-full rounded border-2 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                      >
                        <option value="usd">USD ($)</option>
                        <option value="eur">EUR (€)</option>
                        <option value="gbp">GBP (£)</option>
                        <option value="inr">INR (₹)</option>
                        <option value="cad">CAD ($)</option>
                        <option value="aud">AUD ($)</option>
                        <option value="jpy">JPY (¥)</option>
                        <option value="chf">CHF (Fr)</option>
                        <option value="brl">BRL (R$)</option>
                        <option value="sgd">SGD ($)</option>
                        <option value="other">Custom ISO…</option>
                      </select>
                      {(!['usd', 'eur', 'gbp', 'inr', 'cad', 'aud', 'jpy', 'chf', 'brl', 'sgd'].includes(form.settings.paymentCurrency?.toLowerCase() ?? '') || form.settings.paymentCurrency === '') && (
                        <input
                          type="text"
                          maxLength={3}
                          placeholder="e.g. eur"
                          value={form.settings.paymentCurrency ?? ''}
                          onChange={(e) => updateSettings(form.id, { paymentCurrency: e.target.value.toLowerCase() })}
                          className="mt-1.5 w-full rounded border-2 border-black bg-white px-3 py-1 font-mono text-xs uppercase text-black outline-none shadow-[2px_2px_0px_#000]"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] font-black uppercase text-neutral-600">Description</div>
                    <input
                      type="text"
                      placeholder="Payment for order #123"
                      value={form.settings.paymentDescription ?? ''}
                      onChange={(e) => updateSettings(form.id, { paymentDescription: e.target.value })}
                      className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                    />
                  </div>
                </div>
              </div>
            </div>

          ) : tab === 'limits' ? (
            <div className="space-y-6">
              <div>
                <div className="mb-1 font-mono text-xs font-black uppercase text-black">Response Cap Limit</div>
                <p className="mb-2 text-[11px] font-bold text-neutral-600">
                  Automatically close the form after this many submissions. Leave blank for unlimited.
                </p>
                <input
                  type="number"
                  min={0}
                  placeholder="Unlimited"
                  value={form.settings.maxResponses || ''}
                  onChange={(e) => updateSettings(form.id, { maxResponses: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>
              <div className="border-t-2 border-black pt-5">
                <div className="mb-1 font-mono text-xs font-black uppercase text-black">Closing Date & Time</div>
                <p className="mb-2 text-[11px] font-bold text-neutral-600">
                  After this wall-clock date the form will automatically reject further answers.
                </p>
                <input
                  type="datetime-local"
                  value={form.settings.closedAt ? new Date(form.settings.closedAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const val = e.target.value
                    updateSettings(form.id, { closedAt: val ? new Date(val).getTime() : undefined })
                  }}
                  className="w-full rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>
              {(form.settings.maxResponses || form.settings.closedAt) && (
                <button
                  onClick={() => updateSettings(form.id, { maxResponses: undefined, closedAt: undefined })}
                  className="border-2 border-black bg-red-400 px-3 py-1 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-red-500"
                >
                  Clear All Limits ✕
                </button>
              )}
            </div>
          ) : tab === 'css' ? (
            <div>
              <div className="mb-1 font-mono text-xs font-black uppercase text-black">Custom CSS Override</div>
              <p className="mb-3 text-[11px] font-bold text-neutral-600">
                Target custom classes: <code className="border border-black bg-[#ffe600] px-1 font-mono text-[10px]">.tally-app</code>, <code className="border border-black bg-[#ffe600] px-1 font-mono text-[10px]">.tally-form-title</code>, <code className="border border-black bg-[#ffe600] px-1 font-mono text-[10px]">.tally-block</code>, <code className="border border-black bg-[#ffe600] px-1 font-mono text-[10px]">.tally-question</code>.
              </p>
              <textarea
                rows={16}
                spellCheck={false}
                value={form.settings.customCss ?? ''}
                onChange={(e) => updateSettings(form.id, { customCss: e.target.value })}
                placeholder={'.tally-submit-button {\n  border: 3px solid #000;\n  box-shadow: 4px 4px 0px #000;\n}'}
                className="w-full resize-none border-2 border-black bg-neutral-900 p-3 font-mono text-[12px] leading-relaxed text-green-400 outline-none shadow-[3px_3px_0px_#000]"
              />
              <button
                onClick={() => updateSettings(form.id, { customCss: '' })}
                className="mt-2 text-[12px] font-medium text-ink/40 hover:text-ink"
              >
                Clear CSS
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ShareDrawer({ form, onClose }: { form: Form; onClose: () => void }) {
  const updateSettings = useForms((s) => s.updateSettings)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [embedTab, setEmbedTab] = useState<'standard' | 'popup' | 'sidetab'>('standard')

  const formSlug = form.settings.slug ? form.settings.slug : form.id
  const publicUrl = `${window.location.origin}${window.location.pathname}#/f/${formSlug}`
  const formTitle = form.settings.title || 'Form'

  const standardEmbed = `<iframe src="${publicUrl}" id="folly-embed-${form.id}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0" title="${formTitle}"></iframe>
<script>
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'folly-resize' && e.data.formId === '${form.id}') {
      var el = document.getElementById('folly-embed-${form.id}');
      if (el) el.style.height = e.data.height + 'px';
    }
  });
</script>`

  const popupEmbed = `<button onclick="document.getElementById('folly-modal-${form.id}').style.display='flex'" style="border:3px solid #000;background:#ffe600;color:#000;padding:10px 20px;font-family:monospace;font-weight:900;text-transform:uppercase;box-shadow:4px 4px 0px #000;cursor:pointer;">
  ${formTitle} ⚡
</button>
<div id="folly-modal-${form.id}" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;align-items:center;justify-content:center;padding:16px;">
  <div style="position:relative;width:100%;max-width:680px;height:85vh;background:#fff;border:3px solid #000;box-shadow:8px 8px 0px #000;display:flex;flex-direction:column;overflow:hidden;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;background:#ffe600;padding:8px 12px;font-family:monospace;font-weight:900;font-size:12px;">
      <span>${formTitle}</span>
      <button onclick="document.getElementById('folly-modal-${form.id}').style.display='none'" style="border:2px solid #000;background:#fff;font-weight:900;padding:2px 8px;cursor:pointer;">[ X ]</button>
    </div>
    <iframe src="${publicUrl}" style="flex:1;border:none;width:100%;height:100%;"></iframe>
  </div>
</div>`

  const sidetabEmbed = `<div id="folly-sidetab-${form.id}" style="position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:99999;">
  <button onclick="var p=document.getElementById('folly-sidepane-${form.id}');p.style.transform=p.style.transform==='translateX(0%)'?'translateX(100%)':'translateX(0%)'" style="border:3px solid #000;background:#ffe600;color:#000;font-family:monospace;font-weight:900;font-size:12px;padding:14px 8px;box-shadow:-4px 4px 0px #000;cursor:pointer;writing-mode:vertical-rl;letter-spacing:1px;">
    ${formTitle} ✦
  </button>
  <div id="folly-sidepane-${form.id}" style="position:fixed;right:0;top:0;width:440px;max-width:92vw;height:100vh;background:#fff;border-left:3px solid #000;box-shadow:-8px 0px 0px #000;transform:translateX(100%);transition:transform 0.3s cubic-bezier(0.16,1,0.3,1);display:flex;flex-direction:column;">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:2px solid #000;background:#ffe600;font-family:monospace;font-weight:900;font-size:12px;">
      <span>${formTitle}</span>
      <button onclick="document.getElementById('folly-sidepane-${form.id}').style.transform='translateX(100%)'" style="cursor:pointer;border:2px solid #000;background:#fff;padding:2px 6px;font-weight:900;">✕</button>
    </div>
    <iframe src="${publicUrl}" style="flex:1;border:none;width:100%;"></iframe>
  </div>
</div>`

  const activeSnippet = embedTab === 'standard' ? standardEmbed : embedTab === 'popup' ? popupEmbed : sidetabEmbed

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
    if (which === 'link') setCopiedLink(true)
    else setCopiedEmbed(true)
    setTimeout(() => {
      setCopiedLink(false)
      setCopiedEmbed(false)
    }, 1800)
  }

  return (
    <div className="animate-fade fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="animate-pop absolute right-0 top-0 flex h-full w-[360px] flex-col border-l-4 border-black bg-white shadow-[-10px_0px_0px_#000] sm:w-[480px]">
        {/* Retro Window Header */}
        <div className="border-b-3 border-black bg-[#ffe600] px-4 py-3 flex items-center justify-between font-mono text-xs font-black uppercase text-black">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 bg-red-400 border-2 border-black shadow-[1px_1px_0px_#000]" />
            <span className="h-3.5 w-3.5 bg-yellow-400 border-2 border-black shadow-[1px_1px_0px_#000]" />
            <span className="h-3.5 w-3.5 bg-green-400 border-2 border-black shadow-[1px_1px_0px_#000]" />
            <span className="ml-1 tracking-wider">SHARE_INTEGRATION.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-black text-white px-2.5 py-0.5 text-xs font-black shadow-[2px_2px_0px_#fff] hover:bg-red-500 active:translate-x-0.5 active:translate-y-0.5"
          >
            ✕ CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Custom Slug */}
          <div className="border-2 border-black bg-[#fffdfa] p-4 shadow-[3px_3px_0px_#000]">
            <div className="mb-1 text-xs font-black uppercase text-black font-mono">Custom URL Slug</div>
            <p className="mb-2 text-[11px] font-bold text-neutral-600">
              Personalize your form link with a branded memorable name.
            </p>
            <div className="flex items-center gap-2">
              <span className="border-2 border-black bg-neutral-100 px-2.5 py-1.5 font-mono text-xs font-black text-black">/f/</span>
              <input
                type="text"
                placeholder={form.id.slice(0, 8)}
                value={form.settings.slug ?? ''}
                onChange={(e) => {
                  const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')
                  updateSettings(form.id, { slug: cleaned || undefined })
                }}
                className="flex-1 rounded border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          {/* Direct Link */}
          <div>
            <div className="mb-2 text-xs font-black uppercase tracking-wider text-black font-mono">Direct Share Link</div>
            <div className="flex items-center gap-2 border-2 border-black bg-white p-2 shadow-[3px_3px_0px_#000]">
              <span className="min-w-0 flex-1 truncate font-mono text-xs font-bold text-black">{publicUrl}</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-black bg-[#5ce1e6] p-1.5 shadow-[1px_1px_0px_#000] hover:bg-[#ffe600] transition"
                title="Open live form"
              >
                <Icon name="share" className="h-4 w-4" />
              </a>
              <button
                onClick={() => copy(publicUrl, 'link')}
                className="border-2 border-black bg-[#ffe600] px-3.5 py-1.5 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
              >
                {copiedLink ? 'COPIED ✓' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Embed Types */}
          <div>
            <div className="mb-2 text-xs font-black uppercase tracking-wider text-black font-mono">Embed Modes</div>
            <div className="flex gap-1.5 mb-3 font-mono text-xs">
              {(['standard', 'popup', 'sidetab'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEmbedTab(tab)}
                  className={`border-2 border-black px-2.5 py-1 font-black uppercase transition ${
                    embedTab === tab
                      ? 'bg-black text-white shadow-[2px_2px_0px_#ffe600]'
                      : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-[#ffe600]'
                  }`}
                >
                  {tab === 'standard' ? 'Standard' : tab === 'popup' ? 'Popup Modal' : 'Side Tab'}
                </button>
              ))}
            </div>

            <div className="border-2 border-black bg-[#fffdfa] p-3 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-black uppercase text-neutral-600">
                  {embedTab === 'standard'
                    ? 'Responsive iframe with auto-height sync'
                    : embedTab === 'popup'
                    ? 'Clickable button with dark backdrop modal'
                    : 'Floating sticky side tab pinned to screen'}
                </span>
                <button
                  onClick={() => copy(activeSnippet, 'embed')}
                  className="border-2 border-black bg-[#00ef84] px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-emerald-400 active:translate-x-0.5 active:translate-y-0.5"
                >
                  {copiedEmbed ? 'COPIED ✓' : 'COPY SNIPPET'}
                </button>
              </div>
              <textarea
                readOnly
                value={activeSnippet}
                rows={5}
                className="w-full resize-none border-2 border-black bg-neutral-900 p-2.5 font-mono text-[11px] text-green-400 outline-none select-all"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </div>

          {/* URL Prefilling & Tracking */}
          <div className="border-2 border-black bg-neutral-100 p-3.5 shadow-[3px_3px_0px_#000]">
            <div className="font-mono text-xs font-black uppercase text-black mb-1">Prefill & Query Parameters</div>
            <p className="text-[11px] font-bold text-neutral-600 mb-2">
              Pass hidden variables in the URL query string to automatically record referral sources, respondent emails, or user IDs:
            </p>
            <div className="border border-black bg-white p-2 font-mono text-[11px] text-black break-all shadow-[1px_1px_0px_#000]">
              {publicUrl}?utm_source=twitter&ref=newsletter&email=user@example.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-black bg-white p-2.5 shadow-[2px_2px_0px_#000]">
      <span className="font-mono text-xs font-black uppercase text-black">{label}</span>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-black transition ${on ? 'bg-[#ffe600]' : 'bg-neutral-200'}`}
        role="switch"
        aria-checked={on}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full border border-black bg-white shadow-[1px_1px_0px_#000] transition-all ${
            on ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}