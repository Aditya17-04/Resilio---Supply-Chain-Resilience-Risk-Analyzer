from fastapi import APIRouter, Query
from typing import Optional
from data.dummy_data import SUPPLIERS, SUPPLY_CHAIN_LINKS

router = APIRouter()


@router.get("/")
def list_suppliers(
    industry: Optional[str] = None,
    min_risk: Optional[int] = None,
    max_risk: Optional[int] = None,
    tier: Optional[int] = None,
):
    result = SUPPLIERS
    if industry:
        result = [s for s in result if s["industry"].lower() == industry.lower()]
    if min_risk is not None:
        result = [s for s in result if s["riskScore"] >= min_risk]
    if max_risk is not None:
        result = [s for s in result if s["riskScore"] <= max_risk]
    if tier is not None:
        result = [s for s in result if s["tier"] == tier]
    return {"suppliers": result, "total": len(result)}


@router.get("/{supplier_id}")
def get_supplier(supplier_id: str):
    supplier = next((s for s in SUPPLIERS if s["id"] == supplier_id), None)
    if not supplier:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Supplier not found")
    links = [l for l in SUPPLY_CHAIN_LINKS if l["source"] == supplier_id or l["target"] == supplier_id]
    return {"supplier": supplier, "links": links}


@router.get("/{supplier_id}/dependencies")
def get_dependencies(supplier_id: str, depth: int = 2):
    visited = set()
    result = []

    def traverse(sid, current_depth):
        if current_depth > depth or sid in visited:
            return
        visited.add(sid)
        supplier = next((s for s in SUPPLIERS if s["id"] == sid), None)
        if supplier:
            result.append({**supplier, "depth": current_depth})
        downstream = [l["target"] for l in SUPPLY_CHAIN_LINKS if l["source"] == sid]
        for next_sid in downstream:
            traverse(next_sid, current_depth + 1)

    traverse(supplier_id, 0)
    return {"supplier_id": supplier_id, "dependencies": result, "depth": depth}


@router.get("/stats/summary")
def supplier_stats():
    total = len(SUPPLIERS)
    high_risk = sum(1 for s in SUPPLIERS if s["riskScore"] >= 70)
    medium_risk = sum(1 for s in SUPPLIERS if 40 <= s["riskScore"] < 70)
    low_risk = sum(1 for s in SUPPLIERS if s["riskScore"] < 40)
    avg_risk = sum(s["riskScore"] for s in SUPPLIERS) / total if total > 0 else 0
    return {
        "total": total,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "avg_risk": round(avg_risk, 1),
        "by_industry": {
            ind: len([s for s in SUPPLIERS if s["industry"] == ind])
            for ind in set(s["industry"] for s in SUPPLIERS)
        }
    }
