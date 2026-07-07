"""
CardioVision AI - Configuration
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    
    MODEL_DIR: str = "./ml_models"
    LOG_LEVEL: str = "info"
    WORKERS: int = 2
    DEFAULT_MODEL: str = "random_forest"
    
    # Feature configuration
    FEATURE_NAMES: list[str] = [
        "age", "sex", "chest_pain_type", "resting_bp", "cholesterol",
        "fasting_bs", "resting_ecg", "max_hr", "exercise_angina",
        "oldpeak", "st_slope", "num_major_vessels", "thal", "bmi"
    ]


settings = Settings()
