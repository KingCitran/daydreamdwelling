import { useState, useEffect } from 'react'

const SOUND_KEY = 'ddd_reveal_sound_mode'
const OUTPUT_KEY = 'ddd_reveal_audio_output'

// Cycle: all → none → rain → all
export const SOUND_MODES = ['all', 'none', 'rain']
export const OUTPUT_MODES = ['headphones', 'desktop']

function readStorage(key, fallback) {
  try { return localStorage.getItem(key) || fallback } catch { return fallback }
}

// Custom events so multiple hook instances stay in sync within the same tab
// (localStorage `storage` event only fires across tabs, not within the same tab)
const SOUND_EVENT = 'ddd-reveal-sound-change'
const OUTPUT_EVENT = 'ddd-reveal-output-change'

export function useRevealAudioPrefs() {
  const [soundMode, setSoundModeState] = useState(() => readStorage(SOUND_KEY, 'all'))
  const [audioOutput, setAudioOutputState] = useState(() => readStorage(OUTPUT_KEY, 'headphones'))

  // Listen for changes from other hook instances
  useEffect(() => {
    const onSound = (e) => setSoundModeState(e.detail)
    const onOutput = (e) => setAudioOutputState(e.detail)
    window.addEventListener(SOUND_EVENT, onSound)
    window.addEventListener(OUTPUT_EVENT, onOutput)
    return () => {
      window.removeEventListener(SOUND_EVENT, onSound)
      window.removeEventListener(OUTPUT_EVENT, onOutput)
    }
  }, [])

  const setSoundMode = (val) => {
    try { localStorage.setItem(SOUND_KEY, val) } catch {}
    setSoundModeState(val)
    window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: val }))
  }
  const setAudioOutput = (val) => {
    try { localStorage.setItem(OUTPUT_KEY, val) } catch {}
    setAudioOutputState(val)
    window.dispatchEvent(new CustomEvent(OUTPUT_EVENT, { detail: val }))
  }

  const cycleSoundMode = () => {
    const next = SOUND_MODES[(SOUND_MODES.indexOf(soundMode) + 1) % SOUND_MODES.length]
    setSoundMode(next)
  }

  const toggleOutput = () => {
    setAudioOutput(audioOutput === 'desktop' ? 'headphones' : 'desktop')
  }

  // Desktop playback gets a small boost over headphones
  const volumeMultiplier = audioOutput === 'desktop' ? 1.3 : 1.0

  return {
    soundMode, audioOutput, volumeMultiplier,
    setSoundMode, setAudioOutput,
    cycleSoundMode, toggleOutput,
  }
}
