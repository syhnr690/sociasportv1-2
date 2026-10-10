import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Chrome, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Gamepad2, 
  Sun, 
  Moon, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  User, 
  Check, 
  TrendingUp, 
  CreditCard,
  Phone,
  MapPin,
  Layers,
  Award,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { auth, googleProvider, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  signInAnonymously 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { UserRole, SportCategory } from '../types';
import confetti from 'canvas-confetti';

interface LoginViewProps {
  onLogin: (role?: UserRole, partnerData?: any) => void;
  onDemoLogin?: (role?: UserRole) => void;
  onBack?: () => void;
  defaultIsLogin?: boolean;
  initialRole?: UserRole;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLogin, 
  onDemoLogin, 
  onBack, 
  defaultIsLogin = false, 
  initialRole = 'player' 
}) => {
  const { isDay, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [district, setDistrict] = useState('Kuningan');
  const [sportCategory, setSportCategory] = useState<SportCategory>('futsal');
  const [courtCount, setCourtCount] = useState('2');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    soundFx.playClick();
    
    try {
      let createdPartnerData: any = null;

      if (isLogin) {
        // Handle Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch or detect existing role in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const storedRole = (data.role as UserRole) || selectedRole;
            setSelectedRole(storedRole);
            if (storedRole === 'partner') {
              createdPartnerData = {
                businessName: data.partnerBusinessName || 'Champions Sports Arena',
                partnerSince: '2024',
                partnerTier: 'Platinum',
                verifiedPartner: true,
                totalRevenue: data.totalRevenue || 28450000,
                readyPayout: data.readyPayout || 24182500,
                bankName: 'Bank Central Asia (BCA)',
                bankAccountNumber: '8830-1928-3199',
                bankAccountHolder: data.displayName || 'MITRA ARENA',
                phone: data.partnerPhone || '0812-9988-7766',
                city: data.city || 'Jakarta Selatan',
                managedVenueCount: parseInt(data.courtCount) || 2,
                activeCourtCount: parseInt(data.courtCount) || 2,
              };
            }
          }
        } catch (fetchErr) {
          console.warn("Could not fetch user role from Firestore, defaulting to selected role:", fetchErr);
        }
      } else {
        // Handle Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const displayName = fullName.trim() || (selectedRole === 'partner' ? 'Budi Santoso' : 'Player');
        await updateProfile(user, { displayName });

        if (selectedRole === 'partner') {
          createdPartnerData = {
            businessName: businessName.trim() || 'Champions Sports Arena',
            partnerSince: '2024',
            partnerTier: 'Platinum',
            verifiedPartner: true,
            totalRevenue: 28450000,
            readyPayout: 24182500,
            bankName: 'Bank Central Asia (BCA)',
            bankAccountNumber: '8830-1928-3199',
            bankAccountHolder: displayName.toUpperCase(),
            phone: phone.trim() || '0812-9988-7766',
            city: city.trim() || 'Jakarta Selatan',
            managedVenueCount: parseInt(courtCount) || 2,
            activeCourtCount: parseInt(courtCount) || 2,
          };
        }

        // Save role and metadata to Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userPayload: any = {
            uid: user.uid,
            email: user.email,
            displayName,
            role: selectedRole,
            level: selectedRole === 'partner' ? 5 : 1,
            xp: 0,
            sociacoins: selectedRole === 'partner' ? 1000 : 200,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
          };

          if (selectedRole === 'partner') {
            userPayload.partnerBusinessName = businessName.trim() || 'Champions Sports Arena';
            userPayload.partnerPhone = phone.trim() || '0812-9988-7766';
            userPayload.city = city.trim() || 'Jakarta Selatan';
            userPayload.district = district.trim() || 'Kuningan';
            userPayload.sportCategory = sportCategory;
            userPayload.courtCount = parseInt(courtCount) || 2;
            userPayload.totalRevenue = 28450000;
            userPayload.readyPayout = 24182500;
            userPayload.verifiedPartner = true;
          }

          await setDoc(userDocRef, userPayload, { merge: true });
        } catch (firestoreErr) {
          console.warn("Could not save initial user doc in Firestore:", firestoreErr);
        }
      }

      setIsSuccess(true);
      soundFx.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: selectedRole === 'partner' ? ['#CCFF00', '#10B981', '#3D4BFF', '#FFFFFF'] : ['#3D4BFF', '#00b0ff', '#CCFF00', '#FFFFFF'],
      });

      setTimeout(() => {
        onLogin(selectedRole, createdPartnerData);
      }, 700);
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth belum aktif di Firebase Console. Anda dapat menggunakan opsi "Akses Cepat Demo" di bawah.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan gunakan email lain atau pilih mode Masuk/Sign In.');
      } else if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found'
      ) {
        setError('Email atau password tidak cocok. Silakan periksa kembali atau gunakan Akun Demo.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu pendek. Harap gunakan minimal 6 karakter.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Jendela otorisasi ditutup sebelum selesai.');
      } else {
        setError(err.message || 'Terjadi kesalahan sistem. Silakan coba lagi atau gunakan tombol demo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Sync role to Firestore if newly created
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          const userPayload: any = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (selectedRole === 'partner' ? 'Mitra Arena' : 'Player'),
            role: selectedRole,
            level: selectedRole === 'partner' ? 5 : 1,
            xp: 0,
            sociacoins: selectedRole === 'partner' ? 1000 : 200,
            onboardingCompleted: true,
          };
          if (selectedRole === 'partner') {
            userPayload.partnerBusinessName = 'Arena Mitra Olahraga';
            userPayload.city = 'Jakarta Selatan';
            userPayload.verifiedPartner = true;
          }
          await setDoc(userDocRef, userPayload, { merge: true });
        }
      } catch (e) {
        console.warn("Google login firestore sync:", e);
      }

      setIsSuccess(true);
      soundFx.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
      setTimeout(() => {
        onLogin(selectedRole);
      }, 700);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login Google dibatalkan.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Provider belum diaktifkan di Firebase. Anda dapat menggunakan Akun Demo di bawah.');
      } else {
        setError(err.message || 'Gagal login Google. Silakan coba lagi atau gunakan Akses Demo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = async (roleToUse: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await signInAnonymously(auth);
      } catch {
        // Safe fallback if anonymous auth isn't enabled
      }
      setIsSuccess(true);
      soundFx.playVictory();
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.5 },
        colors: roleToUse === 'partner' ? ['#CCFF00', '#10B981', '#FFFFFF'] : ['#3D4BFF', '#00b0ff', '#FFFFFF'],
      });
      setTimeout(() => {
        if (onDemoLogin) {
          onDemoLogin(roleToUse);
        } else {
          onLogin(roleToUse);
        }
      }, 500);
    } catch (err: any) {
      console.warn("Demo login fallback:", err);
      if (onDemoLogin) {
        onDemoLogin(roleToUse);
      } else {
        onLogin(roleToUse);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    soundFx.playClick();
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 selection:bg-[#CCFF00] selection:text-black transition-colors ${
      isDay ? 'bg-[#F4F6F9]' : 'bg-[#121212]'
    }`}>
      {/* Background Animated Blobs */}
      <div className={`absolute top-0 left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full mix-blend-screen filter blur-[120px] pointer-events-none transition-all ${
        selectedRole === 'partner' ? 'bg-emerald-600/25' : 'bg-[#3D4BFF]/30'
      }`} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#CCFF00] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none" />

      {/* Top Action Bar: Back & Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between max-w-5xl mx-auto">
        {onBack ? (
          <button 
            onClick={onBack}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isDay ? 'text-slate-600 hover:text-slate-900' : 'text-[#9E9E9E] hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        ) : <div />}

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            isDay
              ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
              : 'bg-[#24242A] text-white border-white/10 hover:border-[#CCFF00]'
          }`}
        >
          {isDay ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Day Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#CCFF00]" />
              <span className="hidden sm:inline">Night Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`w-full max-w-5xl backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 mt-12 mb-6 ${
          isDay
            ? 'bg-white/95 border-slate-200 text-slate-900'
            : 'bg-[#1A1A1F]/95 border-white/10 text-white'
        }`}
      >
        {/* Left Column: Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center">
          
          {/* Header Badges & Titles */}
          <div className="mb-5 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3D4BFF] text-white">
                SOCIA SPORT V1.2
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedRole === 'partner' 
                  ? 'bg-[#CCFF00] text-black font-black' 
                  : 'bg-emerald-500 text-white font-bold'
              }`}>
                {isLogin 
                  ? (selectedRole === 'partner' ? '🏢 LOGIN PORTAL MITRA LAPANGAN' : '🎮 LOGIN PEMAIN / ATLET')
                  : (selectedRole === 'partner' ? '🏢 REGISTRASI MITRA BARU (0% BIAYA)' : '🎮 DAFTAR ATLET / PEMAIN')}
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-display font-black leading-tight uppercase tracking-tight ${
              isDay ? 'text-slate-900' : 'text-white'
            }`}>
              {selectedRole === 'partner' ? (
                <>
                  {isLogin ? 'Masuk Portal' : 'Daftarkan Arena & Jadi'} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-[#CCFF00] to-[#3D4BFF]">
                    Mitra Lapangan Socia Sport
                  </span>
                </>
              ) : (
                <>
                  {isLogin ? 'Masuk ke' : 'Bergabung di'} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D4BFF] to-[#00b0ff]">
                    Arena Olahraga Gamifikasi
                  </span>
                </>
              )}
            </h1>

            <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
              {selectedRole === 'partner'
                ? 'Kelola fasilitas lapangan olahraga, pantau omzet sewa, dan verifikasi check-in pemain secara otomatis.'
                : 'Cari teman mabar, booking lapangan favorit, kumpulkan XP, dan pamerkan gear avatar.'}
            </p>
          </div>

          {/* Segmented Role Selector: Switch between Player and Partner */}
          <div className="mb-5 p-1 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedRole('player');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedRole === 'player'
                  ? isDay
                    ? 'bg-white text-[#3D4BFF] shadow-md border border-slate-200'
                    : 'bg-[#3D4BFF] text-white shadow-lg shadow-[#3D4BFF]/30'
                  : isDay
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#9E9E9E] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Akun Pemain / Atlet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedRole('partner');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedRole === 'partner'
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/25 font-black'
                  : isDay
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#9E9E9E] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Akun Mitra Lapangan</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="flex-1">{error}</p>
                </motion.div>
              )}

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <p className="font-bold">
                    {selectedRole === 'partner' 
                      ? 'Autentikasi Mitra Berhasil! Membuka Dashboard Pengelola...' 
                      : 'Autentikasi Berhasil! Mengarahkan ke Arena Pemain...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fields when Registering */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                  }`}>
                    {selectedRole === 'partner' ? 'Nama Pemilik / PIC Lapangan' : 'Nama Lengkap / In-Game Nickname'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'partner' ? 'Misal: Budi Santoso' : 'Misal: Captain Arga'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                      isDay
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#121212] border-white/10 text-white placeholder-white/30'
                    }`}
                  />
                </div>

                {/* Additional Partner-Specific Fields */}
                {selectedRole === 'partner' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                        }`}>
                          Nama Bisnis / Arena Olahraga
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: Champions Arena Futsal"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                            isDay
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'bg-[#121212] border-white/10 text-white placeholder-white/30'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                        }`}>
                          Nomor WhatsApp PIC
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Misal: 0812-9988-7766"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                            isDay
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'bg-[#121212] border-white/10 text-white placeholder-white/30'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                        }`}>
                          Kota Lokasi
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Jakarta Selatan"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                            isDay
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'bg-[#121212] border-white/10 text-white placeholder-white/30'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                        }`}>
                          Kategori Utama
                        </label>
                        <select
                          value={sportCategory}
                          onChange={(e) => setSportCategory(e.target.value as SportCategory)}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                            isDay
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'bg-[#121212] border-white/10 text-white'
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

                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
                        }`}>
                          Jumlah Lapangan
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={courtCount}
                          onChange={(e) => setCourtCount(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                            isDay
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'bg-[#121212] border-white/10 text-white'
                          }`}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            
            {/* Email and Password */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
              }`}>
                {selectedRole === 'partner' ? 'Alamat Email Bisnis Mitra' : 'Alamat Email'}
              </label>
              <input
                type="email"
                required
                placeholder={selectedRole === 'partner' ? 'mitra@championsarena.id' : 'player@sociasport.id'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                  isDay
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#121212] border-white/10 text-white placeholder-white/30'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDay ? 'text-slate-600' : 'text-[#9E9E9E]'
              }`}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#3D4BFF] transition-colors ${
                  isDay
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#121212] border-white/10 text-white placeholder-white/30'
                }`}
              />
            </div>

            {/* Terms checkbox for partner signup */}
            {!isLogin && selectedRole === 'partner' && (
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-xs text-slate-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#3D4BFF] focus:ring-[#3D4BFF]"
                />
                <span>
                  Saya menyetujui program Kemitraan Socia Sport tanpa biaya pendaftaran, pencairan dana H+0, dan keterhubungan jadwal ke komunitas mabar.
                </span>
              </label>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess || (!isLogin && selectedRole === 'partner' && !agreedTerms)}
              className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all flex justify-center items-center shadow-lg disabled:opacity-60 cursor-pointer ${
                selectedRole === 'partner'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#3D4BFF] text-white shadow-emerald-500/20'
                  : 'bg-[#3D4BFF] text-white shadow-[#3D4BFF]/30 hover:bg-[#303ed9]'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                selectedRole === 'partner' ? 'Masuk ke Dashboard Mitra' : 'Masuk Arena Pemain'
              ) : (
                selectedRole === 'partner' ? 'Daftarkan Arena & Buka Dashboard' : 'Daftar Akun Pemain Baru'
              )}
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 pt-1">
              <div className={`h-px flex-1 ${isDay ? 'bg-slate-200' : 'bg-white/10'}`} />
              <span className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
                Akses Pengujian Cepat 1-Klik
              </span>
              <div className={`h-px flex-1 ${isDay ? 'bg-slate-200' : 'bg-white/10'}`} />
            </div>

            {/* Google Sign-in */}
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={isLoading || isSuccess}
              className={`w-full py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 text-xs font-bold ${
                isDay
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              <Chrome className="w-4 h-4 text-emerald-400" />
              <span>
                Lanjut dengan Akun Google ({selectedRole === 'partner' ? 'Mitra' : 'Pemain'})
              </span>
            </button>

            {/* 2 Instant Demo Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('partner')}
                disabled={isLoading || isSuccess}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#CCFF00] text-black font-black text-xs flex items-center justify-between hover:scale-[1.02] transition-transform shadow-md cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-black shrink-0" />
                  <div>
                    <div className="leading-tight">Demo Mitra Lapangan</div>
                    <div className="text-[10px] font-normal opacity-80">Champions Arena • BCA</div>
                  </div>
                </div>
                <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-mono font-bold">Rp 24,1 Juta</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDemoLogin('player')}
                disabled={isLoading || isSuccess}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#3D4BFF] to-[#00b0ff] text-white font-bold text-xs flex items-center justify-between hover:scale-[1.02] transition-transform shadow-md cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <div>
                    <div className="leading-tight">Demo Akun Pemain</div>
                    <div className="text-[10px] font-normal opacity-80">STRIKER_99 (LVL 24)</div>
                  </div>
                </div>
                <span className="text-[9px] bg-black/30 px-1.5 py-0.5 rounded font-mono">Major 1</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Highlights & Toggle */}
        <div className="w-full lg:w-5/12 flex flex-col justify-between relative border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-10">
          
          {/* Top Toggle Switch between Login & Signup */}
          <div className="flex justify-between items-center mb-6">
            <span className={`text-[11px] font-mono uppercase tracking-wider ${isDay ? 'text-slate-500' : 'text-[#9E9E9E]'}`}>
              {isLogin ? 'Belum Terdaftar?' : 'Sudah Punya Akun?'}
            </span>
            <button
              onClick={handleToggle}
              type="button"
              className={`flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 rounded-full border transition-all backdrop-blur-md cursor-pointer ${
                isDay
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              <span className="text-xs font-bold tracking-wide">
                {isLogin 
                  ? (selectedRole === 'partner' ? 'Registrasi Mitra Baru' : 'Daftar Akun Baru') 
                  : (selectedRole === 'partner' ? 'Masuk Portal Mitra' : 'Masuk Sekarang')}
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isLogin ? 'bg-[#3D4BFF] text-white' : 'bg-[#CCFF00] text-black'
              }`}>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Dynamic Feature Highlights */}
          <div className="space-y-3 my-auto">
            {selectedRole === 'partner' ? (
              <>
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      Dashboard Finansial & Saldo H+0
                    </h3>
                  </div>
                  <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                    Pencairan omzet otomatis tanpa potongan tersembunyi langsung ke rekening BCA, Mandiri, BRI, BNI milik mitra.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      Terminal Check-In & Scanner Cepat
                    </h3>
                  </div>
                  <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                    Validasi kedatangan pemain secara instan hanya dengan memasukkan kode booking reservasi di meja resepsionis venue.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Layers className="w-4 h-4 text-[#3D4BFF]" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      Kontrol Slot & Anti Double-Booking
                    </h3>
                  </div>
                  <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                    Kunci slot 1-klik untuk sewa pelanggan offline atau buka slot untuk di-booking ribuan pemain komunitas Socia Sport.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      Roblox-Style 3D Avatar Locker
                    </h3>
                  </div>
                  <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                    Kustomisasi jersey, visor haptik, dan sepatu specs eksklusif untuk dipamerkan di podium leaderboard olahraga.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gamepad2 className="w-4 h-4 text-[#3D4BFF]" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      Point Blank Matchmaking Lobby
                    </h3>
                  </div>
                  <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                    Bentuk squad Team Red vs Team Blue dengan sound effects tematik, voting slot lapangan, dan sistem Ready-Check.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isDay ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-slate-900' : 'text-white'}`}>
                      Tiket Digital & Cashback Koin
                    </h3>
                  </div>
                  <p className={`text-xs ${isDay ? 'text-slate-600' : 'text-[#9E9E9E]'}`}>
                    Booking instan tanpa ribet transfer manual dengan QRIS dan dapatkan cashback Sociacoins setiap sesi mabar selesai.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 text-[10px] text-[#9E9E9E] font-mono">
            <span>SOCIA SPORT V1.2 MITRA</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL ENCRYPTED
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
