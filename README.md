# Ridgeway — 6:10 AM Intelligence Platform

An AI-first overnight security intelligence platform for Ridgeway Site. Built for the Skylark Drones Founding Full Stack Engineer assignment.

## What It Does

Maya arrives at 6:10 AM to a screen full of overnight signals. ARIA (the AI agent) automatically investigates them all — cross-referencing fence alerts, badge failures, vehicle movements, and drone patrol data — then produces a structured morning briefing ready for Nisha's 8 AM review.

**Key features:**
- 🤖 **Real AI agent loop** — ARIA uses Claude claude-sonnet-4-20250514 with 5 MCP-style tools in a full agentic loop (tool calls → results → reasoning → briefing)
- 🗺️ **Live site map** — dark Leaflet map with event markers, severity colours, and animated drone patrol path
- 🚁 **Drone patrol replay** — step-by-step waypoint simulation of PAT-2024-047
- 📋 **Human review layer** — Maya can override any AI classification and add notes before approving
- ⏱️ **Live countdown** to Nisha's 8:00 AM arrival
- 📡 **SSE streaming** — agent reasoning streams live to the UI as it runs

---

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- An Anthropic API key

### 1. Set your API key
```bash
export ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

### 2. Start the backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on **http://localhost:8080**

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

### 4. Open the app
Navigate to **http://localhost:5173** and press **▶ START INVESTIGATION**.

---

## Architecture

```
ridgeway-6am/
├── backend/                    # Spring Boot 3 + WebFlux
│   └── src/main/java/com/ridgeway/
│       ├── agent/
│       │   ├── AgentService.java      # Agentic loop (tool call → result → loop)
│       │   └── AnthropicClient.java   # Claude API HTTP client
│       ├── tools/
│       │   └── ToolRegistry.java      # 5 MCP-style tools
│       ├── api/
│       │   ├── AgentController.java   # SSE /api/agent/investigate
│       │   └── EventController.java   # REST /api/events, /api/drone/waypoints
│       ├── data/
│       │   └── SeedDataLoader.java    # 8 seeded overnight events + drone waypoints
│       └── model/                     # Event, AgentStep, BriefingReport
│
└── frontend/                   # React + Vite + Leaflet
    └── src/
        ├── components/
        │   ├── TopBar.jsx             # Clock + countdown + start button
        │   ├── SiteMap.jsx            # Leaflet dark map
        │   ├── EventTimeline.jsx      # Chronological signal list
        │   ├── AgentPanel.jsx         # Live ARIA investigation feed
        │   ├── BriefingCard.jsx       # Morning briefing with override controls
        │   ├── DroneSimulator.jsx     # Patrol waypoint replay
        │   └── EventDetail.jsx        # Map click popup
        ├── pages/
        │   └── OpsRoom.jsx            # Main layout
        └── api/
            └── backendApi.js          # API + SSE client
```

## The 5 Tools (MCP-style)

| Tool | What it returns |
|---|---|
| `get_fence_alerts` | Alert events + wind speed, camera status, false-positive history |
| `get_badge_swipes` | Failed swipes + employee context, badge fault tickets, supervisor note |
| `get_vehicle_movements` | Entry/exit logs + policy context, guard notes, CCTV status |
| `get_drone_patrol_log` | Patrol PAT-2024-047 with waypoints + critical and clear findings |
| `generate_briefing` | Accepts full structured briefing from ARIA, stores for Maya |

## The Overnight Story

8 seeded events spanning 01:14 AM – 04:50 AM:
- **EVT-001** Fence alert near Gate 3 (wind? camera offline)
- **EVT-002** Unknown vehicle enters restricted Storage Yard B
- **EVT-003/004/005** Badge failures at Block C (EMP-441 badge fault, EMP-209 one-off)
- **EVT-006** Drone PAT-2024-047 launches
- **EVT-007** 🚨 Drone finds Block C east door OPEN (DOOR-C-E2)
- **EVT-008** Unknown vehicle exits main gate 3h19m later

ARIA connects these dots — the badge failures at Block C + the open door found by the drone are almost certainly related.
