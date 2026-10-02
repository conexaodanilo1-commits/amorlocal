/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DatingListing, PageView, UserSession, CommentItem } from './types/classifieds';
import { INITIAL_LISTINGS } from './data/initialListings';
import {
  parseUrlToView,
  buildViewUrl,
  updateDocumentSeo
} from './utils/seo';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { DetailView } from './components/DetailView';
import { PublishAdView } from './components/PublishAdView';
import { LoginView } from './components/LoginView';
import { FavoritesView } from './components/FavoritesView';
import { ContactModal } from './components/ContactModal';
import { StaticPages } from './components/StaticPages';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MyAccountView } from './components/MyAccountView';
import { InteractiveChatView } from './components/InteractiveChatView';
import { RealtimeNotificationToast, AppNotification } from './components/RealtimeNotificationToast';
import { getProfileAvatar } from './data/profileImages';
import { STORAGE_LISTINGS_KEY, STORAGE_FAVORITES_KEY, STORAGE_USER_KEY } from './constants/storage';
import {
  getListingsFromFirestore,
  subscribeToListings,
  saveListingToFirestore,
  addCommentToFirestoreListing
} from './features/listings/services/listingsService';
import {
  saveUserProfileToFirestore,
  getUserProfileFromFirestore
} from './features/auth/services/authService';
import { saveFavoriteToFirestore } from './features/favorites/services/favoritesService';
import {
  subscribeToUserReceivedMessages,
  subscribeToWhoFavoritedMyListings
} from './services/firebaseService';

