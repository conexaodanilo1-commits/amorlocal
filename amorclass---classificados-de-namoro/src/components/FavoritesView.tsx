import React from 'react';
import { DatingListing, PageView } from '../types/classifieds';
import { buildListingUrl } from '../utils/seo';
import { Heart, Trash2, MapPin } from 'lucide-react';

interface FavoritesViewProps {
  favorites: string[];
  listings: DatingListing[];
  onNavigate: (view: PageView) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  listings,
  onNavigate,
  onRemoveFavorite
}) => {
  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="border-b border-gray-200 pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-osclass-serif">
            Meus Anúncios Favoritos
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Você tem {favoriteListings.length} {favoriteListings.length === 1 ? 'perfil salvo' : 'perfis salvos'}
          </p>
        </div>

        <button
          onClick={() => onNavigate({ type: 'search' })}
          className="text-xs text-[#0098d9] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
        >
          Explorar mais anúncios &rarr;
        </button>
      </div>

      {favoriteListings.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center my-6 space-y-4">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-base font-bold text-gray-800">
            Nenhum anúncio favoritado ainda
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Ao navegar pelos classificados, clique no coração para salvar os perfis que mais despertaram seu interesse!
          </p>
          <button
            onClick={() => onNavigate({ type: 'search' })}
            className="px-6 py-2.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
          >
            Buscar Anúncios de Namoro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoriteListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-200 hover:border-gray-300 transition-colors flex flex-col group"
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemoveFavorite(listing.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-sm cursor-pointer"
                  title="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="mb-1">
                    <a
                      href={buildListingUrl(listing)}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate({ type: 'detail', listingId: listing.id });
                      }}
                      className="text-[#0098d9] group-hover:underline text-sm font-semibold line-clamp-1 block cursor-pointer"
                    >
                      {listing.title}
                    </a>
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{listing.location.city}, {listing.location.region}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 font-osclass-serif">
                    {listing.age} anos
                  </span>
                  <a
                    href={buildListingUrl(listing)}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate({ type: 'detail', listingId: listing.id });
                    }}
                    className="text-xs text-[#0098d9] hover:underline font-semibold cursor-pointer"
                  >
                    Ver perfil
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
