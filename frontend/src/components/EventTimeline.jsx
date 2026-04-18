import React from 'react'

const TYPE_ICONS = {
  FENCE_ALERT:       '⚡',
  BADGE_SWIPE_FAIL:  '🔐',
  VEHICLE_PATH:      '🚗',
  DRONE_PATROL:      '🚁',
  DRONE_OBSERVATION: '👁',
  VEHICLE_EXIT:      '🚪',
}
const SEV_COLOR   = { HIGH: '#ff1744', MEDIUM: '#ffd600', LOW: '#00e676' }
const STATUS_INFO = {
  HARMLESS:   { label: '✓ HARMLESS', cls: 'badge-harmless' },
  MONITOR:    { label: '◎ MONITOR',  cls: 'badge-monitor' },
  ESCALATE:   { label: '▲ ESCALATE', cls: 'badge-escalate' },
  UNREVIEWED: { label: '— PENDING',  cls: 'badge-unreviewed' },
}

export default function EventTimeline({ events, selectedEvent, onSelectEvent }) {
  const escalated = events.filter(e => e.status === 'ESCALATE').length
  const pending   = events.filter(e => e.status === 'UNREVIEWED').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-blue)', letterSpacing: '0.12em' }}>
            OVERNIGHT EVENTS
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
            {events.length} SIGNALS
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {escalated > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 3 }} className="badge-escalate">
              {escalated} ESCALATED
            </span>
          )}
          {pending > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 3 }} className="badge-unreviewed">
              {pending} PENDING
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {events.map((evt, idx) => {
          const isSelected = selectedEvent?.id === evt.id
          const icon       = TYPE_ICONS[evt.type] || '●'
          const sevColor   = SEV_COLOR[evt.severity] || '#7a8fa6'
          const si         = STATUS_INFO[evt.status] || STATUS_INFO.UNREVIEWED

          return (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(isSelected ? null : evt)}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${idx * 30}ms`,
                padding: '10px 12px', marginBottom: 4, borderRadius: 6,
                border: `1px solid ${isSelected ? 'var(--border-bright)' : 'var(--border)'}`,
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
              }}>
              {/* Left accent */}
              <div style={{
                position: 'absolute', left: 0, top: 6, bottom: 6,
                width: 2, borderRadius: 1,
                background: isSelected ? sevColor : 'transparent',
                transition: 'background 0.15s',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>{evt.time}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: sevColor, letterSpacing: '0.06em' }}>{evt.severity}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4, fontWeight: 500 }}>
                    {evt.location}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
                    {evt.description.length > 85 ? evt.description.substring(0, 85) + '…' : evt.description}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.05em' }} className={si.cls}>
                    {si.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
