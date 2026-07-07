import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Brain, Shield, Clock, Cpu, Download, Printer, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import api from "@/services/api";
import { getRiskColor, getRiskBadgeClass, formatDateTime } from "@/lib/utils";

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: prediction, isLoading } = useQuery({
    queryKey: ["prediction", id],
    queryFn: () => api.get(`/predictions/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!prediction) return <div className="text-center text-gray-400 py-20">Prediction not found</div>;

  const riskScore = parseFloat(prediction.riskScore) * 100;
  const confidenceScore = parseFloat(prediction.confidenceScore) * 100;
  const riskColor = getRiskColor(prediction.riskCategory);

  // Prepare SHAP chart data
  const shapData = prediction.shapValues
    ? Object.entries(prediction.shapValues)
        .map(([key, val]: [string, any]) => ({
          feature: val?.display_name || key,
          value: typeof val === "object" ? val.value || 0 : val,
        }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 10)
    : [];

  // Feature importance data
  const importanceData = prediction.featureImportance
    ? Object.entries(prediction.featureImportance)
        .map(([key, val]: [string, any]) => ({
          feature: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          value: typeof val === "number" ? val : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prediction Result</h1>
          <p className="text-gray-400 text-sm mt-1">
            {prediction.modelName?.replace(/_/g, " ")} v{prediction.modelVersion} • {formatDateTime(prediction.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] text-gray-300 hover:text-white transition-colors text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] text-gray-300 hover:text-white transition-colors text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Risk Score + Heart Age + Confidence */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Risk Score Gauge */}
        <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Cardiac Risk Score</h3>
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none" stroke={riskColor} strokeWidth="10"
                strokeDasharray={`${riskScore * 3.14} ${314 - riskScore * 3.14}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: riskColor }}>{riskScore.toFixed(1)}%</span>
            </div>
          </div>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${getRiskBadgeClass(prediction.riskCategory)}`}>
            {prediction.riskCategory} RISK
          </span>
        </motion.div>

        {/* Heart Age */}
        <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Heart Age</h3>
          <Heart className="w-16 h-16 mx-auto mb-3 animate-heartbeat" style={{ color: riskColor }} />
          <div className="text-4xl font-bold text-white mb-1">{prediction.heartAge}</div>
          <div className="text-sm text-gray-500">years old</div>
          {prediction.inputFeatures?.age && (
            <div className="mt-3 text-xs text-gray-400">
              Chronological: {prediction.inputFeatures.age}y •
              <span style={{ color: prediction.heartAge > prediction.inputFeatures.age ? "#ef4444" : "#22c55e" }}>
                {prediction.heartAge > prediction.inputFeatures.age ? " +" : " "}
                {prediction.heartAge - prediction.inputFeatures.age}y
              </span>
            </div>
          )}
        </motion.div>

        {/* Confidence & Model */}
        <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Model Confidence</h3>
          <div className="text-4xl font-bold text-teal-400 mb-2">{confidenceScore.toFixed(1)}%</div>
          <div className="w-full h-3 rounded-full bg-[var(--color-surface-3)] overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500" style={{ width: `${confidenceScore}%` }} />
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Model</span>
              <span className="text-white">{prediction.modelName?.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Latency</span>
              <span className="text-white">{prediction.predictionTimeMs}ms</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SHAP Values Chart */}
      {shapData.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">SHAP Feature Contributions</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shapData} layout="vertical" margin={{ left: 120 }}>
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis type="category" dataKey="feature" stroke="#6b7280" fontSize={11} width={120} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                {shapData.map((entry, i) => (
                  <Bar key={i} dataKey="value" fill={entry.value >= 0 ? "#ef4444" : "#22c55e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Feature Importance */}
      {importanceData.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-white">Feature Importance</h3>
          </div>
          <div className="space-y-3">
            {importanceData.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-28 text-sm text-gray-400 truncate">{item.feature}</span>
                <div className="flex-1 h-6 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-white font-medium w-14 text-right">{(item.value * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {prediction.recommendations?.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {prediction.recommendations.map((rec: any, i: number) => (
              <div key={i} className={`p-4 rounded-xl border ${
                rec.priority === "CRITICAL" ? "border-red-500/20 bg-red-500/5" :
                rec.priority === "HIGH" ? "border-amber-500/20 bg-amber-500/5" :
                "border-white/5 bg-[var(--color-surface-2)]"
              }`}>
                <div className="flex items-start gap-3">
                  {rec.priority === "CRITICAL" ? <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" /> :
                   rec.priority === "HIGH" ? <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" /> :
                   <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />}
                  <div>
                    <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
