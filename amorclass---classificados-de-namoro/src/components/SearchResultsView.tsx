import React, { useState, useMemo } from 'react';
import { DatingListing, PageView } from '../types/classifieds';
import { CATEGORIES } from '../data/categories';
import { buildListingUrl } from '../utils/seo';
import { Heart, Search, X, Check, Mail, MapPin, SlidersHorizontal } from 'lucide-react';

interface SearchResultsViewProps {
  listings: DatingListing[];
  initialCategory?: string;
  initialQuery?: string;
  initialCity?: string;
  onNavigate: (view: PageView) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  listings,
  initialCategory,
  initialQuery = '',
  initialCity = '',
  onNavigate,
  favorites,
  onToggleFavorite
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [withPhotoOnly, setWithPhotoOnly] = useState(true);
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribedToast, setSubscribedToast] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFiltersCount = [
    query ? 'q' : null,
    city ? 'c' : null,
    selectedCategory ? 'cat' : null,
    minAge ? 'min' : null,
    maxAge ? 'max' : null
  ].filter(Boolean).length;

  // Sync state when initial navigation props change
  React.useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialCity !== undefined) {
      setCity(initialCity);
    }
  }, [initialCity]);

  React.useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Filter listings based on current state
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCity = item.location.city.toLowerCase().includes(q);
        const matchesProf = item.attributes.profession?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesProf) {
          return false;
        }
      }

      // City filter
      if (city.trim()) {
        const c = city.toLowerCase();
        if (
          !item.location.city.toLowerCase().includes(c) &&
          !item.location.region.toLowerCase().includes(c)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory) {
        if (item.category !== selectedCategory) {
          return false;
        }
      }

      // Photo filter
      if (withPhotoOnly && (!item.images || item.images.length === 0)) {
        return false;
      }

      // Age range
      if (minAge && item.age < parseInt(minAge, 10)) {
        return false;
      }
      if (maxAge && item.age > parseInt(maxAge, 10)) {
        return false;
      }

      return true;
    });
  }, [listings, query, city, selectedCategory, withPhotoOnly, minAge, maxAge]);

  const handleResetFilters = () => {
    setQuery('');
    setCity('');
    setSelectedCategory('');
    setMinAge('');
    setMaxAge('');
    setWithPhotoOnly(false);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriberEmail.trim()) {
      setSubscribedToast(true);
      setTimeout(() => setSubscribedToast(false), 3500);
      setSubscriberEmail('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      {/* Mobile Filter Toggle Button (hidden on PC) */}
      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:border-[#0098d9] text-gray-800 text-xs font-semibold flex items-center justify-between shadow-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0098d9]" />
            <span>Filtrar e Categorias</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#0098d9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <span className="text-[#0098d9] font-medium text-xs">
            {mobileFiltersOpen ? 'Ocultar Filtros ▲' : 'Modificar Filtros ▼'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {/* Left Sidebar Filter Form - Faithful to Osclass Bender on PC, collapsible on mobile */}
        <div className={`md:col-span-1 space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Filtros de Busca
              </span>
              {(query || city || selectedCategory || minAge || maxAge) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  title="Limpar todos os filtros"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-4 text-xs"
            >
              {/* Your search */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Sua busca
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Palavras-chave..."
                  className="w-full px-2.5 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Cidade ou Estado
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="ex: São Paulo, Campinas..."
                  className="w-full px-2.5 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                />
              </div>

              {/* Show only listings with pictures */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700">
                  <input
                    type="checkbox"
                    checked={withPhotoOnly}
                    onChange={(e) => setWithPhotoOnly(e.target.checked)}
                    className="w-4 h-4 text-[#0098d9] rounded border-gray-300 focus:ring-0"
                  />
                  <span>Mostrar apenas com foto</span>
                </label>
              </div>

              {/* Age Range (Price equivalent) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Idade
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    placeholder="Mín."
                    className="w-1/2 px-2 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    placeholder="Máx."
                    className="w-1/2 px-2 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-[#0098d9]"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors font-semibold text-xs cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            </form>
          </div>

          {/* Subscribe to this search - As in screenshot 4 */}
          <div className="bg-white border border-gray-200 p-4">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0098d9]" />
              <span>Receber novos anúncios</span>
            </h4>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
              Fique sabendo em primeira mão quando novos perfis compatíveis forem publicados.
            </p>
            {subscribedToast ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-2.5 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Inscrição confirmada com sucesso!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full px-2.5 py-1.5 border border-gray-300 text-xs focus:outline-none focus:border-[#0098d9]"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors font-semibold text-xs cursor-pointer"
                >
                  Inscrever-se agora!
                </button>
              </form>
            )}
          </div>

          {/* Refine Category - As in screenshot 4 */}
          <div className="bg-white border border-gray-200 p-4">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Refinar categoria
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left py-1 cursor-pointer transition-colors ${
                    selectedCategory === ''
                      ? 'text-[#0098d9] font-bold underline'
                      : 'text-gray-600 hover:text-[#0098d9]'
                  }`}
                >
                  Todas as categorias
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left py-1 cursor-pointer transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'text-[#0098d9] font-bold underline'
                        : 'text-gray-600 hover:text-[#0098d9]'
                    }`}
                  >
                    <span className="truncate">{cat.shortName}</span>
                    <span className="text-[10px] text-gray-400 font-mono ml-1">
                      ({cat.count})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Main Search Results - Faithful to Osclass in screenshots 5 & 6 */}
        <div className="md:col-span-3">
          {/* Header Bar */}
          <div className="border-b border-gray-200 pb-3 mb-4 flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-osclass-serif">
                Resultados da busca
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                1 - {filteredListings.length} de {filteredListings.length} anúncios
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Listagem de classificados</span>
            </div>
          </div>

          {/* Listings List (Row Layout) - Exactly like Osclass demo rows in screenshot 5 */}
          {filteredListings.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center my-6">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Nenhum anúncio encontrado para esta busca
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Tente ajustar seus termos de busca, limpar filtros de idade ou selecionar todas as categorias.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => {
                const isFav = favorites.includes(listing.id);
                return (
                  <article
                    key={listing.id}
                    className="bg-white border border-gray-200 hover:border-gray-300 transition-colors p-3.5 flex flex-col sm:flex-row gap-4 relative group"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-full sm:w-40 sm:h-28 aspect-[4/3] sm:aspect-auto bg-gray-100 overflow-hidden shrink-0 border border-gray-100 relative">
                      <a
                        href={buildListingUrl(listing)}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate({ type: 'detail', listingId: listing.id });
                        }}
                        className="block w-full h-full cursor-pointer"
                      >
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </a>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Title Link */}
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="line-clamp-1">
                            <a
                              href={buildListingUrl(listing)}
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigate({ type: 'detail', listingId: listing.id });
                              }}
                              className="text-base font-semibold text-[#0098d9] hover:underline cursor-pointer leading-snug block"
                            >
                              {listing.title}
                            </a>
                          </h2>

                          {/* Age / Tag */}
                          <div className="text-right shrink-0">
                            <a
                              href={`/busca?categoria=${listing.category}&cidade=${encodeURIComponent(listing.location.city)}&idade_min=${listing.age}&idade_max=${listing.age}`}
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigate({
                                  type: 'search',
                                  category: listing.category,
                                  city: listing.location.city,
                                  minAge: listing.age,
                                  maxAge: listing.age
                                });
                              }}
                              className="text-base font-bold text-gray-900 font-osclass-serif hover:text-[#0098d9] hover:underline cursor-pointer block"
                              title={`${listing.gender === 'Feminino' ? 'Mulheres' : 'Homens'} de ${listing.age} anos em ${listing.location.city} à procura de namoro`}
                            >
                              {listing.age} anos
                            </a>
                          </div>
                        </div>

                        {/* Metadata row: Category in City / City (Region) / Date - Clickable SEO links */}
                        <p className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-1.5">
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
                            className="text-[#0098d9] hover:underline font-medium cursor-pointer"
                            title={`Ver anúncios de ${listing.categoryLabel} em ${listing.location.cityArea ? `${listing.location.cityArea}, ` : ''}${listing.location.city}`}
                          >
                            {listing.categoryLabel} em {listing.location.cityArea ? `${listing.location.cityArea}, ` : ''}{listing.location.city}
                          </a>
                          <span className="text-gray-300">/</span>
                          <a
                            href={`/busca?cidade=${encodeURIComponent(listing.location.city)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate({
                                type: 'search',
                                city: listing.location.city
                              });
                            }}
                            className="text-gray-600 hover:text-[#0098d9] hover:underline flex items-center gap-0.5 cursor-pointer"
                            title={`Ver todos os anúncios de namoro em ${listing.location.city}`}
                          >
                            <MapPin className="w-3 h-3 text-[#0098d9]" />
                            <span>
                              {listing.location.cityArea ? `${listing.location.cityArea}, ` : ''}
                              {listing.location.city} ({listing.location.region})
                            </span>
                          </a>
                          <span className="text-gray-300">/</span>
                          <span>{listing.publishedDate}</span>
                        </p>

                        {/* Excerpt description - 2 lines max */}
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 font-medium">
                            {listing.attributes.relationshipStatus}
                          </span>
                          <span>·</span>
                          <span>{listing.attributes.profession || 'Profissional'}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(listing.id);
                            }}
                            className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFav ? 'text-rose-500 fill-rose-500' : ''
                              }`}
                            />
                            <span>{isFav ? 'Favoritado' : 'Favoritar'}</span>
                          </button>

                          <a
                            href={buildListingUrl(listing)}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate({ type: 'detail', listingId: listing.id });
                            }}
                            className="text-[#0098d9] hover:underline font-semibold cursor-pointer"
                          >
                            Ver anúncio &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination - As in screenshot 6 */}
          {filteredListings.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-center gap-1 text-xs">
              <span className="w-7 h-7 flex items-center justify-center border border-[#0098d9] bg-[#0098d9] text-white font-bold">
                1
              </span>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-300 text-gray-700 hover:border-[#0098d9] hover:text-[#0098d9] cursor-pointer">
                2
              </button>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-300 text-gray-700 hover:border-[#0098d9] hover:text-[#0098d9] cursor-pointer">
                &gt;
              </button>
            </div>
          )}

          {/* Other searches that may interest you - Bottom tags from screenshot 6 */}
          <div className="mt-12 bg-white border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Outras buscas que podem interessar a você
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Namoro em São Paulo',
                'Mulheres solteiras no Rio',
                'Relacionamento sério',
                'Encontros acima de 40 anos',
                'Perfis com foto verificada',
                'Belo Horizonte',
                'Curitiba',
                'Amizades novas'
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                  }}
                  className="px-2.5 py-1 bg-gray-50 border border-gray-200 hover:border-[#0098d9] hover:text-[#0098d9] text-gray-700 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
