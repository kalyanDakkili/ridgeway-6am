#!/bin/bash
set -e

# ── Ridgeway 6:10 AM — Quick Start (OpenRouter) ────────────────────────────
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="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"
export ANTHROPIC_API_KEY=""
export ANTHROPIC_MODEL="anthropic/claude-3.5-haiku"

echo "🚀 Starting Ridgeway 6:10 AM Intelligence Platform"
echo "   Provider : OpenRouter"
echo "   Model    : $ANTHROPIC_MODEL"
echo ""

# Start backend
echo "▶ Starting backend (Spring Boot :8080)..."
cd backend
mvn spring-boot:run -q &
BACKEND_PID=$!
cd ..

# Wait for backend health
echo "   Waiting for backend..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
done
echo "   ✓ Backend ready"

# Install frontend deps if needed, then start
echo "▶ Starting frontend (Vite :5173)..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "   Installing npm dependencies..."
  npm install --silent
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅  Open http://localhost:5173 and press ▶ START INVESTIGATION"
echo "    Press Ctrl+C to stop."
echo ""

trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM
wait
