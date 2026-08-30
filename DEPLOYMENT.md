# Contract Management System — Local and Live Hosting

## Local

### Backend

From the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

In a second terminal:

```powershell
npm install
npm run dev
```

Vite runs the frontend at the address shown in the terminal (normally `http://localhost:5173`). In development the API service automatically uses `http://127.0.0.1:8000/api/v1` unless `VITE_API_URL` is supplied.

## Multiple Parties Migration

Run the normal Alembic migration before using multiple parties:

```powershell
cd backend
alembic upgrade head
```

Existing contracts are preserved. Each existing `contracts.party_id` value is copied into `contract_parties` as `Primary Party`. The original `party_id` column is intentionally retained for backward compatibility.

## Super Admin

The system already contains the `Super Admin` role. To create a system-level account without putting a password in source code:

```powershell
cd backend
python -m app.database.create_super_admin admin@example.com "Use-A-Strong-Password" First Last
```

A Super Admin can be organization-less. Organization-scoped roles keep their existing organization requirement.

## Live Hosting

The repository includes `render.yaml` for the FastAPI service and `vercel.json` for the frontend.

### Render

Create/configure the backend service using `render.yaml` and set the database environment variables in Render. The build command runs Alembic migrations before starting FastAPI.

Required secrets/variables are listed in `backend/.env.example`.

### Vercel

The frontend is configured to use `/api/v1` in production. `vercel.json` proxies that path to the configured Render backend URL and serves the SPA entry point for client-side routes.

If the backend URL changes, update the Render destination in `vercel.json` and the backend CORS allow-list in `backend/app/main.py`.

## Security

`.env` files are intentionally excluded from the distributable source package. Do not commit database passwords, JWT secrets, or other credentials. If credentials from an earlier project archive were ever exposed, rotate them before production deployment.
