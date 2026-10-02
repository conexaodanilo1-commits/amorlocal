import React, { useState } from 'react';
import { PageView } from '../types/classifieds';
import { ShieldCheck, Mail, Send, Check } from 'lucide-react';

interface StaticPagesProps {
  type: 'terms' | 'privacy' | 'contact';
  onNavigate: (view: PageView) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ type, onNavigate }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 4000);
  };

  if (type === 'contact') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-normal text-gray-900 font-osclass-serif mb-2">
          Fale Conosco
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Dúvidas, sugestões ou suporte sobre sua conta e anúncios de namoro no AmorClass.
        </p>

        {contactSent ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>Sua mensagem foi enviada à nossa equipe de moderação. Responderemos em até 24 horas.</span>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-6 space-y-4 text-xs sm:text-sm">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Seu E-mail</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Assunto</label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Dúvida, denúncia de perfil ou sugestão"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mensagem</label>
                <textarea
                  required
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0098d9]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-white border border-[#0098d9] text-[#0098d9] hover:bg-[#0098d9] hover:text-white transition-colors font-semibold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Mensagem</span>
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  if (type === 'terms') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-700 text-sm leading-relaxed space-y-4">
        <h1 className="text-3xl font-normal text-gray-900 font-osclass-serif mb-4">
          Termos e Condições de Uso
        </h1>
        <p className="text-xs text-gray-500 mb-6">Última atualização: 01 de Outubro, 2026</p>

        <section className="bg-white border border-gray-200 p-6 space-y-3">
          <h2 className="text-base font-bold text-gray-900">1. Objetivo da Plataforma</h2>
          <p>
            O AmorClass é uma plataforma de classificados destinada à publicação de anúncios de namoro, encontros, companheirismo e relacionamentos pessoais entre maiores de 18 anos.
          </p>

          <h2 className="text-base font-bold text-gray-900 pt-2">2. Conduta do Usuário & Moderação</h2>
          <p>
            É estritamente proibida a publicação de conteúdos que promovam assédio, ódio, discriminação, golpes financeiros ou exploração. Perfis falsos, uso de fotos de terceiros sem autorização ou anúncios fraudulentos serão sumariamente banidos.
          </p>

          <h2 className="text-base font-bold text-gray-900 pt-2">3. Responsabilidade</h2>
          <p>
            Os usuários são responsáveis pela veracidade das informações fornecidas em seus anúncios e pelas mensagens trocadas. Recomendamos cautela ao marcar encontros presenciais.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-700 text-sm leading-relaxed space-y-4">
      <h1 className="text-3xl font-normal text-gray-900 font-osclass-serif mb-4">
        Política de Privacidade
      </h1>
      <p className="text-xs text-gray-500 mb-6">Última atualização: 01 de Outubro, 2026</p>

      <section className="bg-white border border-gray-200 p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900">1. Proteção de Dados Pessoais</h2>
        <p>
          O AmorClass respeita a privacidade de todos os seus membros em conformidade com as leis de proteção de dados (LGPD). Informações sensíveis de contato só são exibidas na página pública se expressamente autorizadas pelo usuário.
        </p>

        <h2 className="text-base font-bold text-gray-900 pt-2">2. Comunicação Segura</h2>
        <p>
          Mensagens privadas enviadas pela plataforma são transmitidas de maneira criptografada para assegurar o sigilo das comunicações entre interessados.
        </p>
      </section>
    </div>
  );
};
