'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, Check, Layers3, Loader2, Pencil, RefreshCw } from 'lucide-react'
import { getCategoryMergeRecommendations } from '@/utils/categoryManagement'

interface CategoryItem {
  category: string
  subcategory?: string | null
  transaction_count: number
}

interface CategoryManagementPanelProps {
  onChanged?: () => void
}

// Fix LE-1: estados independentes por seção — renomear, mesclar e subcategoria não compartilham sourceCategory/targetCategory
export function CategoryManagementPanel({ onChanged }: CategoryManagementPanelProps) {
  const [items, setItems] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Seção: Renomear categoria (estados isolados)
  const [renameSource, setRenameSource] = useState('')
  const [renameTarget, setRenameTarget] = useState('')

  // Seção: Mesclar categorias (estados isolados)
  const [mergeSource, setMergeSource] = useState('')
  const [mergeDest, setMergeDest] = useState('')

  // Seção: Subcategorias (estados isolados)
  const [subSource, setSubSource] = useState('')
  const [subSourceSub, setSubSourceSub] = useState('')
  const [subDest, setSubDest] = useState('')
  const [subDestSub, setSubDestSub] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/categories')
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'Não foi possível carregar as categorias.')
      const loaded = Array.isArray(result.items) ? result.items : []
      setItems(loaded)
      const names = [...new Set<string>(loaded.map((item: CategoryItem) => String(item.category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
      const firstCategory = names[0] || ''
      const secondCategory = names[1] || ''
      setRenameSource(current => current || firstCategory)
      setMergeSource(current => current || firstCategory)
      setMergeDest(current => current || secondCategory)
      setSubSource(current => current || firstCategory)
      setSubDest(current => current || firstCategory)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as categorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const categories = useMemo(() => {
    const map = new Map<string, { count: number; subcategories: Map<string, number> }>()
    items.forEach(item => {
      const category = String(item.category || '').trim()
      if (!category) return
      const current = map.get(category) || { count: 0, subcategories: new Map<string, number>() }
      const count = Number(item.transaction_count) || 0
      current.count += count
      const subcategory = String(item.subcategory || '').trim()
      if (subcategory) current.subcategories.set(subcategory, (current.subcategories.get(subcategory) || 0) + count)
      map.set(category, current)
    })
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      subcategories: Array.from(data.subcategories.entries()).map(([subName, count]) => ({ name: subName, count }))
    })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [items])

  // Fix S-2: memoizar lista estática de recomendações
  const recommendations = useMemo(() => getCategoryMergeRecommendations(), [])

  const sourceSubs = categories.find(category => category.name === subSource)?.subcategories || []
  const destSubs = categories.find(category => category.name === subDest)?.subcategories || []

  useEffect(() => { setSubSourceSub(sourceSubs[0]?.name || '') }, [subSource, items])
  useEffect(() => { setSubDestSub(destSubs[0]?.name || '') }, [subDest, items])

  const mutate = async (payload: Record<string, string>, confirmation?: string) => {
    if (confirmation && !window.confirm(confirmation)) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'Não foi possível atualizar as categorias.')
      setMessage(`${Number(result.transaction_count) || 0} lançamento(s) e ${Number(result.rule_count) || 0} regra(s) atualizados.`)
      setRenameTarget('')
      await load()
      onChanged?.()
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Não foi possível atualizar as categorias.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-[var(--capital-text,#242a2e)] flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-[var(--capital-success,#157449)]" />
              Categorias e subcategorias
            </h3>
            <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
              Renomeie ou mescle itens. A alteração alcança somente seus lançamentos históricos e suas regras.
            </p>
          </div>
          <button type="button" onClick={load} disabled={loading || saving} className="p-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] disabled:opacity-50" title="Atualizar lista">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-[var(--capital-danger,#ad3333)] bg-[var(--capital-danger-soft,#fcecec)] p-3 text-xs font-semibold text-[var(--capital-danger,#ad3333)]">{error}</div>}
      {message && <div className="rounded-xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] p-3 text-xs font-semibold text-[var(--capital-success,#157449)]">{message}</div>}

      {loading ? (
        <div className="py-16 flex items-center justify-center text-sm text-[var(--capital-muted,#242a2e)]"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...</div>
      ) : (
        <>
          {/* Recomendações automáticas */}
          <div className="rounded-xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] p-4 space-y-3">
            <div className="font-bold text-sm text-[var(--capital-text,#242a2e)]">Revisão recomendada</div>
            {recommendations.map(recommendation => {
              // Fix S-1: comparação insensível a maiúsculas/acentos ao verificar existência
              const sourceExists = categories.some(category =>
                category.name.toLocaleLowerCase('pt-BR') === recommendation.sourceCategory.toLocaleLowerCase('pt-BR')
              )
              return (
                <div key={recommendation.sourceCategory} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] p-3">
                  <div className="text-xs">
                    <strong>{recommendation.sourceCategory}</strong> → <strong>{recommendation.targetCategory}</strong>
                    <div className="text-[var(--capital-muted,#242a2e)] mt-0.5">{recommendation.reason}</div>
                  </div>
                  <button
                    type="button"
                    disabled={!sourceExists || saving}
                    onClick={() => mutate(
                      { action: 'merge_category', sourceCategory: recommendation.sourceCategory, targetCategory: recommendation.targetCategory },
                      `Mesclar "${recommendation.sourceCategory}" em "${recommendation.targetCategory}" em todos os seus lançamentos?`
                    )}
                    className="px-3 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] text-xs font-bold disabled:opacity-40"
                  >
                    {sourceExists ? 'Mesclar agora' : 'Já revisado'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Seção: Renomear categoria — estados próprios: renameSource, renameTarget */}
            <section className="rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] p-4 space-y-3">
              <h4 className="font-bold text-sm flex items-center gap-2"><Pencil className="w-4 h-4" /> Renomear categoria</h4>
              <select value={renameSource} onChange={event => setRenameSource(event.target.value)} className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs">
                {categories.map(category => <option key={category.name} value={category.name}>{category.name} ({category.count})</option>)}
              </select>
              <input value={renameTarget} onChange={event => setRenameTarget(event.target.value)} placeholder="Novo nome da categoria" className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs" />
              {/* Fix LE-1: renomeação também exige confirmação — operação irreversível em massa */}
              <button
                type="button"
                disabled={saving || !renameSource || !renameTarget.trim()}
                onClick={() => mutate(
                  { action: 'rename_category', sourceCategory: renameSource, targetCategory: renameTarget.trim() },
                  `Renomear "${renameSource}" para "${renameTarget.trim()}" em todos os seus lançamentos e regras?`
                )}
                className="w-full px-3 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Renomear categoria
              </button>
            </section>

            {/* Seção: Mesclar categorias — estados próprios: mergeSource, mergeDest */}
            <section className="rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] p-4 space-y-3">
              <h4 className="font-bold text-sm flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Mesclar categorias</h4>
              <select value={mergeSource} onChange={event => setMergeSource(event.target.value)} className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs">
                {categories.map(category => <option key={category.name} value={category.name}>De: {category.name}</option>)}
              </select>
              <select value={mergeDest} onChange={event => setMergeDest(event.target.value)} className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs">
                {categories.filter(category => category.name !== mergeSource).map(category => <option key={category.name} value={category.name}>Para: {category.name}</option>)}
              </select>
              <button
                type="button"
                disabled={saving || !mergeSource || !mergeDest || mergeSource === mergeDest}
                onClick={() => mutate(
                  { action: 'merge_category', sourceCategory: mergeSource, targetCategory: mergeDest },
                  `Mesclar "${mergeSource}" em "${mergeDest}" em todos os seus lançamentos?`
                )}
                className="w-full px-3 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] text-xs font-bold disabled:opacity-40"
              >
                Mesclar categorias
              </button>
            </section>

            {/* Seção: Subcategorias — estados próprios: subSource, subSourceSub, subDest, subDestSub */}
            <section className="rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] p-4 space-y-3 lg:col-span-2">
              <h4 className="font-bold text-sm">Editar ou mesclar subcategoria</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <select value={subSource} onChange={event => setSubSource(event.target.value)} className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs">
                    {categories.map(category => <option key={category.name} value={category.name}>{category.name}</option>)}
                  </select>
                  <select value={subSourceSub} onChange={event => setSubSourceSub(event.target.value)} className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs">
                    {sourceSubs.map(subcategory => <option key={subcategory.name} value={subcategory.name}>{subcategory.name} ({subcategory.count})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <select value={subDest} onChange={event => setSubDest(event.target.value)} className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs">
                    {categories.map(category => <option key={category.name} value={category.name}>{category.name}</option>)}
                  </select>
                  <input value={subDestSub} onChange={event => setSubDestSub(event.target.value)} placeholder="Nome da subcategoria de destino" className="w-full rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={saving || !subSourceSub || !subDestSub.trim()}
                  onClick={() => mutate(
                    { action: 'rename_subcategory', sourceCategory: subSource, sourceSubcategory: subSourceSub, targetCategory: subSource, targetSubcategory: subDestSub.trim() },
                    `Renomear subcategoria "${subSourceSub}" para "${subDestSub.trim()}" dentro de "${subSource}"?`
                  )}
                  className="px-3 py-2 rounded-xl border border-[var(--capital-accent,#927025)] text-xs font-bold disabled:opacity-40"
                >
                  Renomear subcategoria
                </button>
                <button
                  type="button"
                  disabled={saving || !subSourceSub || !subDest || !subDestSub.trim()}
                  onClick={() => mutate(
                    { action: 'merge_subcategory', sourceCategory: subSource, sourceSubcategory: subSourceSub, targetCategory: subDest, targetSubcategory: subDestSub.trim() },
                    `Mesclar "${subSourceSub}" em "${subDest} > ${subDestSub.trim()}"?`
                  )}
                  className="px-3 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] text-xs font-bold disabled:opacity-40"
                >
                  Mesclar subcategoria
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
