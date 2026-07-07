"""
CardioVision AI - Health Check Router
"""

from fastapi import APIRouter, Request
from app.schemas.prediction import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request):
    """Health check endpoint."""
    model_manager = request.app.state.model_manager
    models = list(model_manager.models.keys())
    
    return HealthResponse(
        status="healthy",
        service="CardioVision AI Service",
        version="1.0.0",
        models_loaded=len(models),
        models=models
    )
