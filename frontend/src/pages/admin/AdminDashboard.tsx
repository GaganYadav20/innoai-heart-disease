import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, FileText, Cpu, Shield, Activity, Server, Database, HardDrive } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "@/services/api";

export default function AdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics").then(r => r.data.data),
  });

  const { data: health } = useQuery({
    queryKey: ["admin-health"],
    queryFn: () => api.get("/admin/health").then(r => r.data.data),
  });

  const { data: models } = useQuery({
    queryKey: ["admin-models"],
    queryFn: () => api.get("/admin/models").then(r => r.data.data),
  });

  const summary = analytics?.summary;

  const adminStats = [
    { icon: Users, label: "Total Users", value: summary?.totalUsers || 0, color: "text-primary-400", bg: "bg-primary-500/10" },
    { icon: Users, label: "Doctors", value: summary?.totalDoctors || 0, color: "text-teal-400", bg: "bg-teal-500/10" },
    { icon: Users, label: "Patients", value: summary?.totalPatients || 0, color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Activity, label: "Predictions", value: summary?.totalPredictions || 0, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-400" /> Admin Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">System administration and monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, i) => (
          <motion.div key={stat.label} className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">System Health</h3>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              {health?.status || "HEALTHY"}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Memory Usage</span>
                <span className="text-white">{health ? `${Math.round((health.totalMemory - health.freeMemory) / 1024 / 1024)}MB / ${Math.round(health.maxMemory / 1024 / 1024)}MB` : "N/A"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-teal-500"
                  style={{ width: health ? `${((health.totalMemory - health.freeMemory) / health.maxMemory) * 100}%` : "0%" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-[var(--color-surface-2)]">
                <div className="text-gray-500">Processors</div>
                <div className="text-white font-medium">{health?.processors || "N/A"}</div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-surface-2)]">
                <div className="text-gray-500">Java Version</div>
                <div className="text-white font-medium">{health?.javaVersion || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Registry */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">AI Models</h3>
          </div>
          <div className="space-y-3">
            {(models || []).map((model: any) => (
              <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)] border border-white/3">
                <div>
                  <div className="text-sm font-medium text-white">{model.modelName?.replace(/_/g, " ")}</div>
                  <div className="text-xs text-gray-500">v{model.version} • Accuracy: {model.accuracy ? (model.accuracy * 100).toFixed(1) + "%" : "N/A"}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs ${model.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                  {model.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
