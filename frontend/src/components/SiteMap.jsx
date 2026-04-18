import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TYPE_CFG = {
  FENCE_ALERT:       { color: '#ffd600', icon: '⚡' },
  BADGE_SWIPE_FAIL:  { color: '#ff6d00', icon: '🔐' },
  VEHICLE_PATH:      { color: '#ff1744', icon: '🚗' },
  DRONE_PATROL:      { color: '#00a8ff', icon: '🚁' },
  DRONE_OBSERVATION: { color: '#e040fb', icon: '👁' },
  VEHICLE_EXIT:      { color: '#78909c', icon: '🚗' },
}
const STATUS_COLOR = {
  HARMLESS: '#00e676',
  MONITOR:  '#ffd600',
  ESCALATE: '#ff1744',
  UNREVIEWED: '#3d5166',
}

const SITE_CENTER = [51.505, -0.089]
const SITE_BOUNDS = [[51.501, -0.095], [51.509, -0.083]]

const ZONES = [
  { pos: [51.505, -0.0905], label: 'GATE 3' },
  { pos: [51.506, -0.0875], label: 'STORAGE YARD B' },
  { pos: [51.5045, -0.091],  label: 'BLOCK C' },
  { pos: [51.504,  -0.0915], label: 'ACCESS PT 7' },
  { pos: [51.507,  -0.087],  label: 'MAIN GATE' },
]

function makeMarkerHtml(cfg, statusColor, isSelected) {
  return `
    <div style="
      width:${isSelected ? 34 : 28}px;
      height:${isSelected ? 34 : 28}px;
      border-radius:50%;
      background:rgba(8,9,13,0.9);
      border:2px solid ${statusColor};
      box-shadow:0 0 ${isSelected ? 14 : 6}px ${statusColor}60;
      display:flex; align-items:center; justify-content:center;
      font-size:${isSelected ? 16 : 13}px;
      cursor:pointer;
      transition:all 0.2s;
    ">${cfg.icon}</div>`
}

export default function SiteMap({ events, waypoints, selectedEvent, onSelectEvent, showDronePath }) {
  const mapRef      = useRef(null)
  const instanceRef = useRef(null)
  const markersRef  = useRef({})
  const pathRef     = useRef(null)
  const droneRef    = useRef(null)

  // Init map once
  useEffect(() => {
    if (instanceRef.current) return
    const map = L.map(mapRef.current, {
      center: SITE_CENTER,
      zoom: 16,
      zoomControl: true,
      attributionControl: false,
      maxBounds: [[51.495, -0.105], [51.515, -0.073]],
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    // Site boundary
    L.rectangle(SITE_BOUNDS, {
      color: 'rgba(0,168,255,0.4)', weight: 1.5,
      fillColor: '#00a8ff', fillOpacity: 0.02,
      dashArray: '5 5',
    }).addTo(map)

    // Zone labels
    ZONES.forEach(z => {
      L.marker(z.pos, {
        icon: L.divIcon({
          className: '',
          html: `<span style="font-family:Space Mono,monospace;font-size:9px;color:rgba(0,168,255,0.45);letter-spacing:0.1em;white-space:nowrap;pointer-events:none;">${z.label}</span>`,
          iconAnchor: [0, 0],
        }),
        interactive: false,
      }).addTo(map)
    })

    instanceRef.current = map
  }, [])

  // Update event markers when events/selection changes
  useEffect(() => {
    const map = instanceRef.current
    if (!map || !events.length) return

    events.forEach(evt => {
      const cfg = TYPE_CFG[evt.type] || { color: '#7a8fa6', icon: '●' }
      const statusColor = STATUS_COLOR[evt.status] || STATUS_COLOR.UNREVIEWED
      const isSelected  = selectedEvent?.id === evt.id
      const html = makeMarkerHtml(cfg, statusColor, isSelected)

      if (markersRef.current[evt.id]) {
        markersRef.current[evt.id].setIcon(L.divIcon({
          className: '', html,
          iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
        }))
      } else {
        const marker = L.marker([evt.lat, evt.lng], {
          icon: L.divIcon({
            className: '', html,
            iconAnchor: [14, 14],
          }),
          zIndexOffset: isSelected ? 1000 : 0,
        })
        marker.on('click', () => onSelectEvent(evt))
        marker.bindTooltip(
          `<div style="font-family:Space Mono,monospace;font-size:11px;color:#ddeeff;padding:1px 0;line-height:1.6">
            <span style="color:#00a8ff">${evt.time}</span>&nbsp;&nbsp;<strong style="color:#ddeeff">${evt.location}</strong>
           </div>`,
          { direction: 'top', offset: [0, -16], className: 'leaflet-tooltip' }
        )
        marker.addTo(map)
        markersRef.current[evt.id] = marker
      }
    })
  }, [events, selectedEvent])

  // Drone path
  useEffect(() => {
    const map = instanceRef.current
    if (!map) return

    if (pathRef.current)  { map.removeLayer(pathRef.current);  pathRef.current = null }
    if (droneRef.current) { map.removeLayer(droneRef.current); droneRef.current = null }

    if (showDronePath && waypoints.length) {
      const latlngs = waypoints.map(w => [w.lat, w.lng])
      pathRef.current = L.polyline(latlngs, {
        color: '#00a8ff', weight: 2, opacity: 0.6, dashArray: '6 4',
      }).addTo(map)

      waypoints.forEach(w => {
        const isAlert = w.observation.startsWith('⚠')
        const dot = L.circleMarker([w.lat, w.lng], {
          radius: 5, color: isAlert ? '#ff1744' : '#00a8ff',
          fillColor: isAlert ? '#ff1744' : '#00a8ff',
          fillOpacity: 0.8, weight: 1.5,
        })
        dot.bindTooltip(
          `<div style="font-family:Space Mono,monospace;font-size:11px;color:#ddeeff;line-height:1.6">
            🚁&nbsp;<span style="color:#00a8ff">${w.time}</span>&nbsp;—&nbsp;<strong style="color:#ddeeff">${w.label}</strong>
           </div>`,
          { direction: 'top', className: 'leaflet-tooltip' }
        )
        dot.addTo(map)
      })

      droneRef.current = L.marker(latlngs[latlngs.length - 1], {
        icon: L.divIcon({
          className: '',
          html: '<div style="font-size:18px;filter:drop-shadow(0 0 6px #00a8ff)">🚁</div>',
          iconAnchor: [10, 10],
        }),
      }).addTo(map)
    }
  }, [showDronePath, waypoints])

  // Pan to selected event
  useEffect(() => {
    if (selectedEvent && instanceRef.current) {
      instanceRef.current.panTo([selectedEvent.lat, selectedEvent.lng], { animate: true, duration: 0.4 })
    }
  }, [selectedEvent])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}