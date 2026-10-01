'use client'

import { useEffect, useState } from 'react'
import { Download, Sparkles, X, Check, Smartphone, Share2, MoreVertical } from 'lucide-react'

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  useEffect(() => {
    // 1. Verificar se já está rodando como PWA instalado
    const checkStandalone = () => {
      try {
        const isStandaloneMode = 
          (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
          (typeof window !== 'undefined' && (window.navigator as any).standalone === true) ||
          (typeof document !== 'undefined' && typeof document.referrer === 'string' && document.referrer.includes('android-app://'))
        setIsStandalone(Boolean(isStandaloneMode))
      } catch (_) {
        setIsStandalone(false)
      }
    }
    checkStandalone()

    // 2. Registrar Service Worker resiliente
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      const registerSw = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Verifica atualizações do SW periodicamente
            if (reg && typeof reg.update === 'function') {
              reg.update().catch(() => {})
            }
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker não registrado:', err)
          })
      }

      if (document.readyState === 'complete') {
        registerSw()
      } else {
        window.addEventListener('load', registerSw)
      }
    }

    // 3. Capturar evento de instalação nativo do Chrome Android
    const handleBeforeInstall = (e: Event) => {
      try {
        e.preventDefault()
        setDeferredPrompt(e)
        
        let dismissed = false
        try {
          dismissed = Boolean(sessionStorage.getItem('leaomed_pwa_install_dismissed'))
        } catch (_) {}

        if (!dismissed) {
          setShowInstallBanner(true)
        }
      } catch (_) {}
    }

    // 4. Ouvir gatilho disparado por botões na interface ("Instalar App")
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        handleInstallClick()
      } else {
        setShowInstructionsModal(true)
      }
    }

    // 5. Detectar quando foi instalado com sucesso
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallBanner(false)
      setShowInstructionsModal(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('leaomed_trigger_pwa_install', handleTriggerInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('leaomed_trigger_pwa_install', handleTriggerInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstructionsModal(true)
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    try {
      sessionStorage.setItem('leaomed_pwa_install_dismissed', 'true')
    } catch (_) {}
  }

  return (
    <>
      {/* Banner Flutuante de Instalação na Tela Inicial (para quem não instalou) */}
      {!isStandalone && showInstallBanner && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white border border-emerald-500/30 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 shadow-sm bg-slate-950 p-0.5">
                <img 
                  src="/icon-192x192.png" 
                  alt="LeãoMed Logo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>Instalar LeãoMed</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    App
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Adicione à tela inicial com o ícone oficial do Leão em tela cheia.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Passo a Passo de Instalação (se clicou no menu ou o prompt nativo já expirou) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 p-0.5 bg-slate-950 shrink-0">
                  <img src="/icon-192x192.png" alt="LeãoMed" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Instalar LeãoMed Capital
                  </h3>
                  <p className="text-[11px] text-slate-400">Aplicativo nativo na tela inicial</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deferredPrompt ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Seu navegador está pronto para instalar o aplicativo com o ícone oficial na tela inicial:
                </p>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Agora no Celular</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>No Android (Google Chrome / Samsung):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
                    <li>Selecione a opção <strong>&quot;Instalar aplicativo&quot;</strong> (ou &quot;Adicionar à tela inicial&quot;).</li>
                    <li>Confirme em <strong>&quot;Instalar&quot;</strong>.</li>
                  </ol>
                  <p className="text-[10px] text-slate-400 pt-1">
                    * O Android criará o app com o ícone dourado do Leão sem a tag do navegador.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="font-bold text-teal-400 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span>No iPhone (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</li>
                    <li>Role para baixo e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</li>
                    <li>Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior direito.</li>
                  </ol>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
