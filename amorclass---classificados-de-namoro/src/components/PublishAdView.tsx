import React, { useState, useEffect } from 'react';
import { DatingListing, PageView, UserSession } from '../types/classifieds';
import { CATEGORIES } from '../data/categories';
import { getProfileAvatar } from '../data/profileImages';
import { AutocompleteInput } from './AutocompleteInput';
import {
  IBGE_ESTADOS_OPTIONS,
  resolveUf,
  resolveStateFullName,
  fetchIbgeCitiesByState,
  fetchIbgeNeighborhoodsAndDistricts,
  fetchAddressByCep
} from '../services/ibgeService';
import {
  Upload,
  X,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  List,
  Check,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Loader2
} from 'lucide-react';

interface PublishAdViewProps {
  onPublish: (newListing: DatingListing) => void;
  onNavigate: (view: PageView) => void;
  user: UserSession;
  returnToListingId?: string;
  targetListing?: DatingListing;
  editingListing?: DatingListing;
}

export const PublishAdView: React.FC<PublishAdViewProps> = ({
  onPublish,
  onNavigate,
  user,
  returnToListingId,
  targetListing,
  editingListing
}) => {
  // General Info
  const [category, setCategory] = useState(editingListing?.category || 'mulheres-homens');
  const [title, setTitle] = useState(editingListing?.title || '');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [age, setAge] = useState<number | ''>(editingListing?.age ?? 28);
  const [gender, setGender] = useState<'Feminino' | 'Masculino' | 'Não-binário'>(
    editingListing?.gender || 'Feminino'
  );
  const [seeking, setSeeking] = useState<'Homens' | 'Mulheres' | 'Todos'>(
    editingListing?.seeking || 'Homens'
  );

  // Attributes
  const [relationshipStatus, setRelationshipStatus] = useState(
    editingListing?.attributes.relationshipStatus || 'Solteiro(a)'
  );
  const [height, setHeight] = useState(editingListing?.attributes.height || '1,70m');
  const [profession, setProfession] = useState(editingListing?.attributes.profession || '');
  const [smoking, setSmoking] = useState(editingListing?.attributes.smoking || 'Não fumante');
  const [drinking, setDrinking] = useState(editingListing?.attributes.drinking || 'Socialmente');
  const [kids, setKids] = useState(editingListing?.attributes.kids || 'Não tenho');

  // Location (Default: São Paulo (SP))
  const initialRegion = editingListing?.location.region
    ? editingListing.location.region.includes('(')
      ? editingListing.location.region
      : `${resolveStateFullName(editingListing.location.region)} (${resolveUf(editingListing.location.region) || 'SP'})`
    : 'São Paulo (SP)';

  const [country, setCountry] = useState(editingListing?.location.country || 'Brasil');
  const [region, setRegion] = useState(initialRegion);
  const [city, setCity] = useState(editingListing?.location.city || 'São Paulo');
  const [cityArea, setCityArea] = useState(editingListing?.location.cityArea || '');

  // Dynamic IBGE States, Cities and Neighborhoods with Autocomplete
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [neighborhoodsList, setNeighborhoodsList] = useState<string[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Quick CEP lookup
  const [cepQuery, setCepQuery] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepSuccessMsg, setCepSuccessMsg] = useState('');

  // 1. Load 100% of IBGE cities whenever state/region changes
  useEffect(() => {
    let isCancelled = false;
    const loadCities = async () => {
      const uf = resolveUf(region);
      if (!uf) {
        setCitiesList([]);
        return;
      }
      setLoadingCities(true);
      try {
        const cities = await fetchIbgeCitiesByState(region);
        if (!isCancelled) {
          setCitiesList(cities);
        }
      } catch (err) {
        console.error('Failed to load IBGE cities:', err);
      } finally {
        if (!isCancelled) {
          setLoadingCities(false);
        }
      }
    };
    loadCities();
    return () => {
      isCancelled = true;
    };
  }, [region]);

  // 2. Load IBGE neighborhoods & districts whenever city or state changes
  useEffect(() => {
    let isCancelled = false;
    const loadNeighborhoods = async () => {
      if (!city || !city.trim()) {
        setNeighborhoodsList([]);
        return;
      }
      setLoadingNeighborhoods(true);
      try {
        const bairros = await fetchIbgeNeighborhoodsAndDistricts(region, city);
        if (!isCancelled) {
          setNeighborhoodsList(bairros);
        }
      } catch (err) {
        console.error('Failed to load neighborhoods:', err);
      } finally {
        if (!isCancelled) {
          setLoadingNeighborhoods(false);
        }
      }
    };
    loadNeighborhoods();
    return () => {
      isCancelled = true;
    };
  }, [region, city]);

  // 3. Quick CEP search
  const handleCepSearch = async (val: string) => {
    setCepQuery(val);
    setCepSuccessMsg('');
    const clean = val.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const addr = await fetchAddressByCep(clean);
        if (addr) {
          setRegion(addr.state);
          setCity(addr.city);
          if (addr.neighborhood) {
            setCityArea(addr.neighborhood);
          }
          setCepSuccessMsg(`Endereço localizado: ${addr.city} - ${addr.uf}${addr.neighborhood ? ` (${addr.neighborhood})` : ''}`);
        }
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Seller Information
  const [name, setName] = useState(editingListing?.contact.name || user.name || '');
  const [email, setEmail] = useState(editingListing?.contact.email || user.email || '');
  const [showEmail, setShowEmail] = useState(editingListing?.contact.showEmail ?? true);
  const [phone, setPhone] = useState(editingListing?.contact.phone || user.phone || '');
  const [showPhone, setShowPhone] = useState(editingListing?.contact.showPhone ?? true);
  const [otherContact, setOtherContact] = useState(editingListing?.contact.instagram || '');

  // Photos
  const [photos, setPhotos] = useState<string[]>(editingListing?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Compress user uploaded image to prevent Firestore 1MB document size limit
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 680;
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
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file upload with compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        setPhotos((prev) => [...prev, compressed]);
      } catch {
        // fallback
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUsePresetAvatar = () => {
    const avatar = getProfileAvatar(
      'new-' + Date.now(),
      gender,
      typeof age === 'number' ? age : 28,
      name || 'Novo Perfil'
    );
    setPhotos((prev) => [...prev, avatar]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Por favor, preencha o título e a descrição do seu anúncio.');
      return;
    }
    setErrorMessage('');

    setIsSubmitting(true);

    const catObj = CATEGORIES.find((c) => c.id === category);
    const resolvedAge = typeof age === 'number' ? age : 28;

    // If no user photo uploaded, generate authentic avatar
    const finalPhotos =
      photos.length > 0
        ? photos
        : [
            getProfileAvatar(
              'ad-' + Date.now(),
              gender,
              resolvedAge,
              name || 'Novo Anunciante'
            )
          ];

    const newAd: DatingListing = {
      id: editingListing ? editingListing.id : ('ad-' + Date.now()),
      title: title.trim(),
      category: category,
      categoryLabel: catObj ? catObj.name : 'Classificados',
      age: resolvedAge,
      gender: gender,
      seeking: seeking,
      location: {
        country: country || 'Brasil',
        region: resolveStateFullName(region) || region || 'São Paulo',
        city: city.trim() || 'São Paulo',
        cityArea: cityArea.trim() || undefined
      },
      publishedDate: editingListing ? editingListing.publishedDate : 'Hoje',
      modifiedDate: 'Hoje',
      views: editingListing ? editingListing.views : 1,
      images: finalPhotos,
      description: description.trim(),
      attributes: {
        orientation:
          gender === 'Feminino' && seeking === 'Homens'
            ? 'Heterossexual'
            : gender === 'Masculino' && seeking === 'Mulheres'
            ? 'Heterossexual'
            : gender === 'Feminino' && seeking === 'Mulheres'
            ? 'Lésbica'
            : gender === 'Masculino' && seeking === 'Homens'
            ? 'Gay'
            : 'Outro',
        height: height || undefined,
        relationshipStatus: relationshipStatus,
        kids: kids,
        smoking: smoking,
        drinking: drinking,
        profession: profession || undefined,
        interests: editingListing?.attributes.interests || ['Conversar', 'Namoro Sério', 'Companheirismo']
      },
      contact: {
        name: name.trim() || 'Anunciante AmorClass',
        email: email.trim() || 'contato@amorclass.com.br',
        showEmail: showEmail,
        phone: phone.trim() || '',
        showPhone: showPhone,
        whatsapp: phone.replace(/\D/g, '') || undefined,
        instagram: otherContact.trim() || undefined,
        verified: true,
        memberSince: editingListing?.contact.memberSince || 'Outubro de 2026',
        responseTime: editingListing?.contact.responseTime || 'Geralmente em 1 hora'
      },
      comments: editingListing ? editingListing.comments : []
    };

    try {
      await onPublish(newAd);
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        if (returnToListingId) {
          onNavigate({
            type: 'detail',
            listingId: returnToListingId,
            autoOpenContact: true
          });
        } else {
          onNavigate({ type: 'detail', listingId: newAd.id });
        }
      }, 400);
    } catch (err) {
      console.error('Error publishing ad:', err);
      setIsSubmitting(false);
      setErrorMessage('Erro ao salvar anúncio. Tente novamente.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Onboarding step 2 banner when user came from trying to contact a profile */}
      {returnToListingId && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-5 h-5 rounded-full bg-[#0098d9] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              2
            </span>
            <span>Passo 2 de 2: Crie seu anúncio / perfil de namoro</span>
          </div>
          <p className="text-xs text-sky-800 leading-relaxed">
            Sua conta já está criada! Agora preencha os dados abaixo para publicar seu anúncio. Assim que concluir, <strong>você retornará diretamente para a conversa com {targetListing?.contact.name || 'o perfil de interesse'}</strong>!
          </p>
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 font-osclass-serif mb-6 sm:mb-8 text-center sm:text-left">
        {editingListing ? 'Editar anúncio' : 'Publicar um anúncio'}
      </h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>
            {editingListing
              ? 'Anúncio atualizado com sucesso no banco de dados!'
              : returnToListingId
              ? `Anúncio publicado com sucesso! Retornando para a conversa com ${targetListing?.contact.name || 'o perfil de interesse'}...`
              : 'Anúncio publicado com sucesso! Redirecionando para visualização...'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10 text-sm">
        {/* SECTION 1: General Information - Matching screenshot 2 */}
        <div className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-bold text-gray-900 font-osclass-serif border-b border-gray-100 pb-2">
            Informações Gerais
          </h2>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Categoria
            </label>
            <div className="sm:col-span-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-[#0098d9] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender & Seeking */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Eu sou / Busco
            </label>
            <div className="sm:col-span-3 flex items-center gap-3 flex-wrap">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-[#0098d9]"
              >
                <option value="Feminino">Mulher</option>
                <option value="Masculino">Homem</option>
                <option value="Não-binário">Não-binário</option>
              </select>

              <span className="text-gray-500 text-xs font-semibold">procurando</span>

              <select
                value={seeking}
                onChange={(e) => setSeeking(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-[#0098d9]"
              >
                <option value="Homens">Homens</option>
                <option value="Mulheres">Mulheres</option>
                <option value="Todos">Todos</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Título
            </label>
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Mariana, 28 anos - Buscando relacionamento sério e cumplicidade"
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
              />
            </div>
          </div>

          {/* Age / Price equivalent */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Sua Idade
            </label>
            <div className="sm:col-span-3 flex items-center gap-2">
              <input
                type="number"
                min={18}
                max={99}
                required
                value={age}
                onChange={(e) =>
                  setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                className="w-28 px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
              />
              <span className="text-xs text-gray-500">anos</span>
            </div>
          </div>

          {/* Description with Osclass Rich Text Mockup Toolbar - Matching screenshot 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm pt-2">
              Descrição
            </label>
            <div className="sm:col-span-3 border border-gray-300">
              {/* Simulated TinyMCE / Osclass Toolbar */}
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                <span className="cursor-pointer hover:text-black">Arquivo</span>
                <span className="cursor-pointer hover:text-black">Editar</span>
                <span className="cursor-pointer hover:text-black">Visualizar</span>
                <span className="cursor-pointer hover:text-black">Inserir</span>
                <span className="cursor-pointer hover:text-black">Formatar</span>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                  title="Itálico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                  title="Alinhar à esquerda"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                  title="Centralizar"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                  title="Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fale um pouco sobre você, seu estilo de vida, o que gosta de fazer no tempo livre e o que espera encontrar neste classificado..."
                className="w-full p-3 text-sm focus:outline-none text-gray-900 border-none resize-y"
              ></textarea>
            </div>
          </div>

          {/* Upload Images - Matching screenshot 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm pt-2">
              Fotos do Anúncio
            </label>
            <div className="sm:col-span-3 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="px-4 py-2 border border-gray-300 hover:border-gray-400 bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-[#0098d9]" />
                  <span>Carregar fotos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleUsePresetAvatar}
                  className="px-3 py-2 border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Gerar Retrato Ilustrado Automático</span>
                </button>
              </div>

              {/* Photos Preview */}
              {photos.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap pt-2">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 border border-gray-300 overflow-hidden group"
                    >
                      <img
                        src={photo}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 cursor-pointer shadow-sm"
                        title="Remover foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-gray-400">
                Formatos permitidos: JPG, PNG, WEBP. Fotos nítidas e amigáveis aumentam em 4x as respostas.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Listing Location - 100% IBGE States, Cities and Neighborhoods */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 gap-1">
            <h2 className="text-base font-bold text-gray-900 font-osclass-serif">
              Localização do Anúncio (100% Brasil - IBGE)
            </h2>
            <span className="text-[11px] text-[#0098d9] font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Base Oficial do IBGE</span>
            </span>
          </div>

          {/* Quick CEP Auto-fill Bar */}
          <div className="bg-sky-50/70 border border-sky-200/70 p-3 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-sky-900 font-semibold">
              <Sparkles className="w-4 h-4 text-[#0098d9] shrink-0" />
              <span>Preenchimento Rápido por CEP (Opcional):</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={9}
                  value={cepQuery}
                  onChange={(e) => handleCepSearch(e.target.value)}
                  placeholder="00000-000"
                  className="w-28 sm:w-32 px-2.5 py-1 bg-white border border-sky-300 text-gray-900 text-xs focus:outline-none focus:border-[#0098d9] rounded-xs font-mono"
                />
                {loadingCep && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0098d9] absolute right-2 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <span className="text-[11px] text-sky-700">Digite seu CEP para preencher Estado, Cidade e Bairro</span>
            </div>
          </div>
          {cepSuccessMsg && (
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xs">
              <Check className="w-3.5 h-3.5" />
              <span>{cepSuccessMsg}</span>
            </div>
          )}

          {/* Country */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              País
            </label>
            <div className="sm:col-span-3">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-[#0098d9]"
              >
                <option value="Brasil">Brasil</option>
                <option value="Portugal">Portugal</option>
              </select>
            </div>
          </div>

          {/* Region / State with Autocomplete (All 27 UFs do IBGE) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Estado / UF (IBGE)
            </label>
            <div className="sm:col-span-3">
              <AutocompleteInput
                value={region}
                onChange={(val) => {
                  setRegion(val);
                  setCity('');
                  setCityArea('');
                }}
                options={IBGE_ESTADOS_OPTIONS}
                placeholder="Selecione ou digite o Estado (ex: Minas Gerais, SP, Rio de Janeiro...)"
                required
                emptyHint="Nenhum estado encontrado. Digite o nome do estado ou a sigla (ex: MG, SP, RJ)."
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                100% dos 27 Estados do Brasil disponíveis com autocompletar.
              </span>
            </div>
          </div>

          {/* City with Autocomplete (100% dos Municípios do Estado no IBGE) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Cidade / Município
            </label>
            <div className="sm:col-span-3">
              <AutocompleteInput
                value={city}
                onChange={(val) => {
                  setCity(val);
                  setCityArea('');
                }}
                options={citiesList}
                isLoading={loadingCities}
                placeholder={
                  loadingCities
                    ? 'Carregando 100% dos municípios do IBGE...'
                    : citiesList.length > 0
                    ? `ex: ${citiesList.slice(0, 3).join(', ')}...`
                    : 'Primeiro selecione o Estado acima...'
                }
                required
                emptyHint={
                  loadingCities
                    ? 'Carregando lista de cidades do IBGE...'
                    : `Nenhuma cidade encontrada na busca. Você pode digitar o nome de qualquer cidade livremente.`
                }
              />
              <span className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
                <span>
                  {citiesList.length > 0
                    ? `${citiesList.length} municípios oficiais do IBGE disponíveis para busca.`
                    : 'Selecione uma sugestão ou digite o nome de qualquer cidade.'}
                </span>
                {loadingCities && (
                  <span className="text-[#0098d9] font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Conectando ao IBGE...
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* City Area / Bairro with Autocomplete (IBGE Distritos + Bairros Conhecidos) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Bairro / Região
            </label>
            <div className="sm:col-span-3">
              <AutocompleteInput
                value={cityArea}
                onChange={(val) => setCityArea(val)}
                options={neighborhoodsList}
                isLoading={loadingNeighborhoods}
                placeholder={
                  loadingNeighborhoods
                    ? 'Carregando distritos e bairros...'
                    : neighborhoodsList.length > 0
                    ? `ex: ${neighborhoodsList.slice(0, 3).join(', ')}...`
                    : 'ex: Centro, Savassi, Eldorado...'
                }
                emptyHint={
                  city
                    ? `Você pode digitar livremente o nome do seu bairro ou condomínio.`
                    : 'Primeiro selecione ou digite a cidade para ver sugestões de bairros.'
                }
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {neighborhoodsList.length > 0
                  ? `Sugestões para ${city}: ${neighborhoodsList.slice(0, 4).join(', ')}, etc. (ou digite seu bairro livremente).`
                  : 'Digite o nome do seu bairro, vila, condomínio ou região.'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Seller's Information - Matching screenshot 3 */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 font-osclass-serif border-b border-gray-100 pb-2">
            Informações do Anunciante
          </h2>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Nome
            </label>
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
              />
            </div>
          </div>

          {/* Email & Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm pt-2">
              E-mail
            </label>
            <div className="sm:col-span-3 space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com.br"
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
              />
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="w-4 h-4 text-[#0098d9] rounded border-gray-300 focus:ring-0"
                />
                <span>Mostrar e-mail na página do anúncio</span>
              </label>
            </div>
          </div>

          {/* Phone Number & Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm pt-2">
              Telefone / WhatsApp
            </label>
            <div className="sm:col-span-3 space-y-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
              />
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="w-4 h-4 text-[#0098d9] rounded border-gray-300 focus:ring-0"
                />
                <span>Mostrar telefone na página do anúncio</span>
              </label>
            </div>
          </div>

          {/* Other contact */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
            <label className="sm:text-right font-semibold text-gray-700 text-xs sm:text-sm">
              Outro contato
            </label>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={otherContact}
                onChange={(e) => setOtherContact(e.target.value)}
                placeholder="ex: @instagram, Telegram, etc."
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
              />
            </div>
          </div>
        </div>

        {/* Publish Button - Matching screenshot 3 */}
        <div className="pt-2 text-center sm:text-left">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-3.5 sm:py-3 bg-[#0098d9] sm:bg-white border border-[#0098d9] text-white sm:text-[#0098d9] hover:bg-[#0077aa] sm:hover:bg-[#0098d9] sm:hover:text-white transition-colors duration-150 font-bold text-sm uppercase tracking-wider cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Anúncio'}
          </button>
        </div>
      </form>
    </div>
  );
};
