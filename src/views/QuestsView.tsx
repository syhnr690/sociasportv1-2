import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Trophy, Zap, CheckCircle2, Sparkles, Flame, Shield, Award } from 'lucide-react';
import { DailyQuest, UserAvatar } from '../types';
import { DAILY_QUESTS } from '../data/mockData';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface QuestsViewProps {
  user: UserAvatar;
  onClaimQuest: (questId: string, xpReward: number) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({ user, onClaimQuest }) => {
  const [quests, setQuests] = useState<DailyQuest[]>(DAILY_QUESTS);

  const handleClaim = (q: DailyQuest) => {
    if (!q.completed || q.claimed) return;
    soundFx.playXpGain();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#CCFF00', '#3D4BFF', '#FFFFFF'],
    });
    setQuests((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, claimed: true } : item))
    );
    onClaimQuest(q.id, q.xpReward);
  };

  const totalCompleted = quests.filter((q) => q.completed).length;

  return (
    <motion.div
      id="quests-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-5xl mx-auto"
    >
      {/* Header Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="p-5 rounded-xl bg-[#24242A] border-l-4 border-[#3D4BFF] border-y border-r border-[#9E9E9E]/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="font-bold text-lg sm:text-xl text-white uppercase tracking-tight">
              Daily Quests & XP Arena
            </h2>
          </div>
          <p className="text-xs text-[#9E9E9E]">
            Selesaikan misi aktivitas fisik dunia nyata untuk mempercepat level-up avatar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-[#121212] border border-[#9E9E9E]/10 text-right">
            <span className="text-[10px] text-[#9E9E9E] uppercase font-mono block">Progres Misi</span>
            <span className="text-sm font-bold text-[#CCFF00] font-mono">
              {totalCompleted} / {quests.length} Selesai
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quests List */}
      <div className="space-y-3">
        {quests.map((q, idx) => {
          const isReadyToClaim = q.completed && !q.claimed;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05, ease: 'easeOut' }}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                q.claimed
                  ? 'bg-[#121212] border-[#9E9E9E]/10 opacity-60'
                  : isReadyToClaim
                  ? 'bg-[#2D3A1B] border-b-4 border-b-[#CCFF00] border-t border-x border-[#CCFF00]/40 shadow-lg shadow-[#CCFF00]/10'
                  : 'bg-[#24242A] border-b-4 border-b-[#3D4BFF] border-t border-x border-[#9E9E9E]/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-white">{q.title}</h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#3D4BFF]/30 text-[#CCFF00] border border-[#3D4BFF]/60">
                      +{q.xpReward} XP
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-[#121212] text-[#9E9E9E] border border-[#9E9E9E]/10">
                      {q.sport}
                    </span>
                  </div>
                  <p className="text-xs text-[#9E9E9E]">{q.description}</p>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1 max-w-md">
                    <div className="flex justify-between text-xs font-mono text-[#9E9E9E]">
                      <span>Target Aktivitas</span>
                      <span className="text-white font-bold">
                        {q.progress} / {q.maxProgress} {q.unit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden border border-[#9E9E9E]/10">
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

                {/* Claim Button */}
                <div className="flex-shrink-0">
                  {q.claimed ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#121212] text-xs text-[#9E9E9E] font-medium border border-[#9E9E9E]/10">
                      <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" /> Hadiah Diklaim
                    </span>
                  ) : isReadyToClaim ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleClaim(q)}
                      className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-white text-[#121212] font-black text-xs uppercase italic tracking-tighter flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>Klaim +{q.xpReward} XP</span>
                    </motion.button>
                  ) : (
                    <span className="px-4 py-2 rounded-lg bg-[#121212] text-xs text-[#9E9E9E] font-mono border border-[#9E9E9E]/10">
                      Belum Selesai
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
