import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Coffee, Ticket, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { UserAvatar } from '../types';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface RedeemViewProps {
  user: UserAvatar;
  onRedeem: (cost: number) => void;
}

export const RedeemView: React.FC<RedeemViewProps> = ({ user, onRedeem }) => {
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const REWARDS = [
    {
      id: 'r1',
      title: 'Voucher Minuman Isotonik',
      desc: 'Tukarkan di kantin venue rekanan.',
      cost: 300,
      icon: Coffee,
      color: '#CCFF00',
    },
    {
      id: 'r2',
      title: 'Diskon Sewa Lapangan 10%',
      desc: 'Potongan harga untuk booking venue apa saja.',
      cost: 1000,
      icon: Ticket,
      color: '#3D4BFF',
    },
    {
      id: 'r3',
      title: 'Exclusive Cyber Jersey',
      desc: 'Jersey fisik official Sociasport edisi terbatas.',
      cost: 5000,
      icon: ShoppingBag,
      color: '#9E9E9E',
    },
    {
      id: 'r4',
      title: 'Akses VIP Lounge',
      desc: 'Akses 1 hari VIP Lounge di GBK Senayan.',
      cost: 2500,
      icon: ShieldCheck,
      color: '#CCFF00',
    }
  ];

  const handleRedeemClick = (rewardId: string) => {
    soundFx.playClick();
    setSelectedReward(rewardId);
    setShowConfirm(true);
  };

  const handleConfirmRedeem = () => {
    const reward = REWARDS.find(r => r.id === selectedReward);
    if (reward && user.sociacoins >= reward.cost) {
      soundFx.playVictory();
      onRedeem(reward.cost);
      setShowConfirm(false);
      setSuccessMessage(`Berhasil menukar ${reward.title}! Cek email/notifikasi Anda.`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#3D4BFF', '#FFFFFF']
      });

      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      soundFx.playError();
      setShowConfirm(false);
    }
  };

  return (
    <motion.div
      id="redeem-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#24242A] border-l-4 border-[#CCFF00] border-y border-r border-[#9E9E9E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-bold text-lg sm:text-xl text-white uppercase tracking-tight flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#CCFF00]" />
            Redeem Store
          </h2>
          <p className="text-xs text-[#9E9E9E]">
            Tukarkan Sociacoins kamu dengan voucher, diskon, atau merchandise eksklusif!
          </p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-[#1C2454] border border-[#3D4BFF]/50 flex flex-col items-center justify-center">
          <span className="text-[10px] text-[#3D4BFF] font-bold uppercase tracking-wider">Saldo Credits</span>
          <span className="text-sm font-mono font-bold text-white">{user.sociacoins.toLocaleString()} SC</span>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-[#2D3A1B] border border-[#CCFF00]/50 flex items-center gap-3 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            <div className="w-8 h-8 rounded-full bg-[#CCFF00] flex items-center justify-center">
              <Check className="w-5 h-5 text-[#121212]" />
            </div>
            <p className="text-sm font-semibold text-white">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {REWARDS.map(reward => {
          const isAffordable = user.sociacoins >= reward.cost;
          const Icon = reward.icon;

          return (
            <div 
              key={reward.id}
              className={`p-5 rounded-xl border transition-all ${
                isAffordable 
                  ? 'bg-[#24242A] border-[#9E9E9E]/20 hover:border-[#CCFF00] hover:shadow-[0_4px_20px_rgba(204,255,0,0.1)]' 
                  : 'bg-[#121212] border-[#9E9E9E]/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${reward.color}15`, border: `1px solid ${reward.color}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color: reward.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{reward.title}</h3>
                  <p className="text-xs text-[#9E9E9E] mb-4">{reward.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#CCFF00]">
                      {reward.cost.toLocaleString()} SC
                    </span>
                    <button
                      onClick={() => handleRedeemClick(reward.id)}
                      disabled={!isAffordable}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                        isAffordable 
                          ? 'bg-[#3D4BFF] hover:bg-[#CCFF00] text-white hover:text-black' 
                          : 'bg-[#121212] text-[#9E9E9E] border border-[#9E9E9E]/20 cursor-not-allowed'
                      }`}
                    >
                      Tukar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#24242A] border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">Konfirmasi Penukaran</h3>
              <p className="text-sm text-[#9E9E9E] mb-6">
                Apakah Anda yakin ingin menukarkan <strong className="text-white">{REWARDS.find(r => r.id === selectedReward)?.cost} SC</strong> untuk mendapatkan <strong className="text-white">{REWARDS.find(r => r.id === selectedReward)?.title}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#9E9E9E]/20 text-[#9E9E9E] hover:text-white font-bold text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmRedeem}
                  className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black uppercase tracking-wide text-sm hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  Konfirmasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
