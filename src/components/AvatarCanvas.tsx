import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Zap, Award } from 'lucide-react';
import { UserAvatar } from '../types';

interface AvatarCanvasProps {
  user: UserAvatar;
  onCustomizeClick?: () => void;
  interactive?: boolean;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  user,
  onCustomizeClick,
  interactive = true,
}) => {
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    setRotateY((x / (rect.width / 2)) * 18);
  };

  const handleMouseLeave = () => {
    setRotateY(0);
    setIsHovered(false);
  };

  // Dynamic Visuals based on equipped gear
  const gear = user.equippedGear || { jersey: '', head: '', shoes: '', accessory: '' };
  
  let jerseyColor = '#24242A';
  let jerseyStripe = '#3D4BFF';
  let armColor = '#1C2454';
  
  if (gear.jersey?.includes('Olive')) {
    jerseyColor = '#2D3A1B';
    jerseyStripe = '#9E9E9E';
    armColor = '#2D3A1B';
  } else if (gear.jersey?.includes('Blue')) {
    jerseyColor = '#3D4BFF';
    jerseyStripe = '#CCFF00';
    armColor = '#3D4BFF';
  }

  let shoeAccent = '#CCFF00';
  if (gear.shoes?.includes('Carbon')) shoeAccent = '#3D4BFF';
  else if (gear.shoes?.includes('CourtMaster')) shoeAccent = '#9E9E9E';

  const showVisor = gear.head?.includes('Visor') || false;
  const showHeadband = gear.head?.includes('Headband') || false;
  const showCap = gear.head?.includes('Cap') || false;

  const showWristband = gear.accessory?.includes('Tracker') || false;
  const showKneeSleeve = gear.accessory?.includes('Knee') || false;

  return (
    <div
      id="roblox-avatar-stage"
      className="relative w-full rounded-2xl bg-[#24242A] border border-[#9E9E9E]/10 p-5 sm:p-6 overflow-hidden shadow-2xl transition-all"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Radial Glow & Hologram Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,#3D4BFF_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Stage Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#3D4BFF] flex items-center justify-center font-bold text-white text-xs uppercase tracking-wider">
            PB
          </div>
          <div>
            <span className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-widest block">
              Roblox 3D Athlete Podium
            </span>
            <span className="text-xs font-semibold text-white">
              Tactical Gear Status
            </span>
          </div>
        </div>

        {onCustomizeClick && (
          <button
            id="btn-edit-avatar"
            onClick={onCustomizeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-[#3D4BFF]/20 text-xs font-semibold text-white border border-[#9E9E9E]/20 hover:border-[#CCFF00] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Customize</span>
          </button>
        )}
      </div>

      {/* 3D Roblox-Style Avatar Podium & Visualizer */}
      <div className="relative z-10 my-2 flex flex-col items-center justify-center">
        {/* Holographic Circular Pedestal Container */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
          {/* Glowing Pedestal Backdrop Arch */}
          <div className="absolute inset-x-8 bottom-4 top-2 bg-gradient-to-t from-[#3D4BFF]/20 to-transparent rounded-b-full border-b-4 border-[#3D4BFF] pointer-events-none" />

          <motion.div
            className="relative w-full h-full flex items-center justify-center z-10"
            animate={{
              rotateY: rotateY,
              y: [0, -6, 0],
            }}
            transition={{
              rotateY: { type: 'spring', damping: 15 },
              y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
            }}
            style={{ perspective: 800, transformStyle: 'preserve-3d' }}
          >
            {/* Dynamic Roblox-Athletic Avatar Vector */}
            <svg
              viewBox="0 0 200 240"
              className="w-48 h-56 sm:w-56 sm:h-64 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
            >
              {/* Pedestal Glow Base */}
              <ellipse cx="100" cy="225" rx="75" ry="14" fill="#3D4BFF" fillOpacity="0.25" />
              <ellipse cx="100" cy="225" rx="55" ry="9" stroke="#CCFF00" strokeWidth="2" strokeDasharray="4 2" fill="none" />

              {/* Legs / Athletic Shorts & Cleats */}
              <rect x="72" y="145" width="22" height="60" rx="6" fill={armColor} />
              <rect x="106" y="145" width="22" height="60" rx="6" fill={armColor} />
              {/* Neon Stripe on shorts */}
              <line x1="72" y1="160" x2="94" y2="160" stroke={jerseyStripe} strokeWidth="3" />
              <line x1="106" y1="160" x2="128" y2="160" stroke={jerseyStripe} strokeWidth="3" />
              {/* Cyber Turf Cleats */}
              <rect x="68" y="198" width="28" height="18" rx="4" fill="#24242A" stroke={shoeAccent} strokeWidth="1.5" />
              <rect x="104" y="198" width="28" height="18" rx="4" fill="#24242A" stroke={shoeAccent} strokeWidth="1.5" />

              {/* Torso / Jersey (Roblox blocky athletic aesthetic) */}
              <rect
                x="62"
                y="80"
                width="76"
                height="70"
                rx="10"
                fill={jerseyColor}
                stroke={jerseyStripe}
                strokeWidth="2.5"
              />
              {/* Cyber Athletic Diagonal Stripe & Sponsor */}
              <path d="M62 100 L138 125 L138 140 L62 115 Z" fill={jerseyStripe} />

              {/* Arms (Left & Right with athletic sweatbands) */}
              <rect x="42" y="85" width="18" height="55" rx="8" fill={armColor} />
              <rect x="140" y="85" width="18" height="55" rx="8" fill={armColor} />
              {/* Haptic band on wrist */}
              {showWristband && (
                <>
                  <rect x="42" y="122" width="18" height="6" rx="2" fill="#CCFF00" />
                  <rect x="140" y="122" width="18" height="6" rx="2" fill="#CCFF00" />
                </>
              )}

              {showKneeSleeve && (
                <>
                  <rect x="72" y="180" width="22" height="10" fill="#3D4BFF" />
                  <rect x="106" y="180" width="22" height="10" fill="#3D4BFF" />
                </>
              )}

              {/* Head / Roblox Block-Oval Style */}
              <rect
                x="76"
                y="30"
                width="48"
                height="46"
                rx="12"
                fill="#3A3A44"
                stroke={showHeadband ? jerseyStripe : "#CCFF00"}
                strokeWidth="2"
              />
              
              {showVisor && (
                <>
                  {/* Cyber HUD Visor (Neon Lime & Electric Blue) */}
                  <path
                    d="M74 44 C84 41, 116 41, 126 44 L124 58 C114 55, 86 55, 76 58 Z"
                    fill="#CCFF00"
                    fillOpacity="0.9"
                    filter="drop-shadow(0 0 6px #CCFF00)"
                  />
                  {/* Holographic Visor Reflection lines */}
                  <line x1="82" y1="47" x2="98" y2="47" stroke="#121212" strokeWidth="2" strokeLinecap="round" />
                  <line x1="104" y1="47" x2="118" y2="47" stroke="#121212" strokeWidth="2" strokeLinecap="round" />
                </>
              )}

              {showCap && (
                <path d="M72 32 Q100 20 128 32 L132 36 L68 36 Z" fill={armColor} />
              )}
            </svg>
          </motion.div>
        </div>

        {/* Player Name & Tagline */}
        <div className="text-center mt-2">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic text-white">
            {user.name}
          </h2>
          <p className="text-[#9E9E9E] text-xs font-semibold uppercase tracking-widest mt-0.5">
            {user.rankBadge} • {user.clan}
          </p>
        </div>

        {/* 3D Stage Hint */}
        <p className="text-[11px] text-[#9E9E9E] font-medium mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
          Interactive 3D Stage • Geser kursor untuk rotasi avatar
        </p>
      </div>

      {/* XP & Level Progression Track */}
      <div className="relative z-10 mt-3 pt-3 border-t border-[#9E9E9E]/10">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[#CCFF00]">XP Progress:</span> Level {user.level} → {user.level + 1}
          </span>
          <span className="font-mono text-[#9E9E9E]">
            <b className="text-white">{user.currentXp.toLocaleString()}</b> / {user.nextLevelXp.toLocaleString()} XP
          </span>
        </div>
        
        {/* Progress Track */}
        <div className="relative w-full h-2.5 bg-[#121212] rounded-full overflow-hidden border border-[#9E9E9E]/20">
          <motion.div
            className="h-full bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]"
            initial={{ width: 0 }}
            animate={{ width: `${(user.currentXp / user.nextLevelXp) * 100}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
