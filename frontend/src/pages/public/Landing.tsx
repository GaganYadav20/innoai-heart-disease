import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, Brain, Shield, Zap, BarChart3, FileText,
  Stethoscope, Activity, ArrowRight, Star, CheckCircle2,
  Cpu, Lock, Globe
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const features = [
  { icon: Brain, title: "AI-Powered Analysis", desc: "Advanced ML models including CNN, LSTM, XGBoost, and Random Forest for accurate cardiac risk prediction." },
  { icon: Activity, title: "Real-time Monitoring", desc: "Track cardiac health metrics with real-time dashboard, trend analysis, and predictive alerts." },
  { icon: Shield, title: "Explainable AI", desc: "SHAP and LIME explanations provide transparent, interpretable predictions for clinical decision support." },
  { icon: FileText, title: "OCR Report Scanning", desc: "Automated extraction of clinical values from medical reports using advanced OCR technology." },
  { icon: BarChart3, title: "Heart Age Estimation", desc: "Biological heart age prediction comparing cardiovascular health against chronological age." },
  { icon: Lock, title: "Enterprise Security", desc: "JWT authentication, role-based access, encrypted storage, and full audit trail compliance." },
];

const stats = [
  { value: "95.2%", label: "Model Accuracy" },
  { value: "< 100ms", label: "Inference Time" },
  { value: "14+", label: "Clinical Features" },
  { value: "5+", label: "AI Models" },
];

const techStack = [
  "React 19", "Spring Boot 3", "FastAPI", "PostgreSQL",
  "TensorFlow", "SHAP/LIME", "Docker", "TypeScript"
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary-400 animate-heartbeat" />
            <span className="text-xl font-bold text-gradient">CardioVision AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            {/* <a href="#technology" className="text-sm text-gray-400 hover:text-white transition-colors">Technology</a> */}
            <a href="#research" className="text-sm text-gray-400 hover:text-white transition-colors">Research</a>
            <a href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium text-white px-5 py-2.5 rounded-xl gradient-primary hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center max-w-4xl mx-auto" {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">Enterprise Healthcare AI Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Predict Cardiac</span>
              <br />
              <span className="text-gradient">Risk with AI</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade cardiac risk prediction platform powered by advanced machine learning.
              Featuring explainable AI, OCR report scanning, and clinical decision support for
              healthcare professionals and researchers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all"
              >
                <Stethoscope className="w-5 h-5" />
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive platform combining advanced AI, clinical analytics, and enterprise security
              for accurate cardiac risk assessment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-8 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      {/* <section id="technology" className="py-24 px-6 bg-[var(--color-surface-1)]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Built with Modern Technology</h2>
            <p className="text-gray-400">Enterprise-grade microservices architecture</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {techStack.map((tech) => (
              <span key={tech} className="px-5 py-3 rounded-xl glass-card text-sm font-medium text-gray-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary-400" />
                {tech}
              </span>
            ))}
          </div>

          {/* Architecture Diagram
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="px-8 py-4 rounded-xl bg-primary-600/20 border border-primary-500/30 text-center">
                <div className="text-primary-300 font-semibold">React 19 Frontend</div>
                <div className="text-xs text-gray-500">TypeScript • Tailwind • shadcn/ui</div>
              </div>
              <div className="w-px h-8 bg-primary-500/30" />
              <div className="px-8 py-4 rounded-xl bg-teal-600/20 border border-teal-500/30 text-center">
                <div className="text-teal-300 font-semibold">Spring Boot API Gateway</div>
                <div className="text-xs text-gray-500">Java 21 • JWT • Spring Security</div>
              </div>
              <div className="w-px h-8 bg-teal-500/30" />
              <div className="flex gap-6 items-start">
                <div className="px-6 py-4 rounded-xl bg-purple-600/20 border border-purple-500/30 text-center">
                  <div className="text-purple-300 font-semibold">FastAPI AI Engine</div>
                  <div className="text-xs text-gray-500">TensorFlow • SHAP • LIME</div>
                </div>
                <div className="px-6 py-4 rounded-xl bg-amber-600/20 border border-amber-500/30 text-center">
                  <div className="text-amber-300 font-semibold">PostgreSQL</div>
                  <div className="text-xs text-gray-500">Flyway • Normalized Schema</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* ── Research ── */}
      <section id="research" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Research-Grade Platform</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Designed for academic research, PhD work, and clinical validation with full explainability and reproducibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Explainable AI", desc: "SHAP waterfall plots, LIME explanations, feature importance rankings, and decision support visualizations." },
              { icon: Globe, title: "Multi-Model Support", desc: "Compare predictions across CNN, LSTM, Random Forest, XGBoost, and hybrid models for robust analysis." },
              { icon: BarChart3, title: "Publication Ready", desc: "Generate comprehensive reports with ROC curves, confusion matrices, and statistical metrics for research papers." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="glass-card p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <item.icon className="w-10 h-10 text-primary-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Cardiac Care?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join healthcare professionals and researchers worldwide using CardioVision AI for
              accurate, explainable cardiac risk prediction.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary-400" />
            <span className="font-semibold text-gradient">CardioVision AI</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 CardioVision AI. Enterprise Cardiac Risk Prediction Platform.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
