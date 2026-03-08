from fastapi import APIRouter, Query
from typing import Optional
from data.dummy_data import ALERTS

router = APIRouter()


@router.get("/")
def list_alerts(
    status: Optional[str] = None,
    alert_type: Optional[str] = None,
    industry: Optional[str] = None,
):
    result = ALERTS
    if status:
        result = [a for a in result if a["status"] == status]
    if alert_type:
        result = [a for a in result if a["type"] == alert_type]
    if industry:
        result = [a for a in result if a["industry"].lower() == industry.lower()]
    return {
        "alerts": result,
        "total": len(result),
        "critical": sum(1 for a in result if a["type"] == "CRITICAL"),
        "active": sum(1 for a in result if a["status"] == "active"),
    }


@router.get("/active")
def get_active_alerts():
    active = [a for a in ALERTS if a["status"] == "active"]
    return {"alerts": active, "count": len(active)}


@router.get("/{alert_id}")
def get_alert(alert_id: str):
    alert = next((a for a in ALERTS if a["id"] == alert_id), None)
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.put("/{alert_id}/status")
def update_alert_status(alert_id: str, status: str):
    alert = next((a for a in ALERTS if a["id"] == alert_id), None)
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    alert["status"] = status
    return {"message": "Status updated", "alert_id": alert_id, "new_status": status}
