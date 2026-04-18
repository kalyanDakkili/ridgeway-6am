import React, { useState, useEffect } from 'react'
import SiteMap        from '../components/SiteMap'
import EventTimeline  from '../components/EventTimeline'
import AgentPanel     from '../components/AgentPanel'
import BriefingCard   from '../components/BriefingCard'
import DroneSimulator from '../components/DroneSimulator'
import EventDetail    from '../components/EventDetail'
import { api, startInvestigation } from '../api/backendApi'

export default function OpsRoom({ onBriefingChange, onStatusChange, triggerRef }) {
  const [events,              setEvents]              = useState([])
  const [waypoints,           setWaypoints]           = useState([])
  const [selectedEvent,       setSelectedEvent]       = useState(null)
  const [agentSteps,          setAgentSteps]          = useState([])
  const [investigationStatus, setInvestigationStatus] = useState('idle')
  const [briefing,            setBriefing]            = useState(null)
  const [showDronePath,       setShowDronePath]       = useState(false)
  const [activeTab,           setActiveTab]           = useState('timeline')

  // Load seed data
  useEffect(() => {
    api.getEvents().then(setEvents).catch(console.error)
    api.getWaypoints().then(setWaypoints).catch(console.error)
  }, [])

  // Expose trigger to TopBar via ref
  useEffect(() => {
    if (triggerRef) triggerRef.current = handleStartInvestigation
  })

  // Sync up to App
  useEffect(() => { if (onStatusChange)  onStatusChange(investigationStatus) },  [investigationStatus])
  useEffect(() => { if (onBriefingChange) onBriefingChange(briefing) },          [briefing])

  const handleStartInvestigation = () => {
    if (investigationStatus === 'running') return
    setAgentSteps([])
    setBriefing(null)
    setInvestigationStatus('running')
    setActiveTab('agent')

    startInvestigation(
      (step) => setAgentSteps(prev => [...prev, step]),
      async () => {
        setInvestigationStatus('done')
        setTimeout(async () => {
          try {
            const b = await api.getBriefing()
            setBriefing(b)
            // Reflect AI classifications on event pins
            if (b?.items) {
              b.items.forEach(item => {
                setEvents(prev => prev.map(e =>
                  e.id === item.eventId ? { ...e, status: item.classification } : e
                ))
              })
            }
            setActiveTab('briefing')
          } catch(e) { console.error(e) }
        }, 600)
      }
    )
  }

  const handleBriefingUpdate = (updated) => {
    setBriefing(updated)
    if (updated?.items) {
      updated.items.forEach(item => {
        setEvents(prev => prev.map(e =>
          e.id === item.eventId ? { ...e, status: item.classification } : e
        ))
      })
    }
  }

  const tabs = [
    { id: 'timeline', label: 'EVENTS',   count: events.length },
    { id: 'agent',    label: 'ARIA',      count: agentSteps.length || null, live: investigationStatus === 'running' },
    { id: 'briefing', label: 'BRIEFING',  count: null, ready: !!briefing },
  ]

  const escalated = events.filter(e => e.status === 'ESCALATE').length

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
      }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '9px 4px',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-blue)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              transition: 'all 0.15s',
            }}>
              {tab.label}
              {tab.live && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676', animation: 'pulse-dot 1s infinite' }} />
              )}
              {tab.count !== null && (
                <span style={{ background: 'var(--border)', borderRadius: 10, padding: '0 5px', fontSize: 8 }}>
                  {tab.count}
                </span>
              )}
              {tab.ready && tab.count === null && (
                <span style={{ color: '#00e676', fontSize: 8 }}>●</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'timeline' && (
            <EventTimeline events={events} selectedEvent={selectedEvent} onSelectEvent={setSelectedEvent} />
          )}
          {activeTab === 'agent' && (
            <AgentPanel steps={agentSteps} status={investigationStatus} />
          )}
          {activeTab === 'briefing' && (
            <BriefingCard briefing={briefing} onBriefingUpdate={handleBriefingUpdate} />
          )}
        </div>
      </div>

      {/* ── CENTRE MAP ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <SiteMap
          events={events}
          waypoints={waypoints}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          showDronePath={showDronePath}
        />

        {selectedEvent && (
          <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}

        {/* Map label */}
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 1000,
          background: 'rgba(8,9,13,0.85)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '4px 10px',
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em',
        }}>
          RIDGEWAY SITE — NIGHT 00:00–06:00
        </div>

        {/* Escalation badge */}
        {escalated > 0 && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
            background: 'rgba(255,23,68,0.12)', border: '1px solid rgba(255,23,68,0.4)',
            borderRadius: 4, padding: '4px 12px',
            fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ff1744', letterSpacing: '0.1em',
            animation: 'pulse-dot 2s infinite',
          }}>
            ▲ {escalated} EVENT{escalated > 1 ? 'S' : ''} REQUIRE ESCALATION
          </div>
        )}

        {/* Idle overlay */}
        {investigationStatus === 'idle' && events.length > 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 999,
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(8,9,13,0.75)', border: '1px solid var(--border-bright)',
              borderRadius: 8, padding: '20px 28px', backdropFilter: 'blur(6px)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                {events.length} OVERNIGHT SIGNALS
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 6 }}>
                Press START INVESTIGATION to begin
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 276, flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-blue)', letterSpacing: '0.12em' }}>
            DRONE OPERATIONS
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <DroneSimulator
            waypoints={waypoints}
            showDronePath={showDronePath}
            onToggleDronePath={() => setShowDronePath(p => !p)}
          />

          {/* Night stats */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.12em', marginBottom: 8 }}>NIGHT SUMMARY</div>
            {[
              { label: 'Total Signals',  val: events.length,                                   color: 'var(--text-primary)' },
              { label: 'High Severity',  val: events.filter(e => e.severity === 'HIGH').length, color: '#ff1744' },
              { label: 'Escalated',      val: events.filter(e => e.status === 'ESCALATE').length, color: '#ff1744' },
              { label: 'Harmless',       val: events.filter(e => e.status === 'HARMLESS').length, color: '#00e676' },
              { label: 'Pending Review', val: events.filter(e => e.status === 'UNREVIEWED').length, color: '#ffd600' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>{row.label.toUpperCase()}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: row.color, fontWeight: 700 }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={handleStartInvestigation}
              disabled={investigationStatus === 'running'}
              style={{
                width: '100%', padding: '11px',
                background: investigationStatus === 'running' ? 'transparent' : 'rgba(0,168,255,0.1)',
                border: `1px solid ${investigationStatus === 'running' ? 'rgba(0,168,255,0.3)' : 'var(--accent-blue)'}`,
                borderRadius: 4, color: 'var(--accent-blue)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                cursor: investigationStatus === 'running' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>
              {investigationStatus === 'running' ? '⟳ ARIA INVESTIGATING...' :
               investigationStatus === 'done'    ? '↺ RE-INVESTIGATE' :
                                                   '▶ START ARIA INVESTIGATION'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
