// Carrier auto-detection from tracking number format.
// Used by the seller OrdersPage and ShippingHistoryPage to show carrier
// badges + clickable tracking links even when Shippo didn't provide the carrier
// (e.g. seller entered tracking manually).

const PATTERNS = [
  // USPS: 20-22 digits, usually starts with 9
  { carrier: 'USPS', re: /^9[0-9]{19,21}$/, url: t => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}` },
  // USPS also: 13-char (e.g. EZ... or LZ...)
  { carrier: 'USPS', re: /^[A-Z]{2}[0-9]{9}US$/i, url: t => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}` },
  // UPS: 1Z + 16 alphanumeric
  { carrier: 'UPS', re: /^1Z[A-Z0-9]{16}$/i, url: t => `https://www.ups.com/track?tracknum=${t}` },
  // FedEx: 12, 15, or 20 digits
  { carrier: 'FedEx', re: /^[0-9]{12}$/, url: t => `https://www.fedex.com/fedextrack/?trknbr=${t}` },
  { carrier: 'FedEx', re: /^[0-9]{15}$/, url: t => `https://www.fedex.com/fedextrack/?trknbr=${t}` },
  { carrier: 'FedEx', re: /^[0-9]{20}$/, url: t => `https://www.fedex.com/fedextrack/?trknbr=${t}` },
  // DHL: 10-digit or JD + 18 digits
  { carrier: 'DHL', re: /^[0-9]{10}$/, url: t => `https://www.dhl.com/us-en/home/tracking/tracking-express.html?tracking-id=${t}` },
  { carrier: 'DHL', re: /^JD[0-9]{18}$/i, url: t => `https://www.dhl.com/us-en/home/tracking/tracking-express.html?tracking-id=${t}` },
]

/**
 * Detect carrier from tracking number format.
 * Returns { carrier, url } or null if unknown.
 * If a known carrier name is provided (e.g. from Shippo), it's used directly
 * for the carrier label; the URL is still generated from the pattern.
 */
export function detectCarrier(trackingNumber, knownCarrier) {
  if (!trackingNumber) return null
  const t = trackingNumber.replace(/\s/g, '').toUpperCase()

  // If Shippo already told us the carrier, build the URL from that
  if (knownCarrier) {
    const c = knownCarrier.trim().toUpperCase()
    if (c === 'USPS')    return { carrier: 'USPS',  url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}` }
    if (c === 'UPS')     return { carrier: 'UPS',   url: `https://www.ups.com/track?tracknum=${t}` }
    if (c === 'FEDEX')   return { carrier: 'FedEx', url: `https://www.fedex.com/fedextrack/?trknbr=${t}` }
    if (c.startsWith('DHL')) return { carrier: 'DHL', url: `https://www.dhl.com/us-en/home/tracking/tracking-express.html?tracking-id=${t}` }
  }

  // Pattern-based detection for manually entered tracking
  for (const p of PATTERNS) {
    if (p.re.test(t)) return { carrier: p.carrier, url: p.url(t) }
  }

  // Fallback: Google search
  return { carrier: null, url: `https://www.google.com/search?q=${encodeURIComponent(trackingNumber + ' tracking')}` }
}
