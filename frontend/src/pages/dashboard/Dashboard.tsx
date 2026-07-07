import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, FileText, AlertTriangle, Heart, TrendingUp, Users, Brain } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import api from "@/services/api";
import { getRiskColor } from "@/lib/utils";

const RISK_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#dc2626"];

export default function Dashboard() {
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get("/dashboard/summary").then(r => r.data.data),
  });

  const { data: charts } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: () => api.get("/dashboard/charts").then(r => r.data.data),
  });

  const stats = [
    { icon: Activity, label: "Total Predictions", value: summary?.totalPredictions || 0, color: "text-primary-400", bg: "bg-primary-500/10" },
    { icon: FileText, label: "Today's Reports", value: summary?.todayReports || 0, color: "text-teal-400", bg: "bg-teal-500/10" },
    { icon: AlertTriangle, label: "High Risk Patients", value: summary?.highRiskPatients || 0, color: "text-red-400", bg: "bg-red-500/10" },
    { icon: Heart, label: "Avg Heart Age", value: summary?.averageHeartAge ? `${Math.round(summary.averageHeartAge)}y` : "N/A", color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  const riskData = charts?.riskDistribution
    ? Object.entries(charts.riskDistribution).map(([name, value]) => ({ name, value: value as number }))
    : [{ name: "LOW", value: 4 }, { name: "MODERATE", value: 3 }, { name: "HIGH", value: 2 }, { name: "CRITICAL", value: 1 }];

  const trendData = [
    { date: "Mon", predictions: 12, risk: 0.35 },
    { date: "Tue", predictions: 19, risk: 0.42 },
    { date: "Wed", predictions: 15, risk: 0.38 },
    { date: "Thu", predictions: 22, risk: 0.45 },
    { date: "Fri", predictions: 18, risk: 0.40 },
    { date: "Sat", predictions: 8, risk: 0.32 },
    { date: "Sun", predictions: 5, risk: 0.28 },
  ];

  const featureData = charts?.topRiskFactors || [
    { feature: "Age", importance: 0.18 },
    { feature: "Cholesterol", importance: 0.15 },
    { feature: "Max HR", importance: 0.14 },
    { feature: "Chest Pain", importance: 0.12 },
    { feature: "Oldpeak", importance: 0.10 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your cardiac health analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prediction Trend */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Prediction Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
              <Area type="monotone" dataKey="predictions" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPred)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {riskData.map((_, i) => (
                  <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {riskData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_COLORS[i] }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="text-white font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Top Risk Factors</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={featureData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" stroke="#6b7280" fontSize={12} />
            <YAxis type="category" dataKey="feature" stroke="#6b7280" fontSize={12} width={80} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
            />
            <Bar dataKey="importance" fill="#3b82f6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
