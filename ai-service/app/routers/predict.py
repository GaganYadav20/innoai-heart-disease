"""
CardioVision AI - Prediction Router
"""

from fastapi import APIRouter, Request, HTTPException
from app.schemas.prediction import PredictionInput, PredictionOutput
from app.services.prediction_service import predict, predict_heart_age, generate_recommendations
from app.services.explainability import generate_shap_values, generate_lime_values, generate_feature_importance

router = APIRouter()


@router.post("/predict", response_model=PredictionOutput)
async def run_prediction(request: Request, data: PredictionInput):
    """
    Run cardiac risk prediction with optional explainability.
    
    Accepts clinical features and returns risk score, heart age,
    SHAP/LIME explanations, and clinical recommendations.
    """
    model_manager = request.app.state.model_manager
    
    try:
        # Get prediction model
        model = model_manager.get_model(data.model_name)
        model_info = model_manager.get_model_info(data.model_name)
        
        # Run prediction
        result = predict(model, data.features, data.model_name)
        
        # Predict heart age
        heart_age = 50
        try:
            heart_age_model = model_manager.get_model("heart_age")
            heart_age = predict_heart_age(heart_age_model, data.features)
        except Exception:
            heart_age = int(data.features.get("age", 50)) + 5
        
        # Generate explanations if requested
        shap_values = {}
        lime_values = {}
        feature_imp = {}
        
        if data.explain:
            shap_values = generate_shap_values(model, data.features)
            lime_values = generate_lime_values(model, data.features)
            feature_imp_list = generate_feature_importance(model, data.features)
            feature_imp = {item["feature"]: item["importance"] for item in feature_imp_list}
        
        # Generate recommendations
        recommendations = generate_recommendations(result["risk_category"], data.features)
        
        return PredictionOutput(
            risk_score=result["risk_score"],
            risk_category=result["risk_category"],
            confidence_score=result["confidence_score"],
            heart_age=heart_age,
            prediction_time_ms=result["prediction_time_ms"],
            model_name=data.model_name,
            model_version=model_info["version"] if model_info else "1.0.0",
            shap_values=shap_values,
            lime_values=lime_values,
            feature_importance=feature_imp,
            recommendations=recommendations,
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
