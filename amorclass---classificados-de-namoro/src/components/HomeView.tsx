import React, { useState } from 'react';
import { DatingListing, PageView } from '../types/classifieds';
import { CATEGORIES, POPULAR_REGIONS } from '../data/categories';
import { buildListingUrl } from '../utils/seo';
import {
  Heart,
  Search,
  Users,
  Sparkles,
  Coffee,
  Compass,
  MapPin,
  Flame,
  ShieldCheck,
  Palmtree,
  Gem
} from 'lucide-react';

interface HomeViewProps {
  listings: DatingListing[];
  onNavigate: (view: PageView) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  listings,
  onNavigate,
  favorites,
  onToggleFavorite
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate({
      type: 'search',
      query: keyword.trim() || undefined,
      category: selectedCategory || undefined
    });
  };

  const getCategoryIcon = (iconName: string, color: string) => {
    const props = { className: 'w-7 h-7', style: { color } };
    switch (iconName) {
      case 'HeartHandshake':
        return <Heart {...props} fill={color} fillOpacity={0.2} />;
      case 'UserCheck':
        return <Users {...props} />;
      case 'Gem':
        return <Gem {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'Rainbow':
        return <Flame {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Coffee':
        return <Coffee {...props} />;
      case 'Palmtree':
        return <Palmtree {...props} />;
      default:
        return <Heart {...props} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Hero Search Box - Exact Osclass Bender aesthetic from screenshot 9 */}
      <div className="mb-10 sm:mb-14 pt-2 sm:pt-4">
        <h1 className="text-2xl sm:text-4xl text-gray-900 font-normal mb-5 sm:mb-8 tracking-tight font-osclass-serif text-center sm:text-left">
          O que você está procurando no amor?
        </h1>

        <form
          onSubmit={handleSearchSubmit}
          className="bg-white border-b border-gray-200 pb-6 sm:pb-8 flex flex-col md:flex-row items-end gap-3.5 sm:gap-4"
        >
          {/* Keyword Field */}
          <div className="flex-1 w-full">
            <label
              htmlFor="keyword-input"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2"
            >
              Palavra-chave
            </label>
            <input
              id="keyword-input"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ex: Romântico, 25-35 anos, São Paulo..."
              className="w-full px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-white border border-gray-300 rounded-none focus:outline-none focus:border-[#0098d9] focus:ring-1 focus:ring-[#0098d9] text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-72">
            <label
              htmlFor="category-select"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2"
            >
              Categoria
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-white border border-gray-300 rounded-none focus:outline-none focus:border-[#0098d9] focus:ring-1 focus:ring-[#0098d9] text-gray-800 cursor-pointer"
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="w-full md:w-auto">
            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3 sm:py-2.5 bg-[#0098d9] md:bg-white text-white md:text-[#0098d9] md:border md:border-[#0098d9] hover:bg-[#0077aa] md:hover:bg-[#0098d9] md:hover:text-white transition-colors duration-150 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Latest Listings Section - 3 columns grid matching screenshot 9 */}
      <div className="mb-16">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-osclass-serif">
            Últimos Anúncios
          </h2>
          <button
            onClick={() => onNavigate({ type: 'search' })}
            className="text-xs text-[#0098d9] hover:underline font-semibold cursor-pointer"
          >
            Ver todos os anúncios &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.slice(0, 6).map((listing) => {
            const isFav = favorites.includes(listing.id);
            return (
              <div
                key={listing.id}
                className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
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
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      loading="lazy"
                    />
                  </a>
                  {/* Verified Badge */}
                  {listing.contact.verified && (
                    <div className="absolute top-2.5 left-2.5 bg-white/95 text-xs text-gray-700 font-semibold px-2 py-0.5 flex items-center gap-1 shadow-sm border border-gray-200 pointer-events-none">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0098d9]" />
                      <span>Verificado</span>
                    </div>
                  )}

                  {/* Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onToggleFavorite(listing.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-gray-600 hover:text-rose-500 shadow-md cursor-pointer transition-transform active:scale-90"
                    title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content - Title and Price/Age */}
                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="mb-1">
                      <a
                        href={buildListingUrl(listing)}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate({ type: 'detail', listingId: listing.id });
                        }}
                        className="text-[#0098d9] group-hover:text-[#0077aa] group-hover:underline text-[15px] font-medium leading-snug cursor-pointer line-clamp-1 block"
                      >
                        {listing.title}
                      </a>
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <a
                        href={`/busca?cidade=${encodeURIComponent(listing.location.city)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate({ type: 'search', city: listing.location.city });
                        }}
                        className="hover:text-[#0098d9] hover:underline flex items-center gap-1 cursor-pointer truncate"
                        title={`Ver anúncios em ${listing.location.city}`}
                      >
                        <MapPin className="w-3 h-3 text-[#0098d9] shrink-0" />
                        <span className="truncate">
                          {listing.location.city}, {listing.location.region}
                        </span>
                      </a>
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
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
                      className="text-base font-bold text-gray-900 font-osclass-serif hover:text-[#0098d9] hover:underline cursor-pointer"
                      title={`${listing.gender === 'Feminino' ? 'Mulheres' : 'Homens'} de ${listing.age} anos em ${listing.location.city}`}
                    >
                      {listing.age} anos
                    </a>
                    <span className="text-xs text-gray-500 font-medium">
                      {listing.attributes.relationshipStatus}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Categories Section - Exact Osclass Grid from screenshot 10 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 font-osclass-serif mb-6 border-b border-gray-200 pb-3">
          Todas as Categorias
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 8 Category Tiles Grid (3/4 of the width) */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  onNavigate({
                    type: 'search',
                    category: cat.id
                  })
                }
                className="bg-white border border-gray-200 hover:border-[#0098d9] p-5 flex flex-col items-center justify-center text-center transition-all duration-150 hover:shadow-xs group cursor-pointer"
              >
                <div className="mb-3 transform group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.iconName, cat.iconColor)}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#0098d9] transition-colors leading-tight">
                  {cat.shortName}
                </span>
                <span className="text-[11px] text-gray-400 mt-1">
                  {cat.count} anúncios
                </span>
              </button>
            ))}
          </div>

          {/* Popular Regions Sidebar (1/4 width) - as in screenshot 10 */}
          <div className="lg:col-span-1 bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0098d9]" />
              <span>Regiões Populares</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {POPULAR_REGIONS.map((reg) => (
                <li key={reg.state}>
                  <button
                    onClick={() =>
                      onNavigate({
                        type: 'search',
                        city: reg.name.split(' (')[0]
                      })
                    }
                    className="w-full flex items-center justify-between text-gray-600 hover:text-[#0098d9] transition-colors py-1 cursor-pointer group"
                  >
                    <span className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                      <span className="text-gray-400 text-[10px]">📍</span>
                      {reg.name}
                    </span>
                    <span className="text-gray-400 text-[11px] font-mono">
                      ({reg.count})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
