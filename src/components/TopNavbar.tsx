import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  FileText, 
  Globe,
  Sun,
  Moon,
  Building2,
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';
import { NavigationTab, UserAvatar, UserRole } from '../types';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface TopNavbarProps {
  user: UserAvatar;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenLandingPage?: () => void;
  onOpenPartnerLandingPage?: () => void;
  onSwitchRole?: (newRole: UserRole) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenLandingPage,
  onOpenPartnerLandingPage,
  onSwitchRole,
}) => {
  const { isDay, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const xpPercentage = Math.min(100, Math.round((user.currentXp / user.nextLevelXp) * 100));
  const isPartner = user.role === 'partner';
  const partnerPayout = user.partnerData?.readyPayout ?? 24182500;
  const partnerBusinessName = user.partnerData?.businessName ?? 'Champions Arena';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 py-2.5 transition-colors ${
      isDay 
        ? 'bg-white/95 border-slate-200 shadow-sm' 
        : 'bg-[#121212]/95 border-[#9E9E9E]/10'
    }`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand Identity & Role-specific Status */}
        <div className="flex items-center justify-between md:justify-start gap-4 sm:gap-6">
          <div 
            onClick={() => {
              soundFx.playClick();
              onTabChange(isPartner ? 'partner' : 'home');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg transition-transform group-hover:scale-105 ${
              isPartner 
                ? 'bg-gradient-to-br from-emerald-500 to-[#3D4BFF] shadow-emerald-500/20' 
                : 'bg-[#3D4BFF] shadow-[#3D4BFF]/30'
            }`}>
              {isPartner ? 'MP' : 'SS'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`text-xs uppercase tracking-widest font-bold ${
                  isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                }`}>
                  Socia Sport v1.2
                </h1>
                
                {/* Role Pill Badge */}
                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black uppercase flex items-center gap-1 ${
                  isPartner
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'bg-[#3D4BFF] text-white'
                }`}>
                  {isPartner ? (
                    <>
                      <Building2 className="w-2.5 h-2.5" /> MITRA LAPANGAN
                    </>
                  ) : (
                    <>
                      <User className="w-2.5 h-2.5" /> PEMAIN / ATLET
                    </>
                  )}
                </span>

                <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold hidden sm:inline ${
                  isDay ? 'bg-amber-100 text-amber-800' : 'bg-indigo-900/60 text-indigo-200'
                }`}>
                  {isDay ? '☀️ DAY' : '🌙 NIGHT'}
                </span>
              </div>

              {/* Differentiated metrics: Normal User (LVL/XP) vs Partner User (Venue Name & Tier) */}
              {isPartner ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`font-black text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-[260px] ${
                    isDay ? 'text-slate-900' : 'text-white'
                  }`}>
                    {partnerBusinessName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className={`font-black text-xl sm:text-2xl italic tracking-tight ${
                    isDay ? 'text-emerald-600' : 'text-[#CCFF00]'
                  }`}>
                    LVL {user.level}
                  </span>
                  <div className={`w-24 sm:w-36 h-2 rounded-full overflow-hidden border ${
                    isDay ? 'bg-slate-200 border-slate-300' : 'bg-[#121212] border-[#9E9E9E]/20'
                  }`}>
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isDay ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]'
                      }`} 
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-mono hidden sm:inline ${
                    isDay ? 'text-slate-500' : 'text-[#9E9E9E]'
                  }`}>
                    XP {user.currentXp}/{user.nextLevelXp}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Theme & Sound Toggle */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onSwitchRole && (
              <button
                onClick={() => {
                  soundFx.playVictory();
                  onSwitchRole(isPartner ? 'player' : 'partner');
                }}
                title={isPartner ? "Ganti ke Mode Pemain" : "Ganti ke Mode Mitra"}
                className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                  isPartner
                    ? 'bg-[#3D4BFF] text-white border-[#3D4BFF]'
                    : 'bg-[#CCFF00] text-black border-[#CCFF00]'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="text-[10px]">{isPartner ? 'Pemain' : 'Mitra'}</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-lg border transition-colors ${
                isDay
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-[#24242A] text-white border-[#9E9E9E]/10'
              }`}
            >
              {isDay ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#CCFF00]" />}
            </button>
            <button
              onClick={handleToggleMute}
              aria-label="Toggle SFX Sound"
              className={`p-2 rounded-lg border transition-colors ${
                isDay
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-[#24242A] text-[#9E9E9E] border-[#9E9E9E]/10 hover:text-white'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Right Status Cards (Credits vs Partner Saldo) + Role Switcher */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-2.5">
          {/* Partner Payout Balance vs Player Sociacoins */}
          {isPartner ? (
            <div 
              onClick={() => {
                soundFx.playClick();
                onTabChange('partner');
              }}
              title="Saldo Siap Dicairkan ke Rekening BCA"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border flex-1 sm:flex-none cursor-pointer transition-transform hover:scale-[1.02] ${
                isDay
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Saldo Siap Cair</span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                Rp {partnerPayout.toLocaleString('id-ID')}
              </span>
            </div>
          ) : (
            <div 
              onClick={() => {
                soundFx.playClick();
                onTabChange('redeem');
              }}
              title="Sociacoins Gamifikasi Pemain"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border flex-1 sm:flex-none cursor-pointer ${
                isDay
                  ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                  : 'bg-[#1C2454] border-[#3D4BFF]/30 text-white'
              }`}
            >
              <span className="text-[10px] block text-[#3D4BFF] font-bold uppercase tracking-wider">Credits</span>
              <span className="font-mono text-sm sm:text-base font-bold">
                {user.sociacoins.toLocaleString()} <span className="text-[#3D4BFF]">◈</span>
              </span>
            </div>
          )}

          {/* Quick Role Switcher Button */}
          {onSwitchRole && (
            <button
              onClick={() => {
                soundFx.playVictory();
                onSwitchRole(isPartner ? 'player' : 'partner');
              }}
              title={isPartner ? "Beralih ke Akun Pemain" : "Beralih ke Akun Mitra Lapangan"}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer hover:scale-105 ${
                isPartner
                  ? 'bg-gradient-to-r from-[#3D4BFF] to-[#00b0ff] text-white border-transparent shadow-md shadow-[#3D4BFF]/20'
                  : 'bg-gradient-to-r from-emerald-500 to-[#CCFF00] text-black border-transparent shadow-md shadow-emerald-500/20'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isPartner ? 'Mode Pemain' : 'Mode Mitra'}</span>
            </button>
          )}

          {/* Partner Tab / Management shortcut */}
          <button
            onClick={() => {
              soundFx.playClick();
              onTabChange('partner');
            }}
            title="Portal Mitra Lapangan"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === 'partner'
                ? 'bg-[#3D4BFF] text-white border-[#3D4BFF] shadow-md shadow-[#3D4BFF]/20'
                : isDay
                ? 'bg-white text-slate-700 hover:text-slate-900 border-slate-300 hover:border-[#3D4BFF]'
                : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border-[#9E9E9E]/20 hover:border-[#CCFF00]'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${activeTab === 'partner' ? 'text-white' : 'text-[#3D4BFF]'}`} />
            <span className="hidden sm:inline">Mitra Lapangan</span>
            <span className="sm:hidden">Mitra</span>
          </button>

          {/* Theme Switcher Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Night/Day Theme"
            title={isDay ? "Ganti ke Night Mode" : "Ganti ke Day Mode"}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDay
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-[#24242A] hover:bg-white/10 text-white border-[#9E9E9E]/20 hover:border-[#CCFF00]'
            }`}
          >
            {isDay ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Day</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Night</span>
              </>
            )}
          </button>

          {/* Landing Page Link */}
          {onOpenLandingPage && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenLandingPage();
              }}
              title="Lihat Landing Page Pemain"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDay
                  ? 'bg-white text-slate-700 hover:text-slate-900 border-slate-300 hover:border-slate-400'
                  : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border-[#9E9E9E]/20 hover:border-[#CCFF00]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#3D4BFF]" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          )}

          {/* Partner Landing Page Link */}
          {onOpenPartnerLandingPage && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenPartnerLandingPage();
              }}
              title="Lihat Landing Page Mitra Lapangan"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDay
                  ? 'bg-white text-slate-700 hover:text-slate-900 border-slate-300 hover:border-[#3D4BFF]'
                  : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border-[#9E9E9E]/20 hover:border-[#CCFF00]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mitra Web</span>
            </button>
          )}

          {/* Specs Tab Quick CTA */}
          <button
            id="btn-nav-blueprint-top"
            onClick={() => {
              soundFx.playClick();
              onTabChange('blueprint');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeTab === 'blueprint'
                ? isDay
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold'
                  : 'bg-[#2D3A1B] text-[#CCFF00] border-[#CCFF00]'
                : isDay
                ? 'bg-white text-slate-600 hover:text-slate-900 border-slate-300'
                : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border-[#9E9E9E]/20 hover:border-[#CCFF00]'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${isDay ? 'text-emerald-600' : 'text-[#CCFF00]'}`} />
            <span className="hidden sm:inline">Spec</span>
          </button>

          {/* Desktop Sound Mute Toggle */}
          <button
            onClick={handleToggleMute}
            aria-label="Toggle SFX Sound"
            className={`hidden md:flex p-2 rounded-xl border transition-colors cursor-pointer ${
              isDay
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-[#24242A] hover:bg-white/10 text-[#9E9E9E] hover:text-white border-[#9E9E9E]/10'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className={`w-4 h-4 ${isDay ? 'text-emerald-600' : 'text-[#CCFF00]'}`} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
