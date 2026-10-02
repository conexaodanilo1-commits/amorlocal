import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  increment,
  serverTimestamp,
  query,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { DatingListing, UserSession, CommentItem, MessageItem, FavoriteActivityItem } from '../types/classifieds';
import { INITIAL_LISTINGS } from '../data/initialListings';

const LISTINGS_COLLECTION = 'listings';
const USERS_COLLECTION = 'users';
const MESSAGES_COLLECTION = 'messages';
const FAVORITES_COLLECTION = 'favorites';

/**
 * Sanitize object to remove undefined values before sending to Firestore.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore);
  }
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        res[key] = sanitizeForFirestore(value);
      }
    }
    return res;
  }
  return data;
}

/**
 * Fetch all listings from Firestore.
 * If Firestore has no listings yet, seeds the database with INITIAL_LISTINGS.
 */
export async function getListingsFromFirestore(): Promise<DatingListing[]> {
  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const snapshot = await getDocs(query(listingsRef, limit(100)));

    if (!snapshot.empty) {
      const items: DatingListing[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as DatingListing);
      });
      items.sort((a, b) => {
        const idA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return idB - idA;
      });
      return items;
    }

    // Seed database if empty
    console.info('[Firestore] Listings collection empty. Seeding initial listings...');
    await Promise.all(
      INITIAL_LISTINGS.map(async (item: DatingListing) => {
        try {
          const cleanItem = sanitizeForFirestore(item);
          await setDoc(doc(db, LISTINGS_COLLECTION, item.id), cleanItem);
        } catch (err) {
          console.warn(`Failed seeding item ${item.id}:`, err);
        }
      })
    );

    return INITIAL_LISTINGS;
  } catch (error) {
    console.warn('[Firestore] Error fetching from Firestore, falling back to initial data:', error);
    return INITIAL_LISTINGS;
  }
}

/**
 * Real-time listener for listings collection.
 */
export function subscribeToListings(callback: (listings: DatingListing[]) => void): () => void {
  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    return onSnapshot(
      listingsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: DatingListing[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as DatingListing);
          });
          items.sort((a, b) => {
            const idA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
            const idB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
            return idB - idA;
          });
          callback(items);
        }
      },
      (error) => {
        console.warn('[Firestore] Subscription listener warning:', error);
      }
    );
  } catch (error) {
    console.warn('[Firestore] Could not set up snapshot listener:', error);
    return () => {};
  }
}

/**
 * Save or publish a new listing to Firestore.
 */
export async function saveListingToFirestore(listing: DatingListing): Promise<boolean> {
  try {
    const cleanData = sanitizeForFirestore(listing);
    const docRef = doc(db, LISTINGS_COLLECTION, listing.id);
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    });
    console.info(`[Firestore] Successfully saved listing ${listing.id} to Firestore.`);
    return true;
  } catch (error) {
    console.error('[Firestore] Failed to save listing to Firestore:', error);
    return false;
  }
}

/**
 * Increment views on an ad in Firestore.
 */
export async function incrementListingViews(listingId: string): Promise<void> {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, listingId);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    console.warn('[Firestore] Failed to increment views:', error);
  }
}

/**
 * Add a comment to an existing listing in Firestore.
 */
export async function addCommentToFirestoreListing(
  listingId: string,
  comment: CommentItem,
  existingComments: CommentItem[]
): Promise<boolean> {
  try {
    const cleanComment = sanitizeForFirestore(comment);
    const cleanExisting = sanitizeForFirestore(existingComments);
    const docRef = doc(db, LISTINGS_COLLECTION, listingId);
    await updateDoc(docRef, {
      comments: [cleanComment, ...cleanExisting]
    });
    console.info(`[Firestore] Successfully recorded comment on listing ${listingId}`);
    return true;
  } catch (error) {
    console.warn('[Firestore] Failed to update comments in Firestore:', error);
    return false;
  }
}

/**
 * Save or update user profile in Firestore.
 */
export async function saveUserProfileToFirestore(
  userId: string,
  userData: Partial<UserSession>
): Promise<boolean> {
  try {
    const sanitizedId = userId.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, USERS_COLLECTION, sanitizedId);
    const cleanData = sanitizeForFirestore(userData);
    await setDoc(
      docRef,
      {
        ...cleanData,
        email: userData.email || userId,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    console.info(`[Firestore] Successfully saved user account ${sanitizedId}`);
    return true;
  } catch (error) {
    console.error('[Firestore] Failed to save user profile to Firestore:', error);
    return false;
  }
}

/**
 * Fetch a user profile from Firestore by email/userId.
 */
export async function getUserProfileFromFirestore(userId: string): Promise<UserSession | null> {
  try {
    const sanitizedId = userId.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, USERS_COLLECTION, sanitizedId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserSession;
    }
    return null;
  } catch (error) {
    console.warn('[Firestore] Error getting user profile:', error);
    return null;
  }
}

