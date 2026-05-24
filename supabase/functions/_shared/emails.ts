// Shared email helpers for DaydreamDwelling edge functions.
//
// One sendEmail() wrapper around Resend, one wispyLayout() HTML shell,
// and the three customer-facing templates Phase 8 needs:
//   - orderConfirmation: fired by stripe-webhook on checkout.session.completed
//   - shippingNotification: fired by create-shipping-label after the Shippo
//     label is stamped to the order_item
//   - refundIssued: fired by refund-order after Stripe confirms the refund
//
// Voice rules (from wispy-redesign-brief.md):
//   - Peer / best-friend warmth, not condescending
//   - Soft and slightly poetic — like the founder note
//   - Complete sentences with rhythm; em-dashes; fragments for emphasis
//   - No exclamation spam (one per 5+ lines max)
//   - No emoji in body copy (SVG sparkles + visual warmth carry that)
//   - No "let's!" / "we'll!" / "you got this!" pep-rally voice
//
// Seller-facing emails (the new-order notification) stay business-tone
// transactional — they live in stripe-webhook still.

interface EmailItem {
  label:     string
  sizeLabel: string
  qty:       number
  unitPrice: number  // dollars
}

/** Send via Resend. Returns true if accepted, false if it errored. */
export async function sendEmail(args: {
  to:       string
  subject:  string
  html:     string
  from?:    string
  replyTo?: string
}): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY missing — skipping send')
    return false
  }
  const body: Record<string, unknown> = {
    from:    args.from    ?? 'Wispy at DaydreamDwelling <orders@daydreamdwelling.com>',
    to:      args.to,
    subject: args.subject,
    html:    args.html,
  }
  if (args.replyTo) body.reply_to = args.replyTo
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[email] resend error:', err)
    return false
  }
  return true
}

/** HTML shell shared by every customer email. The header has the brand
 * gradient, the body slot drops in whatever copy + tables, and the footer
 * carries a tiny "— Wispy" signature mark so the voice is anchored visually. */
