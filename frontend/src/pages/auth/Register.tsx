import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(["PATIENT", "DOCTOR"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { register: reg, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "PATIENT" },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
      });
      const { accessToken, refreshToken, user } = res.data.data;
      login(user, accessToken, refreshToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-surface-2)] border border-white/5 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all";

  return (
    <div className="min-h-screen flex bg-[var(--color-surface-0)]">
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-primary-400 animate-heartbeat" />
            <span className="text-xl font-bold text-gradient">CardioVision AI</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400 mb-8">Join the cardiac risk prediction platform</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              {(["PATIENT", "DOCTOR"] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all ${
                    watch("role") === role
                      ? "border-primary-500 bg-primary-500/10 text-primary-400"
                      : "border-white/5 text-gray-400 hover:border-white/10"
                  }`}
                >
                  <input type="radio" value={role} {...reg("role")} className="hidden" />
                  {role === "PATIENT" ? <User className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  <span className="text-sm font-medium">{role === "PATIENT" ? "Patient" : "Doctor"}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...reg("firstName")} placeholder="First name" className={inputClass} />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
              </div>
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input {...reg("lastName")} placeholder="Last name" className={inputClass} />
                </div>
                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input {...reg("email")} type="email" placeholder="Email address" className={inputClass} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input {...reg("phone")} placeholder="Phone (optional)" className={inputClass} />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input {...reg("password")} type={showPassword ? "text" : "password"} placeholder="Password (min 8 chars)" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-[var(--color-surface-2)] border border-white/5 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input {...reg("confirmPassword")} type="password" placeholder="Confirm password" className={inputClass} />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center gradient-hero relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md px-8">
          <Heart className="w-20 h-20 text-primary-400 mx-auto mb-6 animate-heartbeat" />
          <h2 className="text-3xl font-bold text-white mb-4">Your Heart Health Journey</h2>
          <p className="text-gray-400">Start tracking and predicting cardiac risk with AI-powered insights.</p>
        </div>
      </div>
    </div>
  );
}