/**
 * Save or toggle favorite status in Firestore.
 */
export async function saveFavoriteToFirestore(
  listingId: string,
  isFavorited: boolean,
  userEmail?: string,
  currentFavorites?: string[]
): Promise<boolean> {
  try {
    const identifier = userEmail
      ? userEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'guest_user';
    const favDocId = `${identifier}_${listingId}`;
    const favRef = doc(db, FAVORITES_COLLECTION, favDocId);

    // Save record in favorites collection
    await setDoc(
      favRef,
      {
        listingId,
        userEmail: userEmail || 'visitante',
        active: isFavorited,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // If user is registered/logged in, sync their savedFavorites in users collection
    if (userEmail && currentFavorites) {
      const sanitizedUserId = userEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const userRef = doc(db, USERS_COLLECTION, sanitizedUserId);
      await updateDoc(userRef, {
        savedFavorites: currentFavorites,
        updatedAt: serverTimestamp()
      }).catch(() => {});
    }

    console.info(`[Firestore] Successfully saved favorite status for ${listingId}: ${isFavorited}`);
    return true;
  } catch (error) {
    console.error('[Firestore] Failed to save favorite in Firestore:', error);
    return false;
  }
}

/**
 * Send an interactive chat message (with support for text, audio, image, and video)
 */
export async function sendChatMessage(params: {
  senderEmail: string;
  senderName: string;
  senderPhone?: string;
  senderPhoto?: string;
  recipientEmail?: string;
  recipientListingId?: string;
  recipientListingTitle?: string;
  recipientListingPhoto?: string;
  conversationId?: string;
  message?: string;
  mediaType?: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  mediaDuration?: number;
  fileName?: string;
  fileSize?: string;
}): Promise<string | null> {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    // Protect against Firestore document size limit (1MB max per document)
    let safeMediaUrl = params.mediaUrl;
    if (safeMediaUrl && safeMediaUrl.length > 850000) {
      console.warn('[Firestore] Media exceeds 850KB. Truncating to avoid Firestore document limit rejection.');
      safeMediaUrl = safeMediaUrl.slice(0, 850000);
    }

    const docData: any = {
      senderEmail: params.senderEmail.toLowerCase().trim(),
      senderName: params.senderName || 'Usuário',
      senderPhone: params.senderPhone || '',
      senderPhoto: params.senderPhoto || '',
      recipientEmail: (params.recipientEmail || '').toLowerCase().trim(),
      recipientListingId: params.recipientListingId || '',
      recipientListingTitle: params.recipientListingTitle || '',
      recipientListingPhoto: params.recipientListingPhoto || '',
      conversationId: params.conversationId || '',
      message: params.message || '',
      mediaType: params.mediaType || 'text',
      isRead: false,
      createdAt: serverTimestamp(),
      sentAtDate: new Date().toISOString()
    };
    if (safeMediaUrl) docData.mediaUrl = safeMediaUrl;
    if (params.mediaDuration) docData.mediaDuration = params.mediaDuration;
    if (params.fileName) docData.fileName = params.fileName;
    if (params.fileSize) docData.fileSize = params.fileSize;

    const docRef = await addDoc(messagesRef, docData);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Error sending chat message:', error);
    return null;
  }
}

/**
 * Real-time subscription for ALL messages involving the current user (sent or received).
 */
export function subscribeToAllUserMessages(
  userEmail: string,
  myListingIds: string[],
  callback: (messages: MessageItem[]) => void
): () => void {
  if (!userEmail && (!myListingIds || myListingIds.length === 0)) {
    callback([]);
    return () => {};
  }

  const normUserEmail = (userEmail || '').toLowerCase().trim();
  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(messagesRef, limit(300));

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const list: MessageItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const sEmail = (data.senderEmail || '').toLowerCase().trim();
        const rEmail = (data.recipientEmail || '').toLowerCase().trim();
        const rListingId = data.recipientListingId || '';
        const convId = (data.conversationId || '').toLowerCase().trim();

        const isSender = normUserEmail && sEmail === normUserEmail;
        const isRecipientByEmail = normUserEmail && rEmail === normUserEmail;
        const isRecipientByListing = myListingIds && myListingIds.includes(rListingId);
        const isParticipantByConv = normUserEmail && convId && convId.includes(normUserEmail);

        if (isSender || isRecipientByEmail || isRecipientByListing || isParticipantByConv) {
          list.push({
            id: d.id,
            senderName: data.senderName || 'Anônimo',
            senderEmail: data.senderEmail || '',
            senderPhone: data.senderPhone || '',
            senderPhoto: data.senderPhoto || undefined,
            recipientListingId: data.recipientListingId || '',
            recipientListingTitle: data.recipientListingTitle || '',
            recipientListingPhoto: data.recipientListingPhoto || undefined,
            recipientEmail: data.recipientEmail || '',
            message: data.message || '',
            createdAt: data.createdAt,
            sentAtDate: data.sentAtDate || '',
            mediaType: data.mediaType || 'text',
            mediaUrl: data.mediaUrl || undefined,
            mediaDuration: data.mediaDuration || undefined,
            fileName: data.fileName || undefined,
            fileSize: data.fileSize || undefined,
            conversationId: data.conversationId || undefined,
            isRead: data.isRead ?? false
          });
        }
      });

      // Sort chronological ascending for chat
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.sentAtDate
          ? new Date(a.sentAtDate).getTime()
          : 0;
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.sentAtDate
          ? new Date(b.sentAtDate).getTime()
          : 0;
        return timeA - timeB;
      });

      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to all user messages:', err);
    }
  );

  return unsubscribe;
}

