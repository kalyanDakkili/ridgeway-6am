import React, { useState } from 'react'
import { api } from '../api/backendApi'

const CLS = {
  HARMLESS:   { icon: '✓', color: '#00e676', cls: 'badge-harmless',   label: 'HARMLESS' },
  MONITOR:    { icon: '◎', color: '#ffd600', cls: 'badge-monitor',    label: 'MONITOR'  },
  ESCALATE:   { icon: '▲', color: '#ff1744', cls: 'badge-escalate',   label: 'ESCALATE' },
  UNREVIEWED: { icon: '—', color: '#6a8099', cls: 'badge-unreviewed', label: 'PENDING'  },
}
const RISK_COLOR = { HIGH: '#ff1744', MEDIUM: '#ffd600', LOW: '#00e676' }

export default function BriefingCard({ briefing, onBriefingUpdate }) {
  const [editingId, setEditingId]     = useState(null)
  const [noteText, setNoteText]       = useState('')
  const [overrideCls, setOverrideCls] = useState('')
  const [approving, setApproving]     = useState(false)

  if (!briefing) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-blue)', letterSpacing: '0.12em' }}>MORNING BRIEFING</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>BRIEFING PENDING<br /><span style={{ fontSize: 9 }}>Run investigation first</span></div>
        </div>
      </div>
    </div>
  )

  const riskColor = RISK_COLOR[briefing.overallRisk] || '#ffd600'
  const riskRgb   = riskColor === '#ff1744' ? '255,23,68' : riskColor === '#ffd600' ? '255,214,0' : '0,230,118'

  const handleApprove = async () => {
    setApproving(true)
    try { onBriefingUpdate(await api.approveBriefing('Maya')) }
    catch(e) { console.error(e) }
    setApproving(false)
  }

  const handleSave = async (eventId) => {
    try {
      onBriefingUpdate(await api.updateBriefingItem(eventId, {
        classification: overrideCls || undefined,
        humanNote: noteText || undefined,
      }))
    } catch(e) { console.error(e) }
    setEditingId(null); setNoteText(''); setOverrideCls('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-blue)', letterSpacing: '0.12em' }}>MORNING BRIEFING</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginLeft: 8 }}>GENERATED {briefing.generatedAt}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: riskColor, letterSpacing: '0.08em' }}>
            ▲ {briefing.overallRisk}
          </span>
          {briefing.approved
            ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 6px', borderRadius: 3 }} className="badge-harmless">✓ APPROVED</span>
            : <button onClick={handleApprove} disabled={approving} style={{
                padding: '3px 10px', background: '#00e676', color: '#000',
                border: 'none', borderRadius: 3, fontFamily: 'var(--font-mono)',
                fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
              }}>{approving ? '...' : '✓ APPROVE'}</button>
          }
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {/* Exec summary */}
        <div style={{ background: `rgba(${riskRgb},0.05)`, border: `1px solid rgba(${riskRgb},0.2)`, borderRadius: 6, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.1em' }}>
            EXECUTIVE SUMMARY — FOR NISHA
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.7 }}>{briefing.executiveSummary}</p>
        </div>

        {/* Event classifications */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 6 }}>EVENT CLASSIFICATIONS</div>
        {(briefing.items || []).map(item => {
          const cfg       = CLS[item.classification] || CLS.UNREVIEWED
          const isEditing = editingId === item.eventId
          return (
            <div key={item.eventId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{item.eventId}</span>
                    {item.time && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{item.time}</span>}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 5px', borderRadius: 2, letterSpacing: '0.05em' }} className={cfg.cls}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {item.overriddenByHuman && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent-blue)' }}>✎ OVERRIDDEN</span>}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 3, fontWeight: 500 }}>{item.description}</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>{item.reasoning}</div>
                  {item.humanNote && (
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--accent-blue)', padding: '4px 8px', background: 'rgba(0,168,255,0.06)', borderRadius: 3, borderLeft: '2px solid var(--accent-blue)' }}>
                      Maya: {item.humanNote}
                    </div>
                  )}
                </div>
                <button onClick={() => { setEditingId(isEditing ? null : item.eventId); setNoteText(item.humanNote || ''); setOverrideCls(item.classification || '') }}
                  style={{ flexShrink: 0, padding: '3px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {isEditing ? '✕' : '✎'}
                </button>
              </div>

              {isEditing && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.08em' }}>OVERRIDE CLASSIFICATION</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {['HARMLESS','MONITOR','ESCALATE'].map(c => (
                      <button key={c} onClick={() => setOverrideCls(c)} style={{
                        padding: '3px 8px', borderRadius: 3, cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.05em',
                        border: overrideCls === c ? 'none' : '1px solid var(--border)',
                        background: overrideCls === c ? CLS[c].color : 'transparent',
                        color: overrideCls === c ? '#000' : 'var(--text-secondary)',
                      }}>{c}</button>
                    ))}
                  </div>
                  <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                    placeholder="Add your note for the record..."
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-bright)', borderRadius: 3, padding: '6px 8px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 11, resize: 'none', outline: 'none' }}
                  />
                  <button onClick={() => handleSave(item.eventId)} style={{ marginTop: 4, padding: '4px 12px', background: 'var(--accent-blue)', color: '#000', border: 'none', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer', fontWeight: 700 }}>
                    SAVE
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Drone findings */}
        {briefing.droneFindings?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent-blue)', letterSpacing: '0.1em', marginBottom: 6 }}>🚁 DRONE PATROL FINDINGS</div>
            {briefing.droneFindings.map((f, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '4px 8px', marginBottom: 3, borderLeft: '2px solid var(--accent-blue)', background: 'rgba(0,168,255,0.04)', borderRadius: '0 3px 3px 0' }}>{f}</div>
            ))}
          </div>
        )}

        {/* Follow-up actions */}
        {briefing.followUpActions?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 6 }}>FOLLOW-UP ACTIONS</div>
            {briefing.followUpActions.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                <span style={{ color: 'var(--accent-yellow)', fontSize: 10, flexShrink: 0, marginTop: 1 }}>→</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
