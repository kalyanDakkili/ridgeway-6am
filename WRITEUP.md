# Ridgeway 6:10 AM — Submission Write-Up

**Skylark Drones | Founding Full Stack Engineer Assignment**

---

## Approach

The brief asked for something specific: not a dashboard, not a chatbot, but a system that helps an operator get to the truth faster. I took that literally.

The core design decision was to make the AI do the investigation upfront — Maya presses one button and ARIA (the AI agent) immediately starts pulling context from every data source, cross-referencing events, and surfacing a draft understanding. By the time Maya reads the first line of the briefing, the AI has already done the equivalent of 20 minutes of manual log-checking.

The interface is built around three panels: a live event timeline on the left, a dark Leaflet site map in the centre, and drone operations on the right. Everything feeds into a morning briefing that Maya can inspect, challenge, and approve before Nisha walks in at 8 AM.

---

## Agent Design

ARIA runs as a synchronous agentic loop in Spring Boot using the Anthropic API.

**The loop:**
1. Send full message history + tool definitions to Claude
2. Claude returns either text (reasoning) or a tool_use block
3. If tool use: execute the tool, append the result, loop back to step 1
4. If end_turn with no pending tools: emit DONE event and close the stream

The loop runs up to 12 iterations. In practice Claude completes the investigation in 5-6 turns: one per data-gathering tool, then a final generate_briefing call.

Each agent step (thinking text, tool call, tool result, conclusion) is emitted as an SSE event and rendered live in the ARIA panel. The operator watches ARIA reason in real time — you can see exactly what it looked at and why it reached each conclusion.

---

## Tool-Calling Design (MCP-Style)

Five tools registered in ToolRegistry.java with full input_schema in MCP format:

| Tool | Purpose | Key context returned |
|---|---|---|
| get_fence_alerts | Perimeter sensor events | Wind speed, camera status, false-positive history |
| get_badge_swipes | Access control failures | Employee name, clearance, open IT tickets, supervisor note |
| get_vehicle_movements | Vehicle entry/exit logs | Authorization status, CCTV availability, guard actions |
| get_drone_patrol_log | Patrol PAT-2024-047 | Waypoints, critical findings, clear findings |
| generate_briefing | Structured morning report | Full classifications, risk level, follow-up actions |

The generate_briefing tool acts as a structured output forcing function: Claude must commit to HARMLESS / MONITOR / ESCALATE with reasoning for every event before the briefing is built.

---

## Human Review Design

The briefing is a draft, not a verdict. Maya has three controls per event:
- **Override classification** — change HARMLESS / MONITOR / ESCALATE with one click
- **Add a note** — attach her own context
- **Approve** — sign off the briefing for the 8 AM handoff to Nisha

Overridden items are visually flagged so Nisha can see where the human disagreed with the AI.

---

## Key Tradeoffs

**Streaming steps vs token streaming:** Agent steps stream as discrete blocks (tool call → result → reasoning) rather than character-by-character. This makes the ARIA panel readable and meaningful.

**Seeded data:** All events and waypoints are seeded in SeedDataLoader.java — deterministic, fast to set up, matches the assignment's explicit guidance.

**Single-page layout:** Everything in one view — timeline, map, agent feed, briefing, drone ops. Maya is under time pressure and cannot afford to navigate between screens.

**OpenRouter:** Configured for OpenRouter with anthropic/claude-3.5-haiku for cost efficiency. Switch to direct Anthropic by changing two environment variables.

---

## How AI Tools Were Used

This project was built end-to-end using Claude (claude.ai) as the primary development tool:
- Architecture and code generation — agentic loop, SSE streaming, MCP-style tool registry, all React components
- Debugging — Java generics type mismatch, CSS @import ordering, SSE done event handling
- Design decisions — ops-room dark theme, three-panel layout, briefing override UX
- Deployment — Dockerfile, Render and Vercel configuration

Roughly 90% of the code was generated or substantially shaped by Claude through iterative prompting in a single conversation session.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Java 17, WebFlux (SSE) |
| AI | Anthropic Claude via OpenRouter |
| Frontend | React 18, Vite, Leaflet, Tailwind CSS |
| Data | Seeded in-memory (SeedDataLoader.java) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Live URLs

- **App:** https://ridgeway-6am.vercel.app
- **API:** https://ridgeway-6am.onrender.com/api/health
