import { CreditCard, LayoutDashboard, ListChecks, PieChart, Receipt, TrendingUp, UploadCloud } from 'lucide-react'

export const dashboardNavigation = [
  { id: 'visao-geral', label: 'Meu mês', mobileLabel: 'Início', icon: LayoutDashboard },
  { id: 'auditoria', label: 'Conferir lançamentos', mobileLabel: 'Conferir', icon: ListChecks },
  { id: 'orcamento', label: 'Orçamento & cartões', mobileLabel: 'Orçamento', icon: CreditCard },
  { id: 'investimentos', label: 'Investimentos', mobileLabel: 'Carteira', icon: PieChart },
  { id: 'parcelamentos', label: 'Parcelamentos & dívidas', mobileLabel: 'Parcelas', icon: Receipt },
  { id: 'ingestao', label: 'Importar documentos', mobileLabel: 'Importar', icon: UploadCloud },
  { id: 'historico', label: 'Histórico mensal', mobileLabel: 'Histórico', icon: TrendingUp },
] as const
export type NavigationTab = typeof dashboardNavigation[number]['id']
const aliases: Record<string, NavigationTab> = {
  'visao-geral-graficos': 'visao-geral', lancamentos: 'auditoria',
  'categorias-planilha': 'orcamento', 'cartoes-credito': 'orcamento',
  'balanceamento-investimentos': 'investimentos', 'reserva-emergencia': 'investimentos',
  'parcelamentos-dividas': 'parcelamentos', 'consolidado-anual': 'visao-geral',
  'central-ingestao': 'ingestao', 'upload-documentos': 'ingestao', 'anexar-fatura': 'ingestao',
  'historico-mensal': 'historico',
}
export function resolveNavigationTab(hash: string): NavigationTab {
  return resolveDashboardTab(hash) || 'visao-geral'
}
export function resolveDashboardTab(hash: string): NavigationTab | undefined {
  const value = hash.replace(/^#/, '')
  return dashboardNavigation.find(item => item.id === value)?.id || aliases[value]
}
export function navigateDashboard(tab: NavigationTab, elementId?: string) {
  window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
  window.location.hash = tab
  window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab, elementId } }))
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
