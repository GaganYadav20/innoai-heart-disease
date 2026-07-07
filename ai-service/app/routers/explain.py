"""
CardioVision AI - Explainability Router
"""

from fastapi import APIRouter, Request, HTTPException
from app.schemas.prediction import ExplainInput, ExplainOutput
from app.services.explainability import (
    generate_shap_values,
    generate_lime_values,
    generate_feature_importance,
)

router = APIRouter()


@router.post("/explain", response_model=ExplainOutput)
async def explain_prediction(request: Request, data: ExplainInput):
    """
    Generate detailed SHAP/LIME explanations for a prediction.
    Returns waterfall chart data, force plot data, and feature importance rankings.
    """
    model_manager = request.app.state.model_manager
    
    try:
        model = model_manager.get_model(data.model_name)
        
        result = ExplainOutput()
        
        if data.explanation_type in ("shap", "all"):
            result.shap_values = generate_shap_values(model, data.features)
        
        if data.explanation_type in ("lime", "all"):
            result.lime_values = generate_lime_values(model, data.features)
        
        result.feature_importance = generate_feature_importance(model, data.features)
        
        # Generate waterfall chart data from SHAP
        if result.shap_values:
            waterfall = []
            sorted_shap = sorted(
                result.shap_values.items(),
                key=lambda x: abs(x[1].get("value", 0) if isinstance(x[1], dict) else 0),
                reverse=True
            )
            cumulative = 0.5  # Base value
            for name, info in sorted_shap:
                value = info.get("value", 0) if isinstance(info, dict) else 0
                waterfall.append({
                    "feature": info.get("display_name", name) if isinstance(info, dict) else name,
                    "value": round(value, 4),
                    "cumulative": round(cumulative + value, 4),
                    "direction": "positive" if value > 0 else "negative"
                })
                cumulative += value
            result.waterfall_data = waterfall
        
        # Force plot data
        if result.shap_values:
            positive_features = []
            negative_features = []
            for name, info in result.shap_values.items():
                val = info.get("value", 0) if isinstance(info, dict) else 0
                entry = {
                    "feature": info.get("display_name", name) if isinstance(info, dict) else name,
                    "value": round(val, 4)
                }
                if val > 0:
                    positive_features.append(entry)
                else:
                    negative_features.append(entry)
            
            result.force_plot_data = {
                "base_value": 0.5,
                "output_value": round(0.5 + sum(
                    (v.get("value", 0) if isinstance(v, dict) else 0) 
                    for v in result.shap_values.values()
                ), 4),
                "positive_features": positive_features,
                "negative_features": negative_features
            }
        
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")
