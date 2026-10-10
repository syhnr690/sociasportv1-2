import React from 'react';
import { Home, Gamepad2, Building2, Shirt, FileText, Gift, Store, Briefcase, Sparkles } from 'lucide-react';
import { NavigationTab, UserRole } from '../types';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  bookingCount?: number;
  userRole?: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange, 
  bookingCount = 0,
  userRole = 'player'
}) => {
  const { isDay } = useTheme();
  const isPartner = userRole === 'partner';

  const PLAYER_NAV_ITEMS: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'venues', label: 'Sewa', icon: Building2 },
    { id: 'lobby', label: 'PB Lobby', icon: Gamepad2 },
    { id: 'partner', label: 'Mitra', icon: Store },
    { id: 'avatar', label: 'Locker', icon: Shirt },
    { id: 'redeem', label: 'Redeem', icon: Gift },
    { id: 'blueprint', label: 'Specs', icon: FileText },
  ];

  const PARTNER_NAV_ITEMS: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'partner', label: 'Dashboard', icon: Store },
    { id: 'venues', label: 'Lapangan', icon: Building2 },
    { id: 'lobby', label: 'PB Lobby', icon: Gamepad2 },
    { id: 'home', label: 'Mode Atlet', icon: Home },
    { id: 'blueprint', label: 'Specs', icon: FileText },
  ];

  const navItems = isPartner ? PARTNER_NAV_ITEMS : PLAYER_NAV_ITEMS;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-2 py-1.5 transition-colors ${
      isDay 
        ? 'bg-white/95 border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]' 
        : 'bg-[#121212]/95 border-[#9E9E9E]/10'
    }`}>
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLobby = item.id === 'lobby';
          const isVenues = item.id === 'venues';
          const isPartnerTab = item.id === 'partner';

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                soundFx.playClick();
                onTabChange(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? isDay ? 'text-[#3D4BFF]' : 'text-[#CCFF00]'
                  : isDay ? 'text-slate-500 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
              }`}
            >
              {/* Highlight background pill */}
              {isActive && (
                <span className={`absolute inset-0 rounded-lg -z-10 ${
                  isDay 
                    ? 'bg-blue-50 border border-blue-200' 
                    : isPartner 
                    ? 'bg-[#1F2C18] border border-emerald-500/40'
                    : 'bg-[#24242A] border border-[#3D4BFF]/40'
                }`} />
              )}

              {/* Icon with badges */}
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isActive 
                    ? isDay ? 'text-[#3D4BFF]' : (isPartner ? 'text-[#CCFF00]' : 'text-[#CCFF00]') 
                    : ''
                }`} />
                {isLobby && (
                  <span className={`absolute -top-1 -right-1.5 w-2 h-2 rounded-full animate-ping ${
                    isDay ? 'bg-[#3D4BFF]' : 'bg-[#CCFF00]'
                  }`} />
                )}
                {isVenues && bookingCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-mono font-bold bg-[#CCFF00] text-black">
                    {bookingCount}
                  </span>
                )}
                {isPartnerTab && (
                  <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>

              <span className={`text-[8.5px] sm:text-[9.5px] font-bold mt-0.5 tracking-tight uppercase whitespace-nowrap ${
                isActive 
                  ? isDay ? 'text-[#3D4BFF]' : 'text-[#CCFF00]' 
                  : isDay ? 'text-slate-500' : 'text-[#9E9E9E]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
