// Standard construction dimensions (US residential defaults)
// Future: load from user account region settings
export const WALL_T = 0.375      // 4.5 inches — interior wall (2×4 stud + drywall)
export const WALL_T_EXT = 0.54   // 6.5 inches — exterior wall (2×6 stud + drywall)

// Unit system — 'imperial' (feet/inches) or 'metric' (meters/cm)
// Internally everything is stored in feet. Display converts.
export const UNIT_SYSTEMS = {
  imperial: { label: 'ft', factor: 1, symbol: "'", step: 0.5 },
  metric:   { label: 'm',  factor: 0.3048, symbol: 'm', step: 0.1 },
}

export function formatDim(valueFt, system = 'imperial') {
  if (system === 'metric') {
    const m = valueFt * 0.3048
    return `${Math.round(m * 10) / 10}m`
  }
  // Imperial: show feet and inches
  const feet = Math.floor(valueFt)
  const inches = Math.round((valueFt - feet) * 12)
  if (inches === 0) return `${feet}'`
  if (inches === 12) return `${feet + 1}'`
  return `${feet}'${inches}"`
}

// Parse user input — accepts: 22.5, 22'6", 22'6, 270" (all inches), 6.7m
export function parseDimInput(input, system = 'imperial') {
  const s = String(input).trim()
  // Metric: convert m to ft
  if (s.endsWith('m')) return parseFloat(s) / 0.3048
  // All inches: 270"
  if (s.endsWith('"') && !s.includes("'")) return parseFloat(s) / 12
  // Feet-inches: 22'6" or 22'6
  const ftIn = s.match(/^(\d+(?:\.\d+)?)'?\s*(\d+(?:\.\d+)?)?"?$/)
  if (ftIn && ftIn[2] != null) return parseFloat(ftIn[1]) + parseFloat(ftIn[2]) / 12
  // Plain number: treat as feet
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}
