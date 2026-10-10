import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Zap, Award, Check, RefreshCw, LogOut } from 'lucide-react';
import { UserAvatar } from '../types';
import { AvatarCanvas } from '../components/AvatarCanvas';
import { soundFx } from '../utils/audio';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface AvatarLockerProps {
  user: UserAvatar;
  onUpdateAvatar: (updated: Partial<UserAvatar>) => void;
}

export const AvatarLocker: React.FC<AvatarLockerProps> = ({ user, onUpdateAvatar }) => {
  const [activeCategory, setActiveCategory] = useState<'head' | 'jersey' | 'shoes' | 'accessory'>('jersey');

  const GEAR_CATALOG = {
    head: [
      { id: 'h1', name: 'Neon HUD Visor MK-II', desc: 'HUD real-time GPS & reflex tracker', rarity: 'Legendary', color: '#CCFF00' },
      { id: 'h2', name: 'Tactical Cyber Headband', desc: 'Menyerap keringat & sensor denyut nadi', rarity: 'Rare', color: '#3D4BFF' },
      { id: 'h3', name: 'Stealth Pro Running Cap', desc: 'Desain aerodinamis untuk lari cepat', rarity: 'Common', color: '#9E9E9E' },
    ],
    jersey: [
      { id: 'j1', name: 'Pro Cyber Striker Jersey', desc: 'Jersey polimer sintetis bergaris neon', rarity: 'Legendary', color: '#CCFF00' },
      { id: 'j2', name: 'Dark Olive Tactician Kit', desc: 'Seragam taktis tim mabar futsal', rarity: 'Epic', color: '#2D3A1B' },
      { id: 'j3', name: 'Electric Blue Slam Dunk Tank', desc: 'Tanktop basket breathable anti-bakteri', rarity: 'Rare', color: '#3D4BFF' },
    ],
    shoes: [
      { id: 's1', name: 'Aero-Grip Turf Spikes', desc: 'Sol karet traksi tinggi untuk vinyl/rumput sintetis', rarity: 'Epic', color: '#CCFF00' },
      { id: 's2', name: 'Carbon-Plate 5K Boosters', desc: 'Sepatu lari pelat karbon pendorong ritme', rarity: 'Legendary', color: '#3D4BFF' },
      { id: 's3', name: 'Indoor Court CourtMaster', desc: 'Dukungan lateral anti-selip untuk badminton', rarity: 'Rare', color: '#9E9E9E' },
    ],
    accessory: [
      { id: 'a1', name: 'Biometric Haptic Tracker', desc: 'Smart wristband sinkronisasi detak jantung', rarity: 'Legendary', color: '#CCFF00' },
      { id: 'a2', name: 'Neon Knee Support Sleeve', desc: 'Kompresi sendi dengan strip reflektif', rarity: 'Common', color: '#3D4BFF' },
    ],
  };

  const handleEquip = (category: 'head' | 'jersey' | 'shoes' | 'accessory', itemName: string) => {
    soundFx.playClick();
    onUpdateAvatar({
      equippedGear: {
        ...user.equippedGear,
        [category]: itemName,
      },
    });
  };

  const handleSignOut = async () => {
    try {
      soundFx.playClick();
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.div
      id="avatar-locker-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#24242A] border-l-4 border-[#3D4BFF] border-y border-r border-[#9E9E9E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-bold text-lg sm:text-xl text-white uppercase tracking-tight">
            Avatar Gear Locker & Stats
          </h2>
          <p className="text-xs text-[#9E9E9E]">
            Kustomisasi avatar 3D Roblox Sociasport & tingkatkan status atribut fisik.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#1C2454] border border-[#3D4BFF]/50 text-xs text-[#CCFF00] font-mono font-bold flex items-center justify-center">
            {user.sociacoins.toLocaleString()} SC
          </div>
          <button 
            onClick={handleSignOut}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-xs text-red-400 font-bold flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Stage Visualizer */}
        <div className="lg:col-span-5">
          <AvatarCanvas user={user} interactive={true} />
        </div>

        {/* Right Column: Gear Customization Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Gear Slot Category Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'jersey', label: '👕 Jersey / Atasan' },
              { id: 'head', label: '🥽 Headwear / HUD' },
              { id: 'shoes', label: '👟 Sepatu / Cleats' },
              { id: 'accessory', label: '⌚ Wearables' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveCategory(cat.id as any);
                }}
                className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#CCFF00] hover:bg-white text-[#121212] font-black italic tracking-tighter shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                    : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border border-[#9E9E9E]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {GEAR_CATALOG[activeCategory].map((item) => {
              const isEquipped = user.equippedGear[activeCategory] === item.name;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isEquipped
                      ? 'bg-[#1C2454] border-b-4 border-b-[#CCFF00] border-t border-x border-[#CCFF00]/40 shadow-md shadow-[#CCFF00]/10'
                      : 'bg-[#24242A] border-b-4 border-b-[#3D4BFF] border-t border-x border-[#9E9E9E]/10 hover:border-[#CCFF00]/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {item.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#121212] text-[#CCFF00] border border-[#9E9E9E]/10">
                        {item.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9E9E]">{item.desc}</p>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="px-4 py-2 rounded-lg bg-[#2D3A1B] text-[#CCFF00] border border-[#CCFF00] text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Terpasang
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquip(activeCategory, item.name)}
                        className="px-4 py-2 rounded-lg bg-[#121212] hover:bg-[#CCFF00] text-white hover:text-black font-black text-xs uppercase tracking-wider border border-[#9E9E9E]/10 hover:border-[#CCFF00] transition-all"
                      >
                        Pasang Gear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
