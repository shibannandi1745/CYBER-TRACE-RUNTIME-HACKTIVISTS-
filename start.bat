@echo off
echo ============================================================================
echo   CyberTrace AI: Spatial Cyber Threat Reconstruction & Autonomous Defense
echo ============================================================================
echo.

echo [*] Launching Python FastAPI Backend Server on port 8000...
start cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [*] Launching React Vite Frontend Dev Server on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo [✓] Servers started!
echo     - Frontend SOC UI: http://localhost:5173
echo     - Backend API Docs: http://localhost:8000/docs
echo     - WebSocket Feed:  ws://localhost:8000/ws
echo ============================================================================
pause
