#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Kiran Printing Press — Production Deployment Script
# Usage: ./deploy.sh [prod|dev]
# ─────────────────────────────────────────────────────────────
set -e

MODE=${1:-prod}
echo "🖨️  Deploying Kiran Printing Press [mode: $MODE]"

if [ "$MODE" = "prod" ]; then
  echo "📦 Building & starting production containers..."
  docker-compose down --remove-orphans
  docker-compose build --no-cache
  docker-compose up -d
  
  echo "⏳ Waiting for services to start..."
  sleep 15
  
  echo "🌱 Running database seeder (first deploy only)..."
  docker-compose exec -T backend node utils/seeder.js || true
  
  echo "✅ Health check..."
  curl -f http://localhost/health && echo " API is up!" || echo "⚠️  API health check failed"
  
  echo ""
  echo "🎉 Deployment complete!"
  echo "   Frontend: http://localhost"
  echo "   API:      http://localhost/api/v1"
  echo "   Admin:    http://localhost/admin"
  
elif [ "$MODE" = "dev" ]; then
  echo "🔧 Starting development servers..."
  
  # Start MongoDB if not running
  docker-compose up -d mongodb
  
  # Start backend in background
  cd backend && npm run dev &
  BACKEND_PID=$!
  
  # Start frontend in background  
  cd ../frontend && npm run dev &
  FRONTEND_PID=$!
  
  echo "✅ Dev servers started!"
  echo "   Frontend: http://localhost:3000"
  echo "   Backend:  http://localhost:5000"
  echo ""
  echo "Press CTRL+C to stop all services"
  
  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
  wait
fi
