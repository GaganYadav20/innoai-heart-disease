"""
CardioVision AI - AI Service Unit & Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_FEATURES = {
    "age": 55,
    "sex": 1,
    "chest_pain_type": 1,
    "resting_bp": 130,
    "cholesterol": 220,
    "fasting_bs": 0,
    "resting_ecg": 0,
    "max_hr": 150,
    "exercise_angina": 0,
    "oldpeak": 1.5,
    "st_slope": 1,
    "num_major_vessels": 0,
    "thal": 1,
    "bmi": 27.0
}


def test_health_endpoint():
    """Test health check endpoint."""
    with TestClient(app) as test_client:
        response = test_client.get("/ai/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["models_loaded"] >= 4
        assert "random_forest" in data["models"]


def test_list_models():
    """Test list models endpoint."""
    with TestClient(app) as test_client:
        response = test_client.get("/ai/models")
        assert response.status_code == 200
        models = response.json()
        assert len(models) >= 4
        model_names = [m["name"] for m in models]
        assert "random_forest" in model_names
        assert "xgboost" in model_names
        assert "neural_network" in model_names
        assert "heart_age" in model_names


def test_predict_random_forest():
    """Test prediction using Random Forest with explainability."""
    with TestClient(app) as test_client:
        payload = {
            "features": SAMPLE_FEATURES,
            "model_name": "random_forest",
            "explain": True
        }
        response = test_client.post("/ai/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert "risk_category" in data
        assert data["risk_category"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
        assert "confidence_score" in data
        assert "heart_age" in data
        assert "shap_values" in data
        assert "lime_values" in data
        assert "feature_importance" in data
        assert len(data["recommendations"]) > 0


def test_predict_xgboost():
    """Test prediction using XGBoost."""
    with TestClient(app) as test_client:
        payload = {
            "features": SAMPLE_FEATURES,
            "model_name": "xgboost",
            "explain": False
        }
        response = test_client.post("/ai/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["model_name"] == "xgboost"
        assert "risk_score" in data


def test_predict_neural_network():
    """Test prediction using Neural Network."""
    with TestClient(app) as test_client:
        payload = {
            "features": SAMPLE_FEATURES,
            "model_name": "neural_network",
            "explain": False
        }
        response = test_client.post("/ai/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["model_name"] == "neural_network"
        assert "risk_score" in data
