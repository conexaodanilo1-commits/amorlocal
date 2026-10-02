export interface CommentItem {
  id: string;
  author: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

export interface ListingAttributes {
  orientation: string;
  height?: string;
  relationshipStatus: string;
  kids: string;
  smoking: string;
  drinking: string;
  profession?: string;
  zodiac?: string;
  interests?: string[];
}

export interface ContactInfo {
  name: string;
  email: string;
  showEmail: boolean;
  phone: string;
  showPhone: boolean;
  whatsapp?: string;
  instagram?: string;
  verified: boolean;
  memberSince: string;
  responseTime: string;
}

export interface DatingListing {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  age: number;
  gender: 'Feminino' | 'Masculino' | 'Não-binário';
  seeking: 'Homens' | 'Mulheres' | 'Todos';
  location: {
    country: string;
    region: string;
    city: string;
    cityArea?: string;
  };
  publishedDate: string;
  modifiedDate: string;
  views: number;
  images: string[];
  description: string;
  attributes: ListingAttributes;
  contact: ContactInfo;
  comments: CommentItem[];
  isFeatured?: boolean;
}

export interface CategoryDef {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  iconName: string;
  iconColor: string;
  count: number;
  description: string;
}

export interface UserSession {
  email: string;
  name: string;
  phone?: string;
  isLoggedIn: boolean;
  savedFavorites: string[];
  myListingIds: string[];
  avatarPhoto?: string;
  city?: string;
  region?: string;
  age?: number;
  bio?: string;
}

export interface MessageItem {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderPhoto?: string;
  recipientListingId: string;
  recipientListingTitle?: string;
  recipientListingPhoto?: string;
  recipientEmail?: string;
  message: string;
  createdAt?: any;
  sentAtDate?: string;
  mediaType?: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  mediaDuration?: number;
  fileName?: string;
  fileSize?: string;
  conversationId?: string;
  isRead?: boolean;
}

export interface FavoriteActivityItem {
  id: string;
  listingId: string;
  listingTitle?: string;
  userEmail: string;
  userName?: string;
  userPhoto?: string;
  updatedAt?: any;
  active: boolean;
}

export type PageView =
  | { type: 'home' }
  | { type: 'search'; category?: string; query?: string; city?: string; minAge?: number; maxAge?: number; withPhotoOnly?: boolean; page?: number }
  | { type: 'detail'; listingId: string; autoOpenContact?: boolean }
  | { type: 'publish'; returnToListingId?: string; editingListing?: DatingListing }
  | { type: 'edit-ad'; listingId: string }
  | { type: 'login'; redirectTargetListingId?: string; registerFirst?: boolean }
  | { type: 'favorites' }
  | { type: 'my-listings' }
  | { type: 'my-account'; activeTab?: 'ads' | 'messages' | 'favorites' | 'received-favorites' }
  | { type: 'chat'; conversationId?: string; recipientListingId?: string }
  | { type: 'terms' }
  | { type: 'privacy' }
  | { type: 'contact' };
