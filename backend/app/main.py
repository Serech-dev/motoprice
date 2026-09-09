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
def health():
    return {"status": "ok"}

