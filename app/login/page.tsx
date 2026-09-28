'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/utils/supabase-client';
import { Eye, EyeOff, TrendingUp, Lock, Mail, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);

  const supabase = createSupabaseBrowserClient();

  // Verifica se já está logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (data.user) router.replace(redirectTo);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message.includes('Invalid login credentials')
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
      setLoading(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 rounded-2xl mb-4">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            LeãoMed Capital
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Plataforma Financeira Inteligente
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {mode === 'reset' && resetSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                E-mail enviado!
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Verifique sua caixa de entrada para redefinir a senha.
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
              >
                ← Voltar para o login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-6">
                {mode === 'login' ? 'Entrar na sua conta' : 'Recuperar senha'}
              </h2>

              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={mode === 'login' ? handleLogin : handleReset} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
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
                      className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password (only in login mode) */}
                {mode === 'login' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 mt-2"
                >
                  {loading
                    ? 'Aguarde...'
                    : mode === 'login'
                    ? 'Entrar'
                    : 'Enviar link de recuperação'
                  }
                </button>
              </form>

              {/* Footer links */}
              <div className="mt-6 text-center space-y-3">
                {mode === 'login' ? (
                  <button
                    onClick={() => { setMode('reset'); setError(null); }}
                    className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                ) : (
                  <button
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
                  >
                    ← Voltar para o login
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Demo link */}
        <p className="text-center mt-6 text-slate-500 text-sm">
          Quer ver sem criar conta?{' '}
          <a href="/demo" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            Ver demonstração →
          </a>
        </p>
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
