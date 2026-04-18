import React from 'react'

const SEV_COLOR  = { HIGH: '#ff1744', MEDIUM: '#ffd600', LOW: '#00e676' }
const TYPE_ICONS = {
  FENCE_ALERT: '⚡', BADGE_SWIPE_FAIL: '🔐',
  VEHICLE_PATH: '🚗', DRONE_PATROL: '🚁',
  DRONE_OBSERVATION: '👁', VEHICLE_EXIT: '🚪',
}
const SEV_RGB = { '#ff1744': '255,23,68', '#ffd600': '255,214,0', '#00e676': '0,230,118' }

export default function EventDetail({ event, onClose }) {
  if (!event) return null
  const sevColor = SEV_COLOR[event.severity] || '#6a8099'
  const icon     = TYPE_ICONS[event.type] || '●'
  const rgb      = SEV_RGB[sevColor] || '106,128,153'

  return (
    <div style={{
      position: 'absolute', bottom: 14, right: 14, zIndex: 1001,
      width: 290,
      background: 'rgba(8,9,13,0.97)',
      border: '1px solid var(--border-bright)',
      borderRadius: 8, overflow: 'hidden',
      boxShadow: '0 8px 36px rgba(0,0,0,0.7)',
      animation: 'fade-in-up 0.2s ease',
    }}>
      {/* Header strip */}
      <div style={{
        padding: '9px 12px', borderBottom: '1px solid var(--border)',
        background: `rgba(${rgb},0.06)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: sevColor, letterSpacing: '0.08em', fontWeight: 700 }}>
            {event.type.replace(/_/g, ' ')}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: sevColor, marginBottom: 2 }}>{event.time}</div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{event.location}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 10 }}>{event.description}</div>

        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px' }}>
            {Object.entries(event.metadata).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.05em', flexShrink: 0 }}>
                  {k.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
