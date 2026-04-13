import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts'
import { Target, TrendingUp, BarChart2, Database, AlertCircle } from 'lucide-react'

const API = 'http://localhost:8000'

const TOOLTIP_STYLE = {
  background: '#09090b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#fafafa',
  fontSize: 13,
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/analytics`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Cannot connect to the backend.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading analytics…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon"><AlertCircle size={32} /></div>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  /* ---- Transform data for charts ---- */

  const perfDist = Object.entries(data.performance_distribution).map(
    ([name, value]) => ({ name, Students: value })
  )

  const importance = Object.entries(data.feature_importances)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      Importance: +(value * 100).toFixed(1),
    }))
    .sort((a, b) => b.Importance - a.Importance)

  const correlations = Object.entries(data.productivity_correlations)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      Correlation: +(value * 100).toFixed(1),
    }))
    .sort((a, b) => Math.abs(b.Correlation) - Math.abs(a.Correlation))

  /* Radar: average metrics for "Good" students */
  const goodMetrics = data.avg_metrics_by_performance['Good'] || {}
  const radarData = Object.entries(goodMetrics).map(([key, val]) => ({
    metric: key.replace(/_/g, ' '),
    value: +val,
  }))

  const PERF_COLORS = ['#fafafa', '#a1a1aa', '#52525b', '#27272a']

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>
          <span className="gradient-text">Analytics</span> & Insights
        </h2>
        <p>
          Explore data distributions, feature importance, and correlation patterns
          discovered by the AI models across {data.dataset_size.toLocaleString()} student records.
        </p>
      </div>      {/* Advanced Bento Architecture */}
      <div className="bento-grid stagger-children">
        
        {/* ROW 1: 4-col Split Stats, 4-col Radar, 4-col Split Stats */}
        <div className="bento-4" style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 32 }}>
          <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
              <Target size={16} /> <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model Accuracy</span>
            </div>
            <div className="stat-value" style={{ fontSize: 36, fontWeight: 900 }}>{data.model_metrics.performance_accuracy}%</div>
          </div>
          <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
              <TrendingUp size={16} /> <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Productivity R²</span>
            </div>
            <div className="stat-value" style={{ fontSize: 36, fontWeight: 900 }}>{data.model_metrics.productivity_r2}%</div>
          </div>
        </div>

        <div className="card bento-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ paddingBottom: 0, border: 'none' }}>
            <span className="card-title">Archetype: Top Performers</span>
          </div>
          <div className="chart-container" style={{ flex: 1, minHeight: 240, marginTop: -10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={80}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#a1a1aa', fontSize: 9 }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Radar
                  name="Average"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-4" style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 32 }}>
          <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
              <BarChart2 size={16} /> <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vectors Analyzed</span>
            </div>
            <div className="stat-value" style={{ fontSize: 36, fontWeight: 900 }}>{Object.keys(data.feature_importances).length}</div>
          </div>
          <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
              <Database size={16} /> <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Epochs</span>
            </div>
            <div className="stat-value" style={{ fontSize: 36, fontWeight: 900 }}>{data.dataset_size.toLocaleString()}</div>
          </div>
        </div>

        {/* ROW 2: 8-col Leaderboard, 4-col Distribution */}
        <div className="card bento-8">
          <div className="card-header">
            <span className="card-title">Feature Impact Matrix</span>
          </div>
          <div className="chart-container" style={{ overflowY: 'auto', paddingRight: 8, maxHeight: 360, marginTop: 16 }}>
            <div className="leaderboard-list">
              {importance.map((entry, i) => (
                <div className="leaderboard-item" key={i}>
                  <div className="leaderboard-rank">#{i + 1}</div>
                  <div className="leaderboard-name">{entry.name}</div>
                  <div className="leaderboard-score">{entry.Importance}% Impact</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bento-4">
          <div className="card-header">
            <span className="card-title">Target Demographics</span>
          </div>
          <div className="chart-container" style={{ overflowY: 'auto', paddingRight: 8, marginTop: 16 }}>
            <div className="dist-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {perfDist.map((entry, i) => (
                <div className="dist-block" key={i}>
                  <div className="dist-count" style={{ fontSize: 24, marginBottom: 4 }}>{entry.Students}</div>
                  <div className="dist-label" style={{ fontSize: 10 }}>{entry.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: 12-col Massive Correlation Array */}
        <div className="card bento-12">
          <div className="card-header">
            <span className="card-title">Pearson Correlation Array (Productivity Matrix)</span>
          </div>
          <div className="chart-container" style={{ marginTop: 16 }}>
            <div className="polarity-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, padding: 0 }}>
              {correlations.map((entry, i) => {
                const isPositive = entry.Correlation >= 0
                return (
                  <div className="polarity-card" key={i}>
                    <div className="polarity-header" style={{ fontSize: 11 }}>{entry.name}</div>
                    <div className={`polarity-value ${isPositive ? 'positive' : 'negative'}`} style={{ fontSize: 24 }}>
                      {entry.Correlation > 0 ? '+' : ''}{entry.Correlation}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
