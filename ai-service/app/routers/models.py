"""
CardioVision AI - Models Router
"""

from fastapi import APIRouter, Request
from app.schemas.prediction import ModelInfo

router = APIRouter()


@router.get("/models", response_model=list[ModelInfo])
async def list_models(request: Request):
    """List all available ML models and their status."""
    model_manager = request.app.state.model_manager
    models = model_manager.list_models()
    return [ModelInfo(**m) for m in models]


@router.get("/models/{model_name}")
async def get_model_info(request: Request, model_name: str):
    """Get detailed information about a specific model."""
    model_manager = request.app.state.model_manager
    info = model_manager.get_model_info(model_name)
    
    if not info:
        return {"error": f"Model '{model_name}' not found"}
    
    # Get feature importances if available
    model = model_manager.get_model(model_name)
    importances = {}
    
    try:
        estimator = model
        if hasattr(model, "named_steps"):
            estimator = model.named_steps.get("clf", model.named_steps.get("reg", model))
        
        if hasattr(estimator, "feature_importances_"):
            from app.config import settings
            for i, name in enumerate(settings.FEATURE_NAMES):
                if i < len(estimator.feature_importances_):
                    importances[name] = round(float(estimator.feature_importances_[i]), 4)
    except Exception:
        pass
    
    return {
        **info,
        "loaded": model_name in model_manager.models,
        "feature_importances": importances
    }