export function wispyLayout(args: {
  /** One line under the brand name in the header (e.g. "Your order's confirmed.") */
  headline: string
  /** Inner HTML for the body slot — paragraphs, tables, tracking blocks. */
  body:     string
  /** Optional preheader text (shows next to subject in many inboxes). */
  preheader?: string
}): string {
  const pre = args.preheader ?? ''
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e0c1e;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${pre}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0c1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1430;border:1px solid rgba(154,122,238,0.25);border-radius:20px;overflow:hidden;max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1430 0%,#2a1a50 100%);padding:36px 32px 28px;text-align:center;border-bottom:1px solid rgba(154,122,238,0.2);">
            <p style="margin:0 0 8px;font-size:28px;font-weight:700;color:#f0eaff;letter-spacing:-0.5px;font-family:Georgia,'Times New Roman',serif;">DaydreamDwelling</p>
            <p style="margin:0;font-size:14px;color:#9a7aee;font-style:italic;">${escapeHtml(args.headline)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:#c0b0e8;font-size:15px;line-height:1.7;">
            ${args.body}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 22px;background:#12102a;border-top:1px solid rgba(154,122,238,0.15);text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#7a6aaa;font-style:italic;letter-spacing:0.3px;">— Wispy</p>
            <p style="margin:0;font-size:10px;color:#3a2a5a;">DaydreamDwelling · daydreamdwelling.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/** Items table used by order confirmation + shipping notification. */
export function itemsTableHtml(items: EmailItem[], totalCents: number): string {
  const rows = items.map(it => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;color:#e0d9ff;font-size:14px;">${escapeHtml(it.label)}${it.sizeLabel ? ` <span style="color:#7878aa;font-size:12px;">· ${escapeHtml(it.sizeLabel)}</span>` : ''}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;color:#a090c8;font-size:14px;text-align:center;">×${it.qty}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;color:#c0b8ff;font-size:14px;text-align:right;font-weight:600;">$${(it.unitPrice * it.qty).toLocaleString()}</td>
    </tr>`).join('')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a3a;border-radius:10px;overflow:hidden;margin:16px 0 4px;">
      <tr style="background:#12102a;">
        <th style="padding:10px 16px;text-align:left;font-size:10px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Item</th>
        <th style="padding:10px 16px;text-align:center;font-size:10px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
        <th style="padding:10px 16px;text-align:right;font-size:10px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total</th>
      </tr>
      ${rows}
      <tr style="background:#12102a;">
        <td colspan="2" style="padding:12px 16px;font-size:12px;font-weight:700;color:#7878aa;text-transform:uppercase;letter-spacing:1px;">Total</td>
        <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#e0d9ff;text-align:right;">$${(totalCents / 100).toLocaleString()}</td>
      </tr>
    </table>`
}

/** Customer order confirmation — fires from stripe-webhook on payment success. */
export function orderConfirmationEmail(items: EmailItem[], totalCents: number): { subject: string; html: string } {
  const subject = "Your order's all set."
  const body = `
    <p style="margin:0 0 16px;">Hi. Your order made it through — everything below is being readied for shipping. I'll write again the moment it leaves the shop.</p>
    ${itemsTableHtml(items, totalCents)}
    <p style="margin:18px 0 0;font-size:13px;color:#9080b8;line-height:1.7;">If something doesn't look right, just reply to this — I'll make sure it gets seen.</p>`
  return { subject, html: wispyLayout({ headline: "Your order's confirmed.", body, preheader: 'Everything below is being readied for shipping.' }) }
}

/** Shipping notification — fires from create-shipping-label after label stamp. */
export function shippingNotificationEmail(args: {
  carrier:        string
  service:        string | null
  trackingNumber: string
  trackingUrl:    string | null
  itemLabel:      string
}): { subject: string; html: string } {
  const subject = "It's on the way."
  const trackBlock = args.trackingUrl
    ? `<a href="${escapeAttr(args.trackingUrl)}" style="display:inline-block;padding:12px 22px;margin:10px 0 6px;background:linear-gradient(135deg,#4a3a7a 0%,#7a4aaa 100%);border:1px solid rgba(154,122,238,0.5);border-radius:10px;color:#e8e0ff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">Track your package →</a>`
    : ''
  const body = `
    <p style="margin:0 0 16px;">Your ${escapeHtml(args.itemLabel)} just left the shop. Here's where to follow along.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a3a;border-radius:10px;overflow:hidden;margin:14px 0 6px;background:#12102a;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:11px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Carrier</p>
        <p style="margin:0;font-size:14px;color:#e0d9ff;font-weight:600;">${escapeHtml(args.carrier)}${args.service ? ` · ${escapeHtml(args.service)}` : ''}</p>
      </td></tr>
      <tr><td style="padding:14px 16px;border-top:1px solid #2a2a3a;">
        <p style="margin:0 0 4px;font-size:11px;color:#7878aa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Tracking</p>
        <p style="margin:0;font-size:13px;color:#c0b8ff;font-family:'Courier New',monospace;">${escapeHtml(args.trackingNumber)}</p>
      </td></tr>
    </table>
    ${trackBlock}
    <p style="margin:18px 0 0;font-size:13px;color:#9080b8;line-height:1.7;">Expect it in a few days. I'll let you know when it lands.</p>`
  return { subject, html: wispyLayout({ headline: "Your package is on the way.", body, preheader: `Tracking ${args.trackingNumber}` }) }
}

/** Refund issued — fires from refund-order after Stripe confirms refund. */
export function refundIssuedEmail(args: {
  amountCents: number
  reason:      string | null
}): { subject: string; html: string } {
  const subject = "Your refund went through."
  const reasonLine = args.reason && args.reason.trim().length
    ? `<p style="margin:0 0 16px;padding:12px 14px;background:#12102a;border-left:3px solid #7a4aaa;border-radius:6px;font-size:13px;color:#c0b0e8;font-style:italic;">A note from the seller: ${escapeHtml(args.reason)}</p>`
    : ''
  const body = `
    <p style="margin:0 0 16px;">Just confirming — $${(args.amountCents / 100).toFixed(2)} was sent back to the card you paid with. Banks usually take five to ten business days to post it.</p>
    ${reasonLine}
    <p style="margin:0 0 12px;font-size:13px;color:#9080b8;line-height:1.7;">Sorry this one didn't land. Whenever you're ready to come back, the room's still here.</p>`
  return { subject, html: wispyLayout({ headline: "Refund confirmed.", body, preheader: `$${(args.amountCents / 100).toFixed(2)} returned to your card` }) }
}

/** Best-effort tracking URL for the common carriers Shippo returns.
 * Falls back to null so callers don't render a broken link. */
export function trackingUrlFor(carrier: string | null | undefined, trackingNumber: string | null | undefined): string | null {
  if (!carrier || !trackingNumber) return null
  const c = carrier.trim().toUpperCase()
  const t = encodeURIComponent(trackingNumber.trim())
  if (c === 'USPS')    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`
  if (c === 'UPS')     return `https://www.ups.com/track?tracknum=${t}`
  if (c === 'FEDEX')   return `https://www.fedex.com/fedextrack/?trknbr=${t}`
  if (c === 'DHL' || c === 'DHL EXPRESS') return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?tracking-id=${t}`
  return null
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
function escapeAttr(s: string): string { return escapeHtml(s) }
