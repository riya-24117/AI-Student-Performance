import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Brain, Database, Layers, TrendingUp, ArrowRight, Activity } from 'lucide-react'

const API = 'http://localhost:8000'

const COLORS = ['#fafafa', '#a1a1aa', '#52525b', '#27272a']

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/analytics`).then(r => r.json()),
      fetch(`${API}/api/model-info`).then(r => r.json()),
    ])
      .then(([a, m]) => {
        setAnalytics(a)
        setModelInfo(m)
      })
      .catch(() => setError('Could not connect to the backend. Make sure the API server is running.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Connecting to AI engine…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon"><Activity size={32} /></div>
        <h3>Connection Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  const perfDistData = Object.entries(analytics.performance_distribution).map(
    ([name, value]) => ({ name, value })
  )

  const importanceData = Object.entries(analytics.feature_importances)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value: +(value * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>
          Welcome to <span className="gradient-text">EduAI Dashboard</span>
        </h2>
        <p>
          AI-powered student performance and productivity analysis system. Monitor
          model metrics, explore analytics, and make predictions.
        </p>
      </div>

      {/* Professional Bento Grid Layout */}
      <div className="bento-grid stagger-children">
        
        {/* ROW 1: 8-col Action CTA, 4-col System Pulse */}
        <div className="card bento-8" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px' }} onClick={() => navigate('/predict')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                Run Model Protocol
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Initialize the predictive engine with new student data to generate performance insights.
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        <div className="card bento-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-input)', padding: '16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            System Online
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Engine: <strong style={{ color: 'var(--text-primary)' }}>FastAPI</strong><br />
            Model Ver: <strong style={{ color: 'var(--text-primary)' }}>{modelInfo.version}</strong><br />
            Status: <strong style={{ color: 'var(--text-primary)' }}>Actively Training</strong>
          </div>
        </div>

        {/* ROW 2: 8-col Leaderboard, 4-col Subgrid Container (R2 + Data metrics) */}
        <div className="card bento-8" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
             <span className="card-title">Top Impact Variables</span>
          </div>
          <div className="chart-container" style={{ flex: 1, overflowY: 'auto', paddingRight: 8, marginTop: 12 }}>
            <div className="leaderboard-list">
              {importanceData.slice(0, 4).map((entry, i) => (
                <div className="leaderboard-item" key={i}>
                  <div className="leaderboard-rank">#{i + 1}</div>
                  <div className="leaderboard-name">{entry.name}</div>
                  <div className="leaderboard-score">{entry.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bento-4" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="stat-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Productivity R² Score</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', textShadow: '2px 2px 0px rgba(0,0,0,0.4)', marginBottom: 4 }}>{analytics.model_metrics.productivity_r2}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Variance captured</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
             <div className="stat-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
               <div>
                 <div className="stat-value" style={{ fontSize: 20, marginBottom: 2 }}>{analytics.dataset_size.toLocaleString()}</div>
                 <div className="stat-label" style={{ fontSize: 10 }}>Training Data</div>
               </div>
               <Database size={20} color="var(--text-muted)" />
             </div>
             <div className="stat-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
               <div>
                 <div className="stat-value" style={{ fontSize: 20, marginBottom: 2 }}>{analytics.model_metrics.performance_accuracy}%</div>
                 <div className="stat-label" style={{ fontSize: 10 }}>Classification</div>
               </div>
               <Activity size={20} color="var(--text-muted)" />
             </div>
          </div>
        </div>

        {/* ROW 3: 8-col Distribution Blocks, 4-col Text AI Insight */}
        <div className="card bento-8">
          <div className="card-header">
            <span className="card-title">Categorical Spread</span>
          </div>
          <div className="chart-container" style={{ height: 'auto', marginTop: 12 }}>
             <div className="dist-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, padding: 0 }}>
               {perfDistData.map((entry, i) => (
                 <div className="dist-block" key={i} style={{ padding: '16px' }}>
                   <div className="dist-count" style={{ fontSize: 20, marginBottom: 4 }}>{entry.value}</div>
                   <div className="dist-label" style={{ fontSize: 10 }}>{entry.name}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="rec-card bento-4" style={{ flexDirection: 'column', padding: 16, justifyContent: 'center', boxSizing: 'border-box' }}>
          <div className="rec-icon" style={{ marginBottom: 12, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)' }}><Brain size={16} /></div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>AI Intelligence Note</h4>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            The active model heavily weights <strong style={{ color: 'var(--text-primary)' }}>{importanceData[0].name}</strong> and <strong style={{ color: 'var(--text-primary)' }}>{importanceData[1].name}</strong>. Adjusting these parameters will yield the highest variance in prediction protocols.
          </p>
        </div>

      </div>
    </div>
  )
}
