import React from 'react';
import { PageView } from '../types/classifieds';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-16 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-gray-600 font-medium">
            <a
              href="/contato"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'contact' });
              }}
              className="hover:text-[#0098d9] transition-colors cursor-pointer"
            >
              Contato
            </a>
            <a
              href="/termos"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'terms' });
              }}
              className="hover:text-[#0098d9] transition-colors cursor-pointer"
            >
              Termos e Condições
            </a>
            <a
              href="/privacidade"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'privacy' });
              }}
              className="hover:text-[#0098d9] transition-colors cursor-pointer"
            >
              Política de Privacidade
            </a>
            <a
              href="/termos"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ type: 'terms' });
              }}
              className="hover:text-[#0098d9] transition-colors cursor-pointer"
            >
              Aviso Legal
            </a>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[#0098d9] font-medium cursor-pointer">Português</span>
            <span>·</span>
            <span className="hover:text-gray-600 cursor-pointer">English</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] gap-2">
          <p>
            Powered by best classifieds scripts <strong className="text-gray-600 font-semibold">AmorClass</strong> — Plataforma segura para encontros, namoro e relacionamentos.
          </p>
          <p>
            © {new Date().getFullYear()} AmorClass Demo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