export default function App() {
  const [listings, setListings] = useState<DatingListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LISTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_LISTINGS;
  });

  const [user, setUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      email: '',
      name: '',
      phone: '',
      isLoggedIn: false,
      savedFavorites: [],
      myListingIds: []
    };
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return ['ad-101'];
  });

  const [currentView, setCurrentView] = useState<PageView>(() => {
    if (typeof window !== 'undefined') {
      try {
        const initial = parseUrlToView(
          window.location.pathname,
          window.location.search,
          INITIAL_LISTINGS
        );
        return initial;
      } catch {
        // fallback
      }
    }
    return { type: 'home' };
  });

  const [contactingListing, setContactingListing] = useState<DatingListing | null>(null);
  const [liveNotifications, setLiveNotifications] = useState<AppNotification[]>([]);
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const [receivedMessagesCount, setReceivedMessagesCount] = useState(0);
  const [whoFavoritedCount, setWhoFavoritedCount] = useState(0);

  const knownMsgIdsRef = useRef<Set<string>>(new Set());
  const knownFavIdsRef = useRef<Set<string>>(new Set());
  const isInitialMsgLoad = useRef(true);
  const isInitialFavLoad = useRef(true);

  useEffect(() => {
    if (!user.isLoggedIn) {
      setLiveNotifications([]);
      setUnreadActivityCount(0);
      setReceivedMessagesCount(0);
      setWhoFavoritedCount(0);
      return;
    }

    const myProfile = listings.find(
      (l) =>
        user.myListingIds.includes(l.id) ||
        (user.email && l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );
    const targetListingIds = myProfile ? [myProfile.id] : user.myListingIds;
    if (!targetListingIds || targetListingIds.length === 0) return;

    isInitialMsgLoad.current = true;
    isInitialFavLoad.current = true;

    const unsubMsg = subscribeToUserReceivedMessages(targetListingIds, (receivedList) => {
      const unreadReceived = receivedList.filter((m) => m.isRead === false);
      setReceivedMessagesCount(unreadReceived.length);
      if (isInitialMsgLoad.current) {
        knownMsgIdsRef.current = new Set(receivedList.map((m) => m.id));
        isInitialMsgLoad.current = false;
        return;
      }

      receivedList.forEach((msg) => {
        if (!knownMsgIdsRef.current.has(msg.id)) {
          knownMsgIdsRef.current.add(msg.id);
          setUnreadActivityCount((c) => c + 1);

          const senderAd = listings.find(
            (l) =>
              (msg.recipientListingId && l.id === msg.recipientListingId) ||
              (msg.senderEmail && l.contact.email && l.contact.email.toLowerCase().trim() === msg.senderEmail.toLowerCase().trim())
          );
          const senderPhoto =
            msg.senderPhoto ||
            senderAd?.images?.[0] ||
            getProfileAvatar(msg.senderEmail || msg.senderName, 'Feminino', 25, msg.senderName);

          setLiveNotifications((prev) => [
            {
              id: 'notif-msg-' + msg.id + '-' + Date.now(),
              type: 'message',
              title: 'Nova Mensagem Recebida',
              senderName: msg.senderName,
              senderPhoto,
              preview: msg.message,
              timestamp: 'Agora mesmo',
              targetTab: 'messages'
            },
            ...prev.slice(0, 3)
          ]);
        }
      });
    });

    const unsubFav = subscribeToWhoFavoritedMyListings(targetListingIds, (favoritedList) => {
      setWhoFavoritedCount(favoritedList.length);
      if (isInitialFavLoad.current) {
        knownFavIdsRef.current = new Set(favoritedList.map((f) => f.id));
        isInitialFavLoad.current = false;
        return;
      }

      favoritedList.forEach((fav) => {
        if (!knownFavIdsRef.current.has(fav.id)) {
          knownFavIdsRef.current.add(fav.id);
          setUnreadActivityCount((c) => c + 1);

          const favUserAd = listings.find(
            (l) =>
              l.contact.email &&
              fav.userEmail &&
              l.contact.email.toLowerCase().trim() === fav.userEmail.toLowerCase().trim()
          );
          const favName =
            fav.userName ||
            favUserAd?.contact.name ||
            (fav.userEmail ? fav.userEmail.split('@')[0] : 'Membro AmorClass');
          const favPhoto =
            fav.userPhoto ||
            favUserAd?.images?.[0] ||
            getProfileAvatar(fav.userEmail, 'Feminino', 26, favName);

          setLiveNotifications((prev) => [
            {
              id: 'notif-fav-' + fav.id + '-' + Date.now(),
              type: 'favorite',
              title: 'Novo Favorito Recebido!',
              senderName: favName,
              senderPhoto: favPhoto,
              preview: 'Curtiu e favoritou seu perfil de namoro.',
              timestamp: 'Agora mesmo',
              targetTab: 'favorites'
            },
            ...prev.slice(0, 3)
          ]);
        }
      });
    });

    return () => {
      unsubMsg();
      unsubFav();
    };
  }, [user.isLoggedIn, user.email, user.myListingIds.join(','), listings.length]);

  const handleDismissNotification = (id: string) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const handlePopState = () => {
      const nextView = parseUrlToView(
        window.location.pathname,
        window.location.search,
        listings
      );
      setCurrentView(nextView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [listings]);

  useEffect(() => {
    const activeListing =
      currentView.type === 'detail'
        ? listings.find((l) => l.id === currentView.listingId)
        : undefined;

    updateDocumentSeo(currentView, activeListing);

    if (typeof window !== 'undefined') {
      const canonicalPath = buildViewUrl(currentView, listings);
      const currentFull = window.location.pathname + window.location.search;
      if (currentFull !== canonicalPath) {
        window.history.replaceState(null, '', canonicalPath);
      }
    }
  }, [currentView, listings]);

  useEffect(() => {
    getListingsFromFirestore().then((items) => {
      if (items && items.length > 0) {
        setListings(items);
      }
    });

    const unsubscribe = subscribeToListings((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setListings(liveItems);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(listings));
      } catch {
        // storage quota or disabled
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [listings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
      } catch {
        // storage quota or disabled
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [favorites]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } catch {
        // storage quota or disabled
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (user.isLoggedIn && user.email) {
      const myAd = listings.find(
        (l) =>
          user.myListingIds.includes(l.id) ||
          (l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
      );
      if (myAd) {
        const needsUpdate =
          !user.avatarPhoto ||
          user.avatarPhoto !== myAd.images[0] ||
          !user.city ||
          user.city !== myAd.location.city ||
          !user.myListingIds.includes(myAd.id);

        if (needsUpdate) {
          setUser((prev) => {
            const updated: UserSession = {
              ...prev,
              name: myAd.contact.name || prev.name,
              avatarPhoto: myAd.images[0],
              city: myAd.location.city,
              region: myAd.location.region,
              age: myAd.age,
              bio: myAd.description,
              myListingIds: [myAd.id]
            };
            if (prev.email) {
              saveUserProfileToFirestore(prev.email, updated);
            }
            return updated;
          });
        }
      }
    }
  }, [listings, user.isLoggedIn, user.email, user.avatarPhoto, user.city, user.myListingIds]);

  const handleNavigate = (view: PageView, pushHistory = true) => {
    setCurrentView(view);
    if (view.type === 'my-account') {
      setUnreadActivityCount(0);
    }
    if (pushHistory && typeof window !== 'undefined') {
      const newUrl = buildViewUrl(view, listings);
      window.history.pushState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleToggleFavorite = async (id: string) => {
    const isAdding = !favorites.includes(id);
    const nextFavorites = isAdding
      ? [...favorites, id]
      : favorites.filter((item) => item !== id);

    setFavorites(nextFavorites);
    await saveFavoriteToFirestore(id, isAdding, user.email || undefined, nextFavorites);
  };

  const handlePublishAd = async (newAd: DatingListing) => {
    setListings((prev) => [newAd, ...prev.filter((i) => i.id !== newAd.id)]);
    await saveListingToFirestore(newAd);
    setUser((prev) => {
      const updated: UserSession = {
        ...prev,
        name: newAd.contact.name || prev.name,
        email: newAd.contact.email || prev.email,
        phone: newAd.contact.phone || prev.phone,
        avatarPhoto: newAd.images[0] || prev.avatarPhoto,
        city: newAd.location.city,
        region: newAd.location.region,
        age: newAd.age,
        bio: newAd.description,
        isLoggedIn: true,
        myListingIds: [newAd.id]
      };
      if (updated.email) {
        saveUserProfileToFirestore(updated.email, updated);
      }
      return updated;
    });
  };

  const handleAddComment = async (listingId: string, comment: CommentItem) => {
    const currentListing = listings.find((item) => item.id === listingId);
    const currentComments = currentListing ? currentListing.comments : [];

    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          return {
            ...item,
            comments: [comment, ...item.comments]
          };
        }
        return item;
      })
    );

    await addCommentToFirestoreListing(listingId, comment, currentComments);
  };

  const handleLogin = async (userData: Partial<UserSession>) => {
    let finalProfile: Partial<UserSession> = { ...userData };
    if (userData.email) {
      try {
        const existing = await getUserProfileFromFirestore(userData.email);
        if (existing) {
          finalProfile = {
            ...existing,
            ...userData,
            savedFavorites: Array.from(
              new Set([...(existing.savedFavorites || []), ...(userData.savedFavorites || [])])
            ),
            myListingIds: Array.from(
              new Set([...(existing.myListingIds || []), ...(userData.myListingIds || [])])
            ),
            isLoggedIn: true
          };
        }

        const normEmail = userData.email.toLowerCase().trim();
        const matchingListing = listings.find(
          (l) => l.contact.email && l.contact.email.toLowerCase().trim() === normEmail
        );
        if (matchingListing) {
          finalProfile.avatarPhoto = finalProfile.avatarPhoto || matchingListing.images[0];
          finalProfile.city = finalProfile.city || matchingListing.location.city;
          finalProfile.region = finalProfile.region || matchingListing.location.region;
          finalProfile.age = finalProfile.age || matchingListing.age;
          finalProfile.bio = finalProfile.bio || matchingListing.description;
          finalProfile.myListingIds = [matchingListing.id];
        }

        await saveUserProfileToFirestore(userData.email, {
          ...finalProfile,
          isLoggedIn: true
        });

        if (finalProfile.savedFavorites && finalProfile.savedFavorites.length > 0) {
          setFavorites(finalProfile.savedFavorites);
        }
      } catch (err) {
        console.warn('Error saving user profile to Firestore:', err);
      }
    }

    setUser((prev) => ({
      ...prev,
      ...finalProfile,
      isLoggedIn: true
    }));
  };

  const handleLogout = () => {
    setUser({
      email: '',
      name: '',
      phone: '',
      isLoggedIn: false,
      savedFavorites: [],
      myListingIds: []
    });
    handleNavigate({ type: 'home' });
  };

  const handleListingDeleted = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    setUser((prev) => ({
      ...prev,
      myListingIds: prev.myListingIds.filter((id) => id !== listingId)
    }));
  };

  const handleUpdateUser = (userData: Partial<UserSession>) => {
    setUser((prev) => ({
      ...prev,
      ...userData
    }));
  };

  const handleAddPhotoToProfile = async (photoBase64OrUrl: string) => {
    const userAdIndex = listings.findIndex(
      (l) =>
        user.myListingIds.includes(l.id) ||
        (user.email && l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );

    let updatedAd: DatingListing | null = null;
    if (userAdIndex >= 0) {
      const currentAd = listings[userAdIndex];
      updatedAd = {
        ...currentAd,
        images: [photoBase64OrUrl, ...(currentAd.images || []).filter((img) => img !== photoBase64OrUrl)]
      };
      setListings((prev) => [updatedAd!, ...prev.filter((i) => i.id !== updatedAd!.id)]);
      await saveListingToFirestore(updatedAd);
    }

    const updatedUser: UserSession = {
      ...user,
      avatarPhoto: photoBase64OrUrl,
      myListingIds: updatedAd ? [updatedAd.id] : user.myListingIds
    };
    setUser(updatedUser);
    if (user.email) {
      await saveUserProfileToFirestore(user.email, updatedUser);
    }
    return updatedAd;
  };

  const currentDetailListing = useMemo(() =>
    currentView.type === 'detail'
      ? listings.find((l) => l.id === currentView.listingId)
      : undefined,
    [currentView, listings]
  );

  const relatedDetailListings = useMemo(() =>
    currentDetailListing
      ? listings.filter(
          (l) =>
            l.id !== currentDetailListing.id &&
            (l.category === currentDetailListing.category ||
              l.location.region === currentDetailListing.location.region)
        )
      : [],
    [currentDetailListing, listings]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800 antialiased selection:bg-[#0098d9] selection:text-white">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        favoritesCount={favorites.length}
        unreadActivityCount={unreadActivityCount}
      />

      <Breadcrumbs
        view={currentView}
        onNavigate={handleNavigate}
        categoryLabel={
          currentView.type === 'search'
            ? currentView.category
            : currentDetailListing?.categoryLabel
        }
        adTitle={
          currentDetailListing
            ? `${currentDetailListing.title} — ${currentDetailListing.location.cityArea ? `${currentDetailListing.location.cityArea}, ` : ''}${currentDetailListing.location.city}, ${currentDetailListing.location.region}`
            : undefined
        }
      />

      <main className="flex-1 pb-20 md:pb-0">
        {currentView.type === 'home' && (
          <HomeView
            listings={listings}
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView.type === 'search' && (
          <SearchResultsView
            listings={listings}
            initialCategory={currentView.category}
            initialQuery={currentView.query}
            initialCity={currentView.city}
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView.type === 'detail' && (
          <>
            {currentDetailListing ? (
              <DetailView
                listing={currentDetailListing}
                relatedListings={relatedDetailListings}
                onNavigate={handleNavigate}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAddComment={handleAddComment}
                onOpenContact={(listing) => setContactingListing(listing)}
                user={user}
                autoOpenContact={Boolean(currentView.autoOpenContact)}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Anúncio não encontrado
                </h2>
                <p className="text-xs text-gray-500 mb-6">
                  Este anúncio de namoro pode ter sido pausado ou removido pelo anunciante.
                </p>
                <button
                  onClick={() => handleNavigate({ type: 'home' })}
                  className="px-6 py-2.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                >
                  Voltar para a página inicial
                </button>
              </div>
            )}
          </>
        )}

        {currentView.type === 'publish' && (() => {
          const userExistingListing = listings.find(
            (l) =>
              user.myListingIds.includes(l.id) ||
              (user.email && l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
          );
          return (
            <PublishAdView
              onPublish={handlePublishAd}
              onNavigate={handleNavigate}
              user={user}
              returnToListingId={currentView.returnToListingId}
              editingListing={currentView.editingListing || userExistingListing}
              targetListing={
                currentView.returnToListingId
                  ? listings.find((l) => l.id === currentView.returnToListingId)
                  : undefined
              }
            />
          );
        })()}

        {currentView.type === 'edit-ad' && (
          <PublishAdView
            onPublish={handlePublishAd}
            onNavigate={handleNavigate}
            user={user}
            editingListing={listings.find((l) => l.id === currentView.listingId)}
          />
        )}

        {currentView.type === 'my-account' && (
          user.isLoggedIn ? (
            <MyAccountView
              user={user}
              listings={listings}
              favorites={favorites}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onToggleFavorite={handleToggleFavorite}
              onUpdateUser={handleUpdateUser}
              onListingDeleted={handleListingDeleted}
              initialTab={currentView.activeTab}
            />
          ) : (
            <LoginView
              onLogin={handleLogin}
              onNavigate={handleNavigate}
              user={user}
            />
          )
        )}

        {currentView.type === 'login' && (
          <LoginView
            onLogin={handleLogin}
            onNavigate={handleNavigate}
            user={user}
            redirectTargetListingId={currentView.redirectTargetListingId}
            registerFirst={currentView.registerFirst}
            targetListing={
              currentView.redirectTargetListingId
                ? listings.find((l) => l.id === currentView.redirectTargetListingId)
                : undefined
            }
          />
        )}

        {currentView.type === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            listings={listings}
            onNavigate={handleNavigate}
            onRemoveFavorite={handleToggleFavorite}
          />
        )}

        {currentView.type === 'chat' && (
          <InteractiveChatView
            user={user}
            listings={listings}
            onNavigate={handleNavigate}
            initialConversationContact={currentView.conversationId}
            initialListingId={currentView.recipientListingId}
          />
        )}

        {(currentView.type === 'terms' ||
          currentView.type === 'privacy' ||
          currentView.type === 'contact') && (
          <StaticPages type={currentView.type} onNavigate={handleNavigate} />
        )}
      </main>

      {contactingListing && (
        <ContactModal
          listing={contactingListing}
          onClose={() => setContactingListing(null)}
          user={user}
          userListing={listings.find(
            (l) =>
              user.myListingIds.includes(l.id) ||
              (user.email && l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
          )}
          onAddPhotoToProfile={handleAddPhotoToProfile}
          onNavigate={handleNavigate}
        />
      )}

      <RealtimeNotificationToast
        notifications={liveNotifications}
        onDismiss={handleDismissNotification}
        onNavigate={handleNavigate}
      />

      <Footer onNavigate={handleNavigate} />

      <MobileBottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        favoritesCount={favorites.length}
        user={user}
        unreadActivityCount={unreadActivityCount}
        receivedMessagesCount={receivedMessagesCount}
        whoFavoritedCount={whoFavoritedCount}
      />
    </div>
  );
}
