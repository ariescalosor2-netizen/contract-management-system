from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.contract_types import router as contract_types_router
from app.api.v1.parties import router as parties_router
from app.api.v1.contracts import router as contracts_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.payments import router as payments_router
from app.api.v1.milestones import router as milestones_router
from app.api.v1.amendments import router as amendments_router
from app.api.v1.renewals import router as renewals_router
from app.api.v1.documents import router as documents_router
from app.api.v1.milestone_tasks import router as milestone_tasks_router
from app.api.v1.contract_parties import router as contract_parties_router
from app.api.v1.super_admin import router as super_admin_router
from app.api.v1.viewer import router as viewer_router


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="ARGO Contract Management System",
    version="1.0.0",
    description="Contract Management module for ARGO HQ.",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://contract-management-system-dusky.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

app.include_router(
    users_router,
    prefix="/api/v1/users",
    tags=["Users"],
)

app.include_router(
    contract_types_router,
    prefix="/api/v1/contract-types",
    tags=["Contract Types"],
)

app.include_router(
    parties_router,
    prefix="/api/v1/parties",
    tags=["Parties"],
)

app.include_router(
    contracts_router,
    prefix="/api/v1/contracts",
    tags=["Contracts"],
)

app.include_router(
    dashboard_router,
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    approvals_router,
    prefix="/api/v1/approvals",
    tags=["Approvals"],
)

app.include_router(
    payments_router,
    prefix="/api/v1/payments",
    tags=["Payments"],
)

app.include_router(
    milestones_router,
    prefix="/api/v1/milestones",
    tags=["Milestones"],
)

app.include_router(
    milestone_tasks_router,
    prefix="/api/v1/milestone-tasks",
    tags=["Milestone Tasks"],
)

app.include_router(
    contract_parties_router,
    prefix="/api/v1/contracts",
    tags=["Contract Parties"],
)

app.include_router(
    super_admin_router,
    prefix="/api/v1/super-admin",
    tags=["Super Admin"],
)

app.include_router(
    viewer_router,
    prefix="/api/v1/viewer",
    tags=["Viewer"],
)

app.include_router(
    documents_router,
    prefix="/api/v1/documents",
    tags=["Documents"],
)

app.include_router(
    amendments_router,
    prefix="/api/v1/amendments",
    tags=["Amendments"],
)
app.include_router(
    renewals_router,
    prefix="/api/v1/renewals",
    tags=["Renewals"],
)

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "ARGO Contract Management API is running.",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
    }