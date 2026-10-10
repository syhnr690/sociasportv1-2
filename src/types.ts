export type NavigationTab = 'home' | 'lobby' | 'venues' | 'partner' | 'quests' | 'avatar' | 'blueprint' | 'redeem';

export type SportCategory = 'all' | 'futsal' | 'badminton' | 'basketball' | 'running' | 'padel' | 'minisoccer' | 'tennis';

export interface PartnerVenueRegistration {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  sport: SportCategory;
  city: string;
  district: string;
  fullAddress: string;
  pricePerHour: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  facilities: string[];
  courtCount: number;
  surfaceType: string;
  operatingHours: string;
  imageUrl?: string;
}

export interface PartnerVenueItem extends Venue {
  ownerId?: string;
  ownerName?: string;
  contactPhone?: string;
  monthlyRevenue?: number;
  monthlyBookings?: number;
  payoutStatus?: 'READY' | 'PROCESSING' | 'PAID';
}


export type UserRole = 'player' | 'partner';

export interface PartnerProfileData {
  businessName: string;
  partnerSince: string;
  partnerTier: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
  verifiedPartner: boolean;
  totalRevenue: number;
  readyPayout: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  phone: string;
  city: string;
  managedVenueCount: number;
  activeCourtCount: number;
}

export interface UserAvatar {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  rankTitle: string;
  rankBadge: string;
  clan: string;
  sociacoins: number;
  equippedGear: {
    head: string;
    jersey: string;
    shoes: string;
    accessory: string;
  };
  avatarColor: string;
  accentColor: string;
  onboardingCompleted?: boolean;
  partnerData?: PartnerProfileData;
}

export interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  sport: SportCategory;
  participants: string;
  xpReward: number;
  coinReward: number;
  difficulty: 'Casual' | 'Competitive' | 'Pro';
  variant: 'dark-blue' | 'dark-olive' | 'surface';
  imageUrl: string;
  location: string;
  time: string;
  isLive?: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  sport: string;
}

export interface PlayerSlot {
  slotNumber: number;
  team: 'red' | 'blue' | 'neutral';
  userId?: string;
  username?: string;
  level?: number;
  rankBadge?: string;
  avatarUrl?: string;
  isHost?: boolean;
  isReady: boolean;
  ping: number;
  gearBonus?: string;
}

export interface PBRoom {
  id: string;
  roomNumber: number;
  title: string;
  sport: SportCategory;
  mode: string;
  venue: string;
  locationDetails: string;
  timeSlot: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'WAITING' | 'READY_CHECK' | 'PLAYING' | 'FULL';
  hostName: string;
  isPasswordProtected: boolean;
  entryFee?: string;
  minLevel: number;
  slots: PlayerSlot[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole?: 'HOST' | 'PLAYER' | 'SYSTEM';
  team?: 'red' | 'blue' | 'all';
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface CourtTimeSlot {
  id: string;
  time: string; // e.g. '08:00 - 09:00'
  price: number;
  isBooked: boolean;
  period: 'pagi' | 'siang' | 'malam';
}

export interface VenueCourt {
  id: string;
  name: string; // e.g. 'Court 1 - Interlock FIFA Pro'
  surfaceType: string; // e.g. 'Interlock', 'Vinyl', 'Rumput Sintetis', 'Parket Kayu'
  pricePerHour: number;
  slots: CourtTimeSlot[];
}

export interface VenueAddon {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
}

export interface Venue {
  id: string;
  name: string;
  sport: SportCategory;
  city: string;
  district: string;
  fullAddress: string;
  distance: string;
  rating: number;
  reviewCount: number;
  priceStartFrom: number;
  imageUrl: string;
  gallery: string[];
  facilities: string[];
  operatingHours: string;
  courts: VenueCourt[];
  rules: string[];
  isPartner: boolean;
  badge?: string;
  mapCoordinates?: string;
}

export interface VenueBooking {
  id: string;
  bookingCode: string;
  venueId: string;
  venueName: string;
  courtName: string;
  sport: SportCategory;
  bookingDate: string;
  formattedDate: string;
  selectedSlots: string[]; // ['19:00 - 20:00', '20:00 - 21:00']
  durationHours: number;
  basePrice: number;
  addons: { id: string; name: string; price: number }[];
  sociacoinsUsed: number;
  sociacoinsDiscount: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  qrCodeValue: string;
  linkedPbRoomId?: string;
}

