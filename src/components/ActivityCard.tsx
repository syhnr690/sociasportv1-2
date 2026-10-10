import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Users, Zap, Clock, ArrowRight } from 'lucide-react';
import { ActivityCard as ActivityCardType } from '../types';

interface ActivityCardProps {
  activity: ActivityCardType;
  onSelect: (activity: ActivityCardType) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSelect }) => {
  // Determine variant styling with Elegant Dark bottom border accents
  const variantStyles = {
    'dark-blue': 'bg-[#24242A] border-b-4 border-[#3D4BFF] hover:bg-[#1C2454]',
    'dark-olive': 'bg-[#24242A] border-b-4 border-[#CCFF00] hover:bg-[#2D3A1B]',
    'surface': 'bg-[#24242A] border-b-4 border-[#9E9E9E] hover:bg-[#2d2d35]',
  }[activity.variant];

  return (
    <motion.div
      id={`card-activity-${activity.id}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(activity)}
      className={`group relative min-w-[260px] max-w-[280px] sm:min-w-[280px] sm:max-w-[300px] flex-shrink-0 rounded-xl p-4 cursor-pointer overflow-hidden transition-all shadow-lg border-t border-x border-[#9E9E9E]/10 ${variantStyles}`}
    >
      {/* Top Banner Image with Live Badge */}
      <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-[#121212]">
        <img
          src={activity.imageUrl}
          alt={activity.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {activity.isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/90 text-white uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live Match
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#121212]/90 backdrop-blur text-[#CCFF00] border border-white/10 uppercase tracking-wider">
            {activity.sport}
          </span>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-[#121212]/90 text-[#9E9E9E] uppercase tracking-wider border border-white/15">
          {activity.difficulty}
        </div>

        {/* XP Reward Chip */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#121212]/90 border border-[#CCFF00]/40 text-xs font-bold text-[#CCFF00]">
          <Zap className="w-3 h-3 text-[#CCFF00] fill-[#CCFF00]" />
          <span className="text-[11px]">+{activity.xpReward} XP</span>
        </div>
      </div>

      {/* Activity Details */}
      <div className="space-y-1.5">
        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#CCFF00] transition-colors">
          {activity.title}
        </h4>
        <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wider line-clamp-1">
          {activity.subtitle}
        </p>

        {/* Location & Time */}
        <div className="pt-2 border-t border-[#9E9E9E]/10 space-y-1 text-[11px] text-[#9E9E9E]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-[#3D4BFF] flex-shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#9E9E9E]" />
              <span>{activity.time}</span>
            </div>
            <div className="flex items-center gap-1 text-white font-medium">
              <Users className="w-3 h-3 text-[#CCFF00]" />
              <span>{activity.participants}</span>
            </div>
          </div>
        </div>

        {/* Join CTA Button */}
        <div className="pt-2">
          <div className="w-full py-2 px-3 rounded-lg bg-[#121212] group-hover:bg-[#CCFF00] text-white group-hover:text-black border border-white/10 group-hover:border-[#CCFF00] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
            <span>Masuk Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
