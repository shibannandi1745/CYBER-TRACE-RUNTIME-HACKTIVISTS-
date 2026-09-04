import asyncio
import json
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os
import sys
from pathlib import Path

# Ensure root and backend directories are in sys.path for serverless runtimes (e.g. Vercel)
_current_file = Path(__file__).resolve()
_app_dir = _current_file.parent
_backend_dir = _app_dir.parent
_root_dir = _backend_dir.parent

for _p in [str(_root_dir), str(_backend_dir), str(_app_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from .engine import CyberTraceEngine
    from .models.alert import AnalystAvailability
    from .models.audit import AuditActor
except (ImportError, ValueError):
    from backend.app.engine import CyberTraceEngine
    from backend.app.models.alert import AnalystAvailability
    from backend.app.models.audit import AuditActor

# Initialize engine instance
engine = CyberTraceEngine()

# Active WebSocket connections
connected_clients: List[WebSocket] = []


async def simulation_background_loop():
    """Continuously runs the simulation tick and broadcasts state over WebSocket."""
    while True:
        try:
            state = engine.tick()
            
            # Broadcast state to all connected WebSocket clients
            if connected_clients:
                payload = json.dumps(state)
                # Disconnect dead clients safely
                disconnected = []
                for client in connected_clients:
                    try:
                        await client.send_text(payload)
                    except Exception:
                        disconnected.append(client)
                for dead in disconnected:
                    if dead in connected_clients:
                        connected_clients.remove(dead)

            # Sleep adjusted by sim_speed
            interval = max(0.2, 0.8 / engine.sim_speed)
            await asyncio.sleep(interval)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            await asyncio.sleep(1.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background simulation task
    task = asyncio.create_task(simulation_background_loop())
    yield
    task.cancel()


app = FastAPI(
    title="CyberTrace AI - Spatial Cyber Threat Reconstruction & Autonomous Defense API",
    description="Backend Simulation & Explainable AI Threat Detection Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------ REST ENDPOINTS ------------------

@app.get("/api/health")
def get_health():
    return {
        "status": "HEALTHY",
        "engine": "CyberTrace AI",
        "defense_mode": "Autonomous / Human-in-the-Loop",
        "devices_count": len(engine.devices)
    }


@app.get("/api/state")
def get_current_state():
    return engine.get_full_state()


class ScenarioRequest(BaseModel):
    scenario_id: str


@app.post("/api/scenario")
def trigger_scenario(req: ScenarioRequest):
    valid_scenarios = ["coordinated_attack", "ransomware_wave", "ot_sabotage", "stealth_imperfect"]
    if req.scenario_id not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Choose from: {valid_scenarios}")
    engine.trigger_scenario(req.scenario_id)
    return {"status": "STARTED", "scenario_id": req.scenario_id}


class AvailabilityRequest(BaseModel):
    availability: AnalystAvailability


@app.post("/api/analyst/availability")
def set_analyst_availability(req: AvailabilityRequest):
    engine.set_analyst_availability(req.availability)
    return {"status": "UPDATED", "availability": req.availability}


@app.post("/api/siren/silence")
def silence_siren():
    res = engine.silence_siren()
    return {"status": "SILENCED", "alert": res.model_dump() if res else None}


@app.post("/api/analyst/acknowledge")
def acknowledge_alert(analyst_name: str = "SOC_Analyst"):
    res = engine.analyst_acknowledge(analyst_name)
    return {"status": "ACKNOWLEDGED", "alert": res.model_dump() if res else None}


@app.post("/api/analyst/approve")
def approve_containment(analyst_name: str = "SOC_Analyst"):
    res = engine.analyst_approve_containment(analyst_name)
    return {"status": "CONTAINMENT_APPROVED", "result": res}


class RejectAlertRequest(BaseModel):
    reason: str = "False Positive"
    analyst_name: str = "SOC_Analyst"


@app.post("/api/analyst/reject")
def reject_alert(req: RejectAlertRequest):
    engine.analyst_reject_alert(req.reason, req.analyst_name)
    return {"status": "REJECTED", "reason": req.reason}


class DeviceActionRequest(BaseModel):
    device_id: str


@app.post("/api/device/isolate")
def isolate_device(req: DeviceActionRequest):
    res = engine.isolate_device(req.device_id, actor=AuditActor.ANALYST)
    return res


@app.post("/api/device/un-isolate")
def un_isolate_device(req: DeviceActionRequest):
    res = engine.rollback_containment(req.device_id, actor=AuditActor.ANALYST)
    return res


class RestoreFileRequest(BaseModel):
    filename: str
    target_version: Optional[int] = None


@app.post("/api/file/restore")
def restore_file(req: RestoreFileRequest):
    res = engine.restore_file(req.filename, req.target_version)
    return res


class SimulationControlRequest(BaseModel):
    pause: Optional[bool] = None
    speed: Optional[float] = None


@app.post("/api/simulation/control")
def control_simulation(req: SimulationControlRequest):
    if req.pause is not None:
        engine.is_paused = req.pause
    if req.speed is not None:
        engine.sim_speed = max(0.2, min(5.0, req.speed))
    return {
        "is_paused": engine.is_paused,
        "sim_speed": engine.sim_speed
    }


class ImperfectionConfigRequest(BaseModel):
    duplicate_rate: float
    delay_rate: float
    drop_rate: float


@app.post("/api/simulation/imperfections")
def configure_imperfections(req: ImperfectionConfigRequest):
    engine.imperfection_engine.configure(
        duplicate_rate=req.duplicate_rate,
        delay_rate=req.delay_rate,
        drop_rate=req.drop_rate
    )
    return {"status": "UPDATED", "config": req.model_dump()}


@app.post("/api/simulation/reset")
def reset_simulation():
    engine.reset_simulation()
    return {"status": "RESET_SUCCESSFUL"}


# ------------------ DATABASE PERSISTENCE ENDPOINTS ------------------

try:
    from .db.database import (
        get_database_stats,
        get_historical_events,
        get_historical_incidents,
        get_historical_audit_logs,
    )
except (ImportError, ValueError):
    from backend.app.db.database import (
        get_database_stats,
        get_historical_events,
        get_historical_incidents,
        get_historical_audit_logs,
    )


@app.get("/api/db/stats")
def get_db_statistics():
    return get_database_stats()


@app.get("/api/db/events")
def query_db_events(
    limit: int = 100,
    severity: Optional[str] = None,
    floor: Optional[int] = None,
    search: Optional[str] = None
):
    return get_historical_events(limit=limit, severity=severity, floor=floor, search=search)


@app.get("/api/db/incidents")
def query_db_incidents(limit: int = 50):
    return get_historical_incidents(limit=limit)


@app.get("/api/db/audit")
def query_db_audit_logs(actor: Optional[str] = None, limit: int = 100):
    return get_historical_audit_logs(actor=actor, limit=limit)



# ------------------ WEBSOCKET ENDPOINT ------------------

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    # Send initial state immediately upon connect
    try:
        initial_state = engine.get_full_state()
        await websocket.send_text(json.dumps(initial_state))
        while True:
            # Handle incoming commands from UI over WS if sent
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
    except Exception:
        if websocket in connected_clients:
            connected_clients.remove(websocket)


# Alias for Vercel Serverless Function entry point
handler = app
