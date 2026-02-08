
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.utils.crud import list_docs, get_doc, create_doc, update_doc, delete_doc
from app.db.mongo import db

router = APIRouter()

@router.get("/")
async def list_entities(page: int = 1, size: int = 20, q: str | None = None):
    query = {"name": {"$regex": q, "$options": "i"}} if q else {}
    # custom listing to apply query
    skip = (page - 1) * size
    cursor = db["accounts"].find(query).skip(skip).limit(size)
    items = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"]) 
        doc.pop("_id", None)
        items.append(doc)
    total = await db["accounts"].count_documents(query)
    return {"items": items, "page": page, "size": size, "total": total}

@router.get("/{entity_id}")
async def get_entity(entity_id: str):
    doc = await get_doc("accounts", entity_id)
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@router.post("/", status_code=201)
async def create_entity(payload: dict, user=Depends(get_current_user)):
    payload.setdefault("created_by", user.get("id"))
    return await create_doc("accounts", payload)

@router.patch("/{entity_id}")
async def update_entity(entity_id: str, updates: dict):
    return await update_doc("accounts", entity_id, updates)

@router.delete("/{entity_id}")
async def delete_entity(entity_id: str):
    return await delete_doc("accounts", entity_id)
