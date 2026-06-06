import { memo } from 'react'
import { User, Settings, KeyRound } from 'lucide-react'

// Bottom-left utility cluster — Account + Settings. Visually matches the
// SideTabStrip pills but anchored bottom-left. Triggers modals (these are
// "you, the operator" surfaces, not task-flow tools).
//
// Memoized — only re-renders when signedIn flips. Function-ref props
// (handlers) are ignored because they change every parent render but the
// component doesn't actually depend on a stable ref to render correctly.

function BottomTabClusterImpl({ onAccount, onSettings, signedIn }) {
  return (
    <>
      <style>{`
        .ddd-bottom-tab,
        .ddd-bottom-tab * {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
        @media (max-width: 768px) {
          .ddd-bottom-tab { padding: 6px !important; min-height: 36px !important; border-radius: 10px !important; }
          .ddd-bottom-tab-label { display: none !important; }
          .ddd-bottom-tab-icon { width: 24px !important; height: 24px !important; }
          .ddd-bottom-tab-icon svg { width: 14px !important; height: 14px !important; }
        }
      `}</style>
      <aside style={{
        position: 'fixed', bottom: 16, left: 12, zIndex: 90,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <BottomTab onClick={onAccount}  Icon={signedIn ? User : KeyRound} label="Account"  accent="#88d8b0" />
        <BottomTab onClick={onSettings} Icon={Settings}                    label="Settings" accent="#ffc87a" />
      </aside>
    </>
  )
}

function BottomTab({ onClick, Icon, label, accent }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="ddd-bottom-tab"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px 10px 12px', minHeight: 52,
        borderRadius: 14,
        border: `1px solid ${accent}33`,
        background: 'rgba(15,12,30,0.45)',
        color: '#f0eaff',
        cursor: 'pointer',
        fontSize: 14, fontWeight: 700,
        fontFamily: "'Outfit', system-ui, sans-serif",
        letterSpacing: '0.3px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <span className="ddd-bottom-tab-icon" style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: accent, color: '#1a0f30',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {Icon && <Icon size={16} strokeWidth={2.2} />}
      </span>
      <span className="ddd-bottom-tab-label">{label}</span>
    </button>
  )
}

const BottomTabCluster = memo(BottomTabClusterImpl, (a, b) => a.signedIn === b.signedIn)
export default BottomTabCluster
