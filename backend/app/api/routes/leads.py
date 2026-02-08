
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.utils.crud import list_docs, get_doc, create_doc, update_doc, delete_doc
from app.db.mongo import db
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def list_entities(page: int = 1, size: int = 20, q: str | None = None):
    query = {}
    return await list_docs("leads", page, size, query)

@router.get("/{entity_id}")
async def get_entity(entity_id: str):
    doc = await get_doc("leads", entity_id)
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@router.post("/", status_code=201)
async def create_entity(payload: dict, user=Depends(get_current_user)):
    payload.setdefault("created_by", user.get("id"))
    return await create_doc("leads", payload)

@router.patch("/{entity_id}")
async def update_entity(entity_id: str, updates: dict):
    return await update_doc("leads", entity_id, updates)

@router.delete("/{entity_id}")
async def delete_entity(entity_id: str):
    return await delete_doc("leads", entity_id)

# ---- Workflow: Convert Lead into Contact + Opportunity ----
@router.post('/{lead_id}/convert')
async def convert_lead(lead_id: str, payload: dict | None = None, user=Depends(get_current_user)):
    payload = payload or {}
    try:
        oid = ObjectId(lead_id)
    except Exception:
        raise HTTPException(400, "Invalid lead id")

    lead = await db.leads.find_one({"_id": oid})
    if not lead:
        raise HTTPException(404, "Lead not found")
    if lead.get('status') == 'converted':
        raise HTTPException(400, "Lead already converted")

    # ---- Determine/Create Account ----
    account_id = payload.get("account_id")
    if not account_id:
        # Choose an account name: payload.account_name > lead name/email > generic
        first = (lead.get('first_name') or '').strip()
        last = (lead.get('last_name') or '').strip()
        base_name = payload.get('account_name') or (f"{first} {last}".strip() or (lead.get('email') or 'New Lead'))
        account_name = f"Account - {base_name}"
        account_res = await db.accounts.insert_one({"name": account_name})
        account_id = str(account_res.inserted_id)

    # Create Contact from lead
    contact_data = {
        "first_name": lead.get("first_name"),
        "last_name": lead.get("last_name"),
        "email": lead.get("email"),
        "phone": lead.get("phone"),
        "title": payload.get("title"),
        "account_id": account_id
    }
    contact_res = await db.contacts.insert_one(contact_data)
    contact_id = str(contact_res.inserted_id)

    # Create Opportunity
    opp_data = {
        "name": payload.get("opportunity_name") or f"{lead.get('first_name','')} {lead.get('last_name','')} Opportunity",
        "account_id": account_id,
        "amount": float(payload.get("amount", 0)),
        "stage": "qualification",
        "owner_id": user.get("id"),
        "lead_id": lead_id,
        "contact_id": contact_id
    }
    opp_res = await db.opportunities.insert_one(opp_data)
    opp_id = str(opp_res.inserted_id)

    # Update lead status
    await db.leads.update_one({"_id": oid}, {"$set": {"status": "converted", "converted_opportunity_id": opp_id, "converted_contact_id": contact_id}})

    # Audit note
    await db.activities.insert_one({
        "entity_type": "lead",
        "entity_id": lead_id,
        "type": "note",
        "subject": "Lead converted",
        "body": f"Created account {account_id}, opportunity {opp_id} and contact {contact_id}",
        "created_by": user.get("id")
    })

    return {"account_id": account_id, "contact_id": contact_id, "opportunity_id": opp_id}
