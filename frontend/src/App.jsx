import React, { useState, useRef } from 'react'
import TopBar from './components/TopBar'
import OpsRoom from './pages/OpsRoom'

export default function App() {
  const [investigationStatus, setInvestigationStatus] = useState('idle')
  const [briefing, setBriefing] = useState(null)
  const triggerRef = useRef(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar
        investigationStatus={investigationStatus}
        onStartInvestigation={() => triggerRef.current?.()}
        briefing={briefing}
      />
      <OpsRoom
        onBriefingChange={setBriefing}
        onStatusChange={setInvestigationStatus}
        triggerRef={triggerRef}
      />
    </div>
  )
}
