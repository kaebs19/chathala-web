export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  profileImage?: string;
  photos?: string[];
  birthDate?: string;
  age?: number;
  gender?: "male" | "female";
  country?: string;
  city?: string;
  bio?: string;
  interests?: string[];
  role?: "user" | "admin";
  isOnline?: boolean;
  lastSeen?: string;
  isPremium?: boolean;
  premiumPlan?: string;
  premiumExpiresAt?: string;
  isVerified?: boolean;
  location?: { type: "Point"; coordinates: [number, number] };
  createdAt?: string;
  superLikes?: number;
  halaId?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string | User;
  content: string;
  type: "text" | "image" | "audio" | "video" | "file" | "system";
  reactions?: { userId: string; emoji: string }[];
  replyTo?: Message;
  isRead?: boolean;
  isDelivered?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  isTemporary?: boolean;
  isBlurred?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  creator?: string;
  lastMessage?: Message;
  unreadCount?: number;
  isMuted?: boolean;
  status?: "accepted" | "pending" | "rejected" | "expired";
  chatMode?: "public" | "private" | "stealth";
  createdAt: string;
  updatedAt?: string;
}

export interface SwipeCard {
  _id: string;
  name: string;
  age?: number;
  profileImage?: string;
  photos?: string[];
  bio?: string;
  country?: string;
  city?: string;
  distance?: number;
  interests?: string[];
  isOnline?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  gender?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title?: string;
  body?: string;
  sender?: User;
  relatedUser?: User;
  relatedConversation?: string;
  read?: boolean;
  readBy?: { _id: string; readAt: string }[];
  image?: string;
  createdAt: string;
}

export interface Match {
  _id: string;
  user?: User;
  users?: User[];
  conversationId?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  gender: "male" | "female";
}

export interface PrivacySettings {
  profileVisibility?: boolean;
  showLastSeen?: boolean;
  notificationSound?: boolean;
  doNotDisturb?: boolean;
  showDistance?: boolean;
  stealthMode?: boolean;
  invisibleRead?: boolean;
  acceptingRequests?: boolean;
  premiumOnlyRequests?: boolean;
  showAge?: boolean;
  showCountry?: boolean;
}
