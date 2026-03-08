from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from data.dummy_data import SUPPLIERS, SUPPLY_CHAIN_LINKS, SIMULATION_SCENARIOS

router = APIRouter()


class SimulationRequest(BaseModel):
    supplier_id: str
    duration_months: Optional[int] = 3
    failure_probability: Optional[float] = 1.0


@router.get("/scenarios")
def list_scenarios():
    return {"scenarios": SIMULATION_SCENARIOS}


@router.post("/run")
def run_simulation(req: SimulationRequest):
    supplier = next((s for s in SUPPLIERS if s["id"] == req.supplier_id), None)
    if not supplier:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Find direct dependencies
    direct_deps = [
        l["target"] for l in SUPPLY_CHAIN_LINKS if l["source"] == req.supplier_id
    ] + [
        l["source"] for l in SUPPLY_CHAIN_LINKS if l["target"] == req.supplier_id
    ]

    affected_suppliers = []
    for dep_id in set(direct_deps):
        dep = next((s for s in SUPPLIERS if s["id"] == dep_id), None)
        if dep:
            affected_suppliers.append({
                "id": dep["id"],
                "name": dep["name"],
                "country": dep["country"],
                "industry": dep["industry"],
                "impact_level": "DIRECT",
                "production_loss_pct": round(supplier["riskScore"] * 0.6),
            })

    economic_impact = supplier["riskScore"] * 25  # millions
    factories_affected = round(supplier["riskScore"] * 4.5)

    cascade_timeline = []
    for week in range(1, req.duration_months * 4 + 1):
        factor = min(1.0, week / 4.0)
        recovery_factor = max(0, (week - 8) / 8) if week > 8 else 0
        cascade_timeline.append({
            "week": week,
            "affected_factories": round(factories_affected * factor * (1 - recovery_factor * 0.5)),
            "production_capacity_pct": max(5, round((100 - supplier["riskScore"] * 0.8) * (1 - factor * 0.7) + recovery_factor * 40)),
        })

    return {
        "supplier": supplier,
        "failure_probability": req.failure_probability,
        "economic_impact_millions": economic_impact,
        "affected_factories": factories_affected,
        "recovery_time_months": round(supplier["riskScore"] / 25),
        "affected_suppliers": affected_suppliers,
        "cascade_timeline": cascade_timeline,
    }


@router.get("/spof")
def get_single_points_of_failure():
    from data.dummy_data import SINGLE_POINTS_OF_FAILURE
    return {"spof": SINGLE_POINTS_OF_FAILURE, "count": len(SINGLE_POINTS_OF_FAILURE)}
