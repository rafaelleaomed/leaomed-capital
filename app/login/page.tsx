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
  Sparkles
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const supabase = createSupabaseBrowserClient();

  // Se já estiver logado, redireciona diretamente
  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (data.user) router.replace(redirectTo);
    });
  }, [router, redirectTo, supabase]);

  // Login de Usuário Existente
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message.includes('Invalid login credentials')
          ? 'E-mail ou senha incorretos. Verifique suas credenciais.'
          : error.message
      );
      setLoading(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  // Cadastro de Novo Usuário (Médico / Pessoa Física ou Jurídica)
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

    // Se a confirmação de e-mail estiver desabilitada no Supabase, a sessão já existe
    if (data.session) {
      router.replace('/dashboard?onboarding=true');
      router.refresh();
      return;
    }

    // Caso contrário, informa que a conta foi criada
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
      {/* Background gradient de alta performance */}
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
                Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.
                Acesse sua caixa de entrada para ativar sua conta e iniciar o onboarding personalizado.
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
            /* Tela de Confirmação de Recuperação de Senha */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-blue-500/30">
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">
                E-mail de recuperação enviado!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Verifique sua caixa de entrada em <strong className="text-white">{email}</strong> para redefinir sua senha de acesso.
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
              {/* Seletor de Modo: Entrar vs Criar Conta */}
              {mode !== 'reset' && (
                <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

              {/* Título de Boas-vindas */}
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">
                  {mode === 'login'
                    ? 'Acesse seu painel financeiro'
                    : mode === 'signup'
                    ? 'Criar nova conta de médico'
                    : 'Recuperar acesso'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'login'
                    ? 'Entre com suas credenciais para gerenciar suas contas.'
                    : mode === 'signup'
                    ? 'Inicie com a planilha padrão médica e personalize suas categorias.'
                    : 'Digite seu e-mail para receber as instruções de recuperação.'}
                </p>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              )}

              <form 
                onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignUp : handleReset} 
                className="space-y-3.5"
              >
                {/* Campos adicionais exclusivos de cadastro */}
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

                    <div className="grid grid-cols-2 gap-2.5">
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
                            className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
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
                          className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
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

                {/* Password */}
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
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl py-3 text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Processando...'
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

              {/* Links de navegação entre Login, Cadastro e Recuperação */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
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
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
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
