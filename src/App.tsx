/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, UserAvatar, UserRole, ActivityCard as ActivityCardType, VenueBooking, Venue } from './types';
import { INITIAL_USER, INITIAL_PARTNER_USER, INITIAL_BOOKINGS, MOCK_VENUES } from './data/mockData';
import { TopNavbar } from './components/TopNavbar';
import { BottomNav } from './components/BottomNav';
import { RobloxHome } from './views/RobloxHome';
import { PointBlankLobby } from './views/PointBlankLobby';
import { VenueBookingView } from './views/VenueBookingView';
import { PartnerFieldRentView } from './views/PartnerFieldRentView';
import { QuestsView } from './views/QuestsView';
import { AvatarLocker } from './views/AvatarLocker';
import { DesignSpecViewer } from './views/DesignSpecViewer';
import { LoginView } from './views/LoginView';
import { LandingPageView } from './views/LandingPageView';
import { PartnerLandingPageView } from './views/PartnerLandingPageView';
import { RedeemView } from './views/RedeemView';
import { OnboardingView } from './views/OnboardingView';
import { soundFx } from './utils/audio';
import confetti from 'canvas-confetti';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { isDay } = useTheme();
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [showPartnerLanding, setShowPartnerLanding] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false);
  const [authDefaultIsLogin, setAuthDefaultIsLogin] = useState<boolean>(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('player');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [user, setUser] = useState<UserAvatar>(INITIAL_USER);
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [bookings, setBookings] = useState<VenueBooking[]>(INITIAL_BOOKINGS);
  const [lobbySportFilter, setLobbySportFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let data;
          if (userDoc.exists()) {
            data = userDoc.data();
          } else {
            // Create user document if it's a new user
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Player',
              role: 'player',
              level: 1,
              xp: 0,
              sociacoins: 200,
              onboardingCompleted: false,
              equippedGear: { head: '', jersey: '', shoes: '', accessory: '' }
            };
            try {
              await setDoc(userDocRef, newUser);
            } catch (writeErr) {
              console.warn("Firestore user creation fallback to local:", writeErr);
            }
            data = newUser;
          }
          
          const userRole: UserRole = (data.role as UserRole) || 'player';

          // Check if onboarding is needed
          if (data.onboardingCompleted !== true && !firebaseUser.isAnonymous) {
            setIsOnboarding(true);
          } else {
            setIsOnboarding(false);
          }

          setUser(prev => ({
            ...prev,
            role: userRole,
            name: data.displayName || firebaseUser.displayName || prev.name,
            level: data.level !== undefined ? data.level : prev.level,
            currentXp: data.xp !== undefined ? data.xp : prev.currentXp,
            sociacoins: data.sociacoins !== undefined ? data.sociacoins : prev.sociacoins,
            equippedGear: data.equippedGear || { head: '', jersey: '', shoes: '', accessory: '' },
            partnerData: userRole === 'partner' ? {
              businessName: data.partnerBusinessName || 'PT Champions Arena Nusantara',
              partnerSince: '2024',
              partnerTier: 'Platinum',
              verifiedPartner: true,
              totalRevenue: 28450000,
              readyPayout: 24182500,
              bankName: 'Bank Central Asia (BCA)',
              bankAccountNumber: '8830-1928-3199',
              bankAccountHolder: data.displayName || 'PT CHAMPIONS ARENA',
              phone: '0812-9988-7766',
              city: data.city || 'Jakarta Selatan',
              managedVenueCount: 2,
              activeCourtCount: 4,
            } : prev.partnerData,
          }));

          // Set default landing tab based on role
          if (userRole === 'partner') {
            setActiveTab('partner');
          }

          setIsAuthenticated(true);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser(prev => ({
            ...prev,
            name: firebaseUser.displayName || 'Player',
            role: 'player',
            level: 1,
            currentXp: 0,
            sociacoins: 200,
            equippedGear: { head: '', jersey: '', shoes: '', accessory: '' }
          }));
          setIsOnboarding(false);
          setIsAuthenticated(true);
        }
      } else {
        // Do not force logout if logged in via instant demo session
        setIsAuthenticated(prev => {
          if (prev && (user.name === 'STRIKER_99' || user.name === 'Budi Santoso')) return true;
          return false;
        });
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [user.name]);

  const handleSignOut = async () => {
    try {
      soundFx.playClick();
      await signOut(auth);
      setIsAuthenticated(false);
      setIsOnboarding(false);
      setShowLandingPage(true);
    } catch (err) {
      console.error("Sign out error:", err);
      setIsAuthenticated(false);
      setShowLandingPage(true);
    }
  };

  // Add XP with automatic Level-up calculation
  const handleAddXp = (xpToAdd: number) => {
    setUser((prev) => {
      let newXp = prev.currentXp + xpToAdd;
      let newLevel = prev.level;
      let nextLevelXp = prev.nextLevelXp;
      const addedCoins = Math.floor(xpToAdd * 0.3);

      if (newXp >= nextLevelXp) {
        newLevel += 1;
        newXp = newXp - nextLevelXp;
        nextLevelXp = Math.floor(nextLevelXp * 1.25);
        soundFx.playXpGain();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#CCFF00', '#3D4BFF', '#FFFFFF', '#FFD700'],
        });
      }
      
      const newSociacoins = prev.sociacoins + addedCoins;

      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          level: newLevel,
          xp: newXp,
          sociacoins: newSociacoins
        }, { merge: true }).catch(console.error);
      }

      return {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        nextLevelXp: nextLevelXp,
        sociacoins: newSociacoins,
      };
    });
  };

  const handleUpdateAvatar = async (updated: Partial<UserAvatar>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, updated, { merge: true });
      } catch (err) {
        console.error("Failed to sync avatar update to Firestore", err);
      }
    }
  };

  const handleSelectActivityFromHome = (activity: ActivityCardType) => {
    setLobbySportFilter(activity.sport);
    setActiveTab('lobby');
  };

  const handleAddBooking = (newBooking: VenueBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Deduct coins if used
    if (newBooking.sociacoinsUsed > 0) {
      setUser((prev) => {
        const newCoins = Math.max(0, prev.sociacoins - newBooking.sociacoinsUsed);
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid), { sociacoins: newCoins }, { merge: true }).catch(console.error);
        }
        return {
          ...prev,
          sociacoins: newCoins,
        };
      });
    }
    // Reward player with Booking XP
    handleAddXp(150);
  };

  const handleAddNewVenue = (newVenue: Venue) => {
    setVenues((prev) => [newVenue, ...prev]);
  };

  // Immediate Login handler that prevents race condition
  const handleLoginSuccess = (role?: UserRole, partnerData?: any) => {
    const determinedRole = role || user.role || 'player';
    setUser(prev => ({
      ...prev,
      role: determinedRole,
      name: partnerData?.bankAccountHolder || (determinedRole === 'partner' ? (prev.name === 'STRIKER_99' ? 'Budi Santoso' : prev.name) : prev.name),
      partnerData: determinedRole === 'partner' 
        ? { ...(prev.partnerData || INITIAL_PARTNER_USER.partnerData), ...(partnerData || {}) } 
        : prev.partnerData,
    }));
    setActiveTab(determinedRole === 'partner' ? 'partner' : 'home');
    setIsAuthenticated(true);
    setShowAuthForm(false);
    setShowLandingPage(false);
    setShowPartnerLanding(false);
  };

  // Helper to trigger partner login or signup
  const handleOpenPartnerAuth = (isLogin: boolean = false) => {
    setAuthDefaultIsLogin(isLogin);
    setAuthDefaultRole('partner');
    setShowPartnerLanding(false);
    setShowLandingPage(true);
    setShowAuthForm(true);
  };

  // Quick Demo Login Handler supporting both Player and Partner
  const handleDemoLogin = (role?: UserRole) => {
    if (role === 'partner') {
      setUser(INITIAL_PARTNER_USER);
      setActiveTab('partner');
    } else {
      setUser({
        ...INITIAL_USER,
        name: 'STRIKER_99',
        role: 'player',
        level: 24,
        currentXp: 850,
        nextLevelXp: 2000,
        sociacoins: 1750,
        onboardingCompleted: true,
        clan: 'CYBER_WOLVES',
        rankTitle: 'Major I',
        rankBadge: '🎖️ Major 1',
      });
      setActiveTab('home');
    }
    setIsAuthenticated(true);
    setShowAuthForm(false);
    setShowLandingPage(false);
    setShowPartnerLanding(false);
  };

  // Switch role seamlessly between Player and Partner
  const handleSwitchRole = (newRole: UserRole) => {
    soundFx.playVictory();
    setUser(prev => {
      if (newRole === 'partner') {
        return {
          ...prev,
          role: 'partner',
          partnerData: prev.partnerData || INITIAL_PARTNER_USER.partnerData,
        };
      } else {
        return {
          ...prev,
          role: 'player',
        };
      }
    });

    if (newRole === 'partner') {
      setActiveTab('partner');
    } else {
      setActiveTab('home');
    }

    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), { role: newRole }, { merge: true }).catch(console.error);
    }
  };

  // 0. Dedicated Partner Landing Page (For Field Owners & Sports Venues)
  if (showPartnerLanding) {
    return (
      <PartnerLandingPageView
        onGoToPartnerDashboard={() => {
          setShowPartnerLanding(false);
          setShowLandingPage(false);
          if (!isAuthenticated) {
            handleDemoLogin('partner');
          } else {
            if (user.role !== 'partner') {
              handleSwitchRole('partner');
            } else {
              setActiveTab('partner');
            }
          }
        }}
        onGoToPlayerApp={() => {
          setShowPartnerLanding(false);
          if (!isAuthenticated) {
            setShowLandingPage(true);
          } else {
            setShowLandingPage(false);
            setActiveTab('home');
          }
        }}
        onRegisterNewVenue={handleAddNewVenue}
        onLoginPartner={() => handleOpenPartnerAuth(true)}
        onSignupPartner={() => handleOpenPartnerAuth(false)}
      />
    );
  }

  // 1. Landing Page View (Default when opening the website link)
  if (showLandingPage) {
    if (showAuthForm && !isAuthenticated) {
      return (
        <LoginView 
          onLogin={handleLoginSuccess}
          onDemoLogin={handleDemoLogin}
          onBack={() => setShowAuthForm(false)}
          defaultIsLogin={authDefaultIsLogin}
          initialRole={authDefaultRole}
        />
      );
    }
    return (
      <LandingPageView 
        isAuthenticated={isAuthenticated}
        currentUser={isAuthenticated ? user : null}
        onEnterApp={() => {
          setShowLandingPage(false);
          setActiveTab(user.role === 'partner' ? 'partner' : 'home');
        }}
        onJoin={(isLogin = false) => {
          if (isAuthenticated) {
            setShowLandingPage(false);
            setActiveTab(user.role === 'partner' ? 'partner' : 'home');
          } else {
            setAuthDefaultIsLogin(isLogin);
            setAuthDefaultRole('player');
            setShowAuthForm(true);
          }
        }} 
        onSignOut={handleSignOut}
        onOpenPartner={() => {
          setShowPartnerLanding(true);
        }}
        onOpenPartnerLogin={() => handleOpenPartnerAuth(true)}
        onOpenPartnerSignup={() => handleOpenPartnerAuth(false)}
      />
    );
  }

  // 2. Loading state while verifying credentials to enter game
  if (isAuthLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 ${
        isDay ? 'bg-slate-50 text-slate-900' : 'bg-[#121212] text-white'
      }`}>
        <Loader2 className="w-10 h-10 text-[#3D4BFF] animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#9E9E9E]">Memuat Socia Sport v1.2...</span>
      </div>
    );
  }

  // 3. Fallback if not authenticated
  if (!isAuthenticated) {
    if (showAuthForm) {
      return (
        <LoginView 
          onLogin={handleLoginSuccess}
          onDemoLogin={handleDemoLogin}
          onBack={() => setShowLandingPage(true)}
          defaultIsLogin={authDefaultIsLogin}
          initialRole={authDefaultRole}
        />
      );
    }
    return (
      <LandingPageView 
        isAuthenticated={false}
        currentUser={null}
        onEnterApp={() => {
          setAuthDefaultIsLogin(true);
          setAuthDefaultRole('player');
          setShowAuthForm(true);
        }}
        onJoin={(isLogin = false) => {
          setAuthDefaultIsLogin(isLogin);
          setAuthDefaultRole('player');
          setShowAuthForm(true);
        }} 
        onOpenPartner={() => {
          setShowPartnerLanding(true);
        }}
        onOpenPartnerLogin={() => handleOpenPartnerAuth(true)}
        onOpenPartnerSignup={() => handleOpenPartnerAuth(false)}
      />
    );
  }

  // 4. Onboarding for new players or partners (clean slate)
  if (isOnboarding) {
    return (
      <OnboardingView 
        defaultRole={user.role || 'player'}
        onComplete={(nickname, selectedRole) => {
          const finalRole = selectedRole || user.role || 'player';
          setUser(prev => ({ 
            ...prev, 
            name: nickname, 
            role: finalRole, 
            onboardingCompleted: true,
            ...(finalRole === 'partner' ? INITIAL_PARTNER_USER : {})
          }));
          setActiveTab(finalRole === 'partner' ? 'partner' : 'home');
          setIsOnboarding(false);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black transition-colors ${
      isDay ? 'bg-[#F4F6F9] text-slate-900' : 'bg-[#121212] text-white'
    }`}>
      {/* Top Tactical Status Bar with Role Adaptability */}
      <TopNavbar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lobby') setLobbySportFilter(undefined);
        }}
        onOpenLandingPage={() => setShowLandingPage(true)}
        onOpenPartnerLandingPage={() => setShowPartnerLanding(true)}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <RobloxHome
              key="home"
              user={user}
              onNavigateToLobby={(sport) => {
                setLobbySportFilter(sport);
                setActiveTab('lobby');
              }}
              onNavigateToAvatar={() => setActiveTab('avatar')}
              onNavigateToVenues={() => setActiveTab('venues')}
              onNavigateToPartner={() => setActiveTab('partner')}
              onSelectActivity={handleSelectActivityFromHome}
              onClaimQuest={(id, xp) => handleAddXp(xp)}
            />
          )}

          {activeTab === 'venues' && (
            <VenueBookingView
              key="venues"
              user={user}
              bookings={bookings}
              onAddBooking={handleAddBooking}
              onNavigateToLobbyWithVenue={(venue, booking) => {
                setLobbySportFilter(booking.sport);
                setActiveTab('lobby');
              }}
              onNavigateToPartner={() => setActiveTab('partner')}
            />
          )}

          {activeTab === 'partner' && (
            <PartnerFieldRentView
              key="partner"
              user={user}
              venues={venues}
              bookings={bookings}
              onAddNewVenue={handleAddNewVenue}
              onNavigateToBooking={() => setActiveTab('venues')}
              onNavigateToLobby={() => setActiveTab('lobby')}
              onOpenPartnerLandingPage={() => setShowPartnerLanding(true)}
              onSwitchRole={handleSwitchRole}
            />
          )}

          {activeTab === 'lobby' && (
            <PointBlankLobby
              key="lobby"
              user={user}
              initialSportFilter={lobbySportFilter}
              onBackToHome={() => setActiveTab('home')}
              onEarnMatchXp={(xp) => handleAddXp(xp)}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsView
              key="quests"
              user={user}
              onClaimQuest={(id, xp) => handleAddXp(xp)}
            />
          )}

          {activeTab === 'avatar' && (
            <AvatarLocker
              key="avatar"
              user={user}
              onUpdateAvatar={handleUpdateAvatar}
            />
          )}

          {activeTab === 'redeem' && (
            <RedeemView
              key="redeem"
              user={user}
              onRedeem={async (cost) => {
                const newCoins = Math.max(0, user.sociacoins - cost);
                setUser(prev => ({
                  ...prev,
                  sociacoins: newCoins,
                }));
                if (auth.currentUser) {
                  try {
                    const userDocRef = doc(db, 'users', auth.currentUser.uid);
                    await setDoc(userDocRef, { sociacoins: newCoins }, { merge: true });
                  } catch (err) {
                    console.error("Failed to sync sociacoins to Firestore", err);
                  }
                }
              }}
            />
          )}

          {activeTab === 'blueprint' && <DesignSpecViewer key="blueprint" />}
        </AnimatePresence>
      </main>

      {/* Thumb-friendly Bottom Navigation Bar adapting to user role */}
      <BottomNav
        activeTab={activeTab}
        bookingCount={bookings.length}
        userRole={user.role}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lobby') setLobbySportFilter(undefined);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
