import React, { useState, useEffect } from 'react';
import {
  DatingListing,
  PageView,
  UserSession,
  MessageItem,
  FavoriteActivityItem
} from '../types/classifieds';
import {
  getUserReceivedMessages,
  getUserSentMessages,
  getWhoFavoritedMyListings,
  subscribeToUserReceivedMessages,
  subscribeToWhoFavoritedMyListings,
  deleteListingFromFirestore,
  saveUserProfileToFirestore
} from '../services/firebaseService';
import {
  User,
  Mail,
  Heart,
  FileText,
  LogOut,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  Inbox,
  Send,
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
  Phone,
  Sparkles,
  ShieldCheck,
  MapPin,
  Camera
} from 'lucide-react';

interface MyAccountViewProps {
  user: UserSession;
  listings: DatingListing[];
  favorites: string[];
  onNavigate: (view: PageView) => void;
  onLogout: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateUser: (userData: Partial<UserSession>) => void;
  onListingDeleted: (listingId: string) => void;
  initialTab?: 'ads' | 'messages' | 'favorites' | 'received-favorites' | 'profile';
}

export const MyAccountView: React.FC<MyAccountViewProps> = ({
  user,
  listings,
  favorites,
  onNavigate,
  onLogout,
  onToggleFavorite,
  onUpdateUser,
  onListingDeleted,
  initialTab = 'ads'
}) => {
  const [activeTab, setActiveTab] = useState<'ads' | 'messages' | 'favorites' | 'profile'>(
    initialTab === 'received-favorites' ? 'favorites' : initialTab
  );

  // Messages sub-tab
  const [messagesTab, setMessagesTab] = useState<'received' | 'sent'>('received');
  const [receivedMessages, setReceivedMessages] = useState<MessageItem[]>([]);
  const [sentMessages, setSentMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Favorites sub-tab
  const [favoritesTab, setFavoritesTab] = useState<'my-favs' | 'received-favs'>(
    initialTab === 'received-favorites' ? 'received-favs' : 'my-favs'
  );
  const [whoFavorited, setWhoFavorited] = useState<FavoriteActivityItem[]>([]);
  const [loadingWhoFavorited, setLoadingWhoFavorited] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Ad delete confirmation modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Unified single profile rule: user's single dating profile
  const myListings = listings.filter((l) => {
    const isOwnerId = user.myListingIds && user.myListingIds.includes(l.id);
    const isOwnerEmail =
      user.email &&
      l.contact.email &&
      l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim();
    return isOwnerId || isOwnerEmail;
  });

  const myProfileAd = myListings[0];
  const userPhoto = myProfileAd?.images?.[0] || user.avatarPhoto;
  const myListingIds = myProfileAd ? [myProfileAd.id] : [];
  const unreadMessagesCount = receivedMessages.filter((m) => m.isRead === false).length;

  // Real-time listener for messages from Firestore
  useEffect(() => {
    setLoadingMessages(true);

    // Initial sent messages fetch
    if (user.email) {
      getUserSentMessages(user.email).then((sent) => {
        setSentMessages(sent);
      });
    }

    // Subscribe in real-time to received messages
    const unsubscribeMessages = subscribeToUserReceivedMessages(
      myListingIds,
      (received) => {
        setReceivedMessages(received);
        setLoadingMessages(false);
      }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [user.email, myListingIds.join(',')]);

  // Real-time listener for who favorited user's listings
  useEffect(() => {
    if (myListingIds.length === 0) {
      setWhoFavorited([]);
      return;
    }

    setLoadingWhoFavorited(true);
    const unsubscribeFavorites = subscribeToWhoFavoritedMyListings(
      myListingIds,
      (items) => {
        setWhoFavorited(items);
        setLoadingWhoFavorited(false);
      }
    );

    return () => {
      unsubscribeFavorites();
    };
  }, [myListingIds.join(',')]);

  // Handle save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.email) return;
    setProfileSaving(true);

    const updated = {
      name: profileName.trim() || user.name,
      phone: profilePhone.trim() || user.phone
    };

    await saveUserProfileToFirestore(user.email, updated);
    onUpdateUser(updated);

    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Handle listing deletion
  const handleConfirmDelete = async (listingId: string) => {
    await deleteListingFromFirestore(listingId);
    onListingDeleted(listingId);
    setDeletingId(null);
  };

  // Favorited listings
  const favoritedListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {/* Account Header Card - Unified with Profile Photo & Address */}
      <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* User Profile Photo from Ad/Profile (no generic letter icon) */}
            <div className="relative shrink-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={user.name || 'Foto do Perfil'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#0098d9] shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#0098d9] to-sky-400 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-xs">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {myProfileAd && (
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'publish', editingListing: myProfileAd })}
                  className="absolute bottom-0 right-0 p-1.5 bg-[#0098d9] text-white rounded-full shadow-md hover:bg-[#0077aa] transition-transform hover:scale-105"
                  title="Alterar Foto do Perfil"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-osclass-serif">
                  {user.name || myProfileAd?.contact.name || 'Meu Perfil'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Perfil Verificado
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>

              {/* Integrated Address and Demographic Information */}
              {myProfileAd ? (
                <p className="text-xs text-gray-700 mt-1.5 font-medium flex items-center gap-1.5 flex-wrap">
                  <MapPin className="w-3.5 h-3.5 text-[#0098d9] shrink-0" />
                  <span>
                    {myProfileAd.location.cityArea ? `${myProfileAd.location.cityArea}, ` : ''}
                    {myProfileAd.location.city}, {myProfileAd.location.region}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>{myProfileAd.age} anos</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#0098d9] font-bold">{myProfileAd.categoryLabel}</span>
                </p>
              ) : (
                user.phone && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {user.phone}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            {myProfileAd ? (
              <button
                type="button"
                onClick={() => onNavigate({ type: 'publish', editingListing: myProfileAd })}
                className="px-3.5 py-2 bg-[#0098d9] hover:bg-[#0077aa] text-white text-xs sm:text-sm font-bold rounded flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Editar informações do seu perfil de namoro"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Meu Perfil</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate({ type: 'publish' })}
                className="px-3.5 py-2 bg-[#0098d9] hover:bg-[#0077aa] text-white text-xs sm:text-sm font-bold rounded flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Criar seu perfil único de namoro"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Meu Perfil</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-300 hover:border-red-300 text-xs sm:text-sm font-medium rounded flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="bg-sky-50/60 border border-sky-100 p-3 rounded text-center sm:text-left">
            <span className="text-[11px] text-sky-700 font-medium block">Status do Meu Perfil</span>
            <span className="text-sm sm:text-base font-bold text-sky-900 flex items-center gap-1 mt-0.5">
              {myProfileAd ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Publicado & Ativo
                </>
              ) : (
                'Pendente'
              )}
            </span>
          </div>
          <div
            onClick={() => onNavigate({ type: 'chat' })}
            className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 p-3 rounded text-center sm:text-left cursor-pointer transition-all hover:shadow-xs group"
            title="Ir para a página exclusiva de mensagens"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-800 font-semibold block">Mensagens</span>
              <span className="text-[10px] text-[#0098d9] font-bold bg-white px-1.5 py-0.2 rounded border border-emerald-100">
                Abrir Chat →
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-900">{unreadMessagesCount}</span>
              <span className="text-[11px] text-emerald-700">não lidas ({receivedMessages.length} total)</span>
            </div>
          </div>
          <div className="bg-rose-50/60 border border-rose-100 p-3 rounded text-center sm:text-left">
            <span className="text-[11px] text-rose-700 font-medium block">Quem Me Favoritou</span>
            <span className="text-xl font-bold text-rose-900">{whoFavorited.length}</span>
          </div>
          <div className="bg-amber-50/60 border border-amber-100 p-3 rounded text-center sm:text-left">
            <span className="text-[11px] text-amber-700 font-medium block">Meus Favoritos</span>
            <span className="text-xl font-bold text-amber-900">{favorites.length}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-300 mb-6 bg-white overflow-x-auto shadow-2xs items-center">
        <button
          type="button"
          onClick={() => setActiveTab('ads')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'ads'
              ? 'border-[#0098d9] text-[#0098d9] bg-sky-50/30'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Meu Perfil de Namoro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'favorites'
              ? 'border-[#0098d9] text-[#0098d9] bg-sky-50/30'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Favoritos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'profile'
              ? 'border-[#0098d9] text-[#0098d9] bg-sky-50/30'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Dados de Acesso</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate({ type: 'chat' })}
          className="ml-auto mr-2 px-3 py-1.5 text-xs font-bold text-[#0098d9] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          title="Acessar página dedicada de mensagens"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Página de Mensagens {unreadMessagesCount > 0 ? `(${unreadMessagesCount} novas)` : ''}</span>
        </button>
      </div>

      {/* TAB 1: MEU PERFIL DE NAMORO (Unified 1 user = 1 profile) */}
      {activeTab === 'ads' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                Meu Perfil de Namoro Oficial
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                No AmorClass, cada usuário possui um perfil único que é exibido nos classificados de namoro.
              </p>
            </div>
            {myProfileAd && (
              <button
                type="button"
                onClick={() => onNavigate({ type: 'publish', editingListing: myProfileAd })}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0098d9] border border-sky-200 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Informações do Perfil</span>
              </button>
            )}
          </div>

          {!myProfileAd ? (
            <div className="bg-white border border-gray-200 p-8 sm:p-12 text-center rounded-sm">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Você ainda não publicou seu perfil de namoro
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-5">
                Complete a criação do seu perfil com suas fotos, idade e localização para que outras pessoas possam te encontrar e mandar mensagens.
              </p>
              <button
                type="button"
                onClick={() => onNavigate({ type: 'publish' })}
                className="px-5 py-2.5 bg-[#0098d9] hover:bg-[#0077aa] text-white text-sm font-bold rounded shadow-xs cursor-pointer transition-colors"
              >
                + Criar Meu Perfil Agora
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-sm shadow-2xs">
              <div className="flex flex-col md:flex-row items-start gap-5">
                <img
                  src={myProfileAd.images[0]}
                  alt={myProfileAd.title}
                  className="w-full md:w-48 h-48 sm:h-52 object-cover rounded-sm border border-gray-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0098d9] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">
                      {myProfileAd.categoryLabel}
                    </span>
                    <span className="text-xs text-gray-400">ID: {myProfileAd.id}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Ativo no Site
                    </span>
                  </div>

                  <h3
                    onClick={() => onNavigate({ type: 'detail', listingId: myProfileAd.id })}
                    className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#0098d9] cursor-pointer"
                  >
                    {myProfileAd.title}
                  </h3>

                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <strong>
                      {myProfileAd.location.cityArea ? `${myProfileAd.location.cityArea}, ` : ''}
                      {myProfileAd.location.city}, {myProfileAd.location.region}
                    </strong>
                    <span>•</span>
                    <span>{myProfileAd.age} anos</span>
                    <span>•</span>
                    <span>{myProfileAd.gender} procurando {myProfileAd.seeking}</span>
                  </p>

                  <p className="text-xs text-gray-600 mt-3 line-clamp-3 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                    {myProfileAd.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                    <span>👁️ {myProfileAd.views || 0} visualizações</span>
                    <span>💬 {myProfileAd.comments?.length || 0} comentários</span>
                    <span>❤️ {whoFavorited.length} curtidas recebidas</span>
                  </div>

                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => onNavigate({ type: 'detail', listingId: myProfileAd.id })}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Como Está no Site</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate({ type: 'publish', editingListing: myProfileAd })}
                      className="px-3.5 py-2 bg-[#0098d9] hover:bg-[#0077aa] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Perfil & Fotos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(myProfileAd.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
                      title="Excluir perfil de namoro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAVORITOS */}
      {activeTab === 'favorites' && (
        <div>
          {/* Sub-tabs for favorites */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setFavoritesTab('my-favs')}
              className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                favoritesTab === 'my-favs'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Quem Eu Favoritei ({favoritedListings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFavoritesTab('received-favs')}
              className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                favoritesTab === 'received-favs'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Quem Me Favoritou ({whoFavorited.length})</span>
            </button>
          </div>

          {favoritesTab === 'my-favs' ? (
            favoritedListings.length === 0 ? (
              <div className="bg-white border border-gray-200 p-8 text-center rounded-sm">
                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-700">Nenhum perfil favoritado</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Clique no coração dos perfis que você gostar para guardá-los nesta lista.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritedListings.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-white border border-gray-200 rounded-sm p-3 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-16 h-16 object-cover rounded-xs border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4
                          onClick={() => onNavigate({ type: 'detail', listingId: ad.id })}
                          className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#0098d9] cursor-pointer truncate"
                        >
                          {ad.title}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {ad.location.city}, {ad.location.region} • {ad.age} anos
                        </p>
                        <span className="text-[10px] text-[#0098d9] font-medium">
                          {ad.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs">
                      <button
                        type="button"
                        onClick={() => onNavigate({ type: 'detail', listingId: ad.id })}
                        className="text-[#0098d9] hover:underline font-bold"
                      >
                        Ver Perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(ad.id)}
                        className="text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : loadingWhoFavorited ? (
            <div className="p-8 text-center bg-white border border-gray-200 text-xs text-gray-500">
              Carregando dados de curtidas no banco de dados...
            </div>
          ) : whoFavorited.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center rounded-sm">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-700">Ninguém favoritou seu perfil ainda</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Assim que outros membros favoritarem seu perfil no AmorClass, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm divide-y divide-gray-100 shadow-2xs">
              {whoFavorited.map((item, idx) => (
                <div key={item.id || idx} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {item.userEmail || 'Membro do site'} favoritou seu perfil
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Perfil: <strong>{myProfileAd ? myProfileAd.title : item.listingId}</strong>
                      </p>
                    </div>
                  </div>
                  {myProfileAd && (
                    <button
                      type="button"
                      onClick={() => onNavigate({ type: 'detail', listingId: myProfileAd.id })}
                      className="text-xs text-[#0098d9] hover:underline font-bold shrink-0"
                    >
                      Ver Anúncio
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DADOS DE ACESSO */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white border border-gray-200 p-5 sm:p-6 rounded-sm shadow-2xs">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            Informações da Conta
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Dados de identificação e acesso vinculados ao seu perfil de namoro no Firestore.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                E-mail Cadastrado
              </label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-xs text-gray-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                O e-mail é o identificador único da sua conta no banco de dados.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Como deseja ser chamado(a)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-hidden focus:border-[#0098d9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="(DDD) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:outline-hidden focus:border-[#0098d9]"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 bg-[#0098d9] hover:bg-[#0077aa] text-white text-xs sm:text-sm font-bold rounded shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {profileSaving ? 'Salvando no banco...' : 'Salvar Alterações'}
              </button>

              {profileSaved && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Dados atualizados com sucesso!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-5 rounded shadow-2xl border border-gray-300 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-2">Excluir Perfil de Namoro?</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Tem certeza que deseja excluir seu perfil de namoro do AmorClass e do banco de dados?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deletingId)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
