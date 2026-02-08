
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.mongo import db

router = APIRouter()

@router.get('/pipeline')
async def pipeline_summary(user=Depends(get_current_user)):
    cursor = db.opportunities.aggregate([
        {"$group": {"_id": "$stage", "count": {"$sum": 1}, "total": {"$sum": {"$ifNull": ["$amount", 0]}}}},
        {"$sort": {"_id": 1}}
    ])
    items = []
    async for doc in cursor:
        items.append({"stage": doc.get("_id"), "count": doc.get("count", 0), "total": float(doc.get("total", 0))})
    return {"items": items}

@router.get('/lead-conversions')
async def lead_conversions(user=Depends(get_current_user)):
    cursor = db.leads.aggregate([
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])
    items = []
    async for doc in cursor:
        items.append({"status": doc.get("_id"), "count": doc.get("count", 0)})
    return {"items": items}

@router.get('/activities/summary')
async def activities_summary(user=Depends(get_current_user)):
    cursor = db.activities.aggregate([
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])
    items = []
    async for doc in cursor:
        items.append({"type": doc.get("_id"), "count": doc.get("count", 0)})
    return {"items": items}
