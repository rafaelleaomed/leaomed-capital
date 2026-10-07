'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Search, 
  X, 
  ArrowRight, 
  Layers, 
  CreditCard, 
  PieChart, 
  Receipt, 
  UploadCloud, 
  PlusCircle, 
  Sliders, 
  ShieldCheck, 
  Calendar,
  Building2,
  TrendingUp,
  Tag,
  Sparkles
} from 'lucide-react'

export interface QuickFinderItem {
  id: string
  title: string
  subtitle: string
  category: 'Categoria' | 'Cartão' | 'Parcelamento' | 'Investimento' | 'Ação Rápida'
  tabTarget: 'visao-geral' | 'orcamento' | 'investimentos' | 'parcelamentos' | 'ingestao' | 'historico'
  elementId?: string
  value?: string
  badge?: string
  icon: any
}

interface GlobalQuickFinderProps {
  isOpen: boolean
  onClose: () => void
  onSelectTab: (tabId: string, elementId?: string) => void
  onOpenQuickTx: () => void
  onOpenWizard: () => void
  categories?: { name: string; total: number; percentage: number }[]
}

export function GlobalQuickFinder({
  isOpen,
  onClose,
  onSelectTab,
  onOpenQuickTx,
  onOpenWizard,
  categories = []
}: GlobalQuickFinderProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Foco automático no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Atalho global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          window.dispatchEvent(new CustomEvent('leaomed_open_quick_finder'))
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Catálogo completo de itens pesquisáveis na plataforma
  const allItems: QuickFinderItem[] = useMemo(() => {
    const items: QuickFinderItem[] = [
      // Ações Rápidas
      {
        id: 'action-new-tx',
        title: 'Adicionar Novo Lançamento',
        subtitle: 'Registrar despesa ou receita (fixa, variável ou parcelada)',
        category: 'Ação Rápida',
        tabTarget: 'visao-geral',
        icon: PlusCircle,
        badge: 'Atalho'
      },
      {
        id: 'action-upload-bill',
        title: 'Importar Fatura ou Extrato',
        subtitle: 'Fazer upload de fatura em PDF/CSV de cartão ou banco',
        category: 'Ação Rápida',
        tabTarget: 'ingestao',
        elementId: 'central-ingestao',
        icon: UploadCloud,
        badge: 'Upload'
      },
      {
        id: 'action-setup-wizard',
        title: 'Personalizar Contas e Setup',
        subtitle: 'Configurar instituições bancárias, metas e teto de gastos',
        category: 'Ação Rápida',
        tabTarget: 'visao-geral',
        icon: Sliders,
        badge: 'Setup'
      },

      // Cartões de Crédito
      {
        id: 'card-c6',
        title: 'Cartão C6 Carbon Black PF',
        subtitle: 'Limite R$ 65.000 • Pontuação Átomos • Fatura do mês',
        category: 'Cartão',
        tabTarget: 'orcamento',
        elementId: 'cartoes-credito',
        icon: CreditCard,
        badge: 'Mastercard Black'
      },
      {
        id: 'card-nu',
        title: 'Cartão Nubank Ultravioleta PF',
        subtitle: 'Limite R$ 40.000 • Cashback rendendo a 200% do CDI',
        category: 'Cartão',
        tabTarget: 'orcamento',
        elementId: 'cartoes-credito',
        icon: CreditCard,
        badge: 'Ultravioleta'
      },
      {
        id: 'card-itau',
        title: 'Cartão Itaú Personnalité PF',
        subtitle: 'Limite R$ 50.000 • Cartão principal de despesas correntes',
        category: 'Cartão',
        tabTarget: 'orcamento',
        elementId: 'cartoes-credito',
        icon: CreditCard,
        badge: 'Visa Infinite'
      },

      // Parcelamentos & Financiamentos
      {
        id: 'debt-safra',
        title: 'Financiamento Banco Safra (T-Cross)',
        subtitle: 'R$ 3.336,42/mês • 18 parcelas restantes • Quitação em Out/2027',
        category: 'Parcelamento',
        tabTarget: 'parcelamentos',
        elementId: 'parcelamentos-dividas',
        icon: Receipt,
        value: 'R$ 3.336,42',
        badge: 'Prioridade'
      },
      {
        id: 'debt-localiza',
        title: 'Aluguel Cartão Localiza Meoo',
        subtitle: 'R$ 6.837,00/mês • 12 parcelas restantes • Quitação em Out/2027',
        category: 'Parcelamento',
        tabTarget: 'parcelamentos',
        elementId: 'parcelamentos-dividas',
        icon: Receipt,
        value: 'R$ 6.837,00',
        badge: 'Alívio R$ 10k+'
      },
      {
        id: 'debt-gramado',
        title: 'Cota Multipropriedade Gramado Parks',
        subtitle: 'R$ 684,00/mês • Despesa fixa de investimento em lazer',
        category: 'Parcelamento',
        tabTarget: 'parcelamentos',
        elementId: 'parcelamentos-dividas',
        icon: Receipt,
        value: 'R$ 684,00'
      },

      // Investimentos & Patrimônio
      {
        id: 'inv-rebalance',
        title: 'Otimizador de Aportes & Rebalanceamento',
        subtitle: 'Distribuição entre Renda Fixa, Ações, FIIs, Internacional e Cripto',
        category: 'Investimento',
        tabTarget: 'investimentos',
        elementId: 'balanceamento-investimentos',
        icon: PieChart,
        badge: 'Simulador'
      },
      {
        id: 'inv-emergency',
        title: 'Reserva de Emergência Familiar & Clínica',
        subtitle: 'Termômetro de liquidez imediata com cobertura de 6 a 12 meses',
        category: 'Investimento',
        tabTarget: 'investimentos',
        elementId: 'reserva-emergencia',
        icon: ShieldCheck,
        badge: 'Segurança'
      },
      {
        id: 'inv-renda-fixa',
        title: 'Carteira de Renda Fixa (CDI / Tesouro)',
        subtitle: '43.2% do patrimônio investido • R$ 77.141,92 alocados',
        category: 'Investimento',
        tabTarget: 'investimentos',
        icon: TrendingUp,
        value: 'R$ 77.141,92'
      },

      // Tributos & Gestão Médica PJ
      {
        id: 'pj-das',
        title: 'Tributos DAS Simples Nacional PJ',
        subtitle: 'Guia unificada mensal de tributos sobre plantões e contratos',
        category: 'Categoria',
        tabTarget: 'orcamento',
        elementId: 'categorias-planilha',
        icon: Building2,
        value: 'R$ 2.764,77',
        badge: 'Simples Nacional'
      },
      {
        id: 'pj-inter',
        title: 'Tarifas Bancárias Banco Inter PJ',
        subtitle: 'Manutenção de conta médica e emissão de boletos',
        category: 'Categoria',
        tabTarget: 'orcamento',
        elementId: 'categorias-planilha',
        icon: Building2,
        value: 'R$ 491,21'
      }
    ]

    // Injeta categorias dinâmicas do payload atual
    categories.forEach((cat) => {
      if (!items.some(i => i.title.toLowerCase().includes(cat.name.toLowerCase()))) {
        items.push({
          id: `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
          title: `Categoria: ${cat.name}`,
          subtitle: `${cat.percentage.toFixed(1)}% do total • R$ ${cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          category: 'Categoria',
          tabTarget: 'orcamento',
          elementId: 'categorias-planilha',
          icon: Tag,
          value: `R$ ${cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        })
      }
    })

    return items
  }, [categories])

  // Filtragem dos itens em tempo real
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems.slice(0, 8)
    }
    const q = query.toLowerCase().trim()
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.value && item.value.toLowerCase().includes(q))
    )
  }, [allItems, query])

  // Teclado: Navegar pelas setas e dar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex])
      }
    }
  }

  const handleSelectItem = (item: QuickFinderItem) => {
    onClose()
    if (item.id === 'action-new-tx') {
      onOpenQuickTx()
    } else if (item.id === 'action-setup-wizard') {
      onOpenWizard()
    } else {
      onSelectTab(item.tabTarget, item.elementId)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      {/* Modal Container */}
      <div 
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Barra de Pesquisa Superior */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Buscar despesa, cartão, categoria, contrato (ex: Safra, C6, Transporte, Fatura)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              ESC para sair
            </div>
          )}
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100 dark:divide-white/5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nenhum resultado encontrado para &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tente buscar por &apos;Cartão&apos;, &apos;Safra&apos;, &apos;Investimentos&apos; ou &apos;Transporte&apos;.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                    {item.value && (
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md hidden sm:inline-flex items-center gap-1">
                      <span>Ir</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 font-mono text-[10px]">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 font-mono text-[10px]">ENTER</kbd>
              <span>Selecionar</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-500 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Busca Inteligente LeãoMed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
