import React from 'react';
import { PageView, UserSession } from '../types/classifieds';
import { Heart, Plus, User, LogOut, Search, Mail } from 'lucide-react';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  user: UserSession;
  onLogout: () => void;
  favoritesCount: number;
  unreadActivityCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  favoritesCount,
  unreadActivityCount = 0
}) => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo - Faithful to Osclass Bender logo: cyan badge with two dots + bold serif/sans text */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate({ type: 'home' });
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          title="AmorClass - Início"
        >
          <div className="w-10 h-7 bg-[#0098d9] rounded-md flex items-center justify-center gap-1.5 shadow-sm px-1.5 transition-transform group-hover:scale-105">
            <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
            <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#0098d9] transition-colors leading-none">
              Amor<span className="text-[#0098d9]">Class</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">
              Classificados de Namoro
            </span>
          </div>
        </a>

        {/* Right Actions - Desktop: Full nav links | Mobile: Quick Publish CTA */}
        <div className="flex items-center gap-2">
          {/* Mobile Quick Action Buttons (shown only on mobile) */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => onNavigate({ type: 'search' })}
              className="p-2 text-gray-600 hover:text-[#0098d9] rounded-md transition-colors"
              title="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ type: 'publish' })}
              className="px-3 py-1.5 bg-[#0098d9] hover:bg-[#0077aa] text-white text-xs font-bold rounded flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Anunciar</span>
            </button>
          </div>

          {/* Desktop Full Navigation (hidden on mobile, unchanged for PC) */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'home' });
              }}
              className={`transition-colors cursor-pointer ${
                currentView.type === 'home'
                  ? 'text-[#0098d9] font-semibold'
                  : 'text-gray-700 hover:text-[#0098d9]'
              }`}
            >
              Início
            </a>

            <a
              href="/busca"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'search' });
              }}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                currentView.type === 'search'
                  ? 'text-[#0098d9] font-semibold'
                  : 'text-gray-700 hover:text-[#0098d9]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explorar</span>
            </a>

            <a
              href="/favoritos"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'favorites' });
              }}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                currentView.type === 'favorites'
                  ? 'text-[#0098d9] font-semibold'
                  : 'text-gray-700 hover:text-[#0098d9]'
              }`}
              title="Meus Favoritos"
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </a>

            {user.isLoggedIn && (
              <a
                href="/mensagens"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate({ type: 'chat' });
                }}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  currentView.type === 'chat'
                    ? 'text-[#0098d9] font-semibold'
                    : 'text-gray-700 hover:text-[#0098d9]'
                }`}
                title="Página de Mensagens"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Mensagens</span>
              </a>
            )}

            {user.isLoggedIn ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'my-account' })}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentView.type === 'my-account'
                      ? 'text-[#0098d9] underline'
                      : 'text-gray-700 hover:text-[#0098d9]'
                  }`}
                  title="Acessar Minha Conta"
                >
                  {user.avatarPhoto ? (
                    <img
                      src={user.avatarPhoto}
                      alt={user.name || 'Perfil'}
                      className="w-5 h-5 rounded-full object-cover border border-[#0098d9] shrink-0"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#0098d9]" />
                  )}
                  <span className="truncate max-w-[150px]">{user.name || user.email}</span>
                  {unreadActivityCount > 0 && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate({ type: 'login' });
                }}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  currentView.type === 'login'
                    ? 'text-[#0098d9] font-semibold'
                    : 'text-gray-700 hover:text-[#0098d9]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </a>
            )}

            {/* Publish Ad Button - exactly like Osclass right header */}
            <a
              href="/publicar"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'publish' });
              }}
              className="cursor-pointer text-[#0098d9] hover:text-[#0077aa] font-semibold text-sm transition-colors flex items-center gap-1 ml-1"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Anúncio</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
