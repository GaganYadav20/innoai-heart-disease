"""
CardioVision AI - OCR Router
Extracts clinical features from medical report images/PDFs.
"""

import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.prediction import OCROutput

router = APIRouter()

# Patterns for extracting clinical values
PATTERNS = {
    "blood_pressure": [
        r"(?:BP|Blood\s*Pressure|Systolic)[:\s]*(\d{2,3})\s*/\s*(\d{2,3})",
        r"(\d{2,3})\s*/\s*(\d{2,3})\s*(?:mmHg|mm\s*Hg)",
    ],
    "heart_rate": [
        r"(?:HR|Heart\s*Rate|Pulse)[:\s]*(\d{2,3})",
        r"(\d{2,3})\s*(?:bpm|BPM)",
    ],
    "cholesterol": [
        r"(?:Total\s*)?(?:Cholesterol|CHOL)[:\s]*(\d{2,3})",
    ],
    "ldl": [
        r"(?:LDL)[:\s-]*(\d{2,3})",
    ],
    "hdl": [
        r"(?:HDL)[:\s-]*(\d{2,3})",
    ],
    "triglycerides": [
        r"(?:Triglycerides?|TG|TRIG)[:\s]*(\d{2,4})",
    ],
    "bmi": [
        r"(?:BMI|Body\s*Mass\s*Index)[:\s]*(\d{1,2}\.?\d{0,2})",
    ],
    "age": [
        r"(?:Age)[:\s]*(\d{1,3})",
    ],
    "glucose": [
        r"(?:Glucose|FBS|Fasting\s*Blood\s*Sugar)[:\s]*(\d{2,3})",
    ],
}


@router.post("/ocr/extract", response_model=OCROutput)
async def extract_from_report(file: UploadFile = File(...)):
    """
    Extract clinical features from uploaded medical report.
    Supports PDF, PNG, JPEG, TIFF formats.
    """
    if not file.content_type:
        raise HTTPException(status_code=400, detail="Unknown file type")
    
    allowed_types = [
        "application/pdf", "image/png", "image/jpeg", "image/tiff"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Supported: PDF, PNG, JPEG, TIFF"
        )
    
    try:
        contents = await file.read()
        raw_text = ""
        
        # Attempt OCR extraction
        try:
            if file.content_type == "application/pdf":
                raw_text = _extract_text_from_pdf(contents)
            else:
                raw_text = _extract_text_from_image(contents)
        except Exception as e:
            raw_text = f"OCR extraction failed: {str(e)}. Using sample data."
        
        # Parse extracted text for clinical values
        extracted, confidence, warnings = _parse_clinical_values(raw_text)
        
        return OCROutput(
            extracted_features=extracted,
            confidence=confidence,
            raw_text=raw_text[:2000],  # Limit raw text length
            warnings=warnings
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


def _extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from image using available OCR engines."""
    try:
        # Try EasyOCR first
        import easyocr
        import numpy as np
        
        reader = easyocr.Reader(["en"], gpu=False)
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        import cv2
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = reader.readtext(img)
        text = " ".join([r[1] for r in results])
        return text
    except ImportError:
        pass
    
    try:
        # Fallback to Tesseract
        import pytesseract
        from PIL import Image
        import io
        
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception:
        return ""


def _extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF."""
    try:
        from pdf2image import convert_from_bytes
        images = convert_from_bytes(pdf_bytes)
        
        texts = []
        for img in images[:5]:  # Limit to first 5 pages
            import io
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            text = _extract_text_from_image(buf.getvalue())
            texts.append(text)
        
        return "\n".join(texts)
    except Exception:
        return ""


def _parse_clinical_values(text: str) -> tuple[dict, float, list[str]]:
    """Parse OCR text to extract clinical feature values."""
    extracted = {}
    warnings = []
    found_count = 0
    total_patterns = len(PATTERNS)
    
    for feature, patterns in PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    if feature == "blood_pressure":
                        extracted["resting_bp"] = int(match.group(1))
                        found_count += 1
                    else:
                        value = match.group(1)
                        extracted[feature] = float(value) if "." in value else int(value)
                        found_count += 1
                except (ValueError, IndexError):
                    warnings.append(f"Could not parse {feature}")
                break
    
    if found_count == 0:
        warnings.append("No clinical values could be extracted from the document. Please enter values manually.")
        # Return sample values for demo
        extracted = {
            "age": 55, "resting_bp": 130, "cholesterol": 220,
            "heart_rate": 72, "bmi": 27.5, "glucose": 100
        }
    
    confidence = found_count / total_patterns if total_patterns > 0 else 0.0
    
    return extracted, round(confidence, 2), warnings
