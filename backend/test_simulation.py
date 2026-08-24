import sys
import os
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.engine import CyberTraceEngine
from backend.app.models.alert import AnalystAvailability
from backend.app.models.audit import AuditActor


def test_cybertrace_simulation():
    print("[*] Initializing CyberTrace Engine...")
    engine = CyberTraceEngine()

    # 1. Verify building & devices
    assert len(engine.devices) >= 20, f"Expected >=20 devices, got {len(engine.devices)}"
    assert len(engine.floors) == 4, f"Expected 4 floors, got {len(engine.floors)}"
    print(f"[OK] Smart Building initialized: {len(engine.floors)} floors, {len(engine.devices)} devices.")

    # 2. Verify graph topology
    graph_view = engine.graph_engine.export_graph_view()
    assert len(graph_view["nodes"]) == len(engine.devices)
    assert len(graph_view["edges"]) > 20
    print(f"[OK] Network Graph topology constructed: {len(graph_view['nodes'])} nodes, {len(graph_view['edges'])} edges.")

    # 3. Test baseline tick
    state = engine.tick()
    assert state["threat_score"]["overall_score"] == 0
    print("[OK] Baseline telemetry generation working without anomalies.")

    # Trigger Coordinated Attack Scenario
    print("[*] Triggering Coordinated Attack Scenario...")
    engine.trigger_scenario("coordinated_attack")
    engine.set_analyst_availability(AnalystAvailability.AWAY)
    # Fast forward scenario clock to trigger all steps
    engine.telemetry_gen.scenario_start_time = time.time() - 35.0

    # Fast forward ticks to advance attack scenario
    for tick_num in range(10):
        state = engine.tick()

    score = state["threat_score"]["overall_score"]
    print(f"[OK] Attack telemetry processed. Threat Score escalated to: {score}/100 ({state['threat_score']['severity']})")
    assert score >= 60, f"Expected elevated threat score >= 60, got {score}"

    # Verify factors
    factors = [f["name"] for f in state["threat_score"]["factors"]]
    print(f"[OK] Explainable Threat Factors: {factors}")

    # Verify attack path reconstruction
    assert state["attack_path"] is not None
    print(f"[OK] Reconstructed Attack Path: {' -> '.join(state['attack_path']['nodes'])} (Confidence: {state['attack_path']['confidence_score']}%)")

    # Verify File Integrity detection
    fi_stats = state["file_integrity"]["stats"]
    print(f"[OK] File Integrity Monitoring Stats: {fi_stats}")
    assert fi_stats["corrupted"] > 0 or fi_stats["deleted"] > 0 or fi_stats["modified"] > 0

    # 5. Test File Restoration from Last Known-Good Snapshot
    print("[*] Testing Snapshot Rollback for financial_report.xlsx...")
    restore_res = engine.restore_file("financial_report.xlsx")
    assert restore_res["success"] is True
    print(f"[OK] File successfully restored: {restore_res['message']}")

    # 6. Test Unprotected File Recovery Rule
    unp_res = engine.restore_file("unprotected_scratch.tmp")
    assert unp_res["success"] is False
    print(f"[OK] Accurate Recovery Policy verified: '{unp_res['message']}'")

    # 7. Test Manual Containment & Reversibility
    print("[*] Testing Manual Containment and Reversibility on Laptop-102...")
    engine.isolate_device("Laptop-102")
    assert engine.devices["Laptop-102"].is_isolated is True
    rollback_res = engine.rollback_containment("Laptop-102")
    assert engine.devices["Laptop-102"].is_isolated is False
    print(f"[OK] Reversible containment verified: {rollback_res['message']}")

    print("\n========================================================")
    print("ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)")
    print("========================================================\n")


if __name__ == "__main__":
    test_cybertrace_simulation()
