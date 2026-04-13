import { useState, useEffect } from 'react'
import { CheckCircle, Code, Database, Brain, Monitor, Braces, UserCircle } from 'lucide-react'

const API = 'http://localhost:8000'

export default function About() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/model-info`)
      .then(r => r.json())
      .then(setInfo)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>
          About <span className="gradient-text">EduAI System</span>
        </h2>
        <p>
          An AI-powered platform that predicts student academic performance and
          productivity using machine learning, providing actionable insights for
          educators and students alike.
        </p>
      </div>

      <div className="about-grid" style={{ marginBottom: 32 }}>
        {/* How it works */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">How It Works</span>
            <Brain size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <ul className="feature-list">
            <li>
              <CheckCircle size={16} className="feat-icon" />
              <span>Collects 8 key student metrics — study hours, sleep, attendance, and more.</span>
            </li>
            <li>
              <CheckCircle size={16} className="feat-icon" />
              <span>Trains on 1,000 synthetic student records with realistic correlations.</span>
            </li>
            <li>
              <CheckCircle size={16} className="feat-icon" />
              <span>Random Forest classifies performance into four tiers with probability scores.</span>
            </li>
            <li>
              <CheckCircle size={16} className="feat-icon" />
              <span>Gradient Boosting predicts a continuous 0‑100 productivity score.</span>
            </li>
            <li>
              <CheckCircle size={16} className="feat-icon" />
              <span>AI engine generates personalized recommendations based on input analysis.</span>
            </li>
            <li>
              <CheckCircle size={16} className="feat-icon" />
              <span>Risk assessment flags at-risk students for early intervention.</span>
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Technology Stack</span>
            <Code size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 500 }}>
            Frontend
          </h4>
          <div className="tech-badges">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">React Router</span>
            <span className="tech-badge">Recharts</span>
            <span className="tech-badge">Lucide Icons</span>
          </div>

          <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 24, marginBottom: 10, fontWeight: 500 }}>
            Backend
          </h4>
          <div className="tech-badges">
            <span className="tech-badge">Python</span>
            <span className="tech-badge">FastAPI</span>
            <span className="tech-badge">Scikit-learn</span>
            <span className="tech-badge">Pandas</span>
            <span className="tech-badge">NumPy</span>
          </div>

          <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 24, marginBottom: 10, fontWeight: 500 }}>
            ML Algorithms
          </h4>
          <div className="tech-badges">
            <span className="tech-badge">Random Forest</span>
            <span className="tech-badge">Gradient Boosting</span>
          </div>
        </div>
      </div>

      {/* Model details */}
      {info && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={20} /> Trained Models
          </h3>
          <div className="grid-2" style={{ marginBottom: 32 }}>
            {info.models.map((model, i) => (
              <div className="model-card" key={i}>
                <h4>{model.name}</h4>
                <div className="model-type">{model.type}</div>
                <div className="model-metric">
                  {model.accuracy ? `${model.accuracy}%` : `R² ${model.r2_score}%`}
                </div>
                <p>{model.description}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Braces size={20} /> Input Features
          </h3>
          <div className="card" style={{ marginBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {info.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Database size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  {f.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Author */}
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--text-secondary)' }}>
          <UserCircle size={48} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>Riya Choudhary</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Developer & ML Engineer — AI-Based Student Performance & Productivity Analysis System
        </p>
      </div>
    </div>
  )
}
