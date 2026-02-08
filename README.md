
# XRM Suite (FastAPI + React + MongoDB)

A modern, extensible **XRM (eXtensible Relationship Management)** starter that you can run locally or with Docker. It includes:

- **Backend**: FastAPI, JWT Auth, RBAC, MongoDB (Motor), CORS, pagination, audit logging, file uploads (GridFS bucket), OpenAPI docs.
- **Frontend**: React + Vite + TypeScript, React Router, Context-based Auth, reusable DataTable & forms.
- **DevOps**: Dockerfiles for API & Web, docker-compose for full stack, environment variables, seed script.

> This is a production-ready *starter* with key features implemented and clear extension points.

---

## Quickstart (Docker)

```bash
# 1) Copy env file
cp .env.example .env
# 2) Adjust values (JWT secret, origins, etc.) in .env
# 3) Build & run
docker compose up -d --build
# 4) API: http://localhost:8000/docs
#    Web: http://localhost:5173
```

## Quickstart (Local Dev)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Default Entities
- Users & Roles (admin, manager, sales, support)
- Accounts
- Contacts
- Leads
- Opportunities
- Activities (notes/tasks)
- Files (GridFS) – basic upload/download

## Credentials
After first run, create an admin user via API:
```
POST /api/v1/auth/register
{
  "email": "admin@example.com",
  "password": "ChangeMe123!",
  "full_name": "Admin",
  "role": "admin"
}
```
Then login at `/api/v1/auth/login` and paste token in the Swagger UI **Authorize** button.

## Environment
See `.env.example` for all variables.

## License
MIT
