"""
CardioVision AI - Prediction Service
Core prediction engine with feature preprocessing.
"""

import time
import numpy as np
import pandas as pd
from typing import Optional

from app.config import settings


# Clinical feature boundaries for validation
FEATURE_RANGES = {
    "age": (18, 120),
    "sex": (0, 1),
    "chest_pain_type": (0, 3),
    "resting_bp": (60, 250),
    "cholesterol": (50, 600),
    "fasting_bs": (0, 1),
    "resting_ecg": (0, 2),
    "max_hr": (40, 220),
    "exercise_angina": (0, 1),
    "oldpeak": (-3, 7),
    "st_slope": (0, 2),
    "num_major_vessels": (0, 4),
    "thal": (0, 3),
    "bmi": (10, 60),
}

# Default values for missing features
FEATURE_DEFAULTS = {
    "age": 50, "sex": 0, "chest_pain_type": 0, "resting_bp": 120,
    "cholesterol": 200, "fasting_bs": 0, "resting_ecg": 0, "max_hr": 150,
    "exercise_angina": 0, "oldpeak": 0.0, "st_slope": 1,
    "num_major_vessels": 0, "thal": 1, "bmi": 25.0,
}


def preprocess_features(features: dict) -> np.ndarray:
    """Validate and preprocess clinical features into model-ready array."""
    processed = []
    for feature_name in settings.FEATURE_NAMES:
        value = features.get(feature_name, FEATURE_DEFAULTS.get(feature_name, 0))
        
        # Convert to float
        try:
            value = float(value)
        except (TypeError, ValueError):
            value = float(FEATURE_DEFAULTS.get(feature_name, 0))
        
        # Clip to valid range
        if feature_name in FEATURE_RANGES:
            low, high = FEATURE_RANGES[feature_name]
            value = np.clip(value, low, high)
        
        processed.append(value)
    
    return np.array(processed).reshape(1, -1)


def predict(model, features: dict, model_name: str) -> dict:
    """Run cardiac risk prediction."""
    start_time = time.time()
    
    # Preprocess
    X = preprocess_features(features)
    
    # Predict
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(X)[0]
        risk_score = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])
    else:
        prediction = model.predict(X)[0]
        risk_score = float(prediction)
    
    # Categorize risk
    risk_category = categorize_risk(risk_score)
    
    # Confidence score
    confidence = calculate_confidence(model, X)
    
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    return {
        "risk_score": round(risk_score, 4),
        "risk_category": risk_category,
        "confidence_score": round(confidence, 4),
        "prediction_time_ms": elapsed_ms,
    }


def predict_heart_age(model, features: dict) -> int:
    """Predict biological heart age."""
    X = preprocess_features(features)
    
    try:
        heart_age = int(model.predict(X)[0])
        # Clamp to reasonable range
        actual_age = int(features.get("age", 50))
        heart_age = max(actual_age - 15, min(actual_age + 25, heart_age))
        return heart_age
    except Exception:
        return int(features.get("age", 50)) + 5


def categorize_risk(score: float) -> str:
    """Categorize risk score into clinical categories."""
    if score < 0.25:
        return "LOW"
    elif score < 0.50:
        return "MODERATE"
    elif score < 0.75:
        return "HIGH"
    else:
        return "CRITICAL"


def calculate_confidence(model, X: np.ndarray) -> float:
    """Calculate model confidence score."""
    try:
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X)[0]
            return float(max(probabilities))
        return 0.85
    except Exception:
        return 0.80


def generate_recommendations(risk_category: str, features: dict) -> list[dict]:
    """Generate clinical recommendations based on risk level and features."""
    recommendations = []
    
    # Universal recommendations
    recommendations.append({
        "title": "Regular Health Monitoring",
        "description": "Schedule regular cardiovascular health checkups with your healthcare provider.",
        "priority": "MEDIUM",
        "icon": "stethoscope"
    })
    
    # Risk-based recommendations
    if risk_category in ("HIGH", "CRITICAL"):
        recommendations.insert(0, {
            "title": "⚠️ Immediate Medical Consultation",
            "description": "Your risk score indicates elevated cardiovascular risk. Please consult a cardiologist as soon as possible.",
            "priority": "CRITICAL",
            "icon": "alert-triangle"
        })
    
    # Feature-specific recommendations
    cholesterol = features.get("cholesterol", 200)
    if cholesterol and float(cholesterol) > 240:
        recommendations.append({
            "title": "Cholesterol Management",
            "description": f"Your cholesterol level ({cholesterol} mg/dL) is above optimal. Consider dietary changes and discuss statin therapy with your doctor.",
            "priority": "HIGH",
            "icon": "heart"
        })
    
    resting_bp = features.get("resting_bp", 120)
    if resting_bp and float(resting_bp) > 140:
        recommendations.append({
            "title": "Blood Pressure Control",
            "description": f"Your resting blood pressure ({resting_bp} mmHg) is elevated. Monitor daily and reduce sodium intake.",
            "priority": "HIGH",
            "icon": "activity"
        })
    
    bmi = features.get("bmi", 25)
    if bmi and float(bmi) > 30:
        recommendations.append({
            "title": "Weight Management",
            "description": f"Your BMI ({bmi}) indicates obesity. A structured exercise and nutrition program is recommended.",
            "priority": "MEDIUM",
            "icon": "trending-down"
        })
    
    max_hr = features.get("max_hr", 150)
    if max_hr and float(max_hr) < 100:
        recommendations.append({
            "title": "Cardiovascular Fitness",
            "description": "Your maximum heart rate is below average. Engage in supervised aerobic exercise to improve cardiac fitness.",
            "priority": "MEDIUM",
            "icon": "heart-pulse"
        })
    
    recommendations.append({
        "title": "Heart-Healthy Diet",
        "description": "Follow a Mediterranean or DASH diet rich in fruits, vegetables, whole grains, and omega-3 fatty acids.",
        "priority": "MEDIUM",
        "icon": "apple"
    })
    
    recommendations.append({
        "title": "Stress Management",
        "description": "Practice stress-reducing activities like meditation, yoga, or deep breathing exercises for 15-20 minutes daily.",
        "priority": "LOW",
        "icon": "brain"
    })
    
    return recommendations
