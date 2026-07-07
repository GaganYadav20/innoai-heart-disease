import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Calendar, Heart, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function Profile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile").then(r => r.data.data),
  });

  const [form, setForm] = useState<Record<string, any>>({});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/profile", { ...profile, ...form });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      updateUser({
        firstName: form.firstName || profile?.firstName,
        lastName: form.lastName || profile?.lastName,
        fullName: `${form.firstName || profile?.firstName} ${form.lastName || profile?.lastName}`,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface-2)] border border-white/5 text-white placeholder-gray-500 focus:border-primary-500 outline-none transition-all text-sm";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information and preferences</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          Profile updated successfully!
        </motion.div>
      )}

      {/* Avatar & Basic Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-gray-400 text-sm">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium gradient-primary text-white">
              {profile?.role}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">First Name</label>
            <input defaultValue={profile?.firstName} onChange={e => update("firstName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Last Name</label>
            <input defaultValue={profile?.lastName} onChange={e => update("lastName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email</label>
            <input value={profile?.email} disabled className={`${inputClass} opacity-60`} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
            <input defaultValue={profile?.phone} onChange={e => update("phone", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Health Info (Patients) */}
      {profile?.role === "PATIENT" && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-400" /> Health Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Date of Birth</label>
              <input type="date" defaultValue={profile?.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Gender</label>
              <select defaultValue={profile?.gender || ""} onChange={e => update("gender", e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Blood Group</label>
              <select defaultValue={profile?.bloodGroup || ""} onChange={e => update("bloodGroup", e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Height (cm)</label>
              <input type="number" defaultValue={profile?.heightCm} onChange={e => update("heightCm", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Weight (kg)</label>
              <input type="number" defaultValue={profile?.weightKg} onChange={e => update("weightKg", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Allergies</label>
              <input defaultValue={profile?.allergies} onChange={e => update("allergies", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
      </button>
    </div>
  );
}
