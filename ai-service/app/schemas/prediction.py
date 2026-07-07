"""
CardioVision AI - Pydantic Schemas
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class PredictionInput(BaseModel):
    """Input features for cardiac risk prediction."""
    model_config = ConfigDict(protected_namespaces=())
    features: dict = Field(..., description="Clinical features as key-value pairs")
    model_name: str = Field(default="random_forest", description="Model to use for prediction")
    explain: bool = Field(default=True, description="Generate SHAP/LIME explanations")


class PredictionOutput(BaseModel):
    """Prediction result with explainability."""
    model_config = ConfigDict(protected_namespaces=())
    risk_score: float = Field(..., description="Cardiac risk probability (0-1)")
    risk_category: str = Field(..., description="Risk level: LOW, MODERATE, HIGH, CRITICAL")
    confidence_score: float = Field(..., description="Model confidence (0-1)")
    heart_age: int = Field(..., description="Estimated biological heart age")
    prediction_time_ms: int = Field(..., description="Inference time in milliseconds")
    model_name: str
    model_version: str
    shap_values: dict = Field(default_factory=dict)
    lime_values: dict = Field(default_factory=dict)
    feature_importance: dict = Field(default_factory=dict)
    recommendations: list[dict] = Field(default_factory=list)


class OCRInput(BaseModel):
    """OCR extraction request."""
    file_path: Optional[str] = None
    file_type: Optional[str] = None


class OCROutput(BaseModel):
    """OCR extraction result."""
    extracted_features: dict
    confidence: float
    raw_text: str
    warnings: list[str] = Field(default_factory=list)


class ExplainInput(BaseModel):
    """Request for detailed explainability."""
    model_config = ConfigDict(protected_namespaces=())
    features: dict
    model_name: str = "random_forest"
    explanation_type: str = Field(default="all", description="Type: shap, lime, or all")


class ExplainOutput(BaseModel):
    """Detailed explainability output."""
    shap_values: dict = Field(default_factory=dict)
    lime_values: dict = Field(default_factory=dict)
    feature_importance: list[dict] = Field(default_factory=list)
    waterfall_data: list[dict] = Field(default_factory=list)
    force_plot_data: dict = Field(default_factory=dict)


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    models_loaded: int
    models: list[str]


class ModelInfo(BaseModel):
    """Model information."""
    name: str
    version: str
    type: str
    description: str
    loaded: bool
    metrics: Optional[dict] = None
