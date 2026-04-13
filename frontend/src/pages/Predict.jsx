import { useState } from 'react'
import { 
  Brain, Sparkles, AlertCircle, Search, TrendingUp,
  Zap, Shield, Lightbulb, Book, Moon, Smartphone, School,
  CheckSquare, BarChart2, Target, BookOpen, Star, Plus, Minus
} from 'lucide-react'

const API = 'http://localhost:8000'

// We map the string identifiers coming from the backend to the Lucide components
const ICON_MAP = {
  Book, Moon, Smartphone, School, Brain, CheckSquare, Target, BookOpen, Star
}

const FIELDS = [
  { key: 'study_hours', label: 'Study Hours', Icon: Book, min: 0, max: 12, step: 0.5, jump: 1, default: 5 },
  { key: 'sleep_hours', label: 'Sleep Hours', Icon: Moon, min: 3, max: 12, step: 0.5, jump: 1, default: 7 },
  { key: 'screen_time', label: 'Screen Time', Icon: Smartphone, min: 0, max: 10, step: 0.5, jump: 1, default: 3 },
  { key: 'attendance', label: 'Attendance %', Icon: School, min: 0, max: 100, step: 1, jump: 5, default: 80 },
  { key: 'assignments_completed', label: 'Assignments Done %', Icon: CheckSquare, min: 0, max: 100, step: 1, jump: 5, default: 75 },
  { key: 'previous_grade', label: 'Previous Grade (GPA)', Icon: BarChart2, min: 0, max: 10, step: 0.1, jump: 0.5, default: 7 },
  { key: 'extracurricular_hours', label: 'Extra-Curricular (hrs/wk)', Icon: Target, min: 0, max: 10, step: 0.5, jump: 0.5, default: 2 },
  { key: 'stress_level', label: 'Stress Level', Icon: Brain, min: 1, max: 10, step: 1, jump: 1, default: 4 },
]

const defaultValues = Object.fromEntries(FIELDS.map(f => [f.key, f.default]))

function getBadgeClass(label) {
  const map = {
    Excellent: 'badge-excellent',
    Good: 'badge-good',
    Average: 'badge-average',
    Poor: 'badge-poor',
  }
  return map[label] || ''
}

function getRiskBadge(risk) {
  const map = {
    Low: 'badge-low-risk',
    Medium: 'badge-medium-risk',
    High: 'badge-high-risk',
  }
  return map[risk] || ''
}

function getProdBadge(level) {
  const map = {
    High: 'badge-high-prod',
    Medium: 'badge-medium-prod',
    Low: 'badge-low-prod',
  }
  return map[level] || ''
}

