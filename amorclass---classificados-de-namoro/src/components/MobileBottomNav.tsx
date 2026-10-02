import React from 'react';
import { PageView, UserSession } from '../types/classifieds';
import { Mail, Heart, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  favoritesCount?: number;
  user: UserSession;
  unreadActivityCount?: number;
  receivedMessagesCount?: number;
  whoFavoritedCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  user,
  unreadActivityCount = 0,
  receivedMessagesCount = 0,
  whoFavoritedCount = 0
}) => {
  return (
    <nav
      aria-label="Navegação mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-3 h-14 items-center">
        {/* 1. Mensagens Recebidas / Chat */}
        <button
          type="button"
          onClick={() =>
            onNavigate(
              user.isLoggedIn
                ? { type: 'chat' }
                : { type: 'login' }
            )
          }
          className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer ${
            currentView.type === 'chat' ||
            (currentView.type === 'my-account' && currentView.activeTab === 'messages')
              ? 'text-[#0098d9] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <Mail
              className={`w-5 h-5 mb-0.5 ${
                receivedMessagesCount > 0 ? 'text-[#0098d9]' : ''
              }`}
            />
            {receivedMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#0098d9] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                {receivedMessagesCount > 99 ? '99+' : receivedMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none">Mensagens</span>
        </button>

        {/* 2. Quem Curtiu (Favoritos que outros usuários deram ao perfil) */}
        <button
          type="button"
          onClick={() =>
            onNavigate(
              user.isLoggedIn
                ? { type: 'my-account', activeTab: 'favorites' }
                : { type: 'login' }
            )
          }
          className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer ${
            currentView.type === 'my-account' && currentView.activeTab === 'favorites'
              ? 'text-[#0098d9] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 mb-0.5 ${
                whoFavoritedCount > 0 ? 'text-rose-500 fill-rose-500' : ''
              }`}
            />
            {whoFavoritedCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                {whoFavoritedCount > 99 ? '99+' : whoFavoritedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none">Curtiu</span>
        </button>

        {/* 3. Minha Conta / Login */}
        <button
          type="button"
          onClick={() => onNavigate(user.isLoggedIn ? { type: 'my-account' } : { type: 'login' })}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            currentView.type === 'my-account' && !currentView.activeTab
              ? 'text-[#0098d9] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5" />
            {unreadActivityCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 ring-2 ring-white"></span>
              </span>
            ) : (
              user.isLoggedIn && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white"></span>
              )
            )}
          </div>
          <span className="text-[10px] leading-none">
            {user.isLoggedIn ? 'Minha Conta' : 'Entrar'}
          </span>
        </button>
      </div>
    </nav>
  );
};
