import React, { useState, useEffect } from 'react';
import { DatingListing, PageView, CommentItem, UserSession } from '../types/classifieds';
import { buildListingUrl } from '../utils/seo';
import {
  saveContactMessageToFirestore,
  incrementListingViews
} from '../services/firebaseService';
import {
  Heart,
  Share2,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  Calendar,
  Eye,
  Star,
  Send,
  Check,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface DetailViewProps {
  listing: DatingListing;
  relatedListings: DatingListing[];
  onNavigate: (view: PageView) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddComment: (listingId: string, comment: CommentItem) => void;
  onOpenContact: (listing: DatingListing) => void;
  user: UserSession;
  autoOpenContact?: boolean;
}

export const DetailView: React.FC<DetailViewProps> = ({
  listing,
  relatedListings,
  onNavigate,
  favorites,
  onToggleFavorite,
  onAddComment,
  onOpenContact,
  user,
  autoOpenContact = false
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [gateModal, setGateModal] = useState<'need_account' | 'need_profile' | null>(null);

  // Auto-open contact modal if returning from profile creation
  useEffect(() => {
    if (autoOpenContact) {
      onOpenContact(listing);
    }
  }, [autoOpenContact]);

  // Record listing view count in Firestore
  useEffect(() => {
    if (listing?.id) {
      incrementListingViews(listing.id);
    }
  }, [listing?.id]);

  // Check if user is allowed to contact: must have account AND published profile
  const checkContactPermission = (): boolean => {
    if (!user.isLoggedIn) {
      setGateModal('need_account');
      return false;
    }
    if (!user.myListingIds || user.myListingIds.length === 0) {
      setGateModal('need_profile');
      return false;
    }
    return true;
  };

  // Comment form state
  const [commentName, setCommentName] = useState(user.name || '');
  const [commentEmail, setCommentEmail] = useState(user.email || '');
  const [commentRating, setCommentRating] = useState(5);
  const [commentTitle, setCommentTitle] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Sync comment fields when user logs in or updates profile
  useEffect(() => {
    if (user.name && !commentName) setCommentName(user.name);
    if (user.email && !commentEmail) setCommentEmail(user.email);
  }, [user]);

  // Quick message state in sidebar
  const [quickMsg, setQuickMsg] = useState('');
  const [quickMsgSuccess, setQuickMsgSuccess] = useState(false);

  const isFav = favorites.includes(listing.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentBody.trim()) return;

    const newComment: CommentItem = {
      id: 'c-' + Date.now(),
      author: commentName.trim(),
      email: commentEmail.trim(),
      rating: commentRating,
      title: commentTitle.trim() || 'Comentário',
      content: commentBody.trim(),
      date: 'Agora mesmo'
    };

    onAddComment(listing.id, newComment);
    setCommentSuccess(true);
    setCommentName('');
    setCommentEmail('');
    setCommentTitle('');
    setCommentBody('');
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  const handleInitiateContact = () => {
    if (!checkContactPermission()) return;
    onOpenContact(listing);
  };

  const handleRevealPhone = () => {
    if (!checkContactPermission()) return;
    setShowPhone(true);
  };

  const handleQuickMsgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkContactPermission()) return;
    if (!quickMsg.trim()) return;

    // Must have at least 1 photo to send message - open modal with quick photo uploader
    if (!user.avatarPhoto) {
      onOpenContact(listing);
      return;
    }

    // Record message directly to Firestore
    await saveContactMessageToFirestore({
      senderName: user.name || 'Usuário Interessado',
      senderEmail: user.email || 'contato@amorclass.com.br',
      senderPhone: user.phone || undefined,
      recipientListingId: listing.id,
      message: quickMsg.trim()
    });

    setQuickMsgSuccess(true);
    setQuickMsg('');
    setTimeout(() => setQuickMsgSuccess(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
      {/* Banner if returning from account/profile creation */}
      {autoOpenContact && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              ✓
            </span>
            <div>
              <p className="font-bold text-emerald-900">
                Seu anúncio foi publicado com sucesso!
              </p>
              <p className="text-emerald-700 text-xs">
                A conversa com {listing.contact.name} foi desbloqueada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenContact(listing)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Abrir Mensagem</span>
          </button>
        </div>
      )}

      {/* Listing Title & Price/Age Header - Matching screenshot 7 */}
      <div className="mb-6">
        {/* Category & City SEO Link */}
        <div className="mb-1.5">
          <a
            href={`/busca?categoria=${listing.category}&cidade=${encodeURIComponent(listing.location.city)}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate({
                type: 'search',
                category: listing.category,
                city: listing.location.city
              });
            }}
            className="text-xs font-semibold text-[#0098d9] hover:underline inline-flex items-center gap-1 cursor-pointer"
            title={`Ver mais anúncios de ${listing.categoryLabel} em ${listing.location.city}`}
          >
            <span>
              {listing.categoryLabel} em {listing.location.cityArea ? `${listing.location.cityArea}, ` : ''}{listing.location.city} ({listing.location.region})
            </span>
            <span>&rarr;</span>
          </a>
        </div>

        <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 font-osclass-serif mb-2 leading-tight">
          {listing.title} — {listing.location.cityArea ? `${listing.location.cityArea}, ` : ''}{listing.location.city}, {listing.location.region}
        </h1>

        <div className="flex items-center gap-3 text-lg font-bold text-gray-900 font-osclass-serif">
          <span>{listing.age} anos</span>
          <span className="text-gray-300 font-normal">·</span>
          <span className="text-sm font-sans font-semibold text-gray-600">
            {listing.attributes.relationshipStatus}
          </span>
        </div>

        {/* Metadata lines: Published date, Modified date, Location */}
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Data de publicação:</span>
            <span>{listing.publishedDate}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Data de modificação:</span>
            <span>{listing.modifiedDate}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Localização:</span>
            <span>
              {listing.location.cityArea ? `${listing.location.cityArea}, ` : ''}
              {listing.location.city}, {listing.location.region}, {listing.location.country}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left Content: Gallery + Description + Attributes + Comments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photo Showcase */}
          <div className="bg-white border border-gray-200 p-2">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative border border-gray-100">
              <img
                src={listing.images[selectedPhotoIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {listing.contact.verified && (
                <div className="absolute top-3 left-3 bg-white/95 text-xs text-gray-800 font-semibold px-2.5 py-1 shadow-sm flex items-center gap-1 border border-gray-200">
                  <ShieldCheck className="w-4 h-4 text-[#0098d9]" />
                  <span>Foto & Perfil Verificados</span>
                </div>
              )}
            </div>

            {/* Thumbnails list if multiple */}
            {listing.images.length > 1 && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-16 h-12 shrink-0 border overflow-hidden cursor-pointer ${
                      selectedPhotoIndex === idx
                        ? 'border-[#0098d9] ring-2 ring-[#0098d9]/30'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Sobre Mim & O Que Procuro
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-4">
              {listing.description}
            </div>

            {/* Detailed Attributes Table */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                Informações Complementares
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Orientação / Interesse:</span>
                  <span className="font-semibold text-gray-800">{listing.attributes.orientation}</span>
                </div>
                {listing.attributes.height && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Altura:</span>
                    <span className="font-semibold text-gray-800">{listing.attributes.height}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Estado Civil:</span>
                  <span className="font-semibold text-gray-800">{listing.attributes.relationshipStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Filhos:</span>
                  <span className="font-semibold text-gray-800">{listing.attributes.kids}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Fumo:</span>
                  <span className="font-semibold text-gray-800">{listing.attributes.smoking}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Bebida:</span>
                  <span className="font-semibold text-gray-800">{listing.attributes.drinking}</span>
                </div>
                {listing.attributes.profession && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Profissão:</span>
                    <span className="font-semibold text-gray-800">{listing.attributes.profession}</span>
                  </div>
                )}
                {listing.attributes.zodiac && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Signo:</span>
                    <span className="font-semibold text-gray-800">{listing.attributes.zodiac}</span>
                  </div>
                )}
              </div>

              {/* Interests Tags */}
              {listing.attributes.interests && listing.attributes.interests.length > 0 && (
                <div className="mt-4 pt-3 flex items-center flex-wrap gap-1.5 text-xs text-gray-600">
                  <span className="font-semibold text-gray-700 mr-1">Interesses:</span>
                  {listing.attributes.interests.map((int, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-0.5 text-gray-700">
                      {int}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & Page Views Bar - Exactly matching screenshot 8 */}
          <div className="bg-white border border-gray-200 p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleInitiateContact}
                className="px-5 py-2 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contactar anunciante</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link copiado!' : 'Compartilhar'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(listing.id)}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:text-rose-600 transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                title="Salvar nos favoritos"
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>{isFav ? 'Salvo' : 'Favoritar'}</span>
              </button>
            </div>

            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{listing.views} visualizações de página</span>
            </div>
          </div>

          {/* Related Listings - As in screenshot 8 */}
          {relatedListings.length > 0 && (
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 font-osclass-serif mb-4 border-b border-gray-100 pb-2">
                Anúncios Relacionados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedListings.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    className="border border-gray-200 hover:border-gray-300 transition-colors group flex flex-col"
                  >
                    <a
                      href={buildListingUrl(rel)}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate({ type: 'detail', listingId: rel.id });
                      }}
                      className="aspect-[4/3] bg-gray-100 overflow-hidden block cursor-pointer"
                    >
                      <img
                        src={rel.images[0]}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="mb-1">
                        <a
                          href={buildListingUrl(rel)}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate({ type: 'detail', listingId: rel.id });
                          }}
                          className="text-xs font-semibold text-[#0098d9] group-hover:underline line-clamp-1 block cursor-pointer"
                        >
                          {rel.title}
                        </a>
                      </h4>
                      <p className="text-xs font-bold text-gray-900 font-osclass-serif">
                        {rel.age} anos · {rel.location.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Ratings Section - As in screenshot 8 & 9 */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 font-osclass-serif mb-4">
              Comentários & Recomendações
            </h3>

            {/* Existing Comments */}
            {listing.comments.length === 0 ? (
              <p className="text-xs text-gray-500 italic mb-6">
                Ainda não há comentários neste anúncio. Seja o primeiro a comentar com respeito!
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                {listing.comments.map((comm) => (
                  <div key={comm.id} className="border-b border-gray-100 pb-4 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{comm.author}:</span>
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= comm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-[11px]">({comm.rating} de 5)</span>
                    </div>
                    {comm.title && (
                      <p className="font-semibold text-gray-700 text-xs mb-1">{comm.title}</p>
                    )}
                    <p className="text-gray-600 leading-relaxed">{comm.content}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{comm.date}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Leave a Comment Form - As in screenshot 9 */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Deixe seu comentário
              </h4>
              <p className="text-[11px] text-gray-500 mb-4">
                (mensagens ofensivas ou spam serão imediatamente removidas)
              </p>

              {commentSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Seu comentário foi publicado com sucesso!</span>
                </div>
              ) : (
                <form onSubmit={handleCommentSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Seu endereço de e-mail (não será exibido publicamente)
                    </label>
                    <input
                      type="email"
                      required
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Avaliação
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="cursor-pointer text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= commentRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={commentTitle}
                      onChange={(e) => setCommentTitle(e.target.value)}
                      placeholder="ex: Perfil muito simpático"
                      className="w-full px-2.5 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Comentário
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Escreva sua mensagem com respeito..."
                      className="w-full px-2.5 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Seller's / Advertiser's Information - Matching screenshots 7 & 8 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Informações do Anunciante
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <img
                  src={listing.images[0]}
                  alt={listing.contact.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">
                  {listing.contact.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {listing.location.city}, {listing.location.region}
                </p>
                {listing.contact.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Identidade Verificada
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <p className="flex justify-between">
                <span className="text-gray-400">Membro desde:</span>
                <span className="font-medium text-gray-800">{listing.contact.memberSince}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Tempo de resposta:</span>
                <span className="font-medium text-gray-800">{listing.contact.responseTime}</span>
              </p>
            </div>

            {/* Contact Details (Phone & Email toggles) */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
              {listing.contact.showPhone && listing.contact.phone && (
                <div>
                  {showPhone ? (
                    <div className="p-2.5 bg-gray-50 border border-gray-200 flex items-center justify-between text-xs font-mono font-bold text-gray-800">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#0098d9]" />
                        {listing.contact.phone}
                      </span>
                      {listing.contact.whatsapp && (
                        <a
                          href={`https://wa.me/${listing.contact.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRevealPhone}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#0098d9]" />
                      <span>Ver número de telefone</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleInitiateContact}
                className="w-full py-2.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar mensagem privada</span>
              </button>
            </div>

            {/* Quick in-page message box */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <span className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Mensagem Rápida
              </span>
              {quickMsgSuccess ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mensagem enviada com sucesso!</span>
                </div>
              ) : (
                <form onSubmit={handleQuickMsgSubmit} className="space-y-2">
                  <textarea
                    rows={3}
                    required
                    value={quickMsg}
                    onChange={(e) => setQuickMsg(e.target.value)}
                    placeholder={`Olá ${listing.contact.name.split(' ')[0]}, vi seu anúncio no AmorClass e gostaria de conversar...`}
                    className="w-full p-2 border border-gray-300 text-xs focus:outline-none focus:border-[#0098d9]"
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Enviar</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Safety Tips Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 text-xs text-amber-900">
            <h4 className="font-bold mb-1.5 flex items-center gap-1 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Dicas de Segurança no Namoro</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 leading-relaxed">
              <li>Marque os primeiros encontros sempre em locais públicos.</li>
              <li>Avise um amigo ou familiar sobre o local e horário.</li>
              <li>Nunca envie dinheiro ou dados bancários a estranhos.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Onboarding Gate Modal - Rule: Create account -> Create ad -> Return to profile */}
      {gateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white border-t sm:border border-gray-300 shadow-2xl max-w-md w-full rounded-t-2xl sm:rounded-none overflow-hidden max-h-[92vh] overflow-y-auto text-xs sm:text-sm animate-in slide-in-from-bottom sm:fade-in duration-200">
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden"></div>

            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0098d9]" />
                <h3 className="font-bold text-gray-900 font-osclass-serif">
                  {gateModal === 'need_account'
                    ? `Falar com ${listing.contact.name}`
                    : 'Crie seu perfil para conversar'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGateModal(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {gateModal === 'need_account' ? (
                <>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    Para falar com <strong>{listing.contact.name}</strong>, primeiro você deve criar uma conta gratuita. Em seguida, você criará seu anúncio de namoro e logo depois retornará aqui para conversar!
                  </p>

                  {/* 3 Steps Visualization */}
                  <div className="bg-gray-50 border border-gray-200 p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 font-semibold text-gray-900">
                      <span className="w-5 h-5 rounded-full bg-[#0098d9] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        1
                      </span>
                      <span>Criar sua conta gratuita (Passo atual)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        2
                      </span>
                      <span>Publicar seu anúncio / perfil de namoro</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        3
                      </span>
                      <span>Conversar diretamente com {listing.contact.name}</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGateModal(null);
                        onNavigate({
                          type: 'login',
                          redirectTargetListingId: listing.id,
                          registerFirst: true
                        });
                      }}
                      className="w-full py-2.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Criar Conta Gratuita &rarr;
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGateModal(null);
                        onNavigate({
                          type: 'login',
                          redirectTargetListingId: listing.id,
                          registerFirst: false
                        });
                      }}
                      className="w-full text-center text-xs text-gray-500 hover:text-[#0098d9] hover:underline cursor-pointer py-1"
                    >
                      Já possui uma conta? Fazer login
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    Você já está conectado! Para que <strong>{listing.contact.name}</strong> possa te conhecer e responder com segurança, crie seu anúncio de namoro. Logo após publicar, você voltará para cá com a conversa liberada.
                  </p>

                  {/* 3 Steps Visualization */}
                  <div className="bg-gray-50 border border-gray-200 p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        ✓
                      </span>
                      <span>Conta criada e conectada</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-semibold text-gray-900">
                      <span className="w-5 h-5 rounded-full bg-[#0098d9] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        2
                      </span>
                      <span>Criar seu anúncio / perfil (Passo atual)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        3
                      </span>
                      <span>Conversar diretamente com {listing.contact.name}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGateModal(null);
                        onNavigate({
                          type: 'publish',
                          returnToListingId: listing.id
                        });
                      }}
                      className="w-full py-2.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Criar Meu Anúncio Agora &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar (visible only on mobile, bottom-14 above mobile nav) */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3.5 py-2.5 flex items-center justify-between gap-2.5 shadow-[0_-3px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={listing.images[0]}
            alt={listing.contact.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">
              {listing.contact.name}
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              {listing.age} anos · {listing.location.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(listing.id)}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded cursor-pointer"
            title="Favoritar"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleInitiateContact}
            className="px-3.5 py-2 bg-[#0098d9] hover:bg-[#0077aa] active:scale-95 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Falar com Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
