import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Users, 
  AlertCircle,
  QrCode,
  Check,
  TrendingUp, 
  CreditCard, 
  X, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Award, 
  ArrowRightLeft, 
  User as UserIcon, 
  Wallet,
  Phone,
  Search,
  Sliders,
  CheckCheck,
  Zap,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { SportCategory, Venue, VenueBooking, UserAvatar, UserRole } from '../types';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';

interface PartnerFieldRentViewProps {
  venues: Venue[];
  bookings: VenueBooking[];
  onAddNewVenue: (newVenue: Venue) => void;
  onNavigateToBooking: () => void;
  onNavigateToLobby?: () => void;
  onOpenPartnerLandingPage?: () => void;
  user?: UserAvatar;
  onSwitchRole?: (newRole: UserRole) => void;
}

export const PartnerFieldRentView: React.FC<PartnerFieldRentViewProps> = ({
  venues,
  bookings,
  onAddNewVenue,
  onNavigateToBooking,
  onNavigateToLobby,
  onOpenPartnerLandingPage,
  user,
  onSwitchRole,
}) => {
  const { isDay } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'checkin' | 'profile' | 'register'>('overview');
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0]?.id || 'venue-1');
  const [selectedDate, setSelectedDate] = useState<string>('Hari Ini (Sabtu)');
  const [selectedCourtIndex, setSelectedCourtIndex] = useState<number>(0);
  
  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5000000');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);
  const [readyPayoutBalance, setReadyPayoutBalance] = useState<number>(
    user?.partnerData?.readyPayout || 24182500
  );

  // Check-In and Booking Scanner State
  const [searchBookingCode, setSearchBookingCode] = useState('');
  const [checkedInCodes, setCheckedInCodes] = useState<string[]>(['SS-FUT-8821']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Slot Locking State (slotId -> isBlocked)
  const [lockedSlots, setLockedSlots] = useState<Record<string, boolean>>({
    's-0-08': true, // e.g. slot 08:00 locked for maintenance
  });

  // New Venue Form State
  const [formVenueName, setFormVenueName] = useState('');
  const [formSport, setFormSport] = useState<SportCategory>('futsal');
  const [formCity, setFormCity] = useState('Jakarta Selatan');
  const [formDistrict, setFormDistrict] = useState('Kuningan');
  const [formAddress, setFormAddress] = useState('');
  const [formPricePerHour, setFormPricePerHour] = useState('250000');
  const [formCourtCount, setFormCourtCount] = useState('2');
  const [formSurface, setFormSurface] = useState('Vinyl Taraflex Pro');
  const [formBankName, setFormBankName] = useState('BCA');
  const [formBankAccount, setFormBankAccount] = useState('8830192831');
  const [formFacilities, setFormFacilities] = useState<string[]>([
    'Lampu Sorot Malam LED Standar Nasional',
    'Shower Air Panas & Ruang Ganti Bersih',
    'Parkir Mobil & Motor Beratap',
    'Kantin Minuman Dingin & Snack',
    'Free WiFi High-Speed',
    'Wasit Berlisensi (Sesuai Permintaan)',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];

  // Toggle slot lock for offline customer or maintenance
  const handleToggleSlotLock = (slotId: string, slotTime: string) => {
    soundFx.playClick();
    setLockedSlots((prev) => {
      const willBeLocked = !prev[slotId];
      if (willBeLocked) {
        showToast(`Slot ${slotTime} berhasil DIKUNCI (Aman untuk sewa offline/maintenance)`);
      } else {
        showToast(`Slot ${slotTime} berhasil DIBUKA (Tersedia untuk komunitas Socia Sport)`);
      }
      return { ...prev, [slotId]: willBeLocked };
    });
  };

  // Check In handler
  const handleVerifyCheckIn = (code: string) => {
    soundFx.playVictory();
    setCheckedInCodes((prev) => [...prev, code]);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#CCFF00', '#10B981', '#3D4BFF'],
    });
    showToast(`Check-In Selesai! Kode ${code} berhasil diverifikasi di meja resepsionis.`);
  };

  // Withdraw submit handler
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount) || 0;
    if (amountNum <= 0 || amountNum > readyPayoutBalance) {
      showToast('Nominal penarikan tidak valid atau melebihi saldo.');
      return;
    }

    soundFx.playVictory();
    setWithdrawSuccess(true);
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#CCFF00', '#FFFFFF', '#3D4BFF'],
    });

    setTimeout(() => {
      setReadyPayoutBalance((prev) => prev - amountNum);
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
      showToast(`Berhasil! Dana Rp ${amountNum.toLocaleString('id-ID')} telah dikirim ke rekening ${selectedBank} Mitra.`);
    }, 1200);
  };

  // Register new venue submit
  const handleRegisterNewVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVenueName.trim() || !formAddress.trim()) {
      showToast('Harap lengkapi nama arena dan alamat lengkap!');
      return;
    }

    setIsSubmitting(true);
    try {
      const price = parseInt(formPricePerHour) || 200000;
      const count = parseInt(formCourtCount) || 1;

      const generatedCourts = Array.from({ length: count }, (_, i) => ({
        id: `c-partner-${Date.now()}-${i + 1}`,
        name: `Lapangan ${i + 1} (${formSport.toUpperCase()})`,
        surfaceType: formSurface,
        pricePerHour: price,
        slots: [
          { id: `sp-${i}-08`, time: '08:00 - 09:00', price, isBooked: false, period: 'pagi' as const },
          { id: `sp-${i}-10`, time: '10:00 - 11:00', price, isBooked: false, period: 'pagi' as const },
          { id: `sp-${i}-15`, time: '15:00 - 16:00', price: price + 20000, isBooked: false, period: 'siang' as const },
          { id: `sp-${i}-17`, time: '17:00 - 18:00', price: price + 30000, isBooked: false, period: 'siang' as const },
          { id: `sp-${i}-19`, time: '19:00 - 20:00', price: price + 50000, isBooked: false, period: 'malam' as const },
          { id: `sp-${i}-20`, time: '20:00 - 21:00', price: price + 50000, isBooked: false, period: 'malam' as const },
          { id: `sp-${i}-21`, time: '21:00 - 22:00', price: price + 50000, isBooked: false, period: 'malam' as const },
        ],
      }));

      const newVenue: Venue = {
        id: `venue-${Date.now()}`,
        name: formVenueName,
        sport: formSport,
        city: formCity,
        district: formDistrict,
        fullAddress: formAddress,
        distance: '0.8 km',
        rating: 5.0,
        reviewCount: 1,
        priceStartFrom: price,
        imageUrl: '/src/assets/images/hero_partner_sports_arena_1791559679886.jpg',
        gallery: [
          '/src/assets/images/hero_partner_sports_arena_1791559679886.jpg',
          '/src/assets/images/partner_futsal_stadium_1791559690281.jpg',
          '/src/assets/images/partner_badminton_hall_1791559703440.jpg',
        ],
        facilities: formFacilities,
        operatingHours: '07:00 - 24:00 WIB',
        rules: ['Wajib gunakan sepatu olahraga', 'Check-in di meja kasir sebelum kickoff'],
        courts: generatedCourts,
        isPartner: true,
        badge: '⭐ MITRA RESMI V1.2',
      };

      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'partnerVenues'), {
            ...newVenue,
            ownerUid: auth.currentUser.uid,
            bankAccount: formBankAccount,
            bankName: formBankName,
            createdAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Firestore venue save fallback to local:', dbErr);
        }
      }

      onAddNewVenue(newVenue);
      setSelectedVenueId(newVenue.id);
      soundFx.playVictory();
      showToast('Selamat! Arena baru Anda berhasil terdaftar di jaringan Socia Sport!');
      setActiveTab('overview');
    } catch (err) {
      console.error('Failed to register venue:', err);
      showToast('Gagal mendaftarkan arena. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock sample incoming bookings for partner terminal
  const samplePartnerBookings = [
    {
      code: 'SS-FUT-8821',
      captain: 'Arga Striker (Garuda FC)',
      courtName: 'Lapangan 1 Vinyl Interlock',
      time: '19:00 - 21:00 WIB (2 Jam)',
      date: 'Hari Ini',
      amount: 540000,
      paymentMethod: 'QRIS Realtime (Lunas)',
      playersCount: 10,
      phone: '0812-3344-5566',
    },
    {
      code: 'SS-BDM-3310',
      captain: 'Dimas Smash (Shuttle Club)',
      courtName: 'Lapangan 2 Badminton Taraflex',
      time: '20:00 - 22:00 WIB (2 Jam)',
      date: 'Hari Ini',
      amount: 280000,
      paymentMethod: 'BCA Virtual Account (Lunas)',
      playersCount: 4,
      phone: '0813-7788-9900',
    },
    {
      code: 'SS-MS-4491',
      captain: 'Coach Rendy (Jakarta All-Star)',
      courtName: 'Mini Soccer Pro Arena',
      time: '16:00 - 18:00 WIB (2 Jam)',
      date: 'Hari Ini',
      amount: 900000,
      paymentMethod: 'Mandiri Livin (Lunas)',
      playersCount: 14,
      phone: '0819-1122-3344',
    },
  ];

  // 7-day revenue visualization data
  const weeklyRevenueData = [
    { day: 'Sen', amount: 3200000, occupancy: '75%' },
    { day: 'Sel', amount: 2850000, occupancy: '68%' },
    { day: 'Rab', amount: 3600000, occupancy: '82%' },
    { day: 'Kam', amount: 3400000, occupancy: '80%' },
    { day: 'Jum', amount: 4800000, occupancy: '95%' },
    { day: 'Sab', amount: 5600000, occupancy: '100%' },
    { day: 'Min', amount: 5000000, occupancy: '92%' },
  ];

  return (
    <motion.div
      id="partner-dashboard-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-28 max-w-6xl mx-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#24242A] border border-[#CCFF00] text-white shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Partner Verified Identity Strip */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDay 
          ? 'bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-emerald-300 shadow-sm'
          : 'bg-gradient-to-r from-emerald-950/40 via-[#1C242A] to-[#1C2454]/40 border-emerald-500/30 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> MITRA RESMI SOCIA SPORT V1.2
                </span>
                <span className="text-[9px] bg-emerald-500 text-black font-black uppercase px-2 py-0.5 rounded font-mono">
                  {user?.partnerData?.partnerTier || 'PLATINUM HOST'}
                </span>
              </div>
              <h2 className={`text-lg sm:text-xl font-display font-black tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
                {user?.partnerData?.businessName || 'Champions Sports Arena Nusantara'}
              </h2>
              <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-zinc-400'}`}>
                Pengelola: <strong className={isDay ? 'text-slate-800' : 'text-white'}>{user?.name || 'Budi Santoso'}</strong> • Rekening Payout: {user?.partnerData?.bankName || 'BCA'} {user?.partnerData?.bankAccountNumber || '8830-1928-3199'} • {user?.partnerData?.city || 'Jakarta Selatan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
            {onOpenPartnerLandingPage && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenPartnerLandingPage();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDay 
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' 
                    : 'bg-[#24242A] hover:bg-white/10 text-white border-white/10'
                }`}
                title="Buka Landing Page Mitra Publik"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#3D4BFF]" />
                <span className="hidden sm:inline">Landing Page Mitra</span>
              </button>
            )}

            {onSwitchRole && (
              <button
                onClick={() => {
                  soundFx.playVictory();
                  onSwitchRole(user?.role === 'partner' ? 'player' : 'partner');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  user?.role === 'partner'
                    ? isDay
                      ? 'bg-blue-50 text-[#3D4BFF] border border-blue-200 hover:bg-blue-100'
                      : 'bg-[#3D4BFF]/20 text-[#00b0ff] border border-[#3D4BFF]/40 hover:bg-[#3D4BFF]/30'
                    : 'bg-[#CCFF00] text-black hover:bg-[#b8e600]'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{user?.role === 'partner' ? 'Mode Pemain' : 'Mode Mitra'}</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                setShowWithdrawModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#CCFF00] text-black font-black uppercase tracking-wider text-xs flex items-center gap-1.5 hover:scale-105 transition-transform shadow-md cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Tarik Saldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Partner Dashboard */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1 overflow-x-auto no-scrollbar ${
        isDay ? 'bg-slate-100 border-slate-200' : 'bg-[#1A1A1F] border-white/10'
      }`}>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('overview');
          }}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#3D4BFF] text-white shadow-md'
              : isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ringkasan & Finansial</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('slots');
          }}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'slots'
              ? 'bg-[#3D4BFF] text-white shadow-md'
              : isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Matrix Jadwal & Slot</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('checkin');
          }}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap relative ${
            activeTab === 'checkin'
              ? 'bg-[#3D4BFF] text-white shadow-md'
              : isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Terminal Check-In</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#CCFF00] text-black">
            {samplePartnerBookings.length}
          </span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('profile');
          }}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#3D4BFF] text-white shadow-md'
              : isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil Fasilitas Venue</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('register');
          }}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'register'
              ? 'bg-[#CCFF00] text-black shadow-md font-black'
              : isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tambah Lapangan</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: RINGKASAN & FINANSIAL (OVERVIEW & REVENUE ANALYTICS)
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Omzet Kotor */}
            <div className={`p-4 rounded-2xl border ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-lg'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#9E9E9E] mb-2 uppercase">
                <span>Omzet Bulan Ini</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className={`text-xl sm:text-2xl font-black font-mono ${isDay ? 'text-slate-900' : 'text-white'}`}>
                Rp 28.450.000
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs Bulan Lalu
              </div>
            </div>

            {/* Card 2: Saldo Siap Cair */}
            <div className={`p-4 rounded-2xl border border-emerald-500/40 ${
              isDay ? 'bg-emerald-50/60 shadow-sm' : 'bg-[#182618] shadow-lg'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-[#CCFF00] mb-2 uppercase">
                <span>Saldo Siap Tarik</span>
                <Wallet className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-[#CCFF00]">
                Rp {readyPayoutBalance.toLocaleString('id-ID')}
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="text-[11px] font-bold text-[#3D4BFF] dark:text-white underline hover:text-[#CCFF00] transition-colors mt-1 block cursor-pointer"
              >
                Tarik ke BCA Sekarang &rarr;
              </button>
            </div>

            {/* Card 3: Tingkat Okupansi */}
            <div className={`p-4 rounded-2xl border ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-lg'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#9E9E9E] mb-2 uppercase">
                <span>Okupansi Hari Ini</span>
                <Zap className="w-4 h-4 text-[#3D4BFF]" />
              </div>
              <div className={`text-xl sm:text-2xl font-black font-mono ${isDay ? 'text-slate-900' : 'text-white'}`}>
                84.2% <span className="text-xs text-[#9E9E9E] font-normal">Padat</span>
              </div>
              <div className="text-[11px] text-[#3D4BFF] font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Jam Ramai: 19:00 - 23:00
              </div>
            </div>

            {/* Card 4: Total Sesi Terbooking */}
            <div className={`p-4 rounded-2xl border ${
              isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-lg'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#9E9E9E] mb-2 uppercase">
                <span>Total Sesi Sewa</span>
                <Calendar className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className={`text-xl sm:text-2xl font-black font-display ${isDay ? 'text-slate-900' : 'text-white'}`}>
                134 <span className="text-xs text-[#9E9E9E] font-normal">Sesi</span>
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Terverifikasi Lunas
              </div>
            </div>
          </div>

          {/* Interactive Weekly Revenue Chart */}
          <div className={`p-6 rounded-2xl border ${
            isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-xl'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className={`text-base font-display font-black uppercase tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
                  Grafik Omzet & Okupansi 7 Hari Terakhir
                </h3>
                <p className={`text-xs ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                  Pemasukan tertinggi tercapai pada hari Jumat & Sabtu (Peak Hours Mabar Futsal & Badminton).
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#3D4BFF]/10 text-[#3D4BFF] font-bold">
                Total Minggu Ini: Rp 28.450.000
              </span>
            </div>

            {/* Bars visualizer */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end pt-6 pb-2 border-b border-white/10">
              {weeklyRevenueData.map((item, idx) => {
                const heightPercent = Math.round((item.amount / 6000000) * 100);
                const isHighlight = item.day === 'Sab' || item.day === 'Jum';
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#9E9E9E] opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.amount / 1000000).toFixed(1)}Jt
                    </span>
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-xl transition-all group-hover:scale-105 ${
                        isHighlight
                          ? 'bg-gradient-to-t from-[#3D4BFF] to-[#CCFF00] shadow-lg shadow-[#CCFF00]/20'
                          : isDay
                          ? 'bg-slate-300 group-hover:bg-[#3D4BFF]'
                          : 'bg-[#2A2A32] group-hover:bg-[#3D4BFF]'
                      }`}
                    />
                    <div className="text-center">
                      <div className={`text-xs font-bold ${isHighlight ? 'text-[#3D4BFF] font-black' : (isDay ? 'text-slate-700' : 'text-white')}`}>
                        {item.day}
                      </div>
                      <div className="text-[9px] font-mono text-emerald-500">
                        {item.occupancy}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payout History & Settlement Table */}
          <div className={`p-6 rounded-2xl border ${
            isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-xl'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base font-display font-black uppercase tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
                  Riwayat Pencairan Saldo Mitra (Payout H+0)
                </h3>
                <p className={`text-xs ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                  Semua penarikan ditransfer instan tanpa biaya admin ke rekening terdaftar.
                </p>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="text-xs font-bold text-[#3D4BFF] hover:underline cursor-pointer"
              >
                + Tarik Dana Baru
              </button>
            </div>

            <div className="space-y-2.5 overflow-x-auto">
              {[
                { date: '10 Okt 2026', id: 'WD-88291', bank: 'BCA (8830-1928-3199)', amount: 'Rp 5.000.000', status: 'Sukses (H+0)' },
                { date: '03 Okt 2026', id: 'WD-77102', bank: 'BCA (8830-1928-3199)', amount: 'Rp 10.000.000', status: 'Sukses (H+0)' },
                { date: '26 Sep 2026', id: 'WD-66481', bank: 'BCA (8830-1928-3199)', amount: 'Rp 8.500.000', status: 'Sukses (H+0)' },
              ].map((tx, i) => (
                <div 
                  key={i}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                    isDay ? 'bg-slate-50 border-slate-200' : 'bg-[#151518] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold">{tx.bank}</div>
                      <div className="text-[10px] text-[#9E9E9E] font-mono">{tx.id} • {tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-sm">{tx.amount}</div>
                    <div className="text-[10px] text-emerald-500 font-bold">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MATRIX JADWAL & SLOT MASTER (SLOT CALENDAR & REALTIME LOCK)
          ========================================================================= */}
      {activeTab === 'slots' && (
        <div className="space-y-5">
          {/* Venue & Court Selector Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-black/5 dark:bg-white/5 border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap mr-1 ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                Pilih Arena:
              </span>
              {venues.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedVenueId(v.id);
                    setSelectedCourtIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                    selectedVenueId === v.id
                      ? 'bg-[#24242A] text-[#CCFF00] border-[#CCFF00] shadow-md'
                      : isDay
                      ? 'bg-white text-slate-700 border-slate-200'
                      : 'bg-[#1A1A1F] text-[#9E9E9E] border-white/10 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{v.name}</span>
                </button>
              ))}
            </div>

            {/* Date Picker Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['Hari Ini (Sabtu)', 'Besok (Minggu)', 'Senin', 'Selasa'].map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedDate(date);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedDate === date
                      ? 'bg-[#3D4BFF] text-white shadow'
                      : isDay
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-white/10 text-[#9E9E9E] hover:text-white'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Court Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {currentVenue?.courts.map((court, idx) => (
              <button
                key={court.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCourtIndex(idx);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  selectedCourtIndex === idx
                    ? 'bg-[#3D4BFF] text-white border-[#3D4BFF] shadow-md'
                    : isDay
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    : 'bg-[#1A1A1F] text-[#9E9E9E] border-white/10 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{court.name}</span>
                <span className="text-[10px] font-mono opacity-80">
                  (Rp {court.pricePerHour.toLocaleString('id-ID')}/jam)
                </span>
              </button>
            ))}
          </div>

          {/* Slot Control Banner with Instructions */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDay ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="text-xs">
                <strong>Fitur Kunci Slot Anti Double-Booking:</strong> Klik tombol gembok pada slot untuk mengunci jam yang disewa secara offline atau turnamen lokal. Slot terkunci tidak akan bisa dibooking oleh pemain di aplikasi.
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="flex items-center gap-1 text-emerald-500">● Buka</span>
              <span className="flex items-center gap-1 text-[#3D4BFF]">● Terbooking</span>
              <span className="flex items-center gap-1 text-red-400">● Terkunci</span>
            </div>
          </div>

          {/* Time Slot Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentVenue?.courts[selectedCourtIndex]?.slots.map((slot) => {
              const isLocked = lockedSlots[slot.id];
              const isBooked = slot.isBooked && !isLocked;

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLocked
                      ? isDay
                        ? 'bg-red-50/80 border-red-200'
                        : 'bg-red-950/20 border-red-500/30'
                      : isBooked
                      ? isDay
                        ? 'bg-blue-50/80 border-blue-200'
                        : 'bg-blue-950/20 border-[#3D4BFF]/30'
                      : isDay
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#1F1F24] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      {slot.period.toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold font-mono ${
                      isLocked ? 'text-red-400' : isBooked ? 'text-[#3D4BFF]' : 'text-emerald-500'
                    }`}>
                      {isLocked ? '🔒 Terkunci (Offline)' : isBooked ? '✓ Dipesan Pemain' : '🟢 Tersedia'}
                    </span>
                  </div>

                  <div className={`text-lg font-black font-display ${isDay ? 'text-slate-900' : 'text-white'}`}>
                    {slot.time}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#9E9E9E] mt-1 mb-3">
                    <span>Tarif Sewa:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      Rp {slot.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleToggleSlotLock(slot.id, slot.time)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isLocked
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Buka Slot</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Kunci Slot</span>
                        </>
                      )}
                    </button>

                    {isBooked && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setActiveTab('checkin');
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-[#3D4BFF] text-white hover:bg-[#303ed9] flex items-center gap-1 cursor-pointer"
                        title="Lihat Detail Pemesan di Terminal Check-In"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Tiket</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TERMINAL CHECK-IN & SCANNER (SCAN & VERIFY)
          ========================================================================= */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {/* Quick Scanner & Code Input Box */}
          <div className={`p-6 rounded-2xl border ${
            isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-xl'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className={`text-lg font-display font-black uppercase tracking-tight flex items-center gap-2 ${
                  isDay ? 'text-slate-900' : 'text-white'
                }`}>
                  <QrCode className="w-5 h-5 text-[#3D4BFF]" />
                  <span>Terminal Verifikasi Tiket & Check-In Meja Resepsionis</span>
                </h3>
                <p className={`text-xs ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                  Masukkan kode reservasi pemain (misal: <strong>SS-FUT-8821</strong>) atau klik Verifikasi untuk menyelesaikan check-in.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#9E9E9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik Kode Booking (contoh: SS-FUT-8821)..."
                  value={searchBookingCode}
                  onChange={(e) => setSearchBookingCode(e.target.value.toUpperCase())}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:border-[#3D4BFF] uppercase ${
                    isDay
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#151518] border-white/10 text-white placeholder-white/30'
                  }`}
                />
              </div>

              <button
                onClick={() => {
                  const codeToVerify = searchBookingCode.trim() || 'SS-FUT-8821';
                  handleVerifyCheckIn(codeToVerify);
                  setSearchBookingCode('');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3D4BFF] hover:bg-[#303ed9] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-[#3D4BFF]/25 cursor-pointer whitespace-nowrap"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Verifikasi Check-In</span>
              </button>
            </div>
          </div>

          {/* List of Incoming Bookings */}
          <div className="space-y-3.5">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
              Daftar Reservasi Hari Ini ({samplePartnerBookings.length} Sesi Terjadwal)
            </h4>

            {samplePartnerBookings.map((b) => {
              const isCheckedIn = checkedInCodes.includes(b.code);

              return (
                <div
                  key={b.code}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCheckedIn
                      ? isDay
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                      : isDay
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#1F1F24] border-white/10 shadow-lg'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                        {b.code}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isCheckedIn 
                          ? 'bg-emerald-500 text-black font-black' 
                          : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        {isCheckedIn ? '✓ SUDAH CHECK-IN' : '⏳ MENUNGGU KEDATANGAN'}
                      </span>
                      <span className="text-xs text-emerald-500 font-semibold">
                        ● {b.paymentMethod}
                      </span>
                    </div>

                    <div className={`text-base font-black ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      {b.captain} • {b.courtName}
                    </div>

                    <div className="text-xs text-[#9E9E9E] flex items-center gap-3">
                      <span>Jam: <strong className="text-slate-800 dark:text-white">{b.time}</strong></span>
                      <span>•</span>
                      <span>Squad: {b.playersCount} Pemain</span>
                      <span>•</span>
                      <span>Total: <strong className="text-emerald-500 font-mono">Rp {b.amount.toLocaleString('id-ID')}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
                    <a
                      href={`https://wa.me/62${b.phone.replace(/[^0-9]/g, '').slice(1)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDay 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                          : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Kapten</span>
                    </a>

                    {!isCheckedIn ? (
                      <button
                        onClick={() => handleVerifyCheckIn(b.code)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Check-In Pemain</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 font-mono">
                        <CheckCheck className="w-4 h-4" /> Check-in Selesai
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PROFIL FASILITAS VENUE (VENUE DETAILS & SETTINGS)
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${
            isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-xl'
          }`}>
            <h3 className={`text-lg font-display font-black uppercase tracking-tight mb-1 ${isDay ? 'text-slate-900' : 'text-white'}`}>
              Profil & Fasilitas Arena: {currentVenue?.name}
            </h3>
            <p className={`text-xs mb-6 ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
              Informasi ini tampil di halaman pencarian dan reservasi bagi seluruh atlet di aplikasi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                    Nama Venue / Arena
                  </label>
                  <input
                    type="text"
                    defaultValue={currentVenue?.name}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${
                      isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    defaultValue={currentVenue?.fullAddress}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                      isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                      Kota
                    </label>
                    <input
                      type="text"
                      defaultValue={currentVenue?.city}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                      Jam Operasional
                    </label>
                    <input
                      type="text"
                      defaultValue={currentVenue?.operatingHours}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Facilities Checklist */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-[#9E9E9E] block">
                  Fasilitas Aktif di Venue:
                </label>
                <div className="space-y-2">
                  {currentVenue?.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 text-xs ${
                        isDay ? 'bg-slate-50 border-slate-200' : 'bg-[#151518] border-white/5'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  soundFx.playVictory();
                  showToast('Perubahan profil arena berhasil disimpan.');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#3D4BFF] hover:bg-[#303ed9] text-white font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 shadow-md cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: DAFTARKAN ARENA BARU (REGISTER NEW VENUE)
          ========================================================================= */}
      {activeTab === 'register' && (
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDay ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1F1F24] border-white/10 shadow-xl'
        }`}>
          <div className="mb-6 space-y-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00] text-black">
              TAMBAH VENUE
            </span>
            <h3 className={`text-xl sm:text-2xl font-display font-black uppercase tracking-tight ${isDay ? 'text-slate-900' : 'text-white'}`}>
              Daftarkan Cabang atau Arena Olahraga Baru
            </h3>
            <p className={`text-xs ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
              Arena Anda akan langsung aktif di katalog Socia Sport dan dapat dipesan oleh ribuan squad Mabar.
            </p>
          </div>

          <form onSubmit={handleRegisterNewVenue} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                  Nama Arena / Venue
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arena Futsal Pro Cilandak"
                  value={formVenueName}
                  onChange={(e) => setFormVenueName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                  Cabang Olahraga Utama
                </label>
                <select
                  value={formSport}
                  onChange={(e) => setFormSport(e.target.value as SportCategory)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                  }`}
                >
                  <option value="futsal">Futsal</option>
                  <option value="badminton">Badminton</option>
                  <option value="minisoccer">Mini Soccer</option>
                  <option value="basketball">Basketball</option>
                  <option value="padel">Padel</option>
                  <option value="tennis">Tennis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                  isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                  Tarif per Jam (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="250000"
                  value={formPricePerHour}
                  onChange={(e) => setFormPricePerHour(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                  Jumlah Court / Lapangan
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formCourtCount}
                  onChange={(e) => setFormCourtCount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                  Tipe Lantai
                </label>
                <input
                  type="text"
                  value={formSurface}
                  onChange={(e) => setFormSurface(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#151518] border-white/10 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#CCFF00] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-transform hover:scale-105 shadow-lg shadow-[#CCFF00]/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Mendaftarkan Arena...' : '+ Simpan & Terbitkan Venue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL TARIK SALDO INSTAN (WITHDRAWAL MODAL)
          ========================================================================= */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
                isDay ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#1A1A1F] border-white/10 text-white'
              }`}
            >
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-4 right-4 p-2 text-[#9E9E9E] hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 mb-5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00] text-black">
                  PAYOUT INSTAN H+0
                </span>
                <h3 className="text-xl font-display font-black uppercase tracking-tight">
                  Tarik Saldo Omzet Mitra
                </h3>
                <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                  Dana dikirimkan langsung ke rekening bank mitra tanpa potongan biaya admin.
                </p>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
                }`}>
                  <div className="text-xs text-[#9E9E9E]">Saldo Tersedia:</div>
                  <div className="text-2xl font-black font-mono text-emerald-500">
                    Rp {readyPayoutBalance.toLocaleString('id-ID')}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                    Nominal Penarikan (Rp)
                  </label>
                  <input
                    type="number"
                    min="100000"
                    max={readyPayoutBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${
                      isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121212] border-white/10 text-white'
                    }`}
                  />
                  <div className="flex gap-2 mt-2">
                    {['1000000', '5000000', '10000000', String(readyPayoutBalance)].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWithdrawAmount(amt)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-mono font-bold cursor-pointer ${
                          isDay ? 'bg-slate-100 border-slate-300' : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {idx === 3 ? 'Semua' : `${(parseInt(amt) / 1000000)}Jt`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9E9E9E] block mb-1">
                    Rekening Tujuan
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${
                      isDay ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121212] border-white/10 text-white'
                    }`}
                  >
                    <option value="BCA">BCA - 8830192831 (a.n {user?.name || 'Budi Santoso'})</option>
                    <option value="Mandiri">Mandiri - 137001928312 (a.n {user?.name || 'Budi Santoso'})</option>
                    <option value="BRI">BRI - 012001928319 (a.n {user?.name || 'Budi Santoso'})</option>
                    <option value="BNI">BNI - 098001928314 (a.n {user?.name || 'Budi Santoso'})</option>
                  </select>
                </div>

                <div className="text-[11px] text-[#9E9E9E] flex items-center justify-between border-t border-white/10 pt-3">
                  <span>Biaya Admin Payout:</span>
                  <span className="text-emerald-500 font-bold">GRATIS (Tier Platinum)</span>
                </div>

                <button
                  type="submit"
                  disabled={withdrawSuccess}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#CCFF00] text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-[#CCFF00]/20 cursor-pointer disabled:opacity-50"
                >
                  {withdrawSuccess ? 'Memproses Transfer...' : 'Konfirmasi Tarik Dana'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
