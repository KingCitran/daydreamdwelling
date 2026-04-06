import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const TOOLS = [
  {
    key: 'csv-export',
    icon: '📋',
    label: 'CSV Export',
    desc: 'Download all your listings as a spreadsheet.',
    phase: null,
    cta: 'Export',
  },
  {
    key: 'performance',
    icon: '📊',
    label: 'Performance Report',
    desc: 'Revenue, trends and earnings breakdown.',
    phase: null,
    cta: 'View Report',
    page: 'earnings',
  },
  {
    key: 'reviews',
    icon: '⭐',
    label: 'Review Manager',
    desc: 'Reply to customer reviews and flag issues.',
    phase: null,
    cta: 'Manage',
    page: 'reviews',
  },
  {
    key: 'bulk-editor',
    icon: '✏️',
    label: 'Bulk Editor',
    desc: 'Edit price, status, or tags across multiple products at once.',
    phase: 2,
  },
  {
    key: 'csv-import',
    icon: '📥',
    label: 'CSV Import',
    desc: 'Upload a spreadsheet to create or update listings in bulk.',
    phase: 2,
  },
  {
    key: 'inventory',
    icon: '📦',
    label: 'Inventory Tracker',
    desc: 'Set stock quantities per variant and get low-stock alerts.',
    phase: 2,
  },
  {
    key: 'discounts',
    icon: '🏷️',
    label: 'Discount Creator',
    desc: 'Create % or $ off coupon codes with expiry and usage limits.',
    phase: 2,
  },
  {
    key: 'pricing',
    icon: '💰',
    label: 'Pricing Assistant',
    desc: 'Get competitive price suggestions based on similar listings.',
    phase: 2,
  },
  {
    key: 'promoted',
    icon: '📢',
    label: 'Promoted Listings',
    desc: 'Pay for priority placement in search results.',
    phase: 2,
  },
  {
    key: 'shipping-calc',
    icon: '🚚',
    label: 'Shipping Calculator',
    desc: 'Estimate shipping costs by weight and destination.',
    phase: 2,
  },
  {
    key: 'disputes',
    icon: '🔄',
    label: 'Returns & Disputes',
    desc: 'Manage return requests and buyer dispute cases.',
    phase: 2,
  },
  {
    key: 'tax',
    icon: '🧾',
    label: 'Tax Summary',
    desc: 'Annual earnings export for tax filing (1099-style).',
    phase: 2,
  },
  {
    key: 'shop-builder',
    icon: '🏠',
    label: 'Seller Shop Builder',
    desc: 'Customize your 3D storefront — layout, music, Wispy style.',
    phase: 2,
  },
]

export default function ToolsPage({ onNavigate }) {
  const { user }    = useAuth()
  const t           = useTheme()
  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)

  const s = makeStyles(t)

  async function handleExport() {
    if (!user) return
    setExporting(true)
    setExportDone(false)
    const { data } = await supabase
      .from('products')
      .select('id, label, brand, category, description, is_active, created_at, product_sizes(label, price)')
      .eq('seller_id', user.id)
    if (!data || data.length === 0) {
      setExporting(false)
      alert('No products found to export.')
      return
    }
    const header = ['ID', 'Name', 'Brand', 'Category', 'Active', 'Created', 'Sizes']
    const rows   = data.map(p => [
      p.id,
      p.label   ?? '',
      p.brand   ?? '',
      p.category ?? '',
      p.is_active ? 'Yes' : 'No',
      p.created_at?.slice(0, 10) ?? '',
      (p.product_sizes || []).map(s => `${s.label}:$${s.price}`).join('; '),
    ])
    const csv  = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'my-products.csv'
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 3000)
  }

  function handleAction(tool) {
    if (tool.key === 'csv-export')  { handleExport(); return }
    if (tool.page)                  { onNavigate(tool.page); return }
  }

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Seller Tools</h1>
          <p style={s.pageSubtitle}>Everything you need to manage and grow your shop.</p>
        </div>
      </div>

      <div style={s.grid}>
        {TOOLS.map(tool => {
          const isLive  = !tool.phase
          const isBusy  = tool.key === 'csv-export' && exporting
          const isDone  = tool.key === 'csv-export' && exportDone

          return (
            <div key={tool.key} style={{ ...s.card, opacity: tool.phase ? 0.72 : 1 }}>
              <div style={s.cardTop}>
                <span style={s.icon}>{tool.icon}</span>
                {tool.phase
                  ? <span style={s.badgePhase}>Phase {tool.phase}</span>
                  : <span style={s.badgeLive}>Live</span>
                }
              </div>
              <div style={s.cardBody}>
                <p style={s.toolName}>{tool.label}</p>
                <p style={s.toolDesc}>{tool.desc}</p>
              </div>
              {isLive && (
                <div style={s.cardFooter}>
                  <button
                    style={{ ...s.ctaBtn, ...(isBusy ? s.ctaBtnDisabled : {}) }}
                    disabled={isBusy}
                    onClick={() => handleAction(tool)}
                  >
                    {isBusy ? 'Exporting…' : isDone ? '✓ Done!' : tool.cta}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p style={s.phaseNote}>
        Phase 2 tools are on the roadmap and will roll out as DaydreamDwelling grows. Stay tuned!
      </p>
    </div>
  )
}

function makeStyles(t) {
  return {
    pageHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    pageTitle:   { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    pageSubtitle:{ fontSize: 13, color: t.textSoft, margin: 0 },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 16,
    },
    card: {
      background: t.surface,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'opacity 0.2s',
    },
    cardTop: {
      padding: '14px 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    icon: { fontSize: 24 },
    badgeLive: {
      fontSize: 10, fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
      background: `${t.accent}22`,
      color: t.accent,
      border: `1px solid ${t.accent}44`,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    badgePhase: {
      fontSize: 10, fontWeight: 600,
      padding: '2px 8px', borderRadius: 20,
      background: `${t.textSoft}18`,
      color: t.textSoft,
      border: `1px solid ${t.surfaceBorder}`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    cardBody: {
      padding: '10px 16px 14px',
      flex: 1,
    },
    toolName: { fontSize: 14, fontWeight: 700, color: t.text, margin: '0 0 4px' },
    toolDesc: { fontSize: 12, color: t.textSoft, margin: 0, lineHeight: 1.45 },
    cardFooter: {
      padding: '0 16px 14px',
    },
    ctaBtn: {
      width: '100%',
      padding: '8px 0',
      background: t.accent,
      color: t.accentText,
      border: 'none',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'opacity 0.15s',
    },
    ctaBtnDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
    phaseNote: {
      marginTop: 32,
      fontSize: 12,
      color: t.textSoft,
      textAlign: 'center',
    },
  }
}
