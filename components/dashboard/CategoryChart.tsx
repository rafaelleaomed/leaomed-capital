import React from 'react'
import { Layers } from 'lucide-react'

interface CategoryData {
  name: string;
  total: number;
  percentage: number;
}

interface CategoryChartProps {
  categories: CategoryData[];
}

export function CategoryChart({ categories }: CategoryChartProps) {
  // Cores personalizadas para categorias reais
  const categoryGradients: Record<string, string> = {
    'Transporte': 'from-blue-500 to-indigo-600',
    'Casa': 'from-emerald-500 to-teal-600',
    'Compras': 'from-purple-500 to-pink-600',
    'Financiamento': 'from-amber-500 to-orange-600',
    'Saúde': 'from-rose-500 to-red-600',
    'Lazer': 'from-cyan-500 to-blue-600',
    'Restaurantes': 'from-yellow-500 to-amber-600',
    'Empresa - Despesas Fixas': 'from-slate-500 to-zinc-600'
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-500" />
            Top Categorias de Gastos (Taxonomia Real)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribuição percentual dos seus gastos consolidados</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {categories.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs text-slate-500">
            Nenhuma despesa processada para este período.
          </div>
        ) : (
          <div className="space-y-3.5">
            {categories.slice(0, 5).map((category) => {
              const gradient = categoryGradients[category.name] || 'from-emerald-500 to-teal-600'
              return (
                <div key={category.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {category.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        R$ {category.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                      style={{ width: `${Math.max(5, Math.min(100, category.percentage))}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Distribuição de Gastos & Compromissos Fixos</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Categorização 100% Automática</span>
      </div>
    </div>
  )
}
