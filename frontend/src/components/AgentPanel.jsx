import React, { useEffect, useRef } from 'react'

const TOOL_ICONS  = { get_fence_alerts:'⚡', get_badge_swipes:'🔐', get_vehicle_movements:'🚗', get_drone_patrol_log:'🚁', generate_briefing:'📋' }
const TOOL_COLORS = { get_fence_alerts:'#ffd600', get_badge_swipes:'#ff6d00', get_vehicle_movements:'#ff1744', get_drone_patrol_log:'#00a8ff', generate_briefing:'#00e676' }

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

export default function AgentPanel({ steps, status }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [steps])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: status === 'running' ? '#00e676' : status === 'done' ? 'var(--accent-blue)' : 'var(--text-dim)',
            boxShadow: status === 'running' ? '0 0 8px #00e676' : 'none',
            animation: status === 'running' ? 'pulse-dot 1s infinite' : 'none',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-blue)', letterSpacing: '0.12em' }}>ARIA INVESTIGATION</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>
          {status === 'running' ? 'LIVE' : status === 'done' ? `${steps.length} STEPS` : 'STANDBY'}
        </span>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {steps.length === 0 && (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 2 }}>ARIA STANDBY</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 6 }}>
              Press START INVESTIGATION<br />to begin overnight analysis
            </div>
          </div>
        )}

        {steps.map((step, i) => <StepBlock key={i} step={step} index={i} />)}

        {status === 'running' && (
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-blue)',
                animation: `pulse-dot 1s ${i*0.2}s infinite`
              }} />
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>ARIA IS THINKING...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function StepBlock({ step, index }) {
  const delay = `${Math.min(index * 20, 180)}ms`

  if (step.stepType === 'THINKING') return (
    <div className="animate-fade-in-up" style={{ animationDelay: delay, padding: '7px 12px', marginBottom: 3 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 11, flexShrink: 0 }}>▸</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>{step.message}</span>
      </div>
    </div>
  )

  if (step.stepType === 'TOOL_CALL') {
    const color = TOOL_COLORS[step.toolName] || '#7a8fa6'
    const icon  = TOOL_ICONS[step.toolName] || '🔧'
    return (
      <div className="animate-slide-in" style={{ animationDelay: delay, padding: '7px 12px', marginBottom: 3 }}>
        <div style={{ background: `rgba(${hexToRgb(color)},0.05)`, border: `1px solid rgba(${hexToRgb(color)},0.25)`, borderRadius: 6, padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span>{icon}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.05em', fontWeight: 700 }}>
              TOOL → {step.toolName?.replace(/_/g,' ')}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>
            {JSON.stringify(step.toolInput, null, 0).substring(0, 130)}
          </div>
        </div>
      </div>
    )
  }

  if (step.stepType === 'TOOL_RESULT') {
    const color = TOOL_COLORS[step.toolName] || '#7a8fa6'
    const raw   = JSON.stringify(step.toolResult)
    const preview = raw.length > 180 ? raw.substring(0, 180) + '…' : raw
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: delay, padding: '3px 12px', marginBottom: 5 }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderLeft: `2px solid ${color}`, borderRadius: '0 4px 4px 0', padding: '5px 10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>← RESULT: {preview}</span>
        </div>
      </div>
    )
  }

  if (step.stepType === 'CONCLUSION') return (
    <div className="animate-fade-in-up" style={{ animationDelay: delay, padding: '7px 12px', marginBottom: 3 }}>
      <div style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 6, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ color: '#00e676' }}>✓</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#00e676', letterSpacing: '0.06em' }}>INVESTIGATION COMPLETE</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.message}</span>
      </div>
    </div>
  )

  if (step.stepType === 'ERROR') return (
    <div className="animate-fade-in-up" style={{ padding: '7px 12px', marginBottom: 3 }}>
      <div style={{ background: 'rgba(255,23,68,0.05)', border: '1px solid rgba(255,23,68,0.3)', borderRadius: 6, padding: '8px 12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ff1744' }}>✗ ERROR: {step.message}</span>
      </div>
    </div>
  )

  return null
}
