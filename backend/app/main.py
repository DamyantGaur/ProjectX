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

# CORS configuration - explicitly list all allowed origins
# Using "*" causes preflight failures when Vercel proxies OPTIONS requests
ALLOWED_ORIGINS = [
    "https://projectx-seven-azure.vercel.app",
    "https://projectx-git-master-damyantgaurs-projects.vercel.app",
    "https://projectx-1cssgh4cj-damyantgaurs-projects.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        import traceback
        print(f"CRASH: {str(e)}")
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(e)}", "traceback": traceback.format_exc()})


# ─── Import and include all routers ───
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router
from app.routes.qr import router as qr_router
from app.routes.payments import router as payments_router
from app.routes.memberships import router as memberships_router
from app.routes.loyalty import router as loyalty_router
from app.routes.analytics import router as analytics_router
from app.routes.stripe_webhooks import router as stripe_router

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(qr_router)
app.include_router(payments_router)
app.include_router(memberships_router)
app.include_router(loyalty_router)
app.include_router(analytics_router)
app.include_router(stripe_router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "operational", "service": "Project X API", "version": "1.0.0"}

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path_name: str):
    print(f"CATCH-ALL 404: {path_name}")
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=404,
        content={"detail": f"Path not found: /api/{path_name}", "path": path_name}
    )
