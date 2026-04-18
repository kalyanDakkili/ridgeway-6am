import React, { useState, useEffect, useRef } from 'react'

export default function DroneSimulator({ waypoints, showDronePath, onToggleDronePath }) {
  const [activeWp, setActiveWp]   = useState(null)
  const [playing, setPlaying]     = useState(false)
  const [progress, setProgress]   = useState(0)
  const intervalRef               = useRef(null)
  const total                     = waypoints.length

  useEffect(() => {
    if (playing && total > 0) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + 1
          if (next >= total) {
            setPlaying(false)
            setActiveWp(waypoints[total - 1])
            return total - 1
          }
          setActiveWp(waypoints[next])
          return next
        })
      }, 1300)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, total, waypoints])

  const handlePlay = () => {
    if (playing) { setPlaying(false); return }
    setProgress(0)
    setActiveWp(waypoints[0])
    setPlaying(true)
    if (!showDronePath) onToggleDronePath()
  }

  const isAlert = (obs) => obs?.startsWith('⚠')

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🚁</span>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent-blue)', letterSpacing: '0.1em' }}>PAT-2024-047</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>02:45–03:23 AM · ROUTE ALPHA</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={onToggleDronePath} style={{
            padding: '3px 7px', borderRadius: 3, cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 8,
            background: showDronePath ? 'rgba(0,168,255,0.15)' : 'transparent',
            border: `1px solid ${showDronePath ? 'var(--accent-blue)' : 'var(--border)'}`,
            color: showDronePath ? 'var(--accent-blue)' : 'var(--text-dim)',
          }}>
            {showDronePath ? '◉ PATH' : '◎ PATH'}
          </button>
          <button onClick={handlePlay} disabled={total === 0} style={{
            padding: '3px 7px', borderRadius: 3, cursor: total === 0 ? 'default' : 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
            background: playing ? 'rgba(255,23,68,0.12)' : 'rgba(0,230,118,0.12)',
            border: `1px solid ${playing ? '#ff1744' : '#00e676'}`,
            color: playing ? '#ff1744' : '#00e676',
          }}>
            {playing ? '■ STOP' : '▶ REPLAY'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ height: 2, background: 'var(--border)' }}>
          <div style={{
            height: '100%', background: 'var(--accent-blue)',
            width: `${(progress / Math.max(total - 1, 1)) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      )}

      {/* Waypoints */}
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {waypoints.map((wp, i) => {
          const isActive = activeWp?.label === wp.label
          const isPast   = activeWp !== null && i <= progress
          const alert    = isAlert(wp.observation)
          return (
            <div key={i} onClick={() => setActiveWp(wp)} style={{
              display: 'flex', gap: 8, padding: '6px 8px', borderRadius: 4, cursor: 'pointer',
              background: isActive ? 'rgba(0,168,255,0.06)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,168,255,0.25)' : 'transparent'}`,
              transition: 'all 0.2s',
            }}>
              {/* Timeline dot + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', marginTop: 2,
                  background: isActive ? (alert ? '#ff1744' : 'var(--accent-blue)') : isPast ? 'rgba(0,168,255,0.35)' : 'var(--border)',
                  border: `2px solid ${isActive ? (alert ? '#ff1744' : 'var(--accent-blue)') : 'transparent'}`,
                  boxShadow: isActive ? `0 0 8px ${alert ? '#ff1744' : 'var(--accent-blue)'}` : 'none',
                }} />
                {i < waypoints.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 10, background: 'var(--border)', marginTop: 2 }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 1 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent-blue)' }}>{wp.time}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isActive ? 700 : 400 }}>
                    {wp.label}
                  </span>
                  {alert && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#ff1744' }}>⚠</span>}
                </div>
                {isActive && (
                  <div style={{ fontSize: 10, color: alert ? '#ff6d00' : 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
                    {wp.observation}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
