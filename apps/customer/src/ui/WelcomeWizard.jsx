// WelcomeWizard — first-time user onboarding
// Shows on first visit, helps users start their first design
import { useState } from 'react'

const TYPES = [
  { id: 'home',      icon: '🏠', label: 'My Home',        desc: 'Plan a house or apartment' },
  { id: 'apartment', icon: '🏢', label: 'Apartment',      desc: 'Studio, 1BR, or 2BR layout' },
  { id: 'hotel',     icon: '🏨', label: 'Hotel / Commercial', desc: 'Multi-room commercial space' },
  { id: 'dungeon',   icon: '⚔️', label: 'DnD / Fantasy',   desc: 'Dungeons, taverns, castles' },
  { id: 'other',     icon: '✨', label: 'Just Exploring',  desc: 'I want to play around' },
]

export default function WelcomeWizard({ onComplete, onSkip }) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)

  if (step === 0) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(8px)',
        fontFamily: "'Outfit',sans-serif",
      }}>
        <div style={{
          background: '#1a1a2e', border: '1px solid #3a3a5a', borderRadius: 20,
          padding: 32, width: 440, maxWidth: '90vw', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f0eaff', marginBottom: 4 }}>
            Welcome to DaydreamDwelling
          </div>
          <div style={{ fontSize: 13, color: '#8878aa', marginBottom: 24 }}>
            What are you designing today?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => { setSelected(t.id); setStep(1) }} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 12,
                border: selected === t.id ? '2px solid #5a3a9a' : '1px solid #3a3a5a',
                background: selected === t.id ? '#5a3a9a20' : '#12122a',
                color: '#e0d8f0', cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', fontSize: 14, fontWeight: 600,
              }}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <div>
                  <div>{t.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: '#8878aa' }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <button onClick={onSkip} style={{
            marginTop: 16, background: 'none', border: 'none', color: '#6868a0',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}>Skip — I know what I'm doing</button>
        </div>
      </div>
    )
  }

  // Step 1: Quick tips based on selection
  const tips = {
    home: ['Open the Floor Plan to draw your house shape', 'Use Add Room to create rooms with walls', 'Name each room, then furnish in the 3D builder'],
    apartment: ['Start with Add Room for your living area', 'Draw walls to separate kitchen and bedroom', 'Our mood themes change the whole vibe'],
    hotel: ['Expand the workspace for large layouts', 'Design one guest room, then Copy Room to duplicate', 'Use + Floor Above for multi-story buildings'],
    dungeon: ['Draw irregular shapes with Floor Shape', 'Internal walls create dungeon corridors', 'Multiple floors = dungeon levels'],
    other: ['Click ▦ Plan to open the floor plan editor', 'Browse the Shop for furniture and decor', 'Try different Mood themes!'],
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(8px)',
      fontFamily: "'Outfit',sans-serif",
    }}>
      <div style={{
        background: '#1a1a2e', border: '1px solid #3a3a5a', borderRadius: 20,
        padding: 32, width: 440, maxWidth: '90vw',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f0eaff', marginBottom: 16 }}>
          Quick Start Tips
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {(tips[selected] ?? tips.other).map((tip, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 12px', background: '#12122a', borderRadius: 10,
              fontSize: 13, color: '#c0b8e0',
            }}>
              <span style={{ color: '#5a3a9a', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>{i + 1}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onComplete(selected)} style={{
          width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none',
          background: '#5a3a9a', color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Let's Build!</button>
      </div>
    </div>
  )
}
