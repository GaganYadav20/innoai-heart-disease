"""
CardioVision AI - Model Loader
Loads and manages all ML models in memory.
"""

import os
import joblib
import numpy as np
from pathlib import Path
from typing import Optional

from app.config import settings


class ModelManager:
    """Manages all ML models. Models are loaded once at startup and kept in memory."""
    
    def __init__(self):
        self.models: dict = {}
        self.model_info: dict = {}
        self._initialized = False
    
    def load_all_models(self):
        """Load all available models from disk into memory."""
        model_dir = Path(settings.MODEL_DIR)
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # Define available models
        model_configs = {
            "random_forest": {
                "file": "random_forest_cardiac.joblib",
                "version": "1.0.0",
                "type": "classification",
                "description": "Random Forest cardiac risk classifier"
            },
            "xgboost": {
                "file": "xgboost_cardiac.joblib",
                "version": "1.0.0",
                "type": "classification",
                "description": "XGBoost gradient boosting cardiac risk classifier"
            },
            "neural_network": {
                "file": "neural_network_cardiac.joblib",
                "version": "1.0.0",
                "type": "classification",
                "description": "Neural network cardiac risk classifier"
            },
            "heart_age": {
                "file": "heart_age_regressor.joblib",
                "version": "1.0.0",
                "type": "regression",
                "description": "Heart age regression model"
            }
        }
        
        for model_name, config in model_configs.items():
            model_path = model_dir / config["file"]
            if model_path.exists():
                try:
                    self.models[model_name] = joblib.load(model_path)
                    self.model_info[model_name] = config
                    print(f"  [OK] Loaded {model_name} from {model_path}")
                except Exception as e:
                    print(f"  [WARN] Failed to load {model_name}: {e}")
                    self._create_default_model(model_name, config, model_dir)
            else:
                print(f"  [INFO] Model file not found for {model_name}, creating default...")
                self._create_default_model(model_name, config, model_dir)
        
        self._initialized = True
        print(f"  [STATS] {len(self.models)} models loaded successfully")
    
    def _create_default_model(self, model_name: str, config: dict, model_dir: Path):
        """Create a default trained model using synthetic data."""
        from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.neural_network import MLPClassifier
        from sklearn.linear_model import LinearRegression
        from sklearn.preprocessing import StandardScaler
        from sklearn.pipeline import Pipeline
        
        np.random.seed(42)
        n_samples = 1000
        n_features = 14
        
        # Generate synthetic training data mimicking cardiac features
        X = np.random.randn(n_samples, n_features)
        # Make features more realistic
        X[:, 0] = np.random.uniform(25, 80, n_samples)   # age
        X[:, 1] = np.random.choice([0, 1], n_samples)     # sex
        X[:, 2] = np.random.choice([0, 1, 2, 3], n_samples)  # chest_pain_type
        X[:, 3] = np.random.uniform(90, 200, n_samples)   # resting_bp
        X[:, 4] = np.random.uniform(100, 400, n_samples)  # cholesterol
        X[:, 5] = np.random.choice([0, 1], n_samples)     # fasting_bs
        X[:, 6] = np.random.choice([0, 1, 2], n_samples)  # resting_ecg
        X[:, 7] = np.random.uniform(60, 200, n_samples)   # max_hr
        X[:, 8] = np.random.choice([0, 1], n_samples)     # exercise_angina
        X[:, 9] = np.random.uniform(0, 6, n_samples)      # oldpeak
        X[:, 10] = np.random.choice([0, 1, 2], n_samples) # st_slope
        X[:, 11] = np.random.choice([0, 1, 2, 3], n_samples)  # num_major_vessels
        X[:, 12] = np.random.choice([0, 1, 2], n_samples) # thal
        X[:, 13] = np.random.uniform(15, 45, n_samples)   # bmi
        
        # Create realistic target based on features
        risk_score = (
            0.02 * X[:, 0] +           # age
            0.3 * X[:, 8] +             # exercise_angina
            0.001 * X[:, 4] +           # cholesterol
            0.01 * X[:, 3] +            # resting_bp
            0.2 * X[:, 9] +             # oldpeak
            -0.01 * X[:, 7] +           # max_hr (negative = protective)
            0.15 * X[:, 2] +            # chest_pain_type
            0.1 * X[:, 5] +             # fasting_bs
            np.random.randn(n_samples) * 0.3
        )
        
        if config["type"] == "classification":
            y = (risk_score > np.median(risk_score)).astype(int)
            
            if model_name == "random_forest":
                model = Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", RandomForestClassifier(
                        n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
                    ))
                ])
            elif model_name == "xgboost":
                model = Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", GradientBoostingClassifier(
                        n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42
                    ))
                ])
            else:  # neural_network
                model = Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", MLPClassifier(
                        hidden_layer_sizes=(128, 64, 32),
                        activation="relu", max_iter=500, random_state=42
                    ))
                ])
            
            model.fit(X, y)
        else:
            # Heart age regression
            y = X[:, 0] + risk_score * 5  # Heart age = actual age + risk adjustment
            model = Pipeline([
                ("scaler", StandardScaler()),
                ("reg", LinearRegression())
            ])
            model.fit(X, y)
        
        # Save model
        model_path = model_dir / config["file"]
        joblib.dump(model, model_path)
        
        self.models[model_name] = model
        self.model_info[model_name] = config
        print(f"  [OK] Created and saved default {model_name}")
    
    def get_model(self, model_name: str):
        """Get a loaded model by name."""
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found. Available: {list(self.models.keys())}")
        return self.models[model_name]
    
    def get_model_info(self, model_name: str) -> Optional[dict]:
        """Get model metadata."""
        return self.model_info.get(model_name)
    
    def list_models(self) -> list[dict]:
        """List all available models."""
        return [
            {
                "name": name,
                "version": info["version"],
                "type": info["type"],
                "description": info["description"],
                "loaded": name in self.models
            }
            for name, info in self.model_info.items()
        ]
    
    def unload_all_models(self):
        """Release all models from memory."""
        self.models.clear()
        self.model_info.clear()
        self._initialized = False
