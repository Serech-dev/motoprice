from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, SessionLocal
from app.services.seed_data import seed_database
from app.routers import (
    suppliers_router, 
    products_router, 
    price_updates_router, 
    settings_router,
    auth_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seed initial autoparts data if needed
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="MotoPrice - Motorcycle Parts Dynamic Price Tracker & Supplier Engine",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust route fallback middleware: allows calling /auth/... or /api/auth/... seamlessly
@app.middleware("http")
async def api_prefix_fallback(request, call_next):
    path = request.url.path
    if not path.startswith("/api") and any(path.startswith(f"/{s}") for s in ["auth", "suppliers", "products", "price-updates", "settings"]):
        request.scope["path"] = f"/api{path}"
    response = await call_next(request)
    return response

# Mount Routers
app.include_router(auth_router)
app.include_router(suppliers_router)
app.include_router(products_router)
app.include_router(price_updates_router)
app.include_router(settings_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
@app.get("/health")
def health():
    db = SessionLocal()
    try:
        from app.models.user import User
        count = db.query(User).count()
        if count == 0:
            seed_database(db)
        return {"status": "ok"}
    finally:
        db.close()



