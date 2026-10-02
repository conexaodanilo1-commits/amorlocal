import React, { useState } from 'react';
import { DatingListing, PageView, UserSession } from '../types/classifieds';
import { Check, ShieldCheck, UserPlus, LogIn, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (userData: Partial<UserSession>) => void;
  onNavigate: (view: PageView) => void;
  redirectTargetListingId?: string;
  registerFirst?: boolean;
  targetListing?: DatingListing;
  user: UserSession;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onNavigate,
  redirectTargetListingId,
  registerFirst = false,
  targetListing,
  user
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(registerFirst);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setStatusMessage(isRegisterMode ? 'Gravando cadastro no banco de dados...' : 'Verificando dados...');
    
    const userPayload: Partial<UserSession> = {
      email: email.trim(),
      name: isRegisterMode ? (name.trim() || email.split('@')[0]) : (name.trim() || email.split('@')[0]),
      phone: phone.trim() || '(11) 98765-4321',
      isLoggedIn: true
    };

    try {
      await onLogin(userPayload);
      setStatusMessage(isRegisterMode ? 'Conta criada e gravada com sucesso!' : 'Acesso confirmado!');

      setTimeout(() => {
        // Flow: if there is a target listing to talk to
        if (redirectTargetListingId) {
          // If user already had a profile published, return directly to target profile
          if (user.myListingIds && user.myListingIds.length > 0) {
            onNavigate({
              type: 'detail',
              listingId: redirectTargetListingId,
              autoOpenContact: true
            });
          } else {
            // Otherwise, step 2: take user to publish their profile
            onNavigate({
              type: 'publish',
              returnToListingId: redirectTargetListingId
            });
          }
        } else {
          onNavigate({ type: 'home' });
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setStatusMessage('Erro ao salvar usuário no banco. Tente novamente.');
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@demo.com');
    setPassword('demo1234');
    setName('Usuário Demo');
    setIsRegisterMode(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-12">
      {/* Onboarding Banner when redirected from a profile */}
      {redirectTargetListingId && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-5 h-5 rounded-full bg-[#0098d9] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              1
            </span>
            <span>Passo 1 de 2: Crie sua conta gratuita</span>
          </div>
          <p className="text-xs text-sky-800 leading-relaxed">
            Para falar com <strong>{targetListing?.contact.name || 'este perfil'}</strong>, primeiro cadastre-se. No próximo passo você criará seu perfil de namoro e logo em seguida retornará para a conversa!
          </p>
        </div>
      )}

      {/* Title - Matching screenshot 1 */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 font-osclass-serif leading-tight">
          {isRegisterMode ? 'Criar sua conta gratuita' : 'Acesso à sua conta'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {isRegisterMode
            ? 'Cadastre-se gratuitamente para publicar anúncios e conversar'
            : 'Entre com seu e-mail e senha cadastrados'}
        </p>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0098d9]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Form Container - Exactly like screenshot 1 */}
      <div className="bg-white border border-gray-200 p-5 sm:p-8 space-y-5 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {isRegisterMode && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Nome completo ou apelido
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 text-gray-900 text-base sm:text-sm focus:outline-none focus:border-[#0098d9]"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@demo.com"
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 text-gray-900 text-base sm:text-sm focus:outline-none focus:border-[#0098d9]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 text-gray-900 text-base sm:text-sm focus:outline-none focus:border-[#0098d9]"
            />
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Telefone / WhatsApp (opcional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 text-gray-900 text-base sm:text-sm focus:outline-none focus:border-[#0098d9]"
              />
            </div>
          )}

          {!isRegisterMode && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#0098d9] rounded border-gray-300 focus:ring-0"
                />
                <span>Lembrar-me</span>
              </label>
            </div>
          )}

          {/* Action button - Responsive */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 sm:py-2.5 bg-[#0098d9] sm:bg-white text-white sm:text-[#0098d9] border sm:border-[#0098d9] hover:bg-[#0077aa] sm:hover:bg-[#0098d9] sm:hover:text-white transition-colors duration-150 font-bold sm:font-semibold text-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer links: Register & Forgot password - Matching screenshot 1 */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#0098d9]">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="hover:underline cursor-pointer"
          >
            {isRegisterMode
              ? 'Já tem uma conta? Fazer login'
              : 'Registrar uma conta gratuita'}
          </button>

          {!isRegisterMode && (
            <button
              type="button"
              onClick={() => setStatusMessage('Instruções de recuperação de senha foram enviadas para o seu e-mail.')}
              className="hover:underline text-gray-500 hover:text-[#0098d9] cursor-pointer"
            >
              Esqueceu a senha?
            </button>
          )}
        </div>

        {/* Quick Demo Login Preset Helper */}
        <div className="pt-3 border-t border-dashed border-gray-200 text-center">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-[11px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
          >
            Usar credenciais de demonstração (demo@demo.com)
          </button>
        </div>
      </div>
    </div>
  );
};
