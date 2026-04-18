import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = {
  getEvents:      () => axios.get(`${BASE}/events`).then(r => r.data),
  getWaypoints:   () => axios.get(`${BASE}/drone/waypoints`).then(r => r.data),
  getBriefing:    () => axios.get(`${BASE}/agent/briefing`).then(r => r.data),
  getAgentSteps:  () => axios.get(`${BASE}/agent/steps`).then(r => r.data),

  approveBriefing: (approvedBy = 'Maya') =>
    axios.post(`${BASE}/agent/briefing/approve`, { approvedBy }).then(r => r.data),

  updateBriefingItem: (eventId, data) =>
    axios.patch(`${BASE}/agent/briefing/item/${eventId}`, data).then(r => r.data),

  updateEventStatus: (id, status) =>
    axios.patch(`${BASE}/events/${id}/status`, { status }).then(r => r.data),
}

/**
 * Start SSE investigation stream.
 * Calls onStep(step) for each step, onDone() when DONE event received or stream closes.
 * Returns the EventSource so caller can close it if needed.
 */
export function startInvestigation(onStep, onDone) {
  const es = new EventSource(`${BASE}/agent/investigate`)
  let doneFired = false

  const fireDone = () => {
    if (!doneFired) {
      doneFired = true
      es.close()
      if (onDone) onDone()
    }
  }

  es.onmessage = (e) => {
    try {
      const step = JSON.parse(e.data)
      if (step.stepType === 'DONE') {
        fireDone()
      } else {
        onStep(step)
      }
    } catch { /* ignore parse errors */ }
  }

  // onerror fires on stream close too — use as fallback
  es.onerror = () => {
    fireDone()
  }

  return es
}
