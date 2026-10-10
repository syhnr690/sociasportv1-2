import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Layers, 
  Palette, 
  Sparkles, 
  Workflow, 
  CheckCircle2, 
  Gamepad2, 
  Layout, 
  Maximize2,
  Zap,
  Volume2,
  Sun,
  Building2
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

export const DesignSpecViewer: React.FC = () => {
  const { isDay } = useTheme();
  const [activeDocTab, setActiveDocTab] = useState<'flow' | 'wireframes' | 'palette' | 'micro' | 'v12'>('flow');

  const triggerDemoConfetti = () => {
    soundFx.playXpGain();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#CCFF00', '#3D4BFF', '#FFFFFF'],
    });
  };

  return (
    <motion.div
      id="design-spec-viewer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-5xl mx-auto"
    >
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border shadow-2xl space-y-2 ${
        isDay 
          ? 'bg-gradient-to-r from-blue-50 via-white to-emerald-50 border-blue-300' 
          : 'bg-gradient-to-r from-[#1C2454] via-[#24242A] to-[#2D3A1B] border-[#CCFF00]/40'
      }`}>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3D4BFF] uppercase tracking-widest">
          <FileText className="w-4 h-4" /> PM & Game UI/UX Design System Specification • v1.2
        </div>
        <h1 className={`font-display font-bold text-2xl sm:text-3xl tracking-wide uppercase ${
          isDay ? 'text-slate-900' : 'text-white'
        }`}>
          SOCIASPORT V1.2 — DOKUMENTASI DESAIN & FITUR BARU
        </h1>
        <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
          isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
        }`}>
          Rancangan arsitektur antarmuka, tata letak wireframe modular, token Night/Day Theme, portal Mitra Sewa Lapangan, dan spesifikasi micro-interaction yang memadukan ekosistem <b>Roblox</b> dengan <b>Point Blank</b>.
        </p>
      </div>

      {/* Doc Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
        {[
          { id: 'flow', label: '1. User Flow & Navigasi', icon: Workflow },
          { id: 'wireframes', label: '2. Wireframe Layar Kunci', icon: Layout },
          { id: 'palette', label: '3. Penerapan Palet Warna', icon: Palette },
          { id: 'micro', label: '4. Micro-interactions & SFX', icon: Sparkles },
          { id: 'v12', label: '5. Fitur Baru v1.2', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveDocTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeDocTab === tab.id
                  ? 'border-[#3D4BFF] text-[#3D4BFF] bg-blue-500/10 font-bold'
                  : 'border-transparent text-[#9E9E9E] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>


      {/* =========================================================================
          SECTION 1: USER FLOW & NAVIGATION ARCHITECTURE
          ========================================================================= */}
      {activeDocTab === 'flow' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#24242A] border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-[#CCFF00]" />
              A. Susunan Menu Bottom Navigation Bar
            </h3>
            <p className="text-xs text-[#9E9E9E]">
              Struktur Bottom Navigation dirancang dengan 5 titik interaksi utama yang mengedepankan kemudahan navigasi satu tangan (thumb zone):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">TAB 1</span>
                <h4 className="font-bold text-white text-xs">🏠 Beranda</h4>
                <p className="text-[10px] text-[#9E9E9E]">
                  Roblox-style 3D Avatar Hero, Level/XP, & Action Feeds.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#2D3A1B] border border-[#CCFF00]/40 space-y-1">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">TAB 2 [BARU]</span>
                <h4 className="font-bold text-white text-xs">🏟️ Sewa Lapang</h4>
                <p className="text-[10px] text-[#9E9E9E]">
                  Booking Court Futsal/Badminton, Jadwal Slot, Addons & E-Ticket.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1C2454] border border-[#3D4BFF] space-y-1">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">TAB 3 [CORE]</span>
                <h4 className="font-bold text-white text-xs">🎮 PB Lobby</h4>
                <p className="text-[10px] text-[#9E9E9E]">
                  Tactical Room List, Matchmaking Red vs Blue, Ready Room & XP.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">TAB 4</span>
                <h4 className="font-bold text-white text-xs">🎯 Quests</h4>
                <p className="text-[10px] text-[#9E9E9E]">
                  Misi harian (10k langkah, kalori, hidrasi) & klaim hadiah XP.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">TAB 5</span>
                <h4 className="font-bold text-white text-xs">👕 Locker</h4>
                <p className="text-[10px] text-[#9E9E9E]">
                  Kustomisasi jersey, sepatu turf, visor HUD, & atribut.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121212] border border-[#CCFF00]/40 space-y-1">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">TAB 6</span>
                <h4 className="font-bold text-white text-xs">📑 Specs</h4>
                <p className="text-[10px] text-[#9E9E9E]">
                  Pusat dokumentasi arsitektur UI/UX & spesifikasi engineering.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#24242A] border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#3D4BFF]" />
              B. Alur User Journey: Homepage → Masuk PB Room Lobby
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#3D4BFF]">
              <div className="relative space-y-1">
                <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-[#CCFF00] border-2 border-black" />
                <h4 className="font-bold text-white text-sm">Langkah 1: Entry & Avatar Dashboard (Homepage)</h4>
                <p className="text-xs text-[#9E9E9E]">
                  User membuka aplikasi dan langsung disambut oleh 3D Avatar personal yang mengenakan gear terkini, status Level 24, progress bar XP harian, dan ringkasan staminanya.
                </p>
              </div>

              <div className="relative space-y-1">
                <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-[#3D4BFF] border-2 border-black" />
                <h4 className="font-bold text-white text-sm">Langkah 2: Discovery Aktivitas / Tekan "Buka PB Lobby"</h4>
                <p className="text-xs text-[#9E9E9E]">
                  User men-scroll horizontal carousel "Trending Sesi Mabar" atau menekan tombol Quick Launch "PB Tactical Matchmaking Lobby" di Homepage.
                </p>
              </div>

              <div className="relative space-y-1">
                <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-[#3D4BFF] border-2 border-black" />
                <h4 className="font-bold text-white text-sm">Langkah 3: Filter & Pilih Room di PB Lobby Browser</h4>
                <p className="text-xs text-[#9E9E9E]">
                  User melihat daftar room bernomor (contoh: Room #101 [RANKED] Mabar Futsal Senayan 8/10), memilih filter kategori olahraga, mengecek ping latency dan lokasi venue.
                </p>
              </div>

              <div className="relative space-y-1">
                <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-[#CCFF00] border-2 border-black" />
                <h4 className="font-bold text-white text-sm">Langkah 4: Masuk Active Room & Tactical In-Room Grid</h4>
                <p className="text-xs text-[#9E9E9E]">
                  Animasi shutter militer terbuka: User ditempatkan di slot Red/Blue Team, avatar dan rank-nya muncul di samping rekan setim. Kolom chat taktis dan shortcut macro ("Siap gas!") aktif.
                </p>
              </div>

              <div className="relative space-y-1">
                <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-[#CCFF00] border-2 border-black animate-ping" />
                <h4 className="font-bold text-white text-sm">Langkah 5: Klik Tombol Neon Lime "READY" & Match Starting</h4>
                <p className="text-xs text-[#9E9E9E]">
                  User menekan tombol "READY" bercahaya neon lime. Sound effect militer berbunyi, status slot berubah menjadi hijau READY, dan ketika Host menekan Start, sinkronisasi GPS tracking/XP dimulai!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: DETAILED SCREEN WIREFRAMES
          ========================================================================= */}
      {activeDocTab === 'wireframes' && (
        <div className="space-y-6">
          {/* Wireframe 1: Roblox Style Homepage */}
          <div className="p-5 rounded-2xl bg-[#24242A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#CCFF00]" />
                1. Wireframe Detail: Homepage (Roblox-Style Layout)
              </h3>
              <span className="px-2.5 py-1 rounded bg-[#1C2454] text-[#CCFF00] text-xs font-mono font-bold">
                ROBLOX CORE LAYOUT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm text-[#CCFF00]">
                  A. Roblox 3D Avatar Podium Stage
                </h4>
                <ul className="space-y-1.5 text-[#9E9E9E] list-disc list-inside">
                  <li><b className="text-white">Penempatan:</b> Bagian atas/tengah halaman (Above the fold hero).</li>
                  <li><b className="text-white">Interaktivitas 3D:</b> Gyroscope tilt merespons pergerakan kursor mouse atau sentuhan jari.</li>
                  <li><b className="text-white">Level & Rank Badge:</b> Kotak neon lime (#CCFF00) menampilkan angka level dan gelar rank (contoh: Major I).</li>
                  <li><b className="text-white">XP Progress Track:</b> Bar gradasi Electric Blue (#3D4BFF) ke Neon Lime (#CCFF00) dengan label nilai XP saat ini.</li>
                  <li><b className="text-white">Floating Stat Tags:</b> Badge Agility, Stamina, dan Teamwork di kiri & kanan avatar.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm text-[#3D4BFF]">
                  B. Horizontal Scroll Activity Rows (Roblox Rows)
                </h4>
                <ul className="space-y-1.5 text-[#9E9E9E] list-disc list-inside">
                  <li><b className="text-white">Row 1:</b> Trending Sports Matches (Futsal Senayan, Badminton Ganda, 3x3 Streetball).</li>
                  <li><b className="text-white">Row 2:</b> Daily Quests Grid dengan tombol klaim XP yang memicu animasi perayaan.</li>
                  <li><b className="text-white">Row 3:</b> Skill Arena & Mini-Games Olahraga (Reflex ladder, Penalty shootout AR, Beep test).</li>
                  <li><b className="text-white">Kartu Aktivitas:</b> Menggunakan Card Variants (Dark Blue #1C2454 & Dark Olive #2D3A1B) dengan highlight Neon Lime.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wireframe 2: Point Blank Style Lobby */}
          <div className="p-5 rounded-2xl bg-[#24242A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#3D4BFF]" />
                2. Wireframe Detail: PB Lobby (Matchmaking & In-Room)
              </h3>
              <span className="px-2.5 py-1 rounded bg-[#2D3A1B] text-[#CCFF00] text-xs font-mono font-bold">
                POINT BLANK TACTICAL UI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm text-[#CCFF00]">
                  A. Room Browser (Daftar Room)
                </h4>
                <ul className="space-y-1.5 text-[#9E9E9E] list-disc list-inside">
                  <li><b className="text-white">Nomor Room:</b> Badge nomor tebal [NO. 101] dengan font militer/cyber.</li>
                  <li><b className="text-white">Judul & Mode:</b> Judul mabar, venue lokasi, dan waktu kickoff.</li>
                  <li><b className="text-white">Indikator Slot:</b> 8/10 Pemain dengan status WAITING / FULL / PLAYING.</li>
                  <li><b className="text-white">Quick Join & Create:</b> Tombol aksi cepat untuk masuk otomatis atau bikin room baru.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm text-[#3D4BFF]">
                  B. Slot Pemain (Red vs Blue Squad)
                </h4>
                <ul className="space-y-1.5 text-[#9E9E9E] list-disc list-inside">
                  <li><b className="text-white">Grid Pemain:</b> 8 hingga 10 slot pemain terbagi atas Red Team dan Blue Team.</li>
                  <li><b className="text-white">Identitas:</b> Mini avatar, level box, rank badge, dan latency ping ms.</li>
                  <li><b className="text-white">Status READY:</b> Label neon lime menyala jika pemain telah mengonfirmasi kesiapan.</li>
                  <li><b className="text-white">Slot Kosong:</b> Border dashed dengan tombol "+ Invite".</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm text-[#CCFF00]">
                  C. Chat Taktis & Tombol READY
                </h4>
                <ul className="space-y-1.5 text-[#9E9E9E] list-disc list-inside">
                  <li><b className="text-white">In-Room Chat:</b> Panel chat real-time dengan pembeda warna tim & log sistem.</li>
                  <li><b className="text-white">Macro Taktis:</b> Shortcut instan ("Siap gas!", "Kiper ready", "Kurang 1 orang").</li>
                  <li><b className="text-white">Tombol READY (#CCFF00):</b> Tombol utama berdaya visual tinggi dengan efek pulsasi glow neon.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: COLOR PALETTE IMPLEMENTATION GUIDE
          ========================================================================= */}
      {activeDocTab === 'palette' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#24242A] border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#CCFF00]" />
              Panduan Implementasi Token Warna Sociasport
            </h3>
            <p className="text-xs text-[#9E9E9E]">
              Perpaduan palet dark modern dirancang untuk menghadirkan kontras tinggi, keterbacaan prima di kondisi lapangan (outdoor), dan aura kompetitif khas game FPS/Esports:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {/* Background */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Main Background</span>
                  <span className="font-mono text-xs text-[#9E9E9E]">#121212</span>
                </div>
                <div className="h-8 rounded-lg bg-[#121212] border border-white/20" />
                <p className="text-[11px] text-[#9E9E9E]">
                  Canvas dasar aplikasi. Menghemat konsumsi daya layar OLED saat dipakai olahraga outdoor.
                </p>
              </div>

              {/* Surface / Cards */}
              <div className="p-4 rounded-xl bg-[#24242A] border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Surface / Cards</span>
                  <span className="font-mono text-xs text-[#9E9E9E]">#24242A</span>
                </div>
                <div className="h-8 rounded-lg bg-[#24242A] border border-white/20" />
                <p className="text-[11px] text-[#9E9E9E]">
                  Kontainer kartu standar, kolom chat, status bar, dan panel navigasi bawah.
                </p>
              </div>

              {/* Neon Lime Accent */}
              <div className="p-4 rounded-xl bg-[#24242A] border border-[#CCFF00]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#CCFF00]">Neon Lime Accent</span>
                  <span className="font-mono text-xs text-[#CCFF00]">#CCFF00</span>
                </div>
                <div className="h-8 rounded-lg bg-[#CCFF00]" />
                <p className="text-[11px] text-[#9E9E9E]">
                  Tombol READY/JOIN, badge XP, highlight level avatar, dan elemen gamifikasi utama.
                </p>
              </div>

              {/* Electric Blue Accent */}
              <div className="p-4 rounded-xl bg-[#24242A] border border-[#3D4BFF]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3D4BFF]">Electric Blue Accent</span>
                  <span className="font-mono text-xs text-[#3D4BFF]">#3D4BFF</span>
                </div>
                <div className="h-8 rounded-lg bg-[#3D4BFF]" />
                <p className="text-[11px] text-[#9E9E9E]">
                  Indikator Blue Squad, tab aktif, progress bar XP, dan border fokus interaktif.
                </p>
              </div>

              {/* Dark Blue Variant */}
              <div className="p-4 rounded-xl bg-[#1C2454] border border-[#3D4BFF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Card Variant: Dark Blue</span>
                  <span className="font-mono text-xs text-[#CCFF00]">#1C2454</span>
                </div>
                <div className="h-8 rounded-lg bg-[#1C2454] border border-[#3D4BFF]" />
                <p className="text-[11px] text-[#9E9E9E]">
                  Kartu aktivitas kompetitif (Futsal Ranked, Streetball, Hero Avatar stage).
                </p>
              </div>

              {/* Dark Olive Variant */}
              <div className="p-4 rounded-xl bg-[#2D3A1B] border border-[#CCFF00]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#CCFF00]">Card Variant: Dark Olive</span>
                  <span className="font-mono text-xs text-[#CCFF00]">#2D3A1B</span>
                </div>
                <div className="h-8 rounded-lg bg-[#2D3A1B] border border-[#CCFF00]/40" />
                <p className="text-[11px] text-[#9E9E9E]">
                  Kartu aktivitas endurance / outdoor (Badminton casual, 5K Night Run, Quest selesai).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: MICRO-INTERACTIONS & SFX
          ========================================================================= */}
      {activeDocTab === 'micro' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#24242A] border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#CCFF00]" />
              Saran Animasi & Tactical Micro-interactions
            </h3>
            <p className="text-xs text-[#9E9E9E]">
              Uji coba langsung efek animasi dan feedback suara (Web Audio API) yang diterapkan di Sociasport:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Interaction 1: Neon Lime Pulse */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">1. Efek Glowing Pulsasi Tombol READY</h4>
                  <span className="px-2 py-0.5 rounded bg-[#CCFF00]/20 text-[#CCFF00] text-[10px] font-mono">
                    PB MATCH READY
                  </span>
                </div>
                <p className="text-xs text-[#9E9E9E]">
                  Tombol READY memiliki bayangan neon lime bernapas (breathing neon drop-shadow) yang berubah menjadi hijau solid berkilau saat ditekan.
                </p>
                <div className="pt-2 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => soundFx.playReadyTone(true)}
                    className="px-6 py-2.5 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider neon-border-lime shadow-lg shadow-[#CCFF00]/40"
                  >
                    Test Ready Tone (SFX)
                  </motion.button>
                </div>
              </div>

              {/* Interaction 2: Room Entry Shutter */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">2. Shutter Masuk Room Taktis</h4>
                  <span className="px-2 py-0.5 rounded bg-[#3D4BFF]/20 text-[#3D4BFF] text-[10px] font-mono">
                    PB ROOM TRANSITION
                  </span>
                </div>
                <p className="text-xs text-[#9E9E9E]">
                  Saat mengklik salah satu room di browser, layar menampilkan animasi sweep cyber horizontal diiringi suara radio militer.
                </p>
                <div className="pt-2 flex items-center justify-center">
                  <button
                    onClick={() => soundFx.playRoomEntry()}
                    className="px-5 py-2.5 rounded-xl bg-[#1C2454] text-white hover:text-[#CCFF00] border border-[#3D4BFF] font-display font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Test Room Shutter (SFX)
                  </button>
                </div>
              </div>

              {/* Interaction 3: XP Claim Confetti Fanfare */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">3. Level-Up / XP Claim Fanfare</h4>
                  <span className="px-2 py-0.5 rounded bg-[#2D3A1B] text-[#CCFF00] text-[10px] font-mono">
                    GAMIFICATION XP
                  </span>
                </div>
                <p className="text-xs text-[#9E9E9E]">
                  Ketika user menyelesaikan quest atau memenangkan match, bar XP mengisi dengan akselerasi kurva ease-out dan partikel confetti menyembur.
                </p>
                <div className="pt-2 flex items-center justify-center">
                  <button
                    onClick={triggerDemoConfetti}
                    className="px-5 py-2.5 rounded-xl bg-[#2D3A1B] text-[#CCFF00] border border-[#CCFF00] font-display font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all"
                  >
                    Test XP Fanfare & Confetti
                  </button>
                </div>
              </div>

              {/* Interaction 4: 3D Avatar Tilt Parallax */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">4. 3D Avatar Gyro Parallax</h4>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono">
                    ROBLOX AVATAR
                  </span>
                </div>
                <p className="text-xs text-[#9E9E9E]">
                  Avatar 3D merespons rotasi sumbu Y secara halus dengan pegas animasi (spring physics), menirukan podium avatar Roblox.
                </p>
                <div className="pt-2 flex items-center justify-center">
                  <div className="text-xs text-[#CCFF00] font-semibold">
                    ✓ Aktif secara langsung di Tab Beranda & Locker
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: SOCIA SPORT V1.2 RELEASE ARCHITECTURE
          ========================================================================= */}
      {activeDocTab === 'v12' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#24242A] border border-[#3D4BFF]/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#3D4BFF] text-white text-xs font-mono font-bold">
                RELEASE SPECIFICATION
              </span>
              <h3 className="font-display font-bold text-xl text-white uppercase">
                Socia Sport v1.2 Arsitektur & Peningkatan Sistem
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Feature 1 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <div className="text-[#CCFF00] font-bold text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Night & Day Theme System</span>
                </div>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">
                  Dukungan transisi mulus antara <b>Daytime Stadium Mode</b> (latar bersih, palet atletik profesional, kontras tinggi) dan <b>Tactical Night Ops</b> (palet obsidian cyber, glow neon lime & blue). Disimpan otomatis via LocalStorage.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <div className="text-[#3D4BFF] font-bold text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#3D4BFF]" />
                  <span>Portal Mitra Lapangan (Partner Hub)</span>
                </div>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">
                  Halaman khusus pemilik arena untuk mengelola jadwal operasional lapangan (07:00 - 24:00), kunci slot untuk maintenance/private, verifikasi check-in pemain via scan QR, serta simulasi penarikan omzet langsung ke rekening bank.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Bounce Auth & Demo Mode</span>
                </div>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">
                  Perbaikan tuntas bug race condition saat login: tidak memantulkan user kembali ke landing page saat token diproses, mapping error ramah pengguna dalam Bahasa Indonesia, dan 1-Click Instant Demo Access tanpa hambatan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
