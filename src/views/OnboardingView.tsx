import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, ArrowRight, User, Building2, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

interface OnboardingViewProps {
  onComplete: (nickname: string, role?: UserRole) => void;
  defaultRole?: UserRole;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ 
  onComplete, 
  defaultRole = 'player' 
}) => {
  const { isDay } = useTheme();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [nickname, setNickname] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("Nama / Nickname tidak boleh kosong.");
      return;
    }
    if (nickname.length < 3) {
      setError("Nama / Nickname minimal 3 karakter.");
      return;
    }
    if (role === 'partner' && !businessName.trim()) {
      setError("Nama Arena / Venue lapangan wajib diisi untuk Mitra.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const updateData: any = {
          displayName: nickname.trim(),
          role: role,
          onboardingCompleted: true,
        };
        if (role === 'partner') {
          updateData.partnerBusinessName = businessName.trim();
        }
        await setDoc(userDocRef, updateData, { merge: true });
      }
      
      soundFx.playVictory();
      onComplete(nickname.trim(), role);
    } catch (err: any) {
      console.warn("Fallback offline nickname onboarding:", err);
      soundFx.playVictory();
      onComplete(nickname.trim(), role);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 selection:bg-[#CCFF00] selection:text-black transition-colors ${
      isDay ? 'bg-slate-50' : 'bg-[#121212]'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#CCFF00]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#3D4BFF]/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden ${
          isDay ? 'bg-white border-slate-200' : 'bg-[#1A1A1F] border-[#9E9E9E]/10'
        }`}>
          {/* Top Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CCFF00] via-[#3D4BFF] to-emerald-400" />
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3D4BFF] text-white">
                SETUP PROFIL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00] text-black">
                SOCIA SPORT V1.2
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1.5 ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Tentukan <span className="text-[#3D4BFF]">Peran Anda</span>
            </h1>
            <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
              Pilih apakah Anda mendaftar sebagai Atlet Pemain (mabar & booking) atau Mitra Pengelola Lapangan.
            </p>
          </div>

          {/* Role selector cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRole('player');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === 'player'
                  ? 'border-[#3D4BFF] bg-[#3D4BFF]/10 ring-2 ring-[#3D4BFF]'
                  : isDay
                  ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  : 'border-white/10 bg-[#24242A] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <User className={`w-5 h-5 ${role === 'player' ? 'text-[#3D4BFF]' : 'text-[#9E9E9E]'}`} />
                {role === 'player' && <CheckCircle2 className="w-4 h-4 text-[#3D4BFF]" />}
              </div>
              <div>
                <p className={`text-xs font-black uppercase ${isDay ? 'text-slate-900' : 'text-white'}`}>Pemain / Atlet</p>
                <p className={`text-[10px] ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>Mabar & Booking</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRole('partner');
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === 'partner'
                  ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500'
                  : isDay
                  ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  : 'border-white/10 bg-[#24242A] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className={`w-5 h-5 ${role === 'partner' ? 'text-emerald-400' : 'text-[#9E9E9E]'}`} />
                {role === 'partner' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div>
                <p className={`text-xs font-black uppercase ${isDay ? 'text-slate-900' : 'text-white'}`}>Mitra Lapangan</p>
                <p className={`text-[10px] ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>Owner & Pengelola</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="nickname" className={`text-xs font-bold uppercase tracking-wider block ${
                isDay ? 'text-slate-700' : 'text-white'
              }`}>
                {role === 'partner' ? 'Nama Pemilik / PIC Venue' : 'Nickname Avatar Gamifikasi'}
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={role === 'partner' ? 'Misal: Budi Santoso' : 'Misal: STRIKER_99'}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                  isDay
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#121212] border-[#9E9E9E]/20 text-white placeholder-white/30'
                }`}
                maxLength={25}
                disabled={isLoading}
              />
            </div>

            {role === 'partner' && (
              <div className="space-y-1.5">
                <label htmlFor="businessName" className={`text-xs font-bold uppercase tracking-wider block ${
                  isDay ? 'text-slate-700' : 'text-white'
                }`}>
                  Nama Lapangan / Sports Complex
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Misal: Gelora Futsal & Badminton Center"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#121212] border-[#9E9E9E]/20 text-white placeholder-white/30'
                  }`}
                  maxLength={40}
                  disabled={isLoading}
                />
              </div>
            )}

            {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !nickname.trim()}
              className="w-full py-3.5 rounded-xl bg-[#CCFF00] text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-[#b8e600] transition-transform hover:scale-[1.01] shadow-[0_0_15px_rgba(204,255,0,0.25)] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Lanjut ke Aplikasi <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
