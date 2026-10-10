import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Check, 
  ChevronRight, 
  QrCode, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Shirt, 
  CircleDot, 
  Camera, 
  CheckCircle2, 
  Share2, 
  Navigation, 
  Gamepad2, 
  X,
  CreditCard,
  Zap,
  Info,
  CalendarCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Venue, VenueCourt, VenueBooking, UserAvatar, SportCategory } from '../types';
import { MOCK_VENUES, MOCK_ADDONS } from '../data/mockData';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

interface VenueBookingViewProps {
  user: UserAvatar;
  bookings: VenueBooking[];
  onAddBooking: (booking: VenueBooking) => void;
  onNavigateToLobbyWithVenue?: (venue: Venue, booking: VenueBooking) => void;
  onNavigateToPartner?: () => void;
}

export const VenueBookingView: React.FC<VenueBookingViewProps> = ({
  user,
  bookings,
  onAddBooking,
  onNavigateToLobbyWithVenue,
  onNavigateToPartner,
}) => {
  const { isDay } = useTheme();
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'my-bookings'>('browse');


  // Filters
  const [selectedSport, setSelectedSport] = useState<SportCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking Flow Modal State
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<VenueCourt | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['addon-rompi']);
  const [useSociacoins, setUseSociacoins] = useState<boolean>(false);
  const [autoCreatePbRoom, setAutoCreatePbRoom] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('qris');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Success / E-Ticket Modal
  const [activeTicket, setActiveTicket] = useState<VenueBooking | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate 7 days upcoming dates
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return {
      index: i,
      dayName: i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : dayNames[d.getDay()],
      dateStr: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      isoDate: d.toISOString().split('T')[0],
      fullLabel: `${i === 0 ? 'Hari Ini, ' : i === 1 ? 'Besok, ' : ''}${d.getDate()} ${monthNames[d.getMonth()]} 2026`,
    };
  });

  // Filter venues
  const filteredVenues = MOCK_VENUES.filter((v) => {
    const matchSport = selectedSport === 'all' || v.sport === selectedSport;
    const matchCity = selectedCity === 'all' || v.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchSearch = 
      searchQuery.trim() === '' || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.facilities.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSport && matchCity && matchSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenBooking = (venue: Venue) => {
    soundFx.playClick();
    setSelectedVenue(venue);
    setSelectedCourt(venue.courts[0]);
    setSelectedDateIndex(0);
    setSelectedSlots([]);
    setSelectedAddonIds(['addon-rompi']);
    setUseSociacoins(false);
    setAutoCreatePbRoom(true);
  };

  const handleToggleSlot = (slotTime: string) => {
    soundFx.playClick();
    if (selectedSlots.includes(slotTime)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotTime));
    } else {
      setSelectedSlots([...selectedSlots, slotTime]);
    }
  };

  const handleToggleAddon = (addonId: string) => {
    soundFx.playClick();
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter(id => id !== addonId));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
    }
  };

  // Pricing calculation
  const durationHours = selectedSlots.length;
  const courtPricePerHour = selectedCourt ? selectedCourt.pricePerHour : 0;
  const basePrice = courtPricePerHour * durationHours;
  
  const chosenAddons = MOCK_ADDONS.filter(a => selectedAddonIds.includes(a.id));
  const addonsTotal = chosenAddons.reduce((acc, a) => acc + a.price, 0);
  
  // Sociacoins discount: 1 SC = Rp 10, max up to 1000 SC (Rp 10.000) or available coins
  const maxCoinsToUse = Math.min(user.sociacoins, 1500);
  const coinDiscount = useSociacoins ? Math.floor(maxCoinsToUse * 10) : 0;
  const grandTotal = Math.max(0, basePrice + addonsTotal - coinDiscount);

  // Submit Booking
  const handleConfirmBooking = () => {
    if (selectedSlots.length === 0 || !selectedVenue || !selectedCourt) {
      showToast('⚠️ Silakan pilih minimal 1 jam slot jadwal lapangan!');
      return;
    }

    setIsProcessing(true);
    soundFx.playClick();

    setTimeout(() => {
      setIsProcessing(false);
      const bookingCode = `PB-VENUE-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: VenueBooking = {
        id: `b-${Date.now()}`,
        bookingCode,
        venueId: selectedVenue.id,
        venueName: selectedVenue.name,
        courtName: selectedCourt.name,
        sport: selectedVenue.sport,
        bookingDate: next7Days[selectedDateIndex].isoDate,
        formattedDate: next7Days[selectedDateIndex].fullLabel,
        selectedSlots: [...selectedSlots].sort(),
        durationHours: selectedSlots.length,
        basePrice,
        addons: chosenAddons.map(a => ({ id: a.id, name: a.name, price: a.price })),
        sociacoinsUsed: useSociacoins ? maxCoinsToUse : 0,
        sociacoinsDiscount: coinDiscount,
        totalPrice: grandTotal,
        paymentMethod: paymentMethod === 'qris' ? 'QRIS Instant Auto-Confirm' : paymentMethod === 'bca' ? 'BCA Virtual Account' : 'Sociacoins Pay',
        paymentStatus: 'PAID',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        qrCodeValue: `SS-${bookingCode}-${selectedVenue.id}-${user.name}`,
        linkedPbRoomId: autoCreatePbRoom ? `room-${Math.floor(100 + Math.random() * 900)}` : undefined,
      };

      onAddBooking(newBooking);
      soundFx.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#3D4BFF', '#FFFFFF', '#FFD700'],
      });

      setSelectedVenue(null);
      setActiveTicket(newBooking);
    }, 1000);
  };

  const handleShareTicket = (booking: VenueBooking) => {
    soundFx.playClick();
    const text = `📢 *SOCIASPORT MABAR VENUE PASS*\n🏟️ Lapangan: ${booking.venueName} (${booking.courtName})\n📅 Tanggal: ${booking.formattedDate}\n⏰ Jam: ${booking.selectedSlots.join(', ')}\n🎟️ Kode Tiket: ${booking.bookingCode}\n\nYuk join mabar squad via Sociasport App!`;
    navigator.clipboard?.writeText(text);
    showToast('✅ Info booking & tiket berhasil disalin! Siap dishare ke grup WhatsApp.');
  };

  return (
    <motion.div
      id="venue-booking-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-28 max-w-5xl mx-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#24242A] border-2 border-[#CCFF00] text-[#CCFF00] font-bold text-xs sm:text-sm shadow-2xl shadow-[#CCFF00]/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#CCFF00]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header & Sub-Tab Navigation */}
      <section className="p-5 rounded-xl bg-[#24242A] border-l-4 border-[#3D4BFF] border-y border-r border-[#9E9E9E]/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="font-bold text-lg sm:text-xl text-white uppercase tracking-tight">
              Sewa Lapang & Arena Booking
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CCFF00] text-black uppercase tracking-wider">
              Resmi PB Partner
            </span>
          </div>
          <p className="text-xs text-[#9E9E9E]">
            Booking lapangan futsal, badminton, basket, padel & mini soccer berstandar turnamen dengan diskon Sociacoins.
          </p>
        </div>

        {/* Tab Switcher: Cari Lapangan vs Tiket Saya */}
        <div className="flex items-center gap-2 p-1 rounded-lg bg-[#121212] border border-[#9E9E9E]/10 self-start md:self-auto">
          <button
            id="tab-btn-browse-venues"
            onClick={() => {
              soundFx.playClick();
              setActiveSubTab('browse');
            }}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'browse'
                ? 'bg-[#3D4BFF] text-white shadow-md shadow-[#3D4BFF]/30'
                : 'text-[#9E9E9E] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Cari Lapang</span>
          </button>

          <button
            id="tab-btn-my-bookings"
            onClick={() => {
              soundFx.playClick();
              setActiveSubTab('my-bookings');
            }}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'my-bookings'
                ? 'bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/30 font-black'
                : 'text-[#9E9E9E] hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Tiket Saya</span>
            {bookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#121212] text-[#CCFF00] font-mono">
                {bookings.length}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* VIEW 1: BROWSE & BOOK VENUES */}
      {activeSubTab === 'browse' && (
        <div className="space-y-5">
          {/* Search Bar & City Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-[#9E9E9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama venue, area Kuningan, Senayan, atau fasilitas..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#24242A] border border-[#9E9E9E]/20 text-white placeholder-[#9E9E9E] text-xs sm:text-sm focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-[#CCFF00] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedCity(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#24242A] border border-[#9E9E9E]/20 text-white text-xs sm:text-sm focus:outline-none focus:border-[#CCFF00] transition-colors appearance-none cursor-pointer"
              >
                <option value="all">📍 Semua Wilayah Jakarta</option>
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Tangerang">Tangerang & BSD</option>
              </select>
            </div>
          </div>

          {/* Sport Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: '🏟️ Semua Cabang' },
              { id: 'futsal', label: '⚽ Futsal' },
              { id: 'badminton', label: '🏸 Badminton' },
              { id: 'padel', label: '🎾 Padel Club' },
              { id: 'basketball', label: '🏀 Basketball' },
              { id: 'minisoccer', label: '🥅 Mini Soccer' },
              { id: 'tennis', label: '🎾 Tennis' },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`venue-sport-filter-${cat.id}`}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedSport(cat.id as any);
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                  selectedSport === cat.id
                    ? 'bg-[#3D4BFF] text-white border border-[#CCFF00] shadow-md shadow-[#3D4BFF]/30'
                    : 'bg-[#24242A] text-[#9E9E9E] hover:text-white border border-[#9E9E9E]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Mitra Lapangan Integration Banner */}
          {onNavigateToPartner && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
              isDay 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-slate-800' 
                : 'bg-gradient-to-r from-[#1C2454] to-[#24242A] border-[#3D4BFF]/40 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D4BFF] text-white flex items-center justify-center flex-shrink-0 shadow">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold uppercase">Punya Lapangan Olahraga Sendiri?</h4>
                  <p className="text-[11px] text-[#9E9E9E]">Daftarkan arena Anda di Mitra Lapangan & jangkau ribuan player Sociasport se-Indonesia.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigateToPartner();
                }}
                className="px-4 py-2 rounded-lg bg-[#CCFF00] text-black font-black uppercase text-xs hover:bg-[#b8e600] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow"
              >
                <span>Portal Mitra Lapangan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                id={`venue-card-${venue.id}`}
                className="rounded-2xl bg-[#24242A] border border-white/5 hover:border-[#3D4BFF]/40 overflow-hidden flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-[#3D4BFF]/10"
              >
                {/* Image Banner with Badges */}
                <div className="relative h-44 overflow-hidden bg-[#121212]">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#24242A] via-transparent to-black/60" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {venue.badge && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#121212]/90 backdrop-blur-md text-[#CCFF00] border border-[#CCFF00]/40">
                        {venue.badge}
                      </span>
                    )}
                  </div>

                  {/* Distance & Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#CCFF00]" /> {venue.distance}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2454] text-[#CCFF00] border border-[#3D4BFF]/50 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#CCFF00] text-[#CCFF00]" /> {venue.rating} ({venue.reviewCount})
                    </span>
                  </div>

                  {/* Sport & City Pin bottom overlay */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-1 text-[11px]">
                      <Building2 className="w-3.5 h-3.5" /> {venue.courts.length} Lapangan Tersedia
                    </span>
                    <span className="text-[11px] text-[#9E9E9E] font-mono">{venue.operatingHours}</span>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-[#9E9E9E] line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#3D4BFF] flex-shrink-0" />
                      {venue.fullAddress}
                    </p>

                    {/* Facilities Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {venue.facilities.slice(0, 3).map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#121212] text-[#9E9E9E] border border-[#9E9E9E]/10"
                        >
                          ✓ {fac}
                        </span>
                      ))}
                      {venue.facilities.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#121212] text-[#CCFF00]">
                          +{venue.facilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action CTA */}
                  <div className="pt-3 border-t border-[#9E9E9E]/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[#9E9E9E] block uppercase font-mono">Mulai Dari</span>
                      <span className="text-base sm:text-lg font-black text-[#CCFF00] font-mono">
                        Rp {venue.priceStartFrom.toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-[#9E9E9E]"> / jam</span>
                      </span>
                    </div>

                    <button
                      id={`btn-book-venue-${venue.id}`}
                      onClick={() => handleOpenBooking(venue)}
                      className="px-4 py-2.5 rounded-lg bg-[#CCFF00] hover:bg-white text-[#121212] font-black text-xs uppercase italic tracking-tighter flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>Pilih Jadwal</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <div className="p-12 text-center rounded-xl bg-[#24242A] border border-[#9E9E9E]/10 space-y-3">
              <Building2 className="w-10 h-10 text-[#9E9E9E] mx-auto opacity-50" />
              <p className="text-sm text-[#9E9E9E]">Tidak ditemukan venue yang sesuai dengan kata kunci atau filter.</p>
              <button
                onClick={() => {
                  setSelectedSport('all');
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-[#3D4BFF] text-white text-xs font-bold uppercase"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY BOOKINGS (TIKET SAYA) */}
      {activeSubTab === 'my-bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base sm:text-lg text-white uppercase tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#CCFF00]" />
              Daftar Tiket & Reservasi Lapangan Saya
            </h3>
            <span className="text-xs text-[#9E9E9E] font-mono">{bookings.length} Transaksi</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#24242A] border border-[#9E9E9E]/10 space-y-4">
              <Calendar className="w-12 h-12 text-[#9E9E9E] mx-auto opacity-40" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Belum Ada Tiket Sewa Lapang</h4>
                <p className="text-xs text-[#9E9E9E] max-w-md mx-auto">
                  Kamu belum melakukan booking lapangan. Pilih venue futsal, badminton, basket, atau padel favoritmu sekarang!
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('browse')}
                className="px-5 py-2.5 rounded-lg bg-[#CCFF00] text-black font-black text-xs uppercase italic tracking-wider shadow-lg"
              >
                Jelajahi Lapangan Tersedia →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  id={`booking-card-${b.id}`}
                  className="p-5 rounded-xl bg-[#24242A] border-l-4 border-l-[#CCFF00] border-y border-r border-[#9E9E9E]/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C2454] text-[#CCFF00] border border-[#3D4BFF]/50">
                        {b.bookingCode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#2D3A1B] text-[#CCFF00] border border-[#CCFF00]/40">
                        ✓ {b.paymentStatus}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#121212] text-[#9E9E9E]">
                        {b.sport}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-white">{b.venueName}</h4>
                      <p className="text-xs text-[#CCFF00] font-medium">{b.courtName}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#9E9E9E] font-mono">
                      <span className="flex items-center gap-1 text-white">
                        <Calendar className="w-3.5 h-3.5 text-[#3D4BFF]" /> {b.formattedDate}
                      </span>
                      <span className="flex items-center gap-1 text-white">
                        <Clock className="w-3.5 h-3.5 text-[#CCFF00]" /> {b.selectedSlots.join(', ')} ({b.durationHours} Jam)
                      </span>
                      <span>Total: <strong className="text-white">Rp {b.totalPrice.toLocaleString('id-ID')}</strong></span>
                    </div>
                  </div>

                  {/* Actions for this booking */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveTicket(b);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#3D4BFF] hover:bg-[#323ec9] text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-[#3D4BFF]/30"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Buka E-Ticket</span>
                    </button>

                    <button
                      onClick={() => handleShareTicket(b)}
                      className="px-3 py-2 rounded-lg bg-[#121212] hover:bg-[#24242A] text-[#9E9E9E] hover:text-white border border-[#9E9E9E]/20 text-xs font-semibold"
                      title="Share ke WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE BOOKING MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedVenue && selectedCourt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#1C1C22] border-2 border-[#3D4BFF]/50 rounded-2xl overflow-hidden shadow-2xl space-y-0 text-white my-8"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-[#24242A] border-b border-[#9E9E9E]/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-[#CCFF00] tracking-widest block font-mono">
                    Form Reservasi Lapangan
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {selectedVenue.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="p-1.5 rounded-lg bg-[#121212] hover:bg-white/10 text-[#9E9E9E] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* 1. Court Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider block">
                    1. Pilih Jenis & Lapangan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedVenue.courts.map((court) => {
                      const isSelected = selectedCourt.id === court.id;
                      return (
                        <button
                          key={court.id}
                          onClick={() => {
                            soundFx.playClick();
                            setSelectedCourt(court);
                            setSelectedSlots([]); // Reset slots on court change
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#1C2454] border-2 border-[#CCFF00] shadow-md shadow-[#CCFF00]/10'
                              : 'bg-[#24242A] border-[#9E9E9E]/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-white block">{court.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />}
                          </div>
                          <span className="text-[11px] text-[#9E9E9E] block mt-0.5">{court.surfaceType}</span>
                          <span className="text-xs font-bold text-[#CCFF00] font-mono mt-1 block">
                            Rp {court.pricePerHour.toLocaleString('id-ID')} / jam
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Date Selector (7 Days Carousel) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider block">
                    2. Pilih Tanggal Main
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {next7Days.map((d) => {
                      const isSelected = selectedDateIndex === d.index;
                      return (
                        <button
                          key={d.index}
                          onClick={() => {
                            soundFx.playClick();
                            setSelectedDateIndex(d.index);
                          }}
                          className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-[#3D4BFF] border-2 border-[#CCFF00] text-white shadow-lg shadow-[#3D4BFF]/30'
                              : 'bg-[#24242A] border-[#9E9E9E]/10 text-[#9E9E9E] hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold block">{d.dayName}</span>
                          <span className="text-xs font-bold font-mono block mt-0.5">{d.dateStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Time Slots Matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">
                      3. Pilih Jam Main ({selectedSlots.length} Jam Dipilih)
                    </label>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#9E9E9E]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3D4BFF]"></span> Tersedia</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#CCFF00]"></span> Dipilih</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#121212] border border-[#9E9E9E]/40"></span> Terisi</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedCourt.slots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.time);
                      const isBooked = slot.isBooked;

                      return (
                        <button
                          key={slot.id}
                          disabled={isBooked}
                          onClick={() => handleToggleSlot(slot.time)}
                          className={`p-2.5 rounded-lg border text-center transition-all ${
                            isBooked
                              ? 'bg-[#121212] border-[#9E9E9E]/10 text-[#9E9E9E]/40 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-[#2D3A1B] border-2 border-[#CCFF00] text-[#CCFF00] font-black shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                              : 'bg-[#24242A] border-[#9E9E9E]/10 hover:border-[#3D4BFF] text-white'
                          }`}
                        >
                          <span className="text-xs font-bold font-mono block">{slot.time}</span>
                          <span className="text-[10px] opacity-75 font-mono block mt-0.5">
                            {isBooked ? 'Terisi' : `Rp ${(slot.price / 1000).toFixed(0)}k`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Match Add-ons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider block">
                    4. Fasilitas & Tambahan Match (Opsional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MOCK_ADDONS.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleToggleAddon(addon.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked
                              ? 'bg-[#1C2454] border-[#3D4BFF] text-white'
                              : 'bg-[#24242A] border-[#9E9E9E]/10 text-[#9E9E9E] hover:border-white/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                            isChecked ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'border-[#9E9E9E]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <span className="text-xs font-bold text-white block">{addon.name}</span>
                            <span className="text-[10px] text-[#9E9E9E] block">{addon.description}</span>
                            <span className="text-xs font-bold text-[#CCFF00] font-mono block">
                              +Rp {addon.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Gamification Discount (Sociacoins) */}
                <div className="p-3.5 rounded-xl bg-[#24242A] border border-[#9E9E9E]/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#1C2454] border border-[#3D4BFF] text-[#CCFF00] flex items-center justify-center font-black">
                      ◈
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Gunakan Diskon Sociacoins
                      </span>
                      <span className="text-[11px] text-[#9E9E9E]">
                        Tukar {maxCoinsToUse.toLocaleString()} SC untuk diskon Rp {(maxCoinsToUse * 10).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setUseSociacoins(!useSociacoins);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      useSociacoins
                        ? 'bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/30 font-black'
                        : 'bg-[#121212] text-[#9E9E9E] border border-white/10 hover:text-white'
                    }`}
                  >
                    {useSociacoins ? '✓ Aktif' : 'Gunakan'}
                  </button>
                </div>

                {/* 6. Auto-Create PB Mabar Room Feature */}
                <div className="p-3.5 rounded-xl bg-[#2D3A1B] border border-[#CCFF00]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#121212] border border-[#CCFF00] text-[#CCFF00] flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#CCFF00] block">
                        🚀 Otomatis Bikin PB Matchmaking Room
                      </span>
                      <span className="text-[10px] text-[#9E9E9E]">
                        Room mabar Point Blank langsung live agar squad bisa join & ready!
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setAutoCreatePbRoom(!autoCreatePbRoom);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      autoCreatePbRoom
                        ? 'bg-[#CCFF00] text-black font-black'
                        : 'bg-[#121212] text-[#9E9E9E] border border-white/10'
                    }`}
                  >
                    {autoCreatePbRoom ? '✓ ON' : 'OFF'}
                  </button>
                </div>

                {/* 7. Payment Methods */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider block">
                    7. Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'qris', label: '⚡ QRIS Instant', sub: 'BCA, GoPay, OVO, Dana' },
                      { id: 'bca', label: '🏦 BCA Virtual Account', sub: 'Auto-Check 24 Jam' },
                      { id: 'sc', label: '◈ Sociacoins Pay', sub: 'Saldo Instan' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => {
                          soundFx.playClick();
                          setPaymentMethod(pm.id);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          paymentMethod === pm.id
                            ? 'bg-[#1C2454] border-2 border-[#CCFF00] text-white'
                            : 'bg-[#24242A] border-[#9E9E9E]/10 text-[#9E9E9E]'
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{pm.label}</span>
                        <span className="text-[10px] text-[#9E9E9E] block mt-0.5">{pm.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-4 rounded-xl bg-[#121212] border border-[#9E9E9E]/20 space-y-2 text-xs">
                  <div className="flex justify-between text-[#9E9E9E]">
                    <span>Sewa Lapangan ({durationHours} Jam x Rp {courtPricePerHour.toLocaleString('id-ID')})</span>
                    <span className="text-white font-mono">Rp {basePrice.toLocaleString('id-ID')}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-[#9E9E9E]">
                      <span>Tambahan Fasilitas Match</span>
                      <span className="text-white font-mono">+Rp {addonsTotal.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {useSociacoins && coinDiscount > 0 && (
                    <div className="flex justify-between text-[#CCFF00]">
                      <span>Potongan Diskon Sociacoins</span>
                      <span className="font-mono font-bold">-Rp {coinDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#9E9E9E]/20 flex justify-between items-center text-sm font-bold">
                    <span className="text-white uppercase tracking-wider">Total Pembayaran</span>
                    <span className="text-[#CCFF00] text-base sm:text-lg font-mono font-black">
                      Rp {grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 bg-[#24242A] border-t border-[#9E9E9E]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#9E9E9E]">
                  🔒 Pembayaran dijamin aman & tiket digital langsung aktif.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedVenue(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-[#121212] hover:bg-white/10 text-[#9E9E9E] hover:text-white text-xs font-bold uppercase"
                  >
                    Batal
                  </button>

                  <button
                    id="btn-confirm-pay-booking"
                    disabled={isProcessing || selectedSlots.length === 0}
                    onClick={handleConfirmBooking}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#CCFF00] hover:bg-white text-[#121212] font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span>Memproses Pembayaran...</span>
                    ) : (
                      <>
                        <span>Bayar & Terbitkan Tiket</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* E-TICKET & DIGITAL PASS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#24242A] border-2 border-[#CCFF00] rounded-2xl overflow-hidden shadow-2xl space-y-0 text-white my-8 relative"
            >
              {/* Top Accent Ribbon */}
              <div className="h-2.5 bg-gradient-to-r from-[#3D4BFF] via-[#CCFF00] to-[#3D4BFF]" />

              {/* Close Button */}
              <button
                onClick={() => setActiveTicket(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#121212]/80 text-[#9E9E9E] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 space-y-5 text-center">
                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-full bg-[#2D3A1B] text-[#CCFF00] border-2 border-[#CCFF00] mx-auto flex items-center justify-center shadow-lg shadow-[#CCFF00]/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                    Tiket Sewa Lapangan Aktif
                  </h3>
                  <p className="text-xs text-[#CCFF00] font-mono">KODE: {activeTicket.bookingCode}</p>
                </div>

                {/* QR Code Pass Card */}
                <div className="p-4 rounded-xl bg-[#121212] border border-[#9E9E9E]/20 space-y-3">
                  <div className="w-44 h-44 bg-white rounded-lg mx-auto p-2.5 flex flex-col items-center justify-center relative shadow-inner">
                    {/* Simulated High-Res QR Code */}
                    <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-black"></div>
                        <div className="w-8 h-8 bg-black"></div>
                      </div>
                      <div className="text-center font-mono text-[9px] font-black text-black tracking-widest uppercase">
                        SOCIASPORT PASS
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 bg-black"></div>
                        <div className="w-4 h-4 bg-[#3D4BFF]"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#9E9E9E] block font-mono">
                    Tunjukkan QR code ini ke resepsionis arena untuk check-in & buka lampu lapangan.
                  </span>
                </div>

                {/* Match & Venue Details Breakdown */}
                <div className="p-3.5 rounded-xl bg-[#1C1C22] border border-[#9E9E9E]/10 text-left space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#9E9E9E] uppercase block font-mono">Venue Arena</span>
                    <span className="font-bold text-white text-sm block">{activeTicket.venueName}</span>
                    <span className="text-[11px] text-[#CCFF00] font-medium block">{activeTicket.courtName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#9E9E9E]/10 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-[#9E9E9E] block">TANGGAL</span>
                      <span className="text-white font-bold">{activeTicket.formattedDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9E9E9E] block">WAKTU</span>
                      <span className="text-[#CCFF00] font-bold">{activeTicket.selectedSlots.join(', ')}</span>
                    </div>
                  </div>

                  {activeTicket.addons.length > 0 && (
                    <div className="pt-2 border-t border-[#9E9E9E]/10">
                      <span className="text-[10px] text-[#9E9E9E] block">FASILITAS TAMBAHAN:</span>
                      <span className="text-white text-[11px]">
                        {activeTicket.addons.map(a => a.name).join(' • ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleShareTicket(activeTicket)}
                    className="w-full py-2.5 rounded-xl bg-[#CCFF00] hover:bg-white text-black font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan Tiket ke WhatsApp Squad</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTicket(null);
                      setActiveSubTab('my-bookings');
                    }}
                    className="w-full py-2 rounded-xl bg-[#121212] text-[#9E9E9E] hover:text-white border border-[#9E9E9E]/10 text-xs font-bold uppercase"
                  >
                    Simpan ke Riwayat Tiket
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
