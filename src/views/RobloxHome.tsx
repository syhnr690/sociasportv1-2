import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Trophy, 
  ChevronRight, 
  Compass, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Gamepad2,
  Users,
  Target,
  Building2,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { UserAvatar, ActivityCard as ActivityCardType, DailyQuest } from '../types';
import { AvatarCanvas } from '../components/AvatarCanvas';
import { ActivityCard } from '../components/ActivityCard';
import { TRENDING_ACTIVITIES, DAILY_QUESTS } from '../data/mockData';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

interface RobloxHomeProps {
  user: UserAvatar;
  onNavigateToLobby: (filterSport?: string) => void;
  onNavigateToAvatar: () => void;
  onNavigateToVenues?: () => void;
  onNavigateToPartner?: () => void;
  onSelectActivity: (activity: ActivityCardType) => void;
  onClaimQuest: (questId: string, xpReward: number) => void;
}

export const RobloxHome: React.FC<RobloxHomeProps> = ({
  user,
  onNavigateToLobby,
  onNavigateToAvatar,
  onNavigateToVenues,
  onNavigateToPartner,
  onSelectActivity,
  onClaimQuest,
}) => {
  const { isDay } = useTheme();
  const [quests, setQuests] = useState<DailyQuest[]>(DAILY_QUESTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');


  const handleClaim = (q: DailyQuest) => {
    if (!q.completed || q.claimed) return;
    soundFx.playXpGain();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#CCFF00', '#3D4BFF', '#FFFFFF'],
    });
    setQuests((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, claimed: true } : item))
    );
    onClaimQuest(q.id, q.xpReward);
  };

  const filteredActivities = activeFilter === 'all'
    ? TRENDING_ACTIVITIES
    : TRENDING_ACTIVITIES.filter((a) => a.sport === activeFilter);

  return (
    <motion.div
      id="roblox-homepage-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-5xl mx-auto"
    >
      {/* Partner Notice if logged in as Partner but browsing Athlete Mode */}
      {user.role === 'partner' && (
        <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isDay
            ? 'bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-300 text-slate-800'
            : 'bg-gradient-to-r from-emerald-950/40 to-[#1C2454]/40 border-emerald-500/30 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold text-lg flex-shrink-0">
              🏢
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-emerald-500 uppercase">Mode Atlet / Pemain Aktif</p>
              <p className="text-xs font-bold">
                Akun Anda terdaftar sebagai Mitra Resmi ({user.partnerData?.businessName || 'Champions Arena'}).
              </p>
            </div>
          </div>
          {onNavigateToPartner && (
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateToPartner();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black uppercase text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/20"
            >
              <span>Dashboard Mitra</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Roblox-Inspired Prominent 3D Avatar Hero Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
        className="relative"
      >
        <AvatarCanvas
          user={user}
          onCustomizeClick={() => {
            soundFx.playClick();
            onNavigateToAvatar();
          }}
        />
      </motion.section>

      {/* Tactical Action Grid: PB Lobby, Sewa Lapangan, & Mitra Lapangan */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
      >
        {/* Card 1: Point Blank Lobby */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col justify-between gap-4 transition-colors ${
          isDay ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-[#24242A] border-white/5 shadow-black/40'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#3D4BFF] text-white flex items-center justify-center font-bold shadow-lg shadow-[#3D4BFF]/30 flex-shrink-0">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base uppercase tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
                  PB Lobby
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#CCFF00] text-black uppercase">
                  Live Rooms
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                Masuk room mabar futsal & badminton Red vs Blue ala PB.
              </p>
            </div>
          </div>

          <button
            id="btn-quick-join-pb"
            onClick={() => {
              soundFx.playRoomEntry();
              onNavigateToLobby();
            }}
            className="w-full py-2.5 rounded-lg bg-[#3D4BFF] hover:bg-[#323ec9] text-white font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#3D4BFF]/30 transition-all cursor-pointer"
          >
            <span>Buka PB Lobby</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Sewa Lapangan & Booking Venue */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col justify-between gap-4 transition-colors ${
          isDay ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-[#24242A] border-white/5 shadow-black/40'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#2D3A1B] text-[#CCFF00] border border-[#CCFF00]/40 flex items-center justify-center font-bold shadow-lg shadow-[#CCFF00]/20 flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base uppercase tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
                  Sewa Lapang
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#3D4BFF] text-white uppercase">
                  Diskon SC
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                Booking court futsal, badminton & basket resmi PB Partner.
              </p>
            </div>
          </div>

          <button
            id="btn-quick-rent-venue"
            onClick={() => {
              soundFx.playClick();
              if (onNavigateToVenues) onNavigateToVenues();
            }}
            className="w-full py-2.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all cursor-pointer"
          >
            <span>Sewa Lapangan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Mitra Lapangan (Field Rent Partner) */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col justify-between gap-4 transition-colors ${
          isDay ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-[#24242A] border-white/5 shadow-black/40'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-lg flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base uppercase tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
                  Mitra Lapang
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-black uppercase">
                  Owner Hub
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                Kelola jadwal arena, terima booking & pantau omzet.
              </p>
            </div>
          </div>

          <button
            id="btn-quick-partner-portal"
            onClick={() => {
              soundFx.playClick();
              if (onNavigateToPartner) onNavigateToPartner();
            }}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Portal Mitra Lapangan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.section>

      {/* Sport Category Quick Pill Filter */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: '🔥 Semua Aktivitas' },
          { id: 'futsal', label: '⚽ Futsal' },
          { id: 'badminton', label: '🏸 Badminton' },
          { id: 'basketball', label: '🏀 Basketball' },
          { id: 'padel', label: '🎾 Padel' },
          { id: 'running', label: '🏃 Running' },
        ].map((cat) => (
          <button
            key={cat.id}
            id={`filter-${cat.id}`}
            onClick={() => {
              soundFx.playClick();
              setActiveFilter(cat.id);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
              activeFilter === cat.id
                ? 'bg-[#3D4BFF] text-white border border-[#CCFF00] shadow-md shadow-[#3D4BFF]/30'
                : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border border-[#9E9E9E]/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </section>


      {/* Row 1: Roblox-Style Horizontal Carousel: Rekomendasi Mabar & Turnamen */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#9E9E9E] uppercase tracking-[0.3em]">
              Trending Matches
            </h3>
            <h4 className="font-bold text-base sm:text-lg text-white">
              Point Blank Matchmaking Rooms
            </h4>
          </div>
          <button
            onClick={() => onNavigateToLobby(activeFilter !== 'all' ? activeFilter : undefined)}
            className="text-xs font-bold text-[#CCFF00] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Scroll Track */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth no-scrollbar">
          {filteredActivities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onSelect={(a) => {
                soundFx.playClick();
                onSelectActivity(a);
              }}
            />
          ))}
        </div>
      </section>

      {/* Row 2: Daily Quests & Gamification Tracker */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#9E9E9E] uppercase tracking-[0.3em]">
              Recommended Quests
            </h3>
            <h4 className="font-bold text-base sm:text-lg text-white">
              Daily Quests & XP Rewards
            </h4>
          </div>
          <span className="text-xs text-[#9E9E9E] font-mono">Reset dalam 4j 25m</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quests.map((q) => {
            const isReadyToClaim = q.completed && !q.claimed;
            return (
              <div
                key={q.id}
                id={`quest-card-${q.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  q.claimed
                    ? 'bg-[#121212] border-b-4 border-[#9E9E9E]/40 opacity-60'
                    : isReadyToClaim
                    ? 'bg-[#24242A] border-b-4 border-[#CCFF00] hover:bg-[#2D3A1B] shadow-md shadow-[#CCFF00]/10'
                    : 'bg-[#24242A] border-b-4 border-[#3D4BFF] hover:bg-[#1C2454]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{q.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2454] text-[#CCFF00] border border-[#3D4BFF]">
                        +{q.xpReward} XP
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9E9E]">{q.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-mono text-[#9E9E9E] mb-1">
                        <span>Progress</span>
                        <span>{q.progress} / {q.maxProgress} {q.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden border border-[#9E9E9E]/20">
                        <div
                          className={`h-full transition-all duration-500 ${
                            q.completed ? 'bg-[#CCFF00]' : 'bg-[#3D4BFF]'
                          }`}
                          style={{
                            width: `${Math.min(100, (q.progress / q.maxProgress) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Claim or Status Action */}
                  <div className="flex-shrink-0 pt-1">
                    {q.claimed ? (
                      <span className="flex items-center gap-1 text-xs text-[#9E9E9E] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" /> Klaim Sukses
                      </span>
                    ) : isReadyToClaim ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClaim(q)}
                        className="px-3.5 py-2 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase italic flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.3)] animate-bounce"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-black" />
                        <span>Klaim XP</span>
                      </motion.button>
                    ) : (
                      <span className="text-xs text-[#9E9E9E] font-mono">In Progress</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Row 3: Roblox-Style Mini-Games & Sports Challenge Catalog */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#9E9E9E] uppercase tracking-[0.3em]">
              Mini-Games & Skill Arena
            </h3>
            <h4 className="font-bold text-base sm:text-lg text-white">
              Roblox Interactive Training
            </h4>
          </div>
          <span className="text-xs text-[#9E9E9E]">Roblox Experience Style</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#24242A] border-b-4 border-[#3D4BFF] hover:bg-[#1C2454] transition-all group cursor-pointer border-t border-x border-[#9E9E9E]/10">
            <div className="h-24 bg-[#121212] rounded-lg mb-3 flex items-center justify-center text-4xl">
              ⚡
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-white text-sm group-hover:text-[#CCFF00] transition-colors">
                Reflex & Agility Ladder
              </h4>
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold">+400 XP</span>
            </div>
            <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Uji reaksi & koordinasi sensorik</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#9E9E9E] pt-2 border-t border-[#9E9E9E]/10">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#CCFF00]" /> 1.2k Active</span>
              <span className="text-white font-bold text-xs">Play Now →</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#24242A] border-b-4 border-[#CCFF00] hover:bg-[#2D3A1B] transition-all group cursor-pointer border-t border-x border-[#9E9E9E]/10">
            <div className="h-24 bg-[#121212] rounded-lg mb-3 flex items-center justify-center text-4xl">
              🎯
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-white text-sm group-hover:text-[#CCFF00] transition-colors">
                Penalty Shootout AR
              </h4>
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold">+650 XP</span>
            </div>
            <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Akurasi tendangan bola via kamera AR</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#9E9E9E] pt-2 border-t border-[#9E9E9E]/10">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#CCFF00]" /> 3.8k Active</span>
              <span className="text-[#CCFF00] font-bold text-xs">Play Now →</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#24242A] border-b-4 border-[#9E9E9E] hover:bg-[#333333] transition-all group cursor-pointer border-t border-x border-[#9E9E9E]/10">
            <div className="h-24 bg-[#121212] rounded-lg mb-3 flex items-center justify-center text-4xl">
              🏃
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-white text-sm group-hover:text-[#3D4BFF] transition-colors">
                Shuttle Run Beep Test
              </h4>
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold">+500 XP</span>
            </div>
            <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">Lacak VO2Max dan kebugaran kardio</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#9E9E9E] pt-2 border-t border-[#9E9E9E]/10">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#CCFF00]" /> 890 Active</span>
              <span className="text-white font-bold text-xs">Play Now →</span>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
