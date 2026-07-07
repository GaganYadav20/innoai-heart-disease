import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, Image, X, Loader2, CheckCircle2, AlertCircle, Edit3 } from "lucide-react";
import api, { aiApi } from "@/services/api";

const FEATURE_LABELS: Record<string, string> = {
  age: "Age", sex: "Sex (0=F, 1=M)", chest_pain_type: "Chest Pain Type (0-3)",
  resting_bp: "Resting BP (mmHg)", cholesterol: "Cholesterol (mg/dL)",
  fasting_bs: "Fasting BS (0/1)", resting_ecg: "Resting ECG (0-2)",
  max_hr: "Max Heart Rate", exercise_angina: "Exercise Angina (0/1)",
  oldpeak: "Oldpeak (ST depression)", st_slope: "ST Slope (0-2)",
  num_major_vessels: "Major Vessels (0-3)", thal: "Thalassemia (0-2)", bmi: "BMI",
};

const DEFAULT_FEATURES: Record<string, number> = {
  age: 55, sex: 1, chest_pain_type: 1, resting_bp: 130, cholesterol: 220,
  fasting_bs: 0, resting_ecg: 0, max_hr: 150, exercise_angina: 0,
  oldpeak: 1.5, st_slope: 1, num_major_vessels: 0, thal: 1, bmi: 27.0,
};

type Step = "upload" | "features" | "processing" | "done";

export default function UploadReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [features, setFeatures] = useState<Record<string, number>>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("random_forest");
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length > 0) {
      const uploadedFile = accepted[0];
      setFile(uploadedFile);
      setStep("features");
      
      // Trigger AI OCR Extraction
      setLoadingOcr(true);
      setOcrWarnings([]);
      try {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        
        const res = await aiApi.post("/ocr/extract", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (res.data && res.data.extracted_features) {
          setFeatures(prev => ({
            ...prev,
            ...res.data.extracted_features
          }));
          setOcrConfidence(res.data.confidence || 0);
          if (res.data.warnings && res.data.warnings.length > 0) {
            setOcrWarnings(res.data.warnings);
          }
        }
      } catch (err: any) {
        console.error("OCR extraction failed:", err);
        setOcrWarnings(["Could not automatically extract features. Please verify or enter values manually."]);
      } finally {
        setLoadingOcr(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/tiff": [".tiff", ".tif"],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  });

  const handleSkipUpload = () => {
    setStep("features");
  };

  const handlePredict = async () => {
    setError("");
    setLoading(true);
    setStep("processing");

    try {
      const res = await api.post("/predictions/predict", {
        features,
        modelName: selectedModel,
      });
      setPredictionId(res.data.data.id);
      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.message || "Prediction failed");
      setStep("features");
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = (key: string, value: string) => {
    setFeatures(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload & Predict</h1>
        <p className="text-gray-400 text-sm mt-1">Upload a medical report or enter features manually</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {(["Upload", "Features", "Processing", "Result"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i <= ["upload", "features", "processing", "done"].indexOf(step)
                ? "gradient-primary text-white" : "bg-[var(--color-surface-3)] text-gray-500"
            }`}>{i + 1}</div>
            <span className="text-sm text-gray-400 hidden sm:block">{s}</span>
            {i < 3 && <div className="w-8 h-px bg-gray-700 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            {...getRootProps()}
            className={`glass-card p-12 text-center cursor-pointer border-2 border-dashed transition-all ${
              isDragActive ? "border-primary-500 bg-primary-500/5" : "border-white/10 hover:border-primary-500/30"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive ? "Drop your file here" : "Drag & drop your medical report"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">Supports PDF, PNG, JPEG, TIFF (max 50MB)</p>
            <button className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
              Browse Files
            </button>
          </div>

          <div className="text-center mt-6">
            <button onClick={handleSkipUpload} className="text-sm text-primary-400 hover:text-primary-300">
              Skip upload → Enter features manually
            </button>
          </div>
        </motion.div>
      )}

      {/* Step: Features */}
      {step === "features" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {file && (
            <div className="glass-card p-4 flex items-center gap-3">
              {file.type.startsWith("image/") ? <Image className="w-8 h-8 text-teal-400" /> : <FileText className="w-8 h-8 text-primary-400" />}
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setFile(null); setStep("upload"); setOcrConfidence(null); setOcrWarnings([]); }}>
                <X className="w-5 h-5 text-gray-500 hover:text-red-400" />
              </button>
            </div>
          )}

          {/* OCR Extraction Status */}
          {loadingOcr && (
            <div className="glass-card p-4 flex items-center gap-3 bg-primary-500/10 border border-primary-500/20 animate-pulse">
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
              <span className="text-sm text-primary-300 font-medium">✨ AI OCR is scanning your document and extracting clinical values...</span>
            </div>
          )}

          {!loadingOcr && ocrConfidence !== null && (
            <div className="glass-card p-4 space-y-2 bg-teal-500/10 border border-teal-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  ✨ AI OCR Extracted Clinical Features
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-medium">
                  Confidence: {Math.round(ocrConfidence * 100)}%
                </span>
              </div>
              {ocrWarnings.length > 0 && (
                <div className="text-xs text-amber-300/80 space-y-1 pt-1 border-t border-teal-500/20">
                  {ocrWarnings.map((w, idx) => (
                    <p key={idx}>⚠️ {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div className="glass-card p-5">
            <label className="block text-sm font-medium text-gray-300 mb-3">Select AI Model</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "random_forest", label: "Random Forest" },
                { value: "xgboost", label: "XGBoost" },
                { value: "neural_network", label: "Neural Network" },
              ].map(m => (
                <button
                  key={m.value}
                  onClick={() => setSelectedModel(m.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedModel === m.value
                      ? "gradient-primary text-white"
                      : "bg-[var(--color-surface-2)] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >{m.label}</button>
              ))}
            </div>
          </div>

          {/* Feature Inputs */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Clinical Features</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input
                    type="number"
                    step="any"
                    value={features[key] ?? 0}
                    onChange={(e) => updateFeature(key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-white/5 text-white text-sm focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "🫀 Run Cardiac Risk Prediction"}
          </button>
        </motion.div>
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Loader2 className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Data</h3>
          <p className="text-gray-400">Running {selectedModel.replace(/_/g, " ")} model with SHAP/LIME explanations...</p>
        </motion.div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Prediction Complete!</h3>
          <p className="text-gray-400 mb-6">Your cardiac risk analysis is ready.</p>
          <button
            onClick={() => navigate(`/dashboard/prediction/${predictionId}`)}
            className="px-8 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all"
          >
            View Results
          </button>
        </motion.div>
      )}
    </div>
  );
}
