export interface Photo { original?: string; medium?: string; thumbnail?: string; order?: number }

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  profileImage?: string | null;
  photos?: (string | Photo)[];
  birthDate?: string | null;
  age?: number;
  gender?: "male" | "female" | null;
  country?: string | null;
  bio?: string;
  interests?: string[];
  role?: string;
  isOnline?: boolean;
  lastLogin?: string | null;
  lastSeen?: string | null;
  isPremium?: boolean;
  premiumActive?: boolean;
  premiumPlan?: string | null;
  premiumExpiresAt?: string | null;
  isVerified?: boolean;
  verification?: { isVerified?: boolean; status?: string };
  isActive?: boolean;
  distance?: number | null;
  halaId?: string;
  joinDate?: string;
  createdAt?: string;
  zodiacSign?: string | null;
  likedYou?: boolean;
  isLiked?: boolean;
  acceptingRequests?: boolean;
  premiumOnlyRequests?: boolean;
  isHidden?: boolean;
  hiddenLabel?: string;
  stealthMode?: boolean;
  privacySettings?: { invisibleRead?: boolean; showLastSeen?: boolean; [k: string]: unknown };
}

export interface Disappearing {
  enabled?: boolean;
  isExpiredForMe?: boolean;
  destroyed?: boolean;
  duration?: number;
}

export interface Message {
  _id: string;
  tempId?: string;
  conversationId?: string;
  conversation?: string | { _id: string };
  sender: string | User;
  senderUser?: User;
  content: string;
  type: "text" | "image" | "audio" | "video" | "file" | "system" | "game" | "location" | "sticker" | string;
  mediaUrl?: string | null;
  mediaWidth?: number;
  mediaHeight?: number;
  imageSource?: string;
  disappearing?: Disappearing | null;
  replyTo?: { _id: string; content?: string; type?: string; sender?: User | string } | null;
  reactions?: { user?: string; userId?: string; emoji: string }[];
  isRead?: boolean;
  isDelivered?: boolean;
  isDeleted?: boolean;
  isBlurred?: boolean;
  hasFlaggedContent?: boolean;
  isExternalPromoBlocked?: boolean;
  createdAt: string;
  updatedAt?: string;
  /** حالة محلية للرسالة المتفائلة */
  local?: "sending" | "failed";
  localPreview?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  creator?: string;
  lastMessage?: Message | null;
  unreadCount?: number;
  isMuted?: boolean;
  status?: "accepted" | "pending" | "rejected" | "expired" | "cancelled";
  initialMessage?: { content: string; createdAt: string } | null;
  blockState?: "iBlocked" | "blockedMe" | null | { blockedMe?: boolean; iBlocked?: boolean };
  createdAt: string;
  updatedAt?: string;
}

export interface SwipeCard {
  _id: string;
  name: string;
  profileImage?: string;
  photos?: string[];
  birthDate?: string | null;
  bio?: string;
  country?: string | null;
  distance?: number | null;
  isOnline?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  lastLogin?: string | null;
  gender?: string;
  role?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title?: string;
  body?: string;
  message?: string;
  sender?: User | null;
  data?: Record<string, unknown>;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}