/**
 * Save a message sent through the contact form to Firestore.
 */
export async function saveContactMessageToFirestore(messageData: {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderPhoto?: string;
  recipientListingId: string;
  recipientListingTitle?: string;
  recipientListingPhoto?: string;
  recipientEmail?: string;
  message: string;
}): Promise<boolean> {
  try {
    const cleanData = sanitizeForFirestore(messageData);
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    await addDoc(messagesRef, {
      ...cleanData,
      isRead: false,
      createdAt: serverTimestamp(),
      sentAtDate: new Date().toISOString()
    });
    console.info(`[Firestore] Successfully recorded message for ad ${messageData.recipientListingId}`);
    return true;
  } catch (error) {
    console.error('[Firestore] Failed to save contact message to Firestore:', error);
    return false;
  }
}

/**
 * Mark a batch of messages as read in Firestore
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<boolean> {
  if (!messageIds || messageIds.length === 0) return true;
  try {
    await Promise.all(
      messageIds.map(async (id) => {
        try {
          const docRef = doc(db, MESSAGES_COLLECTION, id);
          await updateDoc(docRef, { isRead: true });
        } catch {
          // ignore individual item failure
        }
      })
    );
    return true;
  } catch (err) {
    console.warn('[Firestore] Error in markMessagesAsRead:', err);
    return false;
  }
}

/**
 * Fetch messages received for the current user's listings.
 */
export async function getUserReceivedMessages(myListingIds: string[]): Promise<MessageItem[]> {
  try {
    if (!myListingIds || myListingIds.length === 0) return [];
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const snap = await getDocs(query(messagesRef, limit(100)));
    const list: MessageItem[] = [];

    snap.forEach((d) => {
      const data = d.data();
      if (myListingIds.includes(data.recipientListingId)) {
        list.push({
          id: d.id,
          senderName: data.senderName || 'Anônimo',
          senderEmail: data.senderEmail || '',
          senderPhone: data.senderPhone || '',
          senderPhoto: data.senderPhoto || undefined,
          recipientListingId: data.recipientListingId,
          recipientListingTitle: data.recipientListingTitle || '',
          recipientListingPhoto: data.recipientListingPhoto || undefined,
          message: data.message || '',
          createdAt: data.createdAt,
          sentAtDate: data.sentAtDate || 'Hoje',
          isRead: data.isRead ?? false
        });
      }
    });

    list.sort((a, b) => (b.id > a.id ? 1 : -1));
    return list;
  } catch (error) {
    console.warn('[Firestore] Error getting received messages:', error);
    return [];
  }
}

/**
 * Real-time subscription for messages received by the user's listings.
 */