export default function Predict() {
  const [values, setValues] = useState(defaultValues)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (key, val) => {
    if (val === '') {
      setValues(prev => ({ ...prev, [key]: '' }))
      return
    }
    setValues(prev => ({ ...prev, [key]: parseFloat(val) }))
  }

  const handleStep = (key, delta, min, max) => {
    setValues(prev => {
      let v = prev[key] === '' ? 0 : parseFloat(prev[key])
      let nv = v + delta
      if (nv > max) nv = max
      if (nv < min) nv = min
      return { ...prev, [key]: Number(nv.toFixed(1)) }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Prediction failed')
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Could not reach the API. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const circumference = 2 * Math.PI * 56
  const prodOffset = result
    ? circumference - (result.productivity.score / 100) * circumference
    : circumference

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>
          <span className="gradient-text">AI Prediction</span> Engine
        </h2>
        <p>
          Enter student metrics below and our AI models will predict performance,
          productivity, risk level, and provide personalized recommendations.
        </p>
      </div>

      <div className="bento-grid stagger-children" style={{ alignItems: 'start' }}>
        {/* ---- Input Form Array (Span 5) ---- */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
              <Brain size={20} />
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Input Parameters</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {FIELDS.map(({ key, label, Icon, min, max, step, jump }) => (
                <div className="mic-card" key={key} style={{ margin: 0 }}>
                  <div className="mic-header" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                    <Icon size={12} style={{ color: 'var(--text-primary)' }} />
                    {label}
                  </div>
                  <div className="mic-body">
                    <button type="button" className="mic-btn" onClick={() => handleStep(key, -jump, min, max)}>
                      <Minus size={14} />
                    </button>
                    <div className="mic-value-wrap">
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={values[key]}
                        onChange={e => handleChange(key, e.target.value)}
                        className="mic-input"
                        style={{ fontSize: 16 }}
                      />
                      <span className="mic-unit">/{max}</span>
                    </div>
                    <button type="button" className="mic-btn" onClick={() => handleStep(key, jump, min, max)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ background: 'var(--bg-input)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: 16 }}>
                 <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>MODEL: <strong style={{color: 'var(--text-primary)'}}>RF_CORE</strong></div>
                 <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>MODE: <strong style={{color: 'var(--text-primary)'}}>LIVE</strong></div>
                 <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>LATENCY: <strong style={{color: '#10b981'}}>&lt; 15ms</strong></div>
               </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: 14 }}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Processing Vector Matrix…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Initialize Prediction Protocol
                </>
              )}
            </button>
          </form>
        </div>

        {/* ---- Results Telemetry Panel (Span 7) ---- */}
        <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {error && (
            <div className="error-container">
              <div className="error-icon"><AlertCircle size={32} /></div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {!result && !error && (
            <div className="telemetry-panel stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Zap size={18} style={{ color: '#10b981' }} />
                  <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live Sensor Telemetry</h3>
                </div>

                <div className="dist-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, padding: 0 }}>
                  <div className="dist-block" style={{ padding: '24px 12px' }}>
                    <div className="dist-count" style={{ fontSize: 24, marginBottom: 4 }}>{values.study_hours}</div>
                    <div className="dist-label" style={{ fontSize: 9 }}>Study.Hrs</div>
                  </div>
                  <div className="dist-block" style={{ padding: '24px 12px' }}>
                    <div className="dist-count" style={{ fontSize: 24, marginBottom: 4 }}>{values.sleep_hours}</div>
                    <div className="dist-label" style={{ fontSize: 9 }}>Sleep.Hrs</div>
                  </div>
                  <div className="dist-block" style={{ padding: '24px 12px' }}>
                    <div className="dist-count" style={{ fontSize: 24, marginBottom: 4 }}>{values.attendance}</div>
                    <div className="dist-label" style={{ fontSize: 9 }}>Atndnce %</div>
                  </div>
                  <div className="dist-block" style={{ padding: '24px 12px', borderColor: values.stress_level >= 8 ? 'rgba(239, 68, 68, 0.3)' : '', background: values.stress_level >= 8 ? 'rgba(239, 68, 68, 0.05)' : '' }}>
                    <div className="dist-count" style={{ fontSize: 24, marginBottom: 4, color: values.stress_level >= 8 ? '#ef4444' : 'var(--text-primary)' }}>{values.stress_level}</div>
                    <div className="dist-label" style={{ fontSize: 9, color: values.stress_level >= 8 ? '#ef4444' : 'var(--text-secondary)' }}>Stress</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Theoretical Output Trajectory</h3>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>Uncalibrated</div>
                </div>
                
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'var(--text-primary)', 
                    width: `${Math.min(100, Math.max(5, (values.attendance * 0.4 + values.assignments_completed * 0.4 + values.study_hours * 2)))}%`,
                    transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }} />
                </div>
                
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Active matrix responds dynamically to input nodes. <strong>Initialize Prediction Protocol</strong> to lock vector coordinates and resolve final deterministic weights.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="results-section stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Performance */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 24 }}>
                  <span className="card-title"><TrendingUp size={16} /> Performance Confidence</span>
                  <span className={`result-badge ${getBadgeClass(result.performance.label)}`}>
                    {result.performance.label}
                  </span>
                </div>
                <div className="dist-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, padding: 0 }}>
                  {Object.entries(result.performance.probabilities).map(([label, prob]) => (
                    <div className="dist-block" key={label} style={{ padding: '24px 16px' }}>
                      <div className="dist-count" style={{ fontSize: 24, marginBottom: 4 }}>{(prob * 100).toFixed(0)}%</div>
                      <div className="dist-label" style={{ fontSize: 9 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productivity + Risk Split Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
                  <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24, color: 'var(--text-secondary)' }}>
                    Output Velocity
                  </h3>
                  <div className="productivity-gauge" style={{ margin: '0 auto', transform: 'scale(1.2)' }}>
                    <div className="gauge-circle">
                      <svg viewBox="0 0 120 120">
                        <circle className="gauge-bg" cx="60" cy="60" r="56" />
                        <circle
                          className="gauge-fill"
                          cx="60"
                          cy="60"
                          r="56"
                          strokeDasharray={circumference}
                          strokeDashoffset={prodOffset}
                        />
                      </svg>
                      <div className="gauge-value">
                        <div className="score" style={{ fontSize: 24, fontWeight: 900 }}>{result.productivity.score}</div>
                        <div className="label" style={{ fontSize: 11 }}>{result.productivity.level}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
                  <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24, color: 'var(--text-secondary)' }}>
                    Systemic Risk Level
                  </h3>
                  <span
                    className={`result-badge ${getRiskBadge(result.risk_level)}`}
                    style={{ fontSize: 16, padding: '12px 32px' }}
                  >
                    {result.risk_level}
                  </span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center', lineHeight: 1.5 }}>
                    {result.risk_level === 'High'
                      ? 'Critical intervention vector detected.'
                      : result.risk_level === 'Medium'
                      ? 'Deviation from optimal trajectory.'
                      : 'Nodes operating nominally.'}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 24 }}>
                  <span className="card-title"><Lightbulb size={16} style={{ marginRight: 8 }} /> AI Recommendations</span>
                </div>
                <div className="rec-list">
                  {result.recommendations.map((rec, i) => {
                    const RecIcon = ICON_MAP[rec.icon] || Lightbulb;
                    
                    return (
                      <div className="rec-card" key={i} style={{ animationDelay: `${i * 100}ms`, padding: '24px' }}>
                        <div className="rec-icon" style={{ background: 'var(--bg-input)' }}>
                          <RecIcon size={16} />
                        </div>
                        <div className="rec-content">
                          <h4 style={{ fontSize: 14 }}>{rec.title}</h4>
                          <p style={{ fontSize: 12 }}>{rec.description}</p>
                          <span className={`rec-priority ${rec.priority}`} style={{ fontSize: 10 }}>{rec.priority}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
