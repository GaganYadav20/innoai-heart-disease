"""
CardioVision AI - FastAPI Application
Enterprise Cardiac Risk Prediction Service
"""

import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.model_loader import ModelManager
from app.routers import predict, ocr, explain, models, health


# Global model manager
model_manager = ModelManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML models into memory at startup, release at shutdown."""
    print("[START] CardioVision AI Service starting...")
    print("[LOAD] Loading ML models into memory...")
    start = time.time()
    model_manager.load_all_models()
    elapsed = time.time() - start
    print(f"[OK] All models loaded in {elapsed:.2f}s")
    
    # Store model manager in app state
    app.state.model_manager = model_manager
    
    yield
    
    # Cleanup
    print("[STOP] Shutting down CardioVision AI Service...")
    model_manager.unload_all_models()


# Create FastAPI app
app = FastAPI(
    title="CardioVision AI Service",
    description="Enterprise Cardiac Risk Prediction & Explainability Engine",
    version="1.0.0",
    docs_url="/ai/docs",
    openapi_url="/ai/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/ai", tags=["Health"])
app.include_router(predict.router, prefix="/ai", tags=["Prediction"])
app.include_router(ocr.router, prefix="/ai", tags=["OCR"])
app.include_router(explain.router, prefix="/ai", tags=["Explainability"])
app.include_router(models.router, prefix="/ai", tags=["Models"])
