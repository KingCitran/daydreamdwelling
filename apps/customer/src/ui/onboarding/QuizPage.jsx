import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { QUESTIONS, calcResult } from './quizData'
import { MOODS } from '@shared/useMood'
import { MOOD_THEMES } from '@shared/themes'

const MOOD_DESC = Object.fromEntries(MOODS.map(m => [m.key, m.desc]))

export default function QuizPage({ onComplete, onSkip }) {
  const t = useTheme()
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult]   = useState(null)

  const question = QUESTIONS[step]
  const isResult = step >= QUESTIONS.length

  function handleAnswer(answerId) {
    const next = { ...answers, [question.id]: answerId }
    setAnswers(next)
    if (step + 1 >= QUESTIONS.length) {
      setResult(calcResult(next))
      setStep(QUESTIONS.length)
    } else {
      setStep(s => s + 1)
    }
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  const resultTheme = result ? MOOD_THEMES[result] : null

  return (
    <div style={styles.page(t)}>
      {!isResult ? (
        <>
          <div style={styles.progressTrack(t)}>
            <div style={styles.progressFill(t, step, QUESTIONS.length)} />
          </div>
          <div style={styles.stepRow}>
            {step > 0 ? (
              <button onClick={handleBack} style={styles.backBtn(t)} aria-label="Previous question">← Back</button>
            ) : (
              <span />
            )}
            <p style={styles.stepLabel(t)}>{step + 1} / {QUESTIONS.length}</p>
          </div>

          <h2 style={styles.question(t)}>{question.text}</h2>

          <div style={styles.grid}>
            {question.answers.map(answer => (
              <button
                key={answer.id}
                className="ddd-quiz-card"
                style={styles.card(t, answers[question.id] === answer.id)}
                onClick={() => handleAnswer(answer.id)}
              >
                <div style={styles.cardVisual(answer)} />
                <span style={styles.cardLabel(t)}>{answer.label}</span>
              </button>
            ))}
          </div>

          <button style={styles.skip(t)} onClick={onSkip}>
            Skip quiz
          </button>
        </>
      ) : (
        /* Result screen */
        <div style={styles.resultWrap}>
          <p style={styles.resultEyebrow(t)}>Your vibe is</p>
          <div style={styles.resultSwatch(resultTheme)} />
          <h2 style={styles.resultName(t)}>{result}</h2>
          <p style={styles.resultDesc(t)}>{MOOD_DESC[result]}</p>

          <div style={styles.resultActions}>
            <button
              style={styles.enterBtn(t)}
              onClick={() => onComplete(result)}
            >
              Enter your room
            </button>
            <button
              style={styles.retakeBtn(t)}
              onClick={() => { setStep(0); setAnswers({}); setResult(null) }}
            >
              Take it again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: t => ({
    minHeight:      '100dvh',
    background:     t.bg,
    color:          t.text,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    padding:        '32px 20px 48px',
    boxSizing:      'border-box',
  }),
  progressTrack: t => ({
    width:          '100%',
    maxWidth:       640,
    height:         3,
    background:     t.surfaceBorder,
    borderRadius:   2,
    overflow:       'hidden',
    marginBottom:   8,
  }),
  progressFill: (t, step, total) => ({
    height:         '100%',
    width:          `${(step / total) * 100}%`,
    background:     t.accent,
    borderRadius:   2,
    transition:     'width 0.35s ease',
  }),
  stepRow: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    width:          '100%',
    maxWidth:       640,
    marginBottom:   40,
  },
  stepLabel: t => ({
    fontSize:       12,
    color:          t.textSoft,
    letterSpacing:  '0.08em',
    margin:         0,
  }),
  backBtn: t => ({
    background:     'none',
    border:         'none',
    color:          t.textSoft,
    fontSize:       13,
    cursor:         'pointer',
    padding:        '4px 8px',
    borderRadius:   6,
    letterSpacing:  '0.02em',
  }),
  question: t => ({
    fontSize:       'clamp(20px, 4vw, 28px)',
    fontWeight:     500,
    color:          t.text,
    textAlign:      'center',
    maxWidth:       560,
    marginBottom:   36,
    lineHeight:     1.3,
  }),
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap:                 16,
    width:               '100%',
    maxWidth:            640,
    marginBottom:        40,
  },
  card: (t, selected) => ({
    background:     selected ? `${t.accent}18` : t.surface,
    border:         `1.5px solid ${selected ? t.accent : t.surfaceBorder}`,
    borderRadius:   12,
    padding:        0,
    overflow:       'hidden',
    cursor:         'pointer',
    textAlign:      'left',
    transform:      selected ? 'scale(1.02)' : 'scale(1)',
    transition:     'border-color 0.15s, transform 0.15s, background 0.15s, box-shadow 0.15s',
  }),
  cardVisual: answer => ({
    width:          '100%',
    aspectRatio:    '4 / 3',
    background:     answer.photo ? undefined : answer.gradient,
    backgroundImage: answer.photo ? `url(${answer.photo})` : undefined,
    backgroundSize:  'cover',
    backgroundPosition: 'center',
  }),
  cardLabel: t => ({
    display:        'block',
    padding:        '10px 12px',
    fontSize:       13,
    color:          t.text,
    lineHeight:     1.35,
    letterSpacing:  '0.01em',
  }),
  skip: t => ({
    background:     'none',
    border:         'none',
    color:          t.textSoft,
    fontSize:       13,
    cursor:         'pointer',
    letterSpacing:  '0.04em',
    padding:        '4px 8px',
    marginTop:      'auto',
  }),
  resultWrap: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    textAlign:      'center',
    marginTop:      48,
    gap:            16,
    maxWidth:       480,
    width:          '100%',
  },
  resultEyebrow: t => ({
    fontSize:       13,
    color:          t.textSoft,
    letterSpacing:  '0.1em',
    textTransform:  'uppercase',
    margin:         0,
  }),
  resultSwatch: rt => ({
    width:          '100%',
    maxWidth:       320,
    height:         180,
    borderRadius:   16,
    background:     rt ? `linear-gradient(135deg, ${rt.navBg}, ${rt.accent})` : '#222',
    transition:     'background 0.4s ease',
  }),
  resultName: t => ({
    fontSize:       32,
    fontWeight:     600,
    color:          t.text,
    margin:         0,
  }),
  resultDesc: t => ({
    fontSize:       15,
    color:          t.textSoft,
    margin:         0,
  }),
  resultActions: {
    display:        'flex',
    flexDirection:  'column',
    gap:            10,
    width:          '100%',
    maxWidth:       280,
    marginTop:      8,
  },
  enterBtn: t => ({
    background:     t.accent,
    color:          t.accentText,
    border:         'none',
    borderRadius:   8,
    padding:        '13px 24px',
    fontSize:       15,
    fontWeight:     600,
    cursor:         'pointer',
    letterSpacing:  '0.02em',
  }),
  retakeBtn: t => ({
    background:     'none',
    color:          t.textSoft,
    border:         `1px solid ${t.surfaceBorder}`,
    borderRadius:   8,
    padding:        '11px 24px',
    fontSize:       14,
    cursor:         'pointer',
  }),
}
