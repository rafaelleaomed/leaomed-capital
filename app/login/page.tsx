'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/utils/supabase-client';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  LogIn, 
  User, 
  Stethoscope,
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Loader2
} from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [crm, setCrm] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const supabase = createSupabaseBrowserClient();

  // Se já estiver logado, redireciona diretamente com cookies propagados
  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (data?.user) {
        window.location.href = redirectTo;
      }
    });
  }, [redirectTo, supabase]);

  // Captura erros vindos de callbacks de autenticação
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      if (urlError === 'auth_callback_failed' || urlError === 'missing_auth_parameters') {
        setError('Não foi possível validar seu link de acesso. Por favor, tente entrar novamente.');
      } else if (urlError === 'auth_config_error') {
        setError('Serviço de autenticação temporariamente indisponível. Tente novamente.');
      } else if (urlError === 'session_expired') {
        setError('Sua sessão expirou ou não pôde ser iniciada. Faça login novamente.');
      } else {
        setError(decodeURIComponent(urlError));
      }
    }
  }, [searchParams]);

  // Autenticação com Google OAuth com 1 Clique
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const redirectUrl = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
        ? `${window.location.origin}/api/auth/callback`
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app') + '/api/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        setError(`Erro ao autenticar com Google: ${error.message}`);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError('Falha ao inicializar o login do Google.');
      setGoogleLoading(false);
    }
  };

  // Login com E-mail e Senha (com Sessão Persistente 365 dias)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message.includes('Invalid login credentials')
          ? 'E-mail ou senha incorretos. Verifique suas credenciais.'
          : error.message
      );
      setLoading(false);
      return;
    }

    if (data?.session) {
      // Redirecionamento com sincronização de cookies 100% garantida
      window.location.href = redirectTo;
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  // Cadastro Simplificado de Novo Usuário (com Auto-Login Imediato)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    const redirectUrl = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
      ? `${window.location.origin}/api/auth/callback`
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app') + '/api/auth/callback';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim() || undefined,
          specialty: specialty.trim() || undefined,
          crm: crm.trim() || undefined,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setError(
        error.message.includes('User already registered')
          ? 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.'
          : error.message
      );
      setLoading(false);
      return;
    }

    // Se já gerou sessão direta (auto-confirm ativo no Supabase), entra imediatamente
    if (data.session) {
      router.replace('/dashboard');
      router.refresh();
      return;
    }

    // Tenta autenticar diretamente
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInData?.session && !signInErr) {
      router.replace('/dashboard');
      router.refresh();
      return;
    }

    // Caso a confirmação de e-mail esteja estritamente ativada no projeto Supabase
    setSignupSuccess(true);
    setLoading(false);
  };

  // Recuperação de Senha
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectUrl = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
      ? `${window.location.origin}/api/auth/callback`
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app') + '/api/auth/callback';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo / Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 border border-emerald-500/30 rounded-2xl mb-3 overflow-hidden shadow-xl shadow-emerald-500/10">
            <img src="/logo.jpg" alt="LeãoMed Capital Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            LeãoMed Capital
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gestão Financeira Médica Integrada (PJ + PF) & IA
          </p>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tela de Confirmação de Cadastro */}
          {mode === 'signup' && signupSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Conta criada com sucesso!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Enviamos um link de ativação para <strong className="text-white">{email}</strong>.
              </p>
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => { setMode('login'); setSignupSuccess(false); }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Fazer login agora
                </button>
                <a
                  href="/demo"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Continuar explorando a demonstração →
                </a>
              </div>
            </div>
          ) : mode === 'reset' && resetSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-blue-500/30">
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">
                E-mail de recuperação enviado!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Verifique sua caixa de entrada em <strong className="text-white">{email}</strong> para redefinir sua senha.
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer mt-2"
              >
                ← Voltar para o login
              </button>
            </div>
          ) : (
            <>
              {/* Botão Oficial: Login com Google com 1 Clique */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md active:scale-98 cursor-pointer disabled:opacity-60 mb-5"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                ) : (
                  <GoogleIcon />
                )}
                <span>Continuar com o Google</span>
              </button>

              {/* Divisor com "ou continue com e-mail" */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider font-semibold text-slate-500 shrink-0">
                  ou continue com e-mail
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Seletor de Modo: Entrar vs Criar Conta */}
              {mode !== 'reset' && (
                <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'login'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'signup'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Criar Conta</span>
                  </button>
                </div>
              )}

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              )}

              <form 
                onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignUp : handleReset} 
                className="space-y-3"
              >
                {/* Campos adicionais de cadastro */}
                {mode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. Rafael Leão"
                          className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Especialidade <span className="text-slate-500 font-normal">(Opcional)</span>
                        </label>
                        <div className="relative">
                          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            placeholder="Ex: Cirurgia Geral"
                            className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          CRM / UF <span className="text-slate-500 font-normal">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={crm}
                          onChange={(e) => setCrm(e.target.value)}
                          placeholder="123456/MG"
                          className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="seu@email.com"
                      className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Senha */}
                {mode !== 'reset' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Senha
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('reset'); setError(null); }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Lembrar deste dispositivo (Persistência) */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 transition-all cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-300 font-medium">
                        Permanecer conectado neste aparelho
                      </span>
                    </label>
                  </div>
                )}

                {/* Confirmação de Senha no Cadastro */}
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl py-3 text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer mt-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </span>
                  ) : mode === 'login' ? (
                    <>
                      <span>Entrar no Painel</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Criar Conta de Médico</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </button>
              </form>

              {/* Links de navegação */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                {mode === 'login' ? (
                  <p className="text-xs text-slate-400">
                    Não tem uma conta ainda?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError(null); }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                    >
                      Cadastre-se gratuitamente →
                    </button>
                  </p>
                ) : mode === 'signup' ? (
                  <p className="text-xs text-slate-400">
                    Já possui cadastro?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(null); }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                    >
                      Fazer login na conta →
                    </button>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-xs text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    ← Voltar para o login
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Link para o Modo Demonstração Pública */}
        <div className="text-center mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Quer conhecer antes de criar conta?</span>
          <a 
            href="/demo" 
            className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold underline"
          >
            Ver Demonstração Pública →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  );
}
