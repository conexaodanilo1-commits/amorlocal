import React, { useState, useEffect, useRef } from 'react';
import { DatingListing, UserSession, PageView } from '../types/classifieds';
import {
  X,
  Send,
  Check,
  ShieldCheck,
  Mail,
  Edit2,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Upload,
  UserCheck,
  User
} from 'lucide-react';
import { saveContactMessageToFirestore } from '../services/firebaseService';

interface ContactModalProps {
  listing: DatingListing;
  onClose: () => void;
  user: UserSession;
  userListing?: DatingListing;
  onAddPhotoToProfile?: (photoUrl: string) => Promise<any>;
  onNavigate?: (view: PageView) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  listing,
  onClose,
  user,
  userListing,
  onAddPhotoToProfile,
  onNavigate
}) => {
  const [senderName, setSenderName] = useState(user?.name || userListing?.contact.name || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || userListing?.contact.email || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || userListing?.contact.phone || '');
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [message, setMessage] = useState(
    `Olá ${listing.contact.name.split(' ')[0]}, vi seu perfil no AmorClass e gostaria de te conhecer!`
  );
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo upload requirement state
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string>('');
  const [manualPhotoUrl, setManualPhotoUrl] = useState('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoSavedSuccess, setPhotoSavedSuccess] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync sender info when user session updates
  useEffect(() => {
    if (user?.name && !senderName) setSenderName(user.name);
    if (user?.email && !senderEmail) setSenderEmail(user.email);
    if (user?.phone && !senderPhone) setSenderPhone(user.phone);
  }, [user]);

  // Check user status against the rules:
  // 1. Must be logged in
  const isLoggedIn = Boolean(user && user.isLoggedIn);

  // 2. Must have a created listing/profile
  const hasProfile = Boolean(
    userListing ||
      (user && user.myListingIds && user.myListingIds.length > 0)
  );

  // 3. Must have at least 1 photo in profile
  const existingPhoto =
    user?.avatarPhoto ||
    (userListing?.images && userListing.images.length > 0 ? userListing.images[0] : '');

  const hasPhoto = Boolean(existingPhoto || photoSavedSuccess);

  // Helper: compress image file from phone / PC
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Por favor, selecione um arquivo de imagem válido (JPG ou PNG).');
      return;
    }

    try {
      setPhotoError('');
      const compressed = await compressImage(file);
      setSelectedPhotoPreview(compressed);
    } catch {
      setPhotoError('Erro ao carregar a imagem. Tente outra foto.');
    }
  };

  // Save photo to user's profile and unlock messaging right in this modal
  const handleSavePhotoToProfile = async () => {
    const photoToSave = selectedPhotoPreview || manualPhotoUrl.trim();
    if (!photoToSave) {
      setPhotoError('Selecione uma foto do seu dispositivo ou insira o link de uma imagem.');
      return;
    }

    setIsSavingPhoto(true);
    setPhotoError('');

    try {
      if (onAddPhotoToProfile) {
        await onAddPhotoToProfile(photoToSave);
      }
      setPhotoSavedSuccess(true);
      setIsSavingPhoto(false);
      setSelectedPhotoPreview('');
      setManualPhotoUrl('');
    } catch (err) {
      console.error('Error adding photo to profile:', err);
      setIsSavingPhoto(false);
      setPhotoError('Não foi possível salvar a foto no momento. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      if (onNavigate) {
        onClose();
        onNavigate({ type: 'login', redirectTargetListingId: listing.id });
      }
      return;
    }

    if (!hasProfile) {
      if (onNavigate) {
        onClose();
        onNavigate({ type: 'publish', returnToListingId: listing.id });
      }
      return;
    }

    if (!hasPhoto) {
      setPhotoError('Adicione uma foto ao seu perfil abaixo para que seu envio seja liberado.');
      return;
    }

    const effectiveName = senderName.trim() || user?.name || 'Usuário';
    const effectiveEmail = senderEmail.trim() || user?.email || 'usuario@amorclass.com.br';
    if (!effectiveName || !effectiveEmail || !message.trim()) return;

    setIsSubmitting(true);

    try {
      // Save message to Firebase Firestore
      await saveContactMessageToFirestore({
        senderName: effectiveName,
        senderEmail: effectiveEmail,
        senderPhone: senderPhone.trim() || undefined,
        senderPhoto: existingPhoto || user?.avatarPhoto || undefined,
        recipientListingId: listing.id,
        recipientListingTitle: listing.title,
        recipientListingPhoto: listing.images?.[0] || undefined,
        recipientEmail: listing.contact?.email || undefined,
        message: message.trim()
      });

      setSent(true);
      setIsSubmitting(false);
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white border-t sm:border border-gray-300 shadow-2xl max-w-lg w-full rounded-t-2xl sm:rounded-none max-h-[92vh] flex flex-col overflow-hidden text-xs sm:text-sm animate-in slide-in-from-bottom sm:fade-in duration-200">
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden"></div>

        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-4 h-4 text-[#0098d9] shrink-0" />
            <h3 className="font-bold text-gray-900 font-osclass-serif truncate">
              Contactar anunciante: {listing.contact.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 cursor-pointer rounded shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {sent ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">
                Mensagem enviada com sucesso!
              </h4>
              <p className="text-xs text-gray-500">
                O anunciante foi notificado e responderá em breve pelo AmorClass, e-mail ou WhatsApp.
              </p>
            </div>
          ) : !isLoggedIn ? (
            /* CASE 1: Not logged in */
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0098d9] flex items-center justify-center mx-auto border border-sky-100">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 font-osclass-serif">
                  Acesse sua conta para conversar
                </h4>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Para conversar com <strong>{listing.contact.name}</strong> com segurança e respeito mútuo, entre ou crie sua conta gratuita no AmorClass.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) {
                      onNavigate({
                        type: 'login',
                        redirectTargetListingId: listing.id,
                        registerFirst: true
                      });
                    }
                  }}
                  className="w-full py-2.5 bg-[#0098d9] hover:bg-[#0077aa] text-white font-bold text-xs rounded transition-colors shadow-xs cursor-pointer"
                >
                  Criar Conta Gratuita &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) {
                      onNavigate({
                        type: 'login',
                        redirectTargetListingId: listing.id,
                        registerFirst: false
                      });
                    }
                  }}
                  className="w-full py-2 text-gray-600 hover:text-[#0098d9] text-xs font-semibold cursor-pointer"
                >
                  Já tenho conta: Fazer Login
                </button>
              </div>
            </div>
          ) : !hasProfile ? (
            /* CASE 2: Logged in, but NO dating profile created yet */
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 font-osclass-serif">
                  Crie seu perfil de namoro para conversar
                </h4>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Você já está logado! No AmorClass, cada membro possui um perfil com foto para que <strong>{listing.contact.name}</strong> possa te conhecer e responder.
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-3 text-left rounded text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
                  <span>Conta criada ({user.email})</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-[#0098d9]">
                  <span className="w-4 h-4 rounded-full bg-[#0098d9] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Criar seu perfil com foto (Passo necessário)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) {
                    onNavigate({
                      type: 'publish',
                      returnToListingId: listing.id
                    });
                  }
                }}
                className="w-full py-2.5 bg-[#0098d9] hover:bg-[#0077aa] text-white font-bold text-xs rounded transition-colors shadow-xs cursor-pointer"
              >
                Criar Meu Perfil Agora &rarr;
              </button>
            </div>
          ) : (
            /* CASE 3: Logged in and has profile */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Verified Sender Bar */}
              <div className="bg-sky-50 border border-sky-200 p-3 flex items-center justify-between text-xs rounded-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {existingPhoto ? (
                    <img
                      src={existingPhoto}
                      alt={senderName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#0098d9] shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0098d9] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {senderName.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 font-bold text-gray-900 truncate">
                      <span>Enviando como <strong>{senderName}</strong></span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-gray-500 text-[11px] truncate">
                      {senderEmail} {senderPhone ? `· ${senderPhone}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditDetails(!showEditDetails)}
                  className="text-[11px] text-[#0098d9] hover:underline font-semibold shrink-0 cursor-pointer ml-2 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{showEditDetails ? 'Ocultar' : 'Alterar'}</span>
                </button>
              </div>

              {/* Editable Name, Email, Phone if requested */}
              {showEditDetails && (
                <div className="space-y-3 bg-gray-50 border border-gray-200 p-3.5 rounded-xs animate-in fade-in duration-150">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-xs">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Seu nome completo ou apelido"
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-xs focus:outline-hidden focus:border-[#0098d9] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-xs">
                        Seu E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="voce@exemplo.com.br"
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-xs focus:outline-hidden focus:border-[#0098d9] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-xs">
                        Seu Telefone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-xs focus:outline-hidden focus:border-[#0098d9] bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MANDATORY PHOTO RULE: In-modal quick photo addition box if no photo */}
              {!hasPhoto && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-sm space-y-3 shadow-xs animate-in fade-in zoom-in-98 duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                        <span>Adicione uma foto ao seu perfil para enviar a mensagem</span>
                      </h4>
                      <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Para a segurança e respeito mútuo da nossa comunidade, é obrigatório ter ao menos <strong>1 foto no seu perfil</strong> antes de enviar mensagens privadas.
                      </p>
                    </div>
                  </div>

                  {/* Photo selection input & preview */}
                  <div className="bg-white p-3 border border-amber-200 rounded space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedPhotoPreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedPhotoPreview}
                          alt="Pré-visualização"
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800">
                            Foto pronta para salvar no seu perfil!
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Ela será usada como sua foto oficial no AmorClass.
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] text-[#0098d9] hover:underline font-semibold mt-1 cursor-pointer block"
                          >
                            Escolher outra foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 px-4 bg-sky-50 hover:bg-sky-100 border border-dashed border-[#0098d9] text-[#0098d9] font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Selecionar Foto do Celular ou Computador</span>
                        </button>

                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-gray-200"></div>
                          <span className="flex-shrink mx-2 text-[10px] text-gray-400 uppercase">ou colar link de foto</span>
                          <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={manualPhotoUrl}
                            onChange={(e) => setManualPhotoUrl(e.target.value)}
                            placeholder="https://exemplo.com/minha-foto.jpg"
                            className="flex-1 px-2.5 py-1.5 border border-gray-300 text-xs focus:outline-hidden focus:border-[#0098d9]"
                          />
                        </div>
                      </div>
                    )}

                    {photoError && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{photoError}</span>
                      </p>
                    )}

                    {(selectedPhotoPreview || manualPhotoUrl.trim()) && (
                      <button
                        type="button"
                        onClick={handleSavePhotoToProfile}
                        disabled={isSavingPhoto}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingPhoto ? (
                          <span>Salvando foto no seu perfil...</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Salvar Foto no Meu Perfil & Liberar Envio</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Photo added success confirmation badge */}
              {photoSavedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Foto adicionada ao seu perfil com sucesso! Seu envio de mensagem agora está liberado.</span>
                </div>
              )}

              {/* Message textarea - Active with user's written message preserved */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5 text-xs sm:text-sm flex items-center justify-between">
                  <span>Mensagem para {listing.contact.name.split(' ')[0]}</span>
                  <span className="text-[11px] text-gray-400 font-normal">Privada e segura</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                  className="w-full p-3 border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-hidden focus:border-[#0098d9] focus:ring-1 focus:ring-[#0098d9]"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer font-medium text-xs sm:text-sm"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !hasPhoto}
                  className={`px-6 py-2.5 font-bold text-xs sm:text-sm rounded transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                    hasPhoto
                      ? 'bg-[#0098d9] hover:bg-[#0077aa] text-white active:scale-98'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!hasPhoto ? 'Adicione uma foto ao perfil acima para liberar o envio' : 'Enviar mensagem agora'}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
