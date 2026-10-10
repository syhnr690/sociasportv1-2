import React from 'react';
import { motion } from 'motion/react';
import { 
  Gamepad2, 
  MapPin, 
  ArrowRight, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  LogOut, 
  Sun, 
  Moon, 
  Building2, 
  Sparkles,
  Users
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { UserAvatar } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LandingPageViewProps {
  onJoin: (isLogin?: boolean) => void;
  isAuthenticated?: boolean;
  currentUser?: UserAvatar | null;
  onEnterApp?: () => void;
  onSignOut?: () => void;
  onOpenPartner?: () => void;
  onOpenPartnerLogin?: () => void;
  onOpenPartnerSignup?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ 
  onJoin, 
  isAuthenticated = false, 
  currentUser = null, 
  onEnterApp,
  onSignOut,
  onOpenPartner,
  onOpenPartnerLogin,
  onOpenPartnerSignup,
}) => {
  const { isDay, toggleTheme } = useTheme();

  const handleCtaClick = (isLogin: boolean = false) => {
    soundFx.playClick();
    if (isAuthenticated && onEnterApp) {
      onEnterApp();
    } else {
      onJoin(isLogin);
    }
  };

  return (
    <div className={`min-h-screen selection:bg-[#CCFF00] selection:text-black overflow-x-hidden font-sans transition-colors ${
      isDay ? 'bg-[#F4F6F9] text-slate-900' : 'bg-[#121212] text-white'
    }`}>
      {/* Background Animated Blobs for Atmosphere */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#3D4BFF] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-blob pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#CCFF00] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-blob animation-delay-2000 pointer-events-none" />

      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors ${
        isDay ? 'bg-white/90 border-slate-200' : 'bg-[#121212]/80 border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3D4BFF] text-white flex items-center justify-center font-black italic shadow-lg shadow-[#3D4BFF]/30">
              SS
            </div>
            <div>
              <span className={`font-display font-black text-xl tracking-tighter uppercase ${
                isDay ? 'text-slate-900' : 'text-white'
              }`}>
                Socia<span className="text-[#3D4BFF]">sport</span>
              </span>
              <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#CCFF00] text-black">
                v1.2
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Day / Night Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isDay
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#24242A] hover:bg-white/10 text-white border-white/10'
              }`}
            >
              {isDay ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#CCFF00]" />
                  <span className="hidden sm:inline">Night</span>
                </>
              )}
            </button>

            {/* Mitra Lapangan Quick Link */}
            {onOpenPartner && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenPartner();
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isDay
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-[#24242A] hover:bg-white/10 text-[#9E9E9E] hover:text-white border-white/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#3D4BFF]" />
                <span className="hidden sm:inline">Portal Mitra</span>
                <span className="sm:hidden">Mitra</span>
              </button>
            )}

            {isAuthenticated && currentUser ? (
              <>
                <div className={`hidden sm:flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs ${
                  isDay ? 'bg-slate-100 border-slate-300' : 'bg-[#1C1C22] border-white/10'
                }`}>
                  {currentUser.role === 'partner' ? (
                    <>
                      <span className="text-emerald-500 font-black flex items-center gap-1">🏢 MITRA</span>
                      <span className="text-white/40">|</span>
                      <span className="font-semibold truncate max-w-[140px]">{currentUser.partnerData?.businessName || currentUser.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#3D4BFF] font-black italic">LVL {currentUser.level}</span>
                      <span className="text-white/40">|</span>
                      <span className="font-semibold truncate max-w-[120px]">{currentUser.name}</span>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => handleCtaClick(false)}
                  className="px-4 sm:px-5 py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black uppercase italic tracking-wider rounded-lg transition-transform hover:scale-105 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  {currentUser.role === 'partner' ? <Building2 className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
                  <span>{currentUser.role === 'partner' ? 'Buka Dashboard' : 'Masuk Game'}</span>
                </button>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Keluar / Sign Out"
                    className="p-2 text-[#9E9E9E] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleCtaClick(true)}
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wider hidden sm:block cursor-pointer transition-colors ${
                    isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleCtaClick(false)}
                  className="px-4 sm:px-5 py-2.5 bg-[#3D4BFF] hover:bg-[#303ed9] text-white text-xs font-black uppercase italic tracking-wider rounded-lg transition-all shadow-lg shadow-[#3D4BFF]/25 hover:scale-105 cursor-pointer"
                >
                  Join Squad
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {isAuthenticated && currentUser ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pemain Terhubung: {currentUser.name} (LVL {currentUser.level})</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3D4BFF]/10 border border-[#3D4BFF]/30 text-[#3D4BFF] text-[10px] font-bold uppercase tracking-widest font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>Socia Sport v1.2 • Gamified Sports & Venue Hub</span>
              </div>
            )}
            
            <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.08] tracking-tighter uppercase ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Main Di Dunia Nyata.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D4BFF] via-[#00a6ff] to-[#CCFF00]">
                Aturan Gamers.
              </span>
            </h1>
            
            <p className={`text-sm sm:text-base max-w-lg leading-relaxed ${
              isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
            }`}>
              Super-app olahraga gamifikasi pertama di Indonesia: Point Blank tactical matchmaking, 3D avatar progression ala Roblox, booking lapangan instan, dan portal sewa mitra lapangan olahraga.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button 
                onClick={() => handleCtaClick(false)}
                className="px-8 py-4 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-sm uppercase italic tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(204,255,0,0.35)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Lanjut Bermain / Masuk Game' : 'Mulai Main Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenPartner && (
                <div className="flex flex-col items-center sm:items-start gap-1.5">
                  <button 
                    onClick={() => {
                      soundFx.playClick();
                      onOpenPartner();
                    }}
                    className={`px-6 py-4 rounded-xl border text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
                      isDay
                        ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                        : 'bg-[#24242A] hover:bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#3D4BFF]" />
                    <span>Portal Mitra Lapangan</span>
                  </button>
                  {onOpenPartnerLogin && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onOpenPartnerLogin();
                      }}
                      className="text-[11px] font-bold text-[#3D4BFF] hover:underline cursor-pointer px-1"
                    >
                      Sudah jadi mitra? Login Portal &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className={`flex items-center gap-3 text-xs font-mono pt-2 ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#24242A] border-2 border-[#121212] flex items-center justify-center text-[10px]">⚽</div>
                <div className="w-7 h-7 rounded-full bg-[#1C2454] border-2 border-[#121212] flex items-center justify-center text-[10px]">🏸</div>
                <div className="w-7 h-7 rounded-full bg-[#2D3A1B] border-2 border-[#121212] flex items-center justify-center text-[10px]">🏀</div>
              </div>
              <span>10,000+ Pemain Terdaftar • 120+ Mitra Lapangan</span>
            </div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto relative flex items-center justify-center">
              {/* Glass Card 1: Match Found */}
              <div className={`absolute top-6 right-0 w-64 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl z-20 ${
                isDay ? 'bg-white/95 border-slate-200' : 'bg-[#24242A]/90 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#3D4BFF] font-mono font-bold">PB TACTICAL MATCH</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3D4BFF] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold uppercase ${isDay ? 'text-slate-900' : 'text-white'}`}>Team Red vs Blue</div>
                    <div className="text-[10px] text-[#9E9E9E]">Futsal • Kuningan Arena</div>
                  </div>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDay ? 'bg-slate-200' : 'bg-[#121212]'}`}>
                  <div className="h-full w-[80%] bg-[#CCFF00]" />
                </div>
                <div className="text-[10px] text-[#9E9E9E] mt-1.5 text-right font-mono">8/10 Ready Check</div>
              </div>

              {/* Glass Card 2: Partner Field Rent */}
              <div className={`absolute bottom-6 left-0 w-72 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl z-20 ${
                isDay ? 'bg-white/95 border-slate-200' : 'bg-[#1C1C22]/95 border-[#3D4BFF]/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold uppercase ${isDay ? 'text-slate-900' : 'text-white'}`}>Mitra Sewa Lapangan</div>
                    <div className="text-[10px] text-emerald-500 font-mono font-bold">QRIS Instant & Booking Slot</div>
                  </div>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-[#3D4BFF]/30 via-transparent to-[#CCFF00]/20 blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className={`py-20 border-y transition-colors ${
        isDay ? 'bg-white border-slate-200' : 'bg-[#1A1A1F] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#3D4BFF]">
              Fitur Lengkap Socia Sport v1.2
            </span>
            <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Ekosistem <span className="text-[#3D4BFF]">Olahraga Masa Depan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDay ? 'bg-slate-50 border-slate-200 hover:border-[#3D4BFF]' : 'bg-[#24242A] border-white/5 hover:border-[#3D4BFF]/50'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-[#3D4BFF]/20 text-[#3D4BFF] flex items-center justify-center mb-4">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold uppercase mb-1.5 ${isDay ? 'text-slate-900' : 'text-white'}`}>
                PB Tactical Lobby
              </h3>
              <p className={`text-xs leading-relaxed ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                Matchmaking sparing futsal, badminton, basket dengan sound FX Point Blank, ready check, dan room browser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDay ? 'bg-slate-50 border-slate-200 hover:border-[#CCFF00]' : 'bg-[#24242A] border-white/5 hover:border-[#CCFF00]/50'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold uppercase mb-1.5 ${isDay ? 'text-slate-900' : 'text-white'}`}>
                Sewa Lapangan & Diskon
              </h3>
              <p className={`text-xs leading-relaxed ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                Pilih slot pagi, siang, atau malam. Dapatkan cashback Sociacoins dan tukarkan koin untuk potongan sewa s/d 50%.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              isDay ? 'bg-slate-50 border-slate-200 hover:border-[#3D4BFF]' : 'bg-[#24242A] border-white/5 hover:border-white/20'
            }`}>
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className={`text-base font-bold uppercase mb-1.5 ${isDay ? 'text-slate-900' : 'text-white'}`}>
                  Portal Mitra Lapangan
                </h3>
                <p className={`text-xs leading-relaxed ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                  Pemilik arena dapat mendaftarkan lapangan, mengatur jadwal slot, dan memantau pendapatan reservasi secara otomatis.
                </p>
              </div>
              {onOpenPartner && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onOpenPartner();
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#3D4BFF] hover:underline cursor-pointer"
                >
                  <span>Pelajari Landing Page Mitra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Feature 4 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDay ? 'bg-slate-50 border-slate-200 hover:border-[#3D4BFF]' : 'bg-[#24242A] border-white/5 hover:border-[#3D4BFF]/50'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold uppercase mb-1.5 ${isDay ? 'text-slate-900' : 'text-white'}`}>
                Roblox 3D Avatar
              </h3>
              <p className={`text-xs leading-relaxed ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                Koleksi jersey, helm, dan sepatu eksklusif yang dipamerkan di metaverse Sociasport seiring kenaikan level aktivitas fisikmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className={`text-3xl sm:text-5xl font-display font-black uppercase tracking-tight ${
            isDay ? 'text-slate-900' : 'text-white'
          }`}>
            Siap Menjadi <span className="text-[#3D4BFF]">Juara Arena?</span>
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto ${
            isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
          }`}>
            Mulai mabar dengan ribuan atlet dan gamer se-Indonesia. Bergabung sekarang gratis!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button 
              onClick={() => handleCtaClick(false)}
              className="px-8 py-4 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs sm:text-sm uppercase italic tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(204,255,0,0.3)] hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>{isAuthenticated ? 'Masuk ke Arena' : 'Masuk / Daftar Akun'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 border-t transition-colors ${
        isDay ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#121212] border-white/5 text-[#9E9E9E]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#3D4BFF] text-white flex items-center justify-center font-bold text-[9px]">
              SS
            </div>
            <span className="font-bold">Socia Sport v1.2</span>
          </div>
          <p>© 2026 Sociasport Inc. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
