import React from 'react';
import { PageView } from '../types/classifieds';

interface BreadcrumbsProps {
  view: PageView;
  onNavigate: (view: PageView) => void;
  categoryLabel?: string;
  adTitle?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  view,
  onNavigate,
  categoryLabel,
  adTitle
}) => {
  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 text-xs text-gray-500 flex items-center flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="text-[#0098d9] hover:underline cursor-pointer focus:outline-none"
        >
          AmorClass Oficial
        </button>

        {view.type === 'home' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Início</span>
          </>
        )}

        {view.type === 'search' && (
          <>
            <span className="text-gray-400">&gt;</span>
            {categoryLabel ? (
              <>
                <button
                  onClick={() => onNavigate({ type: 'search' })}
                  className="text-[#0098d9] hover:underline cursor-pointer"
                >
                  Resultados da busca
                </button>
                <span className="text-gray-400">&gt;</span>
                <span className="text-gray-700">{categoryLabel}</span>
              </>
            ) : (
              <span className="text-gray-700">Resultados da busca</span>
            )}
          </>
        )}

        {view.type === 'detail' && (
          <>
            <span className="text-gray-400">&gt;</span>
            {categoryLabel && (
              <>
                <button
                  onClick={() => onNavigate({ type: 'search', category: categoryLabel })}
                  className="text-[#0098d9] hover:underline cursor-pointer"
                >
                  {categoryLabel}
                </button>
                <span className="text-gray-400">&gt;</span>
              </>
            )}
            <span className="text-gray-700 truncate max-w-md">
              {adTitle || 'Detalhes do anúncio'}
            </span>
          </>
        )}

        {view.type === 'publish' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Publicar um anúncio</span>
          </>
        )}

        {view.type === 'login' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Acesso à sua conta</span>
          </>
        )}

        {view.type === 'favorites' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Meus Anúncios Favoritos</span>
          </>
        )}

        {view.type === 'terms' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Termos e Condições</span>
          </>
        )}

        {view.type === 'privacy' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Política de Privacidade</span>
          </>
        )}

        {view.type === 'contact' && (
          <>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-700">Fale Conosco / Contato</span>
          </>
        )}
      </div>
    </div>
  );
};
