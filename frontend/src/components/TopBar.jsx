import React, { useState, useEffect } from 'react'

export default function TopBar({ investigationStatus, onStartInvestigation, briefing }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      height: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, zIndex: 200,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent-blue)',
            boxShadow: '0 0 10px var(--accent-blue)',
            animation: 'pulse-dot 2s infinite'
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--accent-blue)' }}>
            RIDGEWAY
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
            6:10 INTELLIGENCE
          </span>
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
          ARIA v2.1 — AI ANALYST
        </span>
      </div>

      {/* Centre — clock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
          {timeStr}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
          {dateStr}
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {briefing?.approved && (
          <div style={{ padding: '4px 10px', background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#00e676', letterSpacing: '0.08em' }}>
              ✓ BRIEFING SENT TO NISHA
            </span>
          </div>
        )}
        <div style={{ padding: '4px 10px', background: 'rgba(255,214,0,0.06)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ffd600' }}>⚠ NISHA IN</span>
          <Countdown />
        </div>
        <button
          onClick={onStartInvestigation}
          disabled={investigationStatus === 'running'}
          style={{
            padding: '7px 18px',
            background: investigationStatus === 'running' ? 'transparent' : 'var(--accent-blue)',
            color: investigationStatus === 'running' ? 'var(--accent-blue)' : '#000',
            border: investigationStatus === 'running' ? '1px solid var(--accent-blue)' : 'none',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            cursor: investigationStatus === 'running' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}>
          {investigationStatus === 'running' ? '⟳ ARIA INVESTIGATING...' :
           investigationStatus === 'done'    ? '↺ RE-INVESTIGATE' :
                                               '▶ START INVESTIGATION'}
        </button>
      </div>
    </div>
  )
}

function Countdown() {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const update = () => {
      const target = new Date()
      target.setHours(8, 0, 0, 0)
      if (target < new Date()) target.setDate(target.getDate() + 1)
      const diff = target - Date.now()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setLabel(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ffd600', fontWeight: 700 }}>{label}</span>
}
