import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: '@yourhandle' },
  { key: 'website',   label: 'Website',   placeholder: 'https://yourstore.com' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: '@yourhandle' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'pinterest.com/yourstore' },
]

export default function SettingsPage() {
  const { user, profile } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [bio,         setBio]         = useState('')
  const [storeName,   setStoreName]   = useState('')
  const [socials,     setSocials]     = useState({ instagram: '', website: '', tiktok: '', pinterest: '' })
  const [shipFrom,    setShipFrom]    = useState({ name: '', company: '', street1: '', street2: '', city: '', state: '', zip: '', country: 'US', phone: '', email: '' })
  const [printers,    setPrinters]    = useState({ label: '', document: '' })
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState(null)
  const [connect, setConnect] = useState({
    accountId: null, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false,
  })
  const [connectBusy, setConnectBusy] = useState(false)
  const [connectError, setConnectError] = useState(null)

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name || '')
    setBio(profile.bio || '')
    setStoreName(profile.store_name || '')
    setSocials({
      instagram: profile.social_instagram || '',
      website:   profile.social_website   || '',
      tiktok:    profile.social_tiktok    || '',
      pinterest: profile.social_pinterest || '',
    })
    setShipFrom({
      name:    profile.ship_from_name    || '',
      company: profile.ship_from_company || '',
      street1: profile.ship_from_street1 || '',
      street2: profile.ship_from_street2 || '',
      city:    profile.ship_from_city    || '',
      state:   profile.ship_from_state   || '',
      zip:     profile.ship_from_zip     || '',
      country: profile.ship_from_country || 'US',
      phone:   profile.ship_from_phone   || '',
      email:   profile.ship_from_email   || '',
    })
    setPrinters({
      label:    profile.label_printer_name    || '',
      document: profile.document_printer_name || '',
    })
    setConnect({
      accountId:        profile.stripe_account_id        || null,
      chargesEnabled:   !!profile.stripe_charges_enabled,
      payoutsEnabled:   !!profile.stripe_payouts_enabled,
      detailsSubmitted: !!profile.stripe_details_submitted,
    })
  }, [profile])

  // When Stripe redirects back from onboarding (?stripe=return) or from a
  // mid-flow refresh (?stripe=refresh), pull the live status and update
  // local + DB state so the seller sees their progress immediately.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const flag = params.get('stripe')
    if (!flag) return
    if (!user) return
    refreshConnectStatus()
    params.delete('stripe')
    const next = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (next ? `?${next}` : ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function refreshConnectStatus() {
    setConnectBusy(true); setConnectError(null)
    try {
      const { data, error: err } = await supabase.functions.invoke('stripe-connect-refresh', { body: {} })
      if (err) throw err
      if (data?.error) throw new Error(data.error)
      setConnect({
        accountId:        data.accountId ?? null,
        chargesEnabled:   !!data.chargesEnabled,
        payoutsEnabled:   !!data.payoutsEnabled,
        detailsSubmitted: !!data.detailsSubmitted,
      })
    } catch (e) {
      setConnectError(e.message)
    } finally {
      setConnectBusy(false)
    }
  }

  async function startConnectOnboarding() {
    setConnectBusy(true); setConnectError(null)
    try {
      const { data, error: err } = await supabase.functions.invoke('stripe-connect-onboard', { body: {} })
      if (err) throw err
      if (data?.error) throw new Error(data.error)
      if (data?.url) window.location.href = data.url
    } catch (e) {
      setConnectError(e.message)
      setConnectBusy(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!user) return
    setError(null); setSaving(true); setSaved(false)
    try {
      const { error: err } = await supabase.from('profiles').upsert({
        id:                user.id,
        display_name:      displayName.trim() || null,
        bio:               bio.trim()         || null,
        store_name:        storeName.trim()   || null,
        social_instagram:  socials.instagram.trim() || null,
        social_website:    socials.website.trim()   || null,
        social_tiktok:     socials.tiktok.trim()    || null,
        social_pinterest:  socials.pinterest.trim() || null,
        ship_from_name:    shipFrom.name.trim()    || null,
        ship_from_company: shipFrom.company.trim() || null,
        ship_from_street1: shipFrom.street1.trim() || null,
        ship_from_street2: shipFrom.street2.trim() || null,
        ship_from_city:    shipFrom.city.trim()    || null,
        ship_from_state:   shipFrom.state.trim()   || null,
        ship_from_zip:     shipFrom.zip.trim()     || null,
        ship_from_country: shipFrom.country.trim() || 'US',
        ship_from_phone:   shipFrom.phone.trim()   || null,
        ship_from_email:   shipFrom.email.trim()   || null,
        label_printer_name:    printers.label.trim()    || null,
        document_printer_name: printers.document.trim() || null,
      })
      if (err) throw err
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 660 }}>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Settings</h1>
          <p style={s.pageSubtitle}>Manage your seller profile and store preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={s.form}>
        {/* Business Profile */}
        <Section title="Business Profile">
          <Field label="Display name">
            <input style={s.input} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Studio Nord" />
          </Field>
          <Field label="Store name (optional — if different from display name)">
            <input style={s.input} value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="e.g. Nord Home Goods" />
          </Field>
          <Field label="Bio">
            <textarea
              style={{ ...s.input, height: 100, resize: 'vertical' }}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell shoppers about your brand, where you're based, what makes your pieces special…"
            />
          </Field>
        </Section>

        {/* Logo placeholder */}
        <Section title="Logo & Brand Image">
          <div style={s.logoPlaceholder}>
            <div style={s.logoCircle}>
              {(displayName || user?.email || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={s.logoHint}>Image upload coming soon via Supabase Storage.</p>
              <p style={{ ...s.logoHint, color: '#b0a0cc' }}>Your initials are used as a placeholder across the marketplace.</p>
            </div>
          </div>
        </Section>

        {/* Ship From — used to generate shipping labels via Shippo */}
        <Section title="Ship From Address">
          <p style={{ fontSize: 12, color: '#7a6ca6', margin: '0 0 14px', lineHeight: 1.55 }}>
            Where packages physically ship from. Used to generate shipping labels via Shippo. Your address isn't shown to buyers — they only see your display name on the slip.
          </p>
          <Field label="Full name">
            <input style={s.input} value={shipFrom.name} onChange={e => setShipFrom(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
          </Field>
          <Field label="Company (optional)">
            <input style={s.input} value={shipFrom.company} onChange={e => setShipFrom(p => ({ ...p, company: e.target.value }))} placeholder="Studio Nord" />
          </Field>
          <Field label="Street address">
            <input style={s.input} value={shipFrom.street1} onChange={e => setShipFrom(p => ({ ...p, street1: e.target.value }))} placeholder="123 Main St" />
          </Field>
          <Field label="Apt/Suite (optional)">
            <input style={s.input} value={shipFrom.street2} onChange={e => setShipFrom(p => ({ ...p, street2: e.target.value }))} placeholder="Apt 4B" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <Field label="City">
              <input style={s.input} value={shipFrom.city} onChange={e => setShipFrom(p => ({ ...p, city: e.target.value }))} placeholder="Portland" />
            </Field>
            <Field label="State">
              <input style={s.input} value={shipFrom.state} onChange={e => setShipFrom(p => ({ ...p, state: e.target.value }))} placeholder="OR" maxLength={2} />
            </Field>
            <Field label="ZIP">
              <input style={s.input} value={shipFrom.zip} onChange={e => setShipFrom(p => ({ ...p, zip: e.target.value }))} placeholder="97214" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Phone (for carriers)">
              <input style={s.input} value={shipFrom.phone} onChange={e => setShipFrom(p => ({ ...p, phone: e.target.value }))} placeholder="+1 503 555 0100" />
            </Field>
            <Field label="Email (for shipping notifications)">
              <input style={s.input} value={shipFrom.email} onChange={e => setShipFrom(p => ({ ...p, email: e.target.value }))} placeholder="ship@example.com" />
            </Field>
          </div>
        </Section>

        {/* Printer Preferences */}
        <Section title="Printer Preferences">
          <p style={{ fontSize: 12, color: '#7a6ca6', margin: '0 0 14px', lineHeight: 1.55 }}>
            Browsers can't pick your printer for you, but they remember your last choice per page size. After you confirm each printer once in the print dialog, the right one is pre-selected every time. These names are just reminders we show above the print preview.
          </p>
          <Field label="Label Printer (4×6 thermal)">
            <input
              style={s.input}
              value={printers.label}
              onChange={e => setPrinters(p => ({ ...p, label: e.target.value }))}
              placeholder="e.g. Rollo X1040 — your sticker label printer"
            />
          </Field>
          <Field label="Document Printer (Letter / A4)">
            <input
              style={s.input}
              value={printers.document}
              onChange={e => setPrinters(p => ({ ...p, document: e.target.value }))}
              placeholder="e.g. HP LaserJet — for packing slips and invoices"
            />
          </Field>
        </Section>

        {/* Social Links */}
        <Section title="Social Links">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input
                style={s.input}
                value={socials[key]}
                onChange={e => setSocials(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </Field>
          ))}
        </Section>

        {/* Payout */}
        <Section title="Payouts">
          <div style={s.payoutBox}>
            <div style={s.payoutIcon}>💳</div>
            <div style={{ flex: 1 }}>
              <p style={s.payoutTitle}>
                Stripe Connect
                {connect.chargesEnabled && connect.payoutsEnabled && (
                  <span style={s.payoutPillReady}>● Ready</span>
                )}
                {connect.detailsSubmitted && !(connect.chargesEnabled && connect.payoutsEnabled) && (
                  <span style={s.payoutPillPending}>● Verifying</span>
                )}
                {connect.accountId && !connect.detailsSubmitted && (
                  <span style={s.payoutPillProgress}>● Onboarding</span>
                )}
              </p>
              <p style={s.payoutDesc}>
                {connect.chargesEnabled && connect.payoutsEnabled
                  ? 'Your bank is connected. Payouts arrive on Stripe\'s standard schedule (typically 2–7 business days after each sale).'
                  : connect.accountId
                    ? 'Finish your Stripe onboarding (ID + bank details) to start receiving payouts directly to your bank account.'
                    : 'Connect your bank to receive payouts from sales. We use Stripe Express — you finish KYC + bank details on Stripe\'s hosted page.'}
              </p>
              {connectError && <p style={{ ...s.payoutDesc, color: '#c05050', marginTop: 6 }}>{connectError}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                onClick={startConnectOnboarding}
                disabled={connectBusy}
                style={{ ...s.payoutBtn, opacity: connectBusy ? 0.5 : 1, cursor: connectBusy ? 'wait' : 'pointer' }}
              >
                {connectBusy ? '…' : connect.accountId ? (connect.chargesEnabled ? 'Manage →' : 'Continue →') : 'Connect bank →'}
              </button>
              {connect.accountId && (
                <button
                  type="button"
                  onClick={refreshConnectStatus}
                  disabled={connectBusy}
                  style={{ ...s.payoutBtnGhost, opacity: connectBusy ? 0.5 : 1 }}
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
          <div style={s.payoutBox}>
            <div style={s.payoutIcon}>📊</div>
            <div style={{ flex: 1 }}>
              <p style={s.payoutTitle}>Tax summary</p>
              <p style={s.payoutDesc}>Annual earnings summaries for tax filing (1099-style) will appear here once you have processed orders.</p>
            </div>
          </div>
        </Section>

        {/* Account */}
        <Section title="Account">
          <Field label="Email">
            <input style={{ ...s.input, color: '#9a88bb' }} value={user?.email || ''} disabled />
          </Field>
          <p style={s.hintText}>To change your email, use the account settings in the customer app or contact support.</p>
        </Section>

        {error && <p style={s.error}>{error}</p>}

        <button
          type="submit"
          style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1, background: saved ? 'linear-gradient(135deg,#88d8b0,#6ec8a0)' : 'linear-gradient(135deg,#c4a8ff,#f0a8d8)' }}
          disabled={saving}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes →'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(180,160,220,0.2)', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 2px 12px rgba(140,100,200,0.06)' }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9a78cc', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6a5a8a' }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  pageHeader:    { marginBottom: 24 },
  pageTitle:     { fontSize: 26, fontWeight: 700, color: '#3a2a5a', marginBottom: 4 },
  pageSubtitle:  { fontSize: 13, color: '#9a88bb' },
  form:          { display: 'flex', flexDirection: 'column', gap: 14 },
  input:         { padding: '10px 12px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(180,160,220,0.35)', borderRadius: 8, color: '#3a2a5a', fontSize: 13, outline: 'none', width: '100%' },
  logoPlaceholder: { display: 'flex', alignItems: 'center', gap: 16 },
  logoCircle:    { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#c4a8ff,#f0a8d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', flexShrink: 0 },
  logoHint:      { fontSize: 12, color: '#8a78aa', margin: '0 0 4px' },
  payoutBox:     { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(180,160,220,0.2)', borderRadius: 10 },
  payoutIcon:    { fontSize: 22, flexShrink: 0, marginTop: 1 },
  payoutTitle:   { fontSize: 13, fontWeight: 600, color: '#3a2a5a', margin: '0 0 4px' },
  payoutDesc:    { fontSize: 12, color: '#9a88bb', lineHeight: 1.6, margin: 0 },
  payoutBtn:     { padding: '8px 14px', background: 'linear-gradient(135deg,#c4a8ff,#f0a8d8)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  payoutBtnGhost:{ padding: '6px 10px', background: 'transparent', border: '1px solid rgba(180,140,255,0.3)', borderRadius: 8, color: '#7a5aaa', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  payoutPillReady:    { marginLeft: 10, fontSize: 11, fontWeight: 600, color: '#3a9070', background: 'rgba(110,200,160,0.18)', border: '1px solid rgba(110,200,160,0.4)', borderRadius: 999, padding: '2px 8px' },
  payoutPillPending:  { marginLeft: 10, fontSize: 11, fontWeight: 600, color: '#a07020', background: 'rgba(240,180,90,0.18)', border: '1px solid rgba(240,180,90,0.4)', borderRadius: 999, padding: '2px 8px' },
  payoutPillProgress: { marginLeft: 10, fontSize: 11, fontWeight: 600, color: '#7a5aaa', background: 'rgba(180,140,255,0.18)', border: '1px solid rgba(180,140,255,0.4)', borderRadius: 999, padding: '2px 8px' },
  hintText:      { fontSize: 11, color: '#b0a0cc', marginTop: -4 },
  error:         { fontSize: 12, color: '#c05050', background: 'rgba(220,100,100,0.08)', border: '1px solid rgba(220,100,100,0.25)', borderRadius: 8, padding: '10px 14px' },
  saveBtn:       { padding: '14px 0', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s, background 0.3s' },
}
