import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ChevronDown, 
  Phone, 
  Send, 
  ExternalLink, 
  Gamepad2, 
  Sun, 
  Moon, 
  Layers,
  ArrowUpRight,
  Sliders,
  Check
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { SportCategory, Venue } from '../types';
import confetti from 'canvas-confetti';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface PartnerLandingPageViewProps {
  onGoToPartnerDashboard: () => void;
  onGoToPlayerApp: () => void;
  onRegisterNewVenue?: (newVenue: Venue) => void;
  onLoginPartner?: () => void;
  onSignupPartner?: () => void;
}

export const PartnerLandingPageView: React.FC<PartnerLandingPageViewProps> = ({
  onGoToPartnerDashboard,
  onGoToPlayerApp,
  onRegisterNewVenue,
  onLoginPartner,
  onSignupPartner,
}) => {
  const { isDay, toggleTheme } = useTheme();

  // Revenue Calculator State
  const [calcSport, setCalcSport] = useState<SportCategory>('futsal');
  const [calcCourts, setCalcCourts] = useState<number>(2);
  const [calcPricePerHour, setCalcPricePerHour] = useState<number>(250000);
  const [calcHoursPerDay, setCalcHoursPerDay] = useState<number>(7);

  // Registration Form State
  const [ownerName, setOwnerName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [sportType, setSportType] = useState<SportCategory>('futsal');
  const [city, setCity] = useState('Jakarta Selatan');
  const [district, setDistrict] = useState('Kuningan');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [courtCount, setCourtCount] = useState('2');
  const [pricePerHour, setPricePerHour] = useState('250000');
  const [bankAccount, setBankAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculate projected revenue
  const monthlyDays = 30;
  const standardRevenue = calcCourts * calcPricePerHour * calcHoursPerDay * monthlyDays;
  // Boost from Socia Sport automated community & matchmaking (+30%)
  const boostedRevenue = Math.round(standardRevenue * 1.32);
  const additionalGain = boostedRevenue - standardRevenue;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim() || !phone.trim() || !ownerName.trim()) {
      alert('Mohon lengkapi nama pemilik, nama venue, dan nomor WhatsApp!');
      return;
    }

    setIsSubmitting(true);
    soundFx.playClick();

    const priceNum = parseInt(pricePerHour) || 250000;
    const courtsNum = parseInt(courtCount) || 2;
    const generatedId = `venue-partner-${Date.now()}`;

    const newVenueObj: Venue = {
      id: generatedId,
      name: venueName,
      sport: sportType,
      city: city,
      district: district,
      fullAddress: address || `Jl. Utama ${venueName}, ${district}, ${city}`,
      distance: '1.2 km',
      rating: 5.0,
      reviewCount: 1,
      priceStartFrom: priceNum,
      imageUrl: '/src/assets/images/hero_partner_sports_arena_1791559679886.jpg',
      gallery: [
        '/src/assets/images/hero_partner_sports_arena_1791559679886.jpg',
        '/src/assets/images/partner_futsal_stadium_1791559690281.jpg',
        '/src/assets/images/partner_badminton_hall_1791559703440.jpg',
      ],
      facilities: [
        'Lampu LED Standar Pertandingan',
        'Ruang Ganti & Shower',
        'Parkir Mobil & Motor',
        'Free WiFi High-Speed',
        'Kantin Minuman Dingin',
      ],
      operatingHours: '07:00 - 24:00 WIB',
      rules: [
        'Gunakan sepatu khusus olahraga',
        'Tunjukkan kode booking Socia Sport di meja resepsionis',
      ],
      courts: Array.from({ length: courtsNum }, (_, i) => ({
        id: `court-${generatedId}-${i + 1}`,
        name: `Lapangan ${i + 1} (${sportType.toUpperCase()})`,
        surfaceType: sportType === 'futsal' ? 'Vinyl Interlock Pro' : 'Synthetic Court Pro',
        pricePerHour: priceNum,
        slots: [
          { id: `s-${i}-08`, time: '08:00 - 09:00', price: priceNum, isBooked: false, period: 'pagi' as const },
          { id: `s-${i}-10`, time: '10:00 - 11:00', price: priceNum, isBooked: false, period: 'pagi' as const },
          { id: `s-${i}-15`, time: '15:00 - 16:00', price: priceNum + 20000, isBooked: false, period: 'siang' as const },
          { id: `s-${i}-17`, time: '17:00 - 18:00', price: priceNum + 30000, isBooked: false, period: 'siang' as const },
          { id: `s-${i}-19`, time: '19:00 - 20:00', price: priceNum + 50000, isBooked: false, period: 'malam' as const },
          { id: `s-${i}-20`, time: '20:00 - 21:00', price: priceNum + 50000, isBooked: false, period: 'malam' as const },
        ],
      })),
      isPartner: true,
      badge: '⭐ MITRA VERIFIKASI V1.2',
    };

    try {
      // Save to Firestore if available
      if (auth.currentUser) {
        await addDoc(collection(db, 'partnerVenues'), {
          ...newVenueObj,
          ownerName,
          phone,
          bankAccount: bankAccount || 'BCA 8830192831',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Fallback saving locally:', err);
    }

    if (onRegisterNewVenue) {
      onRegisterNewVenue(newVenueObj);
    }

    setIsSubmitting(false);
    setRegistrationSubmitted(true);
    soundFx.playVictory();
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#CCFF00', '#3D4BFF', '#FFFFFF', '#00E5FF'],
    });
  };

  const sportsOptions: { label: string; value: SportCategory }[] = [
    { label: 'Futsal', value: 'futsal' },
    { label: 'Badminton', value: 'badminton' },
    { label: 'Mini Soccer', value: 'minisoccer' },
    { label: 'Basketball', value: 'basketball' },
    { label: 'Padel', value: 'padel' },
    { label: 'Tennis', value: 'tennis' },
  ];

  const faqs = [
    {
      q: 'Berapa biaya pendaftaran untuk menjadi Mitra Socia Sport?',
      a: 'Pendaftaran menjadi mitra 100% GRATIS tanpa biaya langganan bulanan atau biaya registrasi awal. Kami hanya membebankan platform fee transparan yang sangat kecil per transaksi booking berhasil.',
    },
    {
      q: 'Bagaimana Socia Sport bisa meningkatkan okupansi lapangan kami?',
      a: 'Socia Sport terhubung langsung ke ekosistem ribuan gamer dan komunitas olahraga lewat fitur matchmaking Tactical PB Room. Ketika komunitas membentuk match 5v5 atau 4v4, sistem kami otomatis merekomendasikan dan mem-booking lapangan mitra terdekat dengan konfirmasi instan.',
    },
    {
      q: 'Kapan dan bagaimana omset sewa lapangan dicairkan?',
      a: 'Dana booking masuk otomatis ke dompet digital mitra saat pemain membayar melalui QRIS atau Virtual Account. Anda dapat mencairkan saldo kapan saja (H+0) langsung ke rekening BCA, Mandiri, BRI, BNI, atau bank lainnya.',
    },
    {
      q: 'Apakah kami masih bisa menerima booking offline dari pelanggan reguler?',
      a: 'Tentu saja! Di dashboard manajemen mitra, Anda memiliki tombol "Kunci Slot" satu klik untuk menandai jam yang sudah dipesan secara offline atau dipakai untuk turnamen pribadi, sehingga tidak akan pernah terjadi double-booking.',
    },
    {
      q: 'Berapa lama proses verifikasi lapangan sampai live di aplikasi?',
      a: 'Kurang dari 24 jam! Begitu Anda mendaftarkan data lapangan, tim verifikasi kami akan meninjau kelengkapan dan langsung mengaktifkan venue Anda agar bisa dipesan oleh seluruh pemain.',
    },
  ];

  return (
    <div className={`min-h-screen selection:bg-[#CCFF00] selection:text-black overflow-x-hidden font-sans transition-colors ${
      isDay ? 'bg-[#F4F6F9] text-slate-900' : 'bg-[#121212] text-white'
    }`}>
      {/* Ambient Lighting Gradients */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#3D4BFF] rounded-full mix-blend-screen filter blur-[180px] opacity-15 pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#CCFF00] rounded-full mix-blend-screen filter blur-[180px] opacity-10 pointer-events-none" />

      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (Nav Links) — Zone 3 (Primary Action) */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDay ? 'bg-white/95 border-slate-200' : 'bg-[#121212]/90 border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#3D4BFF] text-white flex items-center justify-center font-black italic shadow-lg shadow-[#3D4BFF]/30">
              SS
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-display font-black text-xl tracking-tight uppercase whitespace-nowrap ${
                isDay ? 'text-slate-900' : 'text-white'
              }`}>
                Socia<span className="text-[#3D4BFF]">Mitra</span>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                isDay ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-slate-300'
              }`}>
                Venue Partner
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <a 
              href="#keunggulan" 
              className={`hover:text-[#3D4BFF] transition-colors whitespace-nowrap ${
                isDay ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Keunggulan
            </a>
            <a 
              href="#kalkulator" 
              className={`hover:text-[#3D4BFF] transition-colors whitespace-nowrap ${
                isDay ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Kalkulator Omset
            </a>
            <a 
              href="#fitur" 
              className={`hover:text-[#3D4BFF] transition-colors whitespace-nowrap ${
                isDay ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Fitur Platform
            </a>
            <a 
              href="#cara-gabung" 
              className={`hover:text-[#3D4BFF] transition-colors whitespace-nowrap ${
                isDay ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Cara Gabung
            </a>
            <a 
              href="#faq" 
              className={`hover:text-[#3D4BFF] transition-colors whitespace-nowrap ${
                isDay ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              FAQ
            </a>
          </nav>

          {/* Zone 3: Actions & Primary CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
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

            {/* Switch to Player App */}
            <button
              onClick={() => {
                soundFx.playClick();
                onGoToPlayerApp();
              }}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                isDay
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-[#24242A] hover:bg-white/10 text-[#9E9E9E] hover:text-white border-white/10'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#3D4BFF]" />
              <span>Mode Pemain</span>
            </button>

            {/* Login Mitra */}
            {onLoginPartner && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLoginPartner();
                }}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  isDay
                    ? 'border-slate-300 text-slate-800 hover:bg-slate-100'
                    : 'border-white/10 text-white hover:bg-white/5'
                }`}
              >
                Masuk Mitra
              </button>
            )}

            {/* Signup Mitra */}
            {onSignupPartner && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSignupPartner();
                }}
                className="px-3.5 py-2 text-xs font-black uppercase italic tracking-wider text-black bg-[#CCFF00] hover:bg-[#b8e600] rounded-lg transition-all shadow-md shadow-[#CCFF00]/20 hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                Daftar Mitra
              </button>
            )}

            {/* Dashboard CTA */}
            <button
              onClick={() => {
                soundFx.playClick();
                onGoToPartnerDashboard();
              }}
              className="px-4 py-2 text-xs font-black uppercase italic tracking-wider text-white bg-[#3D4BFF] hover:bg-[#303ed9] rounded-lg transition-all shadow-md shadow-[#3D4BFF]/20 hover:scale-105 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Dashboard Mitra</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Clean unboxed editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#3D4BFF]">
              <span>Socia Sport Mitra v1.2</span>
              <span aria-hidden="true">·</span>
              <span>Solusi Manajemen Venue Olahraga Cerdas</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.08] tracking-tight uppercase ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Ubah Lapangan Kosong Jadi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D4BFF] via-[#00c8ff] to-[#CCFF00]">
                Mesin Pendapatan 24 Jam.
              </span>
            </h1>

            <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
              isDay ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Hubungkan lapangan futsal, badminton, basket, dan mini soccer Anda langsung ke ribuan pemain aktif dan komunitas pertandingan. Booking otomatis tanpa chat WhatsApp manual, tanpa risiko bentrok jadwal, dan pencairan dana instan H+0.
            </p>

            {/* Primary Action Decisions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={() => {
                  soundFx.playClick();
                  if (onSignupPartner) {
                    onSignupPartner();
                  } else {
                    const el = document.getElementById('daftar-form');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase italic tracking-wider text-sm rounded-xl transition-all shadow-lg shadow-[#CCFF00]/25 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Mitra Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onLoginPartner && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onLoginPartner();
                  }}
                  className={`px-5 py-3.5 border font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDay 
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-800' 
                      : 'border-white/10 hover:bg-white/5 text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#3D4BFF]" />
                  <span>Masuk Portal Mitra</span>
                </button>
              )}

              <a 
                href="#kalkulator"
                onClick={() => soundFx.playClick()}
                className={`px-4 py-3.5 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 text-center ${
                  isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#3D4BFF]" />
                <span>Kalkulator Omset</span>
              </a>
            </div>

            {/* Trust Markers and Proof Adjacency */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-display font-black text-2xl text-[#3D4BFF] tabular-nums">450+</p>
                <p className="text-xs text-slate-500">Venue Terdaftar</p>
              </div>
              <div>
                <p className="font-display font-black text-2xl text-[#CCFF00] tabular-nums">Rp 3.8M+</p>
                <p className="text-xs text-slate-500">Transaksi Terproses</p>
              </div>
              <div>
                <p className="font-display font-black text-2xl text-emerald-500 tabular-nums">99.4%</p>
                <p className="text-xs text-slate-500">Okupansi Slot Weekend</p>
              </div>
              <div>
                <p className="font-display font-black text-2xl text-white dark:text-white tabular-nums">0%</p>
                <p className="text-xs text-slate-500">Biaya Pendaftaran</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Hero Asset */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className={`relative rounded-3xl overflow-hidden border shadow-2xl ${
              isDay ? 'border-slate-200 shadow-slate-200' : 'border-white/10 shadow-black/80'
            }`}>
              <img 
                src="/src/assets/images/hero_partner_sports_arena_1791559679886.jpg" 
                alt="Modern Premium Sports Arena Partner" 
                referrerPolicy="no-referrer"
                className="w-full h-[380px] sm:h-[460px] object-cover"
              />
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#CCFF00]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sistem Mitra Arena Terverifikasi</span>
                </div>
                <h3 className="font-display font-black text-xl uppercase tracking-tight">
                  Grand Arena Kuningan Sports Center
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Meningkatkan pendapatan booking malam hingga +185% dalam 2 bulan pertama bergabung di Socia Sport.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Revenue & ROI Calculator */}
      <section id="kalkulator" className={`py-20 px-6 border-y transition-colors ${
        isDay ? 'bg-white border-slate-200' : 'bg-[#18181E] border-white/5'
      }`}>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D4BFF]">
              Kalkulator Potensi Omset
            </div>
            <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Berapa Penghasilan Lapangan Anda Setiap Bulan?
            </h2>
            <p className={`text-sm ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
              Sesuaikan data di bawah untuk melihat proyeksi omset standar versus akselerasi pemesanan dengan ekosistem pemain Socia Sport.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className={`lg:col-span-6 p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDay ? 'bg-[#F9FAFC] border-slate-200' : 'bg-[#222228] border-white/5'
            }`}>
              {/* Sport Category Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Kategori Olahraga Lapangan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sportsOptions.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setCalcSport(s.value);
                      }}
                      className={`py-2.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        calcSport === s.value
                          ? 'bg-[#3D4BFF] text-white border-[#3D4BFF] shadow-sm'
                          : isDay
                          ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          : 'bg-[#1A1A20] text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Court Count Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Jumlah Lapangan
                  </label>
                  <span className="font-mono font-bold text-sm text-[#3D4BFF] tabular-nums">
                    {calcCourts} Lapangan
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="1"
                  value={calcCourts}
                  onChange={(e) => setCalcCourts(Number(e.target.value))}
                  className="w-full accent-[#3D4BFF] cursor-pointer"
                />
              </div>

              {/* Price Per Hour Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tarif Rata-Rata per Jam
                  </label>
                  <span className="font-mono font-bold text-sm text-[#3D4BFF] tabular-nums">
                    Rp {calcPricePerHour.toLocaleString('id-ID')} / jam
                  </span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="750000" 
                  step="25000"
                  value={calcPricePerHour}
                  onChange={(e) => setCalcPricePerHour(Number(e.target.value))}
                  className="w-full accent-[#3D4BFF] cursor-pointer"
                />
              </div>

              {/* Hours per Day Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rata-Rata Jam Tersewa per Hari
                  </label>
                  <span className="font-mono font-bold text-sm text-[#3D4BFF] tabular-nums">
                    {calcHoursPerDay} Jam / hari
                  </span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="14" 
                  step="1"
                  value={calcHoursPerDay}
                  onChange={(e) => setCalcHoursPerDay(Number(e.target.value))}
                  className="w-full accent-[#3D4BFF] cursor-pointer"
                />
              </div>
            </div>

            {/* Projection Output Cards */}
            <div className={`lg:col-span-6 p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDay ? 'bg-white border-slate-200 shadow-md' : 'bg-[#1C1C22] border-white/10 shadow-xl'
            }`}>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Estimasi Omset Bulanan
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-display font-black text-[#CCFF00] tabular-nums">
                    Rp {boostedRevenue.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    +32% Boost
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Diproyeksikan dari {calcCourts} lapangan × {calcHoursPerDay} jam/hari × 30 hari kalender.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Omset Manual Tanpa Platform:</span>
                  <span className="font-mono font-semibold tabular-nums">
                    Rp {standardRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Tambahan dari Matchmaking Gamers:</span>
                  <span className="font-mono font-bold text-emerald-500 tabular-nums">
                    +Rp {additionalGain.toLocaleString('id-ID')} / bulan
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5">
                  <span className="text-slate-500">Biaya Administrasi Pendaftaran:</span>
                  <span className="font-mono font-bold text-[#CCFF00] uppercase">
                    Rp 0 (GRATIS)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#3D4BFF]/10 border border-[#3D4BFF]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3D4BFF]">
                  <TrendingUp className="w-4 h-4" />
                  <span>Kenapa Ada Pertumbuhan +32%?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Fitur Point Blank Matchmaking Socia Sport otomatis mengarahkan pertandingan komunitas (slot malam & weekend kosong) langsung ke lapangan Anda tanpa Anda perlu promosi manual.
                </p>
              </div>

              <a
                href="#daftar-form"
                onClick={() => soundFx.playClick()}
                className="w-full py-3.5 bg-[#3D4BFF] hover:bg-[#303ed9] text-white font-black uppercase italic tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Klaim Potensi Omset Ini Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section id="fitur" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D4BFF]">
              Keunggulan Eksklusif
            </div>
            <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Dibangun Khusus Untuk Pengelola Lapangan
            </h2>
            <p className={`text-sm ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
              Solusi end-to-end dari pencatatan jadwal, pembayaran digital, hingga retensi pemain berulang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento Card 1: Futsal Stadium Showcase (7 cols) */}
            <div className={`md:col-span-7 rounded-2xl border overflow-hidden flex flex-col justify-between ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1C22] border-white/5'
            }`}>
              <div className="p-6 sm:p-8 space-y-4">
                <span className="font-mono text-xs font-bold text-[#3D4BFF]">01. MANAJEMEN SLOT OTOMATIS</span>
                <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${
                  isDay ? 'text-slate-900' : 'text-white'
                }`}>
                  Kalender Real-Time & Nol Risiko Double-Booking
                </h3>
                <p className={`text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
                  Slot yang dibooking pemain di aplikasi langsung terkunci dalam detik yang sama. Anda juga dapat mengunci slot untuk turnamen pribadi atau perawatan rumput dengan satu sentuhan.
                </p>
              </div>
              <div className="relative h-64 overflow-hidden border-t border-slate-100 dark:border-white/5">
                <img 
                  src="/src/assets/images/partner_futsal_stadium_1791559690281.jpg" 
                  alt="Modern Futsal Stadium" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </div>
            </div>

            {/* Bento Card 2: Badminton Showcase (5 cols) */}
            <div className={`md:col-span-5 rounded-2xl border overflow-hidden flex flex-col justify-between ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1C22] border-white/5'
            }`}>
              <div className="p-6 sm:p-8 space-y-4">
                <span className="font-mono text-xs font-bold text-[#CCFF00]">02. EKOSISTEM GAMERS</span>
                <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${
                  isDay ? 'text-slate-900' : 'text-white'
                }`}>
                  Pasar Komunitas Olahraga Siap Main
                </h3>
                <p className={`text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
                  Pemain mencari sparring dan match di lobby Point Blank langsung membooking lapangan Anda sebagai arena pertempuran resmi mereka.
                </p>
              </div>
              <div className="relative h-64 overflow-hidden border-t border-slate-100 dark:border-white/5">
                <img 
                  src="/src/assets/images/partner_badminton_hall_1791559703440.jpg" 
                  alt="Badminton Tournament Hall" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </div>
            </div>

            {/* Bento Card 3: Instant Payout (6 cols) */}
            <div className={`md:col-span-6 p-6 sm:p-8 rounded-2xl border space-y-4 ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1C22] border-white/5'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-500">03. KEUANGAN TRANSPARAN</span>
              <h3 className={`text-xl font-display font-black uppercase tracking-tight ${
                isDay ? 'text-slate-900' : 'text-white'
              }`}>
                Pencairan Saldo H+0 Langsung Ke Rekening Bank
              </h3>
              <p className={`text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
                Tidak perlu menunggu berhari-hari. Saldo dari booking QRIS dan Virtual Account dapat ditarik langsung ke BCA, Mandiri, BRI, atau BNI kapan saja tanpa biaya tersembunyi.
              </p>
            </div>

            {/* Bento Card 4: QR Check-In & Security (6 cols) */}
            <div className={`md:col-span-6 p-6 sm:p-8 rounded-2xl border space-y-4 ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1C22] border-white/5'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#3D4BFF]/10 text-[#3D4BFF] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-[#3D4BFF]">04. SCAN QR CHECK-IN</span>
              <h3 className={`text-xl font-display font-black uppercase tracking-tight ${
                isDay ? 'text-slate-900' : 'text-white'
              }`}>
                Verifikasi Pemain Instan & Anti No-Show
              </h3>
              <p className={`text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
                Pemain datang menunjukkan tiket QR digital. Petugas lapangan cukup memverifikasi dalam 2 detik. Pembayaran di awal menjamin Anda tidak akan dirugikan oleh pemain yang batal sepihak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="cara-gabung" className={`py-20 px-6 border-y transition-colors ${
        isDay ? 'bg-[#F9FAFC] border-slate-200' : 'bg-[#17171D] border-white/5'
      }`}>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D4BFF]">
              3 Langkah Mudah
            </div>
            <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Mulai Menerima Booking Hari Ini
            </h2>
            <p className={`text-sm ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
              Proses registrasi hanya butuh 3 menit tanpa prosedur birokrasi rumit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 sm:p-8 rounded-2xl border relative space-y-4 ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F26] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-[#3D4BFF] text-white font-black font-display flex items-center justify-center text-lg">
                1
              </div>
              <h3 className={`text-lg font-bold ${isDay ? 'text-slate-900' : 'text-white'}`}>
                Isi Data Lapangan Anda
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-400'}`}>
                Masukkan nama arena, lokasi, jumlah lapangan, dan tarif per jam di formulir pendaftaran mitra.
              </p>
            </div>

            <div className={`p-6 sm:p-8 rounded-2xl border relative space-y-4 ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F26] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black font-black font-display flex items-center justify-center text-lg">
                2
              </div>
              <h3 className={`text-lg font-bold ${isDay ? 'text-slate-900' : 'text-white'}`}>
                Verifikasi Cepat & Aktivasi
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-400'}`}>
                Tim Socia Sport memverifikasi data venue Anda dalam 24 jam dan langsung membuka slot booking publik di aplikasi.
              </p>
            </div>

            <div className={`p-6 sm:p-8 rounded-2xl border relative space-y-4 ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F26] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black font-display flex items-center justify-center text-lg">
                3
              </div>
              <h3 className={`text-lg font-bold ${isDay ? 'text-slate-900' : 'text-white'}`}>
                Terima Booking & Tarik Omset
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDay ? 'text-slate-600' : 'text-slate-400'}`}>
                Pemain otomatis mengisi jadwal lapangan Anda. Pantau transaksi di dashboard dan cairkan omset kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Onboarding & Registration Form */}
      <section id="daftar-form" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D4BFF]">
              Registrasi Mitra Baru
            </div>
            <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Daftarkan Lapangan Anda Sekarang
            </h2>
            <p className={`text-sm ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
              Gratis pendaftaran. Tanpa kontrak yang mengikat. Nikmati pertumbuhan pemesanan langsung dari komunitas.
            </p>
          </div>

          <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${
            isDay ? 'bg-white border-slate-200' : 'bg-[#1C1C22] border-white/10'
          }`}>
            {registrationSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${
                    isDay ? 'text-slate-900' : 'text-white'
                  }`}>
                    Selamat! Lapangan Berhasil Didaftarkan
                  </h3>
                  <p className={`text-sm max-w-lg mx-auto ${isDay ? 'text-slate-600' : 'text-slate-300'}`}>
                    Venue <span className="font-bold text-[#3D4BFF]">{venueName}</span> telah ditambahkan ke sistem Socia Sport. Anda sekarang dapat mengelola jadwal dan melihat pesanan di Dashboard Mitra.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onGoToPartnerDashboard();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#3D4BFF] hover:bg-[#303ed9] text-white font-black uppercase italic tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-[#3D4BFF]/30 cursor-pointer"
                  >
                    Buka Dashboard Manajemen Lapangan
                  </button>

                  <button
                    onClick={() => {
                      setRegistrationSubmitted(false);
                      setVenueName('');
                      setOwnerName('');
                    }}
                    className={`w-full sm:w-auto px-6 py-3.5 border text-xs font-bold rounded-xl transition-colors ${
                      isDay ? 'border-slate-300 text-slate-700' : 'border-white/10 text-white'
                    }`}
                  >
                    Daftarkan Venue Lain
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Owner Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Nama Pemilik / Pengelola Venue *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Hendra Wijaya"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Contoh: 081288997766"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Venue Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Nama Lapangan / Sports Arena *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Champion Futsal & Badminton Center"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Sport Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Kategori Olahraga Utama *
                    </label>
                    <select
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value as SportCategory)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    >
                      {sportsOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Kota / Wilayah *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Jakarta Selatan"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* District / Kecamatan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Kecamatan / Area *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Kuningan / Tebet"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Court Count */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Jumlah Lapangan Tersedia *
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="20"
                      required
                      value={courtCount}
                      onChange={(e) => setCourtCount(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Price Per Hour */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Tarif Rata-Rata per Jam (Rp) *
                    </label>
                    <input 
                      type="number" 
                      min="50000"
                      step="10000"
                      required
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                        isDay 
                          ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                          : 'bg-[#15151B] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Address Full */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Alamat Lengkap Venue
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Jl. Rasuna Said Kav. 8 No. 12, RT.02/RW.05, Kuningan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                      isDay 
                        ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                        : 'bg-[#15151B] border-white/10 text-white'
                    }`}
                  />
                </div>

                {/* Bank Account for Payout */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Rekening Bank untuk Pencairan Saldo (BCA / Mandiri / BRI / BNI)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: BCA 8830192831 a/n Hendra Wijaya"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:border-[#3D4BFF] ${
                      isDay 
                        ? 'bg-[#F9FAFC] border-slate-300 text-slate-900' 
                        : 'bg-[#15151B] border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase italic tracking-wider text-sm rounded-xl transition-all shadow-lg shadow-[#CCFF00]/20 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Memproses Pendaftaran Mitra...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim & Aktifkan Lapangan Saya Sekarang</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    Dengan mendaftar, Anda menyetujui Ketentuan Layanan Mitra Socia Sport. Verifikasi bebas biaya.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section id="faq" className={`py-20 px-6 border-t transition-colors ${
        isDay ? 'bg-white border-slate-200' : 'bg-[#17171D] border-white/5'
      }`}>
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D4BFF]">
              Pertanyaan Umum
            </div>
            <h2 className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              Hal Yang Sering Ditanyakan Pengelola
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-2xl overflow-hidden transition-colors ${
                    isDay ? 'border-slate-200 bg-[#F9FAFC]' : 'border-white/10 bg-[#1F1F26]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setOpenFaq(isOpen ? null : index);
                    }}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold gap-4 cursor-pointer"
                  >
                    <span className={isDay ? 'text-slate-900' : 'text-white'}>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform text-[#3D4BFF] ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className={`px-6 pb-4 text-xs sm:text-sm leading-relaxed border-t ${
                      isDay ? 'text-slate-600 border-slate-200/60' : 'text-slate-300 border-white/5'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conversion Banner / Quiet Footer */}
      <footer className={`py-12 px-6 border-t transition-colors ${
        isDay ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#121212] border-white/5 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3D4BFF] text-white flex items-center justify-center font-black italic text-xs">
              SS
            </div>
            <div>
              <span className={`font-display font-black text-sm tracking-tight uppercase ${
                isDay ? 'text-slate-900' : 'text-white'
              }`}>
                Socia<span className="text-[#3D4BFF]">Sport</span> Mitra
              </span>
              <p className="text-[11px] text-slate-500">
                © 2026 PT Socia Sport Digital Nusantara. Hak Cipta Dilindungi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <button 
              onClick={() => {
                soundFx.playClick();
                onGoToPlayerApp();
              }}
              className="hover:text-[#3D4BFF] transition-colors cursor-pointer"
            >
              Mode Aplikasi Pemain
            </button>
            <button 
              onClick={() => {
                soundFx.playClick();
                onGoToPartnerDashboard();
              }}
              className="hover:text-[#3D4BFF] transition-colors cursor-pointer"
            >
              Dashboard Manajemen Venue
            </button>
            <a href="#daftar-form" className="text-[#3D4BFF] hover:underline">
              Daftar Jadi Mitra
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