export function subscribeToUserReceivedMessages(
  myListingIds: string[],
  callback: (messages: MessageItem[]) => void
): () => void {
  if (!myListingIds || myListingIds.length === 0) {
    callback([]);
    return () => {};
  }

  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(messagesRef, limit(100));

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const list: MessageItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (myListingIds.includes(data.recipientListingId)) {
          list.push({
            id: d.id,
            senderName: data.senderName || 'Anônimo',
            senderEmail: data.senderEmail || '',
            senderPhone: data.senderPhone || '',
            senderPhoto: data.senderPhoto || undefined,
            recipientListingId: data.recipientListingId,
            recipientListingTitle: data.recipientListingTitle || '',
            recipientListingPhoto: data.recipientListingPhoto || undefined,
            message: data.message || '',
            createdAt: data.createdAt,
            sentAtDate: data.sentAtDate || 'Hoje',
            isRead: data.isRead ?? false
          });
        }
      });
      list.sort((a, b) => (b.id > a.id ? 1 : -1));
      callback(list);
    },
    (error) => {
      console.warn('[Firestore] Error subscribing to received messages:', error);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription for visitors/users who favorited the current user's listings.
 */
export function subscribeToWhoFavoritedMyListings(
  myListingIds: string[],
  callback: (favorites: FavoriteActivityItem[]) => void
): () => void {
  if (!myListingIds || myListingIds.length === 0) {
    callback([]);
    return () => {};
  }

  const favsRef = collection(db, FAVORITES_COLLECTION);
  const q = query(favsRef, limit(200));

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const list: FavoriteActivityItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.active !== false && myListingIds.includes(data.listingId)) {
          list.push({
            id: d.id,
            listingId: data.listingId,
            listingTitle: data.listingTitle || '',
            userEmail: data.userEmail || 'Visitante',
            updatedAt: data.updatedAt,
            active: true
          });
        }
      });
      list.sort((a, b) => (b.id > a.id ? 1 : -1));
      callback(list);
    },
    (error) => {
      console.warn('[Firestore] Error subscribing to who favorited listings:', error);
    }
  );

  return unsubscribe;
}

/**
 * Fetch messages sent by the current user.
 */
export async function getUserSentMessages(userEmail: string): Promise<MessageItem[]> {
  try {
    if (!userEmail) return [];
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const snap = await getDocs(query(messagesRef, limit(100)));
    const list: MessageItem[] = [];

    const normEmail = userEmail.toLowerCase().trim();
    snap.forEach((d) => {
      const data = d.data();
      if (data.senderEmail && data.senderEmail.toLowerCase().trim() === normEmail) {
        list.push({
          id: d.id,
          senderName: data.senderName || 'Você',
          senderEmail: data.senderEmail,
          senderPhone: data.senderPhone || '',
          recipientListingId: data.recipientListingId,
          recipientListingTitle: data.recipientListingTitle || '',
          message: data.message || '',
          createdAt: data.createdAt,
          sentAtDate: data.sentAtDate || 'Hoje'
        });
      }
    });

    list.sort((a, b) => (b.id > a.id ? 1 : -1));
    return list;
  } catch (error) {
    console.warn('[Firestore] Error getting sent messages:', error);
    return [];
  }
}

/**
 * Fetch users/visitors who favorited the current user's listings.
 */
export async function getWhoFavoritedMyListings(myListingIds: string[]): Promise<FavoriteActivityItem[]> {
  try {
    if (!myListingIds || myListingIds.length === 0) return [];
    const favsRef = collection(db, FAVORITES_COLLECTION);
    const snap = await getDocs(query(favsRef, limit(200)));
    const list: FavoriteActivityItem[] = [];

    snap.forEach((d) => {
      const data = d.data();
      if (data.active !== false && myListingIds.includes(data.listingId)) {
        list.push({
          id: d.id,
          listingId: data.listingId,
          listingTitle: data.listingTitle || '',
          userEmail: data.userEmail || 'Visitante',
          updatedAt: data.updatedAt,
          active: true
        });
      }
    });

    return list;
  } catch (error) {
    console.warn('[Firestore] Error getting who favorited my listings:', error);
    return [];
  }
}

/**
 * Delete a listing from Firestore.
 */
export async function deleteListingFromFirestore(listingId: string): Promise<boolean> {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, listingId);
    await deleteDoc(docRef);
    console.info(`[Firestore] Successfully deleted listing ${listingId}`);
    return true;
  } catch (error) {
    console.error('[Firestore] Error deleting listing from Firestore:', error);
    return false;
  }
}
