import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Clock, 
  Shield, 
  Send, 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Lock, 
  Unlock, 
  Wifi, 
  Check, 
  X, 
  Flame, 
  MessageSquare,
  AlertCircle,
  Play
} from 'lucide-react';
import { PBRoom, PlayerSlot, ChatMessage, UserAvatar, SportCategory } from '../types';
import { MOCK_PB_ROOMS, INITIAL_ROOM_CHATS } from '../data/mockData';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface PointBlankLobbyProps {
  user: UserAvatar;
  initialSportFilter?: string;
  onBackToHome: () => void;
  onEarnMatchXp?: (xp: number) => void;
}

export const PointBlankLobby: React.FC<PointBlankLobbyProps> = ({
  user,
  initialSportFilter,
  onBackToHome,
  onEarnMatchXp,
}) => {
  const [rooms, setRooms] = useState<PBRoom[]>(MOCK_PB_ROOMS);
  const [selectedSport, setSelectedSport] = useState<SportCategory>(
    (initialSportFilter as SportCategory) || 'all'
  );
  const [activeRoom, setActiveRoom] = useState<PBRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_ROOM_CHATS);
  const [inputText, setInputText] = useState('');
  const [isUserReady, setIsUserReady] = useState(false);
  const [isMatchStarting, setIsMatchStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New room form state
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomSport, setNewRoomSport] = useState<SportCategory>('futsal');
  const [newRoomVenue, setNewRoomVenue] = useState('GBK Sports Arena Court 1');
  const [newRoomMaxPlayers, setNewRoomMaxPlayers] = useState(10);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeRoom]);

  // Handle countdown if user clicks Start/Ready
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMatchStarting && countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
        soundFx.playClick();
      }, 1000);
    } else if (isMatchStarting && countdown === 0) {
      soundFx.playXpGain();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#3D4BFF', '#FFFFFF'],
      });
      setIsMatchStarting(false);
      setCountdown(null);
      if (onEarnMatchXp) {
        onEarnMatchXp(1500);
      }
      // Add system message
      setChatMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'SYSTEM',
          isSystem: true,
          text: '🎮 MATCH DIMULAI! Skor & GPS tracking telah sinkron dengan avatar Sociasport (+1500 XP diberikan).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    return () => clearTimeout(timer);
  }, [isMatchStarting, countdown, onEarnMatchXp]);

  const handleEnterRoom = (room: PBRoom) => {
    soundFx.playRoomEntry();
    setActiveRoom(room);
    setIsUserReady(false);
    setIsMatchStarting(false);
    setCountdown(null);
  };

  const handleLeaveRoom = () => {
    soundFx.playClick();
    setActiveRoom(null);
    setIsUserReady(false);
    setIsMatchStarting(false);
  };

  const toggleUserReady = () => {
    const newReadyState = !isUserReady;
    setIsUserReady(newReadyState);
    soundFx.playReadyTone(newReadyState);

    if (activeRoom) {
      // Update the user slot
      setActiveRoom((prev) => {
        if (!prev) return null;
        const updatedSlots = prev.slots.map((s) =>
          s.userId === user.id ? { ...s, isReady: newReadyState } : s
        );
        return { ...prev, slots: updatedSlots };
      });

      // Broadcast chat announcement
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: user.name,
          senderRole: 'PLAYER',
          team: 'blue',
          text: newReadyState ? '🟢 [READY] Saya siap gas match!' : '🔴 [NOT READY] Menyesuaikan gear...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    soundFx.playClick();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: user.name,
      senderRole: 'PLAYER',
      team: 'blue',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate friendly teammate reaction after a delay
    setTimeout(() => {
      const replies = [
        'Mantap STRIKER_99, langsung press garis depan ya!',
        'Sip bro, bola udah disiapin sama pengelola lapangan.',
        'Kekuatan tim biru solid malam ini!',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'Captain_Arga',
          senderRole: 'HOST',
          team: 'red',
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const handleSendMacro = (macroText: string) => {
    soundFx.playClick();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `macro-${Date.now()}`,
        sender: user.name,
        senderRole: 'PLAYER',
        team: 'blue',
        text: macroText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleStartMatchSimulation = () => {
    soundFx.playRoomEntry();
    setIsMatchStarting(true);
    setCountdown(3);
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;

    soundFx.playXpGain();
    const newRoom: PBRoom = {
      id: `room-${Date.now()}`,
      roomNumber: Math.floor(Math.random() * 899) + 100,
      title: newRoomTitle.trim(),
      sport: newRoomSport,
      mode: newRoomSport === 'futsal' ? '5 vs 5 Tactical Match' : 'Casual Match',
      venue: newRoomVenue,
      locationDetails: 'Court Utama - Standar Nasional',
      timeSlot: 'Hari ini • 20:00 WIB',
      currentPlayers: 1,
      maxPlayers: newRoomMaxPlayers,
      status: 'WAITING',
      hostName: user.name,
      isPasswordProtected: false,
      entryFee: 'Rp 40.000 / orang',
      minLevel: 1,
      slots: [
        {
          slotNumber: 1,
          team: 'red',
          userId: user.id,
          username: user.name,
          level: user.level,
          rankBadge: user.rankBadge,
          isHost: true,
          isReady: true,
          ping: 15,
          gearBonus: 'Host Room Leader',
        },
        ...Array.from({ length: newRoomMaxPlayers - 1 }, (_, i) => ({
          slotNumber: i + 2,
          team: (i + 2 <= newRoomMaxPlayers / 2 ? 'red' : 'blue') as 'red' | 'blue',
          isReady: false,
          ping: 0,
        })),
      ],
    };

    setRooms([newRoom, ...rooms]);
    setShowCreateModal(false);
    setNewRoomTitle('');
    setActiveRoom(newRoom);
    setIsUserReady(true);
  };

  const filteredRooms = selectedSport === 'all'
    ? rooms
    : rooms.filter((r) => r.sport === selectedSport);

  return (
    <motion.div
      id="pointblank-lobby-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 pb-24 max-w-6xl mx-auto"
    >
      {/* Sound & Navigation Top Tactical Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#24242A] border border-[#9E9E9E]/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="font-mono text-[#9E9E9E]">SERVER:</span>
          <span className="font-bold text-white tracking-wider uppercase">JAKARTA-01 [CYBER ARENA]</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#1C2454] text-[#CCFF00] border border-[#3D4BFF]/40 text-[10px] font-mono">
            PING: 14ms
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const muted = soundFx.toggleMute();
              setIsMuted(muted);
            }}
            className="flex items-center gap-1.5 text-[#9E9E9E] hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#CCFF00]" />}
            <span className="hidden sm:inline text-xs font-semibold">{isMuted ? 'SFX Muted' : 'SFX Active'}</span>
          </button>

          {activeRoom && (
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 transition-all font-bold text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Keluar Room
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW A: ACTIVE ROOM SCREEN (POINT BLANK IN-ROOM TACTICAL UI)
          ========================================================================= */}
      <AnimatePresence mode="wait">
        {activeRoom ? (
          <motion.div
            key="pb-active-room"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            id="pb-active-room"
            className="space-y-4"
          >
          {/* Room Banner Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#24242A] border-l-4 border-[#3D4BFF] border-y border-r border-[#9E9E9E]/10 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#CCFF00] text-black font-black text-sm tracking-wider uppercase italic">
                    ROOM #{activeRoom.roomNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#3D4BFF] text-white uppercase tracking-wider">
                    {activeRoom.sport} • {activeRoom.mode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#2D3A1B] text-[#CCFF00] border border-[#CCFF00]/30">
                    {activeRoom.status}
                  </span>
                </div>
                <h2 className="font-bold text-white text-lg sm:text-xl tracking-wide">
                  {activeRoom.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9E9E9E]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3D4BFF]" /> {activeRoom.venue} ({activeRoom.locationDetails})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#CCFF00]" /> {activeRoom.timeSlot}
                  </span>
                  <span className="flex items-center gap-1 text-white">
                    <Shield className="w-3.5 h-3.5 text-[#3D4BFF]" /> Host: <b className="text-[#CCFF00]">{activeRoom.hostName}</b>
                  </span>
                </div>
              </div>

              {/* Match Start / Countdown Alert */}
              {isMatchStarting && (
                <div className="px-4 py-3 rounded-xl bg-[#2D3A1B] border-2 border-[#CCFF00] flex items-center gap-3 animate-pulse">
                  <Flame className="w-6 h-6 text-[#CCFF00]" />
                  <div>
                    <div className="text-xs font-bold text-[#CCFF00] uppercase tracking-wider">
                      Match Countdown
                    </div>
                    <div className="text-2xl font-black text-white leading-none">
                      MULAI DALAM {countdown}s
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tactical Main Grid: Player Slots (Left 2 cols) & Live In-Room Chat (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* LEFT & CENTER: PB PLAYER SLOTS (RED TEAM vs BLUE TEAM) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Team Red Section */}
              <div className="p-4 rounded-xl bg-[#24242A] border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                    <span className="font-bold text-red-400 text-xs tracking-widest uppercase">
                      RED TEAM (SQUAD A)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#9E9E9E]">
                    {activeRoom.slots.filter((s) => s.team === 'red' && s.userId).length} / {activeRoom.slots.filter((s) => s.team === 'red').length} Pemain
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeRoom.slots
                    .filter((s) => s.team === 'red')
                    .map((slot) => (
                      <div
                        key={slot.slotNumber}
                        className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                          slot.userId
                            ? slot.isReady
                              ? 'bg-[#1C2454] border-[#CCFF00]/60 shadow-sm'
                              : 'bg-[#121212] border-[#9E9E9E]/20'
                            : 'bg-[#121212]/40 border-dashed border-[#9E9E9E]/20 opacity-70'
                        }`}
                      >
                        {slot.userId ? (
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="relative w-9 h-9 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center font-bold text-base text-white">
                              {slot.level}
                              {slot.isHost && (
                                <span className="absolute -top-1.5 -right-1 px-1 rounded bg-[#CCFF00] text-black text-[9px] font-bold">
                                  HOST
                                </span>
                              )}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white truncate">
                                  {slot.username}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-[#9E9E9E]">
                                <span>{slot.rankBadge}</span>
                                <span className="text-green-400 font-mono">{slot.ping}ms</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-[#9E9E9E] italic">
                            <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center font-mono">
                              #{slot.slotNumber}
                            </span>
                            <span>Slot Kosong (Buka)</span>
                          </div>
                        )}

                        <div>
                          {slot.userId ? (
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                slot.isReady
                                  ? 'bg-[#CCFF00] text-black shadow-sm shadow-[#CCFF00]/40'
                                  : 'bg-white/10 text-[#9E9E9E]'
                              }`}
                            >
                              {slot.isReady ? 'READY' : 'WAIT'}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                soundFx.playClick();
                                alert('Link undangan slot telah disalin ke clipboard!');
                              }}
                              className="px-2 py-1 rounded bg-[#3D4BFF]/20 hover:bg-[#3D4BFF]/40 text-[#CCFF00] border border-[#3D4BFF]/40 text-[10px] font-semibold"
                            >
                              + Invite
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Team Blue Section */}
              <div className="p-4 rounded-xl bg-[#24242A] border border-[#3D4BFF]/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#3D4BFF]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#3D4BFF] shadow-sm shadow-[#3D4BFF]" />
                    <span className="font-bold text-[#3D4BFF] text-xs tracking-widest uppercase">
                      BLUE TEAM (SQUAD B)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#9E9E9E]">
                    {activeRoom.slots.filter((s) => s.team === 'blue' && s.userId).length} / {activeRoom.slots.filter((s) => s.team === 'blue').length} Pemain
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeRoom.slots
                    .filter((s) => s.team === 'blue')
                    .map((slot) => {
                      const isMe = slot.userId === user.id;
                      return (
                        <div
                          key={slot.slotNumber}
                          className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                            isMe
                              ? 'bg-[#1C2454] border-[#CCFF00] shadow-md shadow-[#CCFF00]/10 ring-1 ring-[#CCFF00]'
                              : slot.userId
                              ? slot.isReady
                                ? 'bg-[#1C2454] border-[#CCFF00]/60 shadow-sm'
                                : 'bg-[#121212] border-[#9E9E9E]/20'
                              : 'bg-[#121212]/40 border-dashed border-[#9E9E9E]/20 opacity-70'
                          }`}
                        >
                          {slot.userId ? (
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="relative w-9 h-9 rounded-lg bg-[#3D4BFF]/30 border border-[#3D4BFF] flex items-center justify-center font-bold text-base text-white">
                                {slot.level}
                                {isMe && (
                                  <span className="absolute -top-1.5 -right-1 px-1 rounded bg-[#CCFF00] text-black text-[9px] font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold text-xs truncate ${isMe ? 'text-[#CCFF00]' : 'text-white'}`}>
                                    {slot.username}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-[#9E9E9E]">
                                  <span>{slot.rankBadge}</span>
                                  <span className="text-green-400 font-mono">{slot.ping}ms</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-[#9E9E9E] italic">
                              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center font-mono">
                                #{slot.slotNumber}
                              </span>
                              <span>Slot Kosong (Buka)</span>
                            </div>
                          )}

                          <div>
                            {slot.userId ? (
                              <span
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  slot.isReady
                                    ? 'bg-[#CCFF00] text-black shadow-sm shadow-[#CCFF00]/40'
                                    : 'bg-white/10 text-[#9E9E9E]'
                                }`}
                              >
                                {slot.isReady ? 'READY' : 'WAIT'}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  alert('Link slot telah disalin!');
                                }}
                                className="px-2 py-1 rounded bg-[#3D4BFF]/20 hover:bg-[#3D4BFF]/40 text-[#CCFF00] border border-[#3D4BFF]/40 text-[10px] font-semibold"
                              >
                                + Invite
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Point Blank High-Impact Tactical CTA Button Section */}
              <div className="p-4 rounded-xl bg-[#24242A] border border-[#9E9E9E]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Status Anda di Room #{activeRoom.roomNumber}:</div>
                  <p className="text-[11px] text-[#9E9E9E]">
                    {isUserReady
                      ? 'Status: Siap bertanding! Menunggu host memulai match.'
                      : 'Status: Belum siap. Tekan tombol READY untuk mengunci slot avatar.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Ready Toggle Button (Glowing Neon Lime) */}
                  <motion.button
                    id="btn-pb-ready-toggle"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleUserReady}
                    className={`w-full sm:w-52 py-4 px-6 rounded-xl font-black text-base uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] ${
                      isUserReady
                        ? 'bg-[#2D3A1B] text-[#CCFF00] border-2 border-[#CCFF00]'
                        : 'bg-[#CCFF00] hover:bg-white text-[#121212]'
                    }`}
                  >
                    {isUserReady ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>READY OK!</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                        <span>READY / JOIN MATCH</span>
                      </>
                    )}
                  </motion.button>

                  {/* Host Start Match Button (Simulated) */}
                  <button
                    id="btn-pb-start-match"
                    onClick={handleStartMatchSimulation}
                    disabled={isMatchStarting}
                    className="px-4 py-4 rounded-xl bg-[#3D4BFF] hover:bg-[#2e3be6] text-white font-bold text-xs uppercase tracking-wider border border-[#CCFF00]/40 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Host Start</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: POINT BLANK IN-ROOM TACTICAL CHAT PANEL */}
            <div className="rounded-xl bg-[#24242A] border border-[#9E9E9E]/10 flex flex-col h-[520px] overflow-hidden shadow-xl">
              {/* Chat Header */}
              <div className="p-4 bg-[#24242A] border-b border-[#9E9E9E]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#CCFF00]" />
                  <span className="text-sm font-black text-[#CCFF00] uppercase italic tracking-widest">
                    Networking Chat
                  </span>
                </div>
                <span className="text-[10px] bg-[#3D4BFF] px-2 py-1 rounded text-white font-bold uppercase">
                  PB V2.4
                </span>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#121212] font-mono text-xs">
                {chatMessages.map((msg) => {
                  if (msg.isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="p-2 rounded-lg bg-[#2D3A1B]/60 border border-[#CCFF00]/30 text-[#CCFF00] text-[11px] leading-relaxed"
                      >
                        {msg.text}
                      </div>
                    );
                  }

                  const isHost = msg.senderRole === 'HOST';
                  const isBlue = msg.team === 'blue';

                  return (
                    <div key={msg.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-[#9E9E9E]">[{msg.timestamp}]</span>
                        {isHost && (
                          <span className="px-1 rounded bg-[#CCFF00] text-black font-bold text-[9px]">
                            HOST
                          </span>
                        )}
                        <span
                          className={`font-bold ${
                            isBlue ? 'text-[#3D4BFF]' : 'text-[#CCFF00]'
                          }`}
                        >
                          {msg.sender}:
                        </span>
                      </div>
                      <p className="text-white text-xs pl-2 border-l-2 border-[#9E9E9E]/20">
                        {msg.text}
                      </p>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Tactical Macro Shortcuts */}
              <div className="p-2 bg-[#1C2454]/40 border-t border-[#9E9E9E]/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['Siap gas!', 'Kurang 1 orang', 'Kiper ready', 'Gue telat 5 mnt', 'Ganti jersey'].map(
                  (macro, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMacro(macro)}
                      className="whitespace-nowrap px-2.5 py-1 rounded bg-[#24242A] hover:bg-[#3D4BFF]/30 text-[10px] font-semibold text-[#CCFF00] border border-[#9E9E9E]/10 hover:border-[#CCFF00] transition-all flex-shrink-0"
                    >
                      {macro}
                    </button>
                  )
                )}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendChat} className="p-3 bg-[#24242A] border-t border-[#9E9E9E]/10 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik pesan strategi..."
                  className="flex-1 bg-[#121212] border border-[#9E9E9E]/20 rounded-lg px-3 py-2 text-xs text-white placeholder-[#9E9E9E] focus:outline-none focus:border-[#CCFF00]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-[#CCFF00] hover:bg-white text-black transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      ) : (
        /* =========================================================================
           VIEW B: POINT BLANK ROOM BROWSER & MATCHMAKING LOBBY
           ========================================================================= */
        <motion.div
          key="pb-room-browser"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          id="pb-room-browser"
          className="space-y-4"
        >
          {/* Lobby Banner & Quick Actions */}
          <div className="p-5 rounded-xl bg-[#24242A] border-l-4 border-[#3D4BFF] border-y border-r border-[#9E9E9E]/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg sm:text-xl text-white uppercase tracking-tight">
                  Point Blank Matchmaking Lobby
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3D4BFF] text-white uppercase tracking-wider">
                  Online: 1.2k
                </span>
              </div>
              <p className="text-xs text-[#9E9E9E] mt-1">
                Pilih Room mabar olahraga yang sedang menunggu pemain atau buat Room baru.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                id="btn-create-pb-room"
                onClick={() => {
                  soundFx.playClick();
                  setShowCreateModal(true);
                }}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-[#3D4BFF] hover:bg-[#2f3de6] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#CCFF00]/30 shadow-lg shadow-[#3D4BFF]/25 transition-all"
              >
                <Plus className="w-4 h-4 text-[#CCFF00]" />
                <span>+ Buat Room Baru</span>
              </button>

              <button
                onClick={() => {
                  if (rooms.length > 0) handleEnterRoom(rooms[0]);
                }}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-white text-[#121212] text-xs font-black uppercase italic tracking-tighter flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
              >
                <Flame className="w-4 h-4" />
                <span>Quick Join</span>
              </button>
            </div>
          </div>

          {/* Sport Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: '🔥 Semua Room' },
              { id: 'futsal', label: '⚽ Futsal (5v5)' },
              { id: 'badminton', label: '🏸 Badminton (Ganda)' },
              { id: 'basketball', label: '🏀 Basketball (3x3)' },
              { id: 'padel', label: '🎾 Padel Open' },
              { id: 'running', label: '🏃 Group Running' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedSport(tab.id as SportCategory);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                  selectedSport === tab.id
                    ? 'bg-[#3D4BFF] text-white border border-[#CCFF00] shadow-md shadow-[#3D4BFF]/30'
                    : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border border-[#9E9E9E]/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Point Blank Tactical Room List Table/Grid */}
          <div className="space-y-2">
            {filteredRooms.map((room) => {
              const isFull = room.currentPlayers >= room.maxPlayers;
              const isWaiting = room.status === 'WAITING';

              return (
                <div
                  key={room.id}
                  id={`pb-room-item-${room.id}`}
                  onClick={() => handleEnterRoom(room)}
                  className="group relative p-3.5 sm:p-4 rounded-xl bg-[#24242A] hover:bg-[#1C2454] border-l-2 border-[#3D4BFF] border-y border-r border-[#9E9E9E]/10 hover:border-[#CCFF00] cursor-pointer transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Room Info */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Room Number Block */}
                    <div className="text-xs font-mono opacity-50 px-2 py-1 rounded bg-[#121212] border border-[#9E9E9E]/10 flex-shrink-0">
                      {String(room.roomNumber).padStart(3, '0')}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base group-hover:text-[#CCFF00] transition-colors">
                          {room.title}
                        </span>
                        {room.isPasswordProtected ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#9E9E9E]">
                        <span className="px-2 py-0.5 rounded bg-[#121212] text-white border border-[#9E9E9E]/10 font-semibold uppercase text-[10px]">
                          {room.sport}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#3D4BFF]" /> {room.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#9E9E9E]" /> {room.timeSlot}
                        </span>
                        <span className="text-white font-mono text-[11px]">
                          Host: <b className="text-[#CCFF00]">{room.hostName}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Capacity & Status CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-[#9E9E9E]/10">
                    {/* Capacity Indicator */}
                    <div className="text-left md:text-right">
                      <div className="flex items-center md:justify-end gap-1.5 text-xs font-bold text-white">
                        <Users className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span className="font-mono">{room.currentPlayers} / {room.maxPlayers} Players</span>
                      </div>
                      <span className="text-[10px] text-[#9E9E9E] font-mono">
                        {room.entryFee || 'Free Entry'}
                      </span>
                    </div>

                    {/* Status Pill & Join Action */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isFull
                            ? 'bg-[#3D4BFF] text-white'
                            : isWaiting
                            ? 'bg-[#2D3A1B] text-[#CCFF00] border border-[#CCFF00]/40'
                            : 'bg-[#1C2454] text-white'
                        }`}
                      >
                        {room.status}
                      </span>

                      <button className="px-4 py-2 rounded-lg bg-[#121212] group-hover:bg-[#CCFF00] text-white group-hover:text-black font-black text-xs uppercase tracking-wider border border-[#9E9E9E]/10 group-hover:border-[#CCFF00] transition-all">
                        {isFull ? 'Spectate' : 'Join Room →'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* =========================================================================
          CREATE ROOM MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#24242A] border border-[#3D4BFF]/50 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#9E9E9E]/10">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#CCFF00]" />
                  <h3 className="font-bold text-lg text-white">
                    Buat Room Mabar PB Baru
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#9E9E9E] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Judul Room Mabar
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomTitle}
                    onChange={(e) => setNewRoomTitle(e.target.value)}
                    placeholder="Contoh: [RANKED] Mabar Futsal Malam - Butuh 3 Orang"
                    className="w-full bg-[#121212] border border-[#9E9E9E]/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#9E9E9E] focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Kategori Olahraga
                    </label>
                    <select
                      value={newRoomSport}
                      onChange={(e) => setNewRoomSport(e.target.value as SportCategory)}
                      className="w-full bg-[#121212] border border-[#9E9E9E]/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="futsal">Futsal (5v5)</option>
                      <option value="badminton">Badminton</option>
                      <option value="basketball">Basketball 3x3</option>
                      <option value="padel">Padel</option>
                      <option value="running">Running</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Kapasitas Slot Pemain
                    </label>
                    <select
                      value={newRoomMaxPlayers}
                      onChange={(e) => setNewRoomMaxPlayers(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#9E9E9E]/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value={4}>4 Pemain (2 vs 2)</option>
                      <option value={6}>6 Pemain (3 vs 3)</option>
                      <option value={10}>10 Pemain (5 vs 5)</option>
                      <option value={14}>14 Pemain (7 vs 7)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Lokasi / Lapangan Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomVenue}
                    onChange={(e) => setNewRoomVenue(e.target.value)}
                    placeholder="Contoh: Epicentrum Futsal Court A"
                    className="w-full bg-[#121212] border border-[#9E9E9E]/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#9E9E9E] focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#9E9E9E]/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#121212] text-[#9E9E9E] hover:text-white text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-white text-[#121212] font-black text-xs uppercase italic tracking-tighter shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                  >
                    Buka Room Sekarang
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
