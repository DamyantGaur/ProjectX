"""Project X - FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Project X API",
    description="QR-based Smart Club & Event Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Import and include all routers ───
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router
from app.routes.qr import router as qr_router
from app.routes.payments import router as payments_router
from app.routes.memberships import router as memberships_router
from app.routes.loyalty import router as loyalty_router
from app.routes.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(qr_router)
app.include_router(payments_router)
app.include_router(memberships_router)
app.include_router(loyalty_router)
app.include_router(analytics_router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "operational", "service": "Project X API", "version": "1.0.0"}
