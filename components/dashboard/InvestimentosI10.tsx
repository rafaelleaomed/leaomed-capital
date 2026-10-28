'use client'

import React, { useState, useEffect, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SummaryData {
  applied?: string | number
  equity?: string | number
  variation?: string | number
  profit_amount?: string | number
  profit_twr?: string | number
  profit_twr_12m?: string | number
  profit_twr_12m_amount?: string | number
  currency?: string
}

interface AllocationItem {
  ticker?: string
  name?: string
  label?: string
  value?: string | number
  percentage?: string | number
  total?: string | number
}

type I10Response =
  | { configured: false; error?: string }
  | { configured: true; summary: SummaryData; allocation: AllocationItem[] | Record<string, unknown>; error?: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: string | number | undefined): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return 'R$ —'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function formatPct(value: string | number | undefined, decimals = 2): string {
  const num = parseFloat(String(value ?? '0'))
  if (isNaN(num)) return '—%'
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`
}

function normalizeAllocation(allocation: AllocationItem[] | Record<string, unknown>): AllocationItem[] {
  if (Array.isArray(allocation)) return allocation
  // Alguns endpoints retornam um objeto com chave "data" ou similar
  const arr = (allocation as Record<string, unknown>)['data'] ?? (allocation as Record<string, unknown>)['items']
  return Array.isArray(arr) ? arr : []
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function InvestimentosI10() {
  const [data, setData] = useState<I10Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletInput, setWalletInput] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/investidor10', { credentials: 'same-origin' })
      const json: I10Response = await res.json()
      setData(json)
      setFetchedAt(new Date())
    } catch {
      setData({ configured: false, error: 'Não foi possível carregar os dados.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletInput.trim()) return

    setConnecting(true)
    setConnectError('')

    try {
      const res = await fetch('/api/investidor10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ walletUrl: walletInput.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setConnectError(json.error ?? 'Erro ao conectar carteira.')
      } else {
        setWalletInput('')
        await fetchData()
      }
    } catch {
      setConnectError('Erro de rede ao conectar carteira.')
    } finally {
      setConnecting(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="capital-panel accent-border" aria-busy="true">
        <div className="panel-heading">
          <h2>Carteira de Investimentos</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--capital-muted)', fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Carregando dados da carteira…
        </div>
      </div>
    )
  }

  // ── Não configurado ─────────────────────────────────────────────────────────
  if (!data?.configured) {
    return (
      <div className="capital-panel accent-border">
        <div className="panel-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="panel-icon" aria-hidden="true">
              {/* ícone: gráfico de pizza */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                <path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
            </span>
            <h2>Carteira de Investimentos</h2>
          </div>
        </div>

        <p className="small-note" style={{ marginBottom: 20 }}>
          Cole o link da sua carteira do Investidor10 para visualizar seus investimentos aqui.
        </p>

        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
          <input
            type="text"
            value={walletInput}
            onChange={e => setWalletInput(e.target.value)}
            placeholder="https://investidor10.com.br/wallet/public/SEU_ID"
            disabled={connecting}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--capital-line)',
              borderRadius: 8,
              background: 'var(--capital-neutral)',
              color: 'var(--capital-text)',
              fontSize: 13,
            }}
            aria-label="Link da carteira Investidor10"
          />
          {connectError && (
            <p style={{ color: 'var(--capital-danger)', fontSize: 12, margin: 0 }} role="alert">
              {connectError}
            </p>
          )}
          <button
            type="submit"
            className="capital-primary-button"
            disabled={connecting || !walletInput.trim()}
            style={{ alignSelf: 'flex-start' }}
          >
            {connecting ? 'Conectando…' : 'Conectar carteira'}
          </button>
        </form>
      </div>
    )
  }

  // ── Dados disponíveis ───────────────────────────────────────────────────────
  const { summary, allocation: rawAllocation } = data
  const allocation = normalizeAllocation(rawAllocation as AllocationItem[] | Record<string, unknown>)

  const equity = parseFloat(String(summary.equity ?? '0'))
  const applied = parseFloat(String(summary.applied ?? '0'))
  const profitAmount = parseFloat(String(summary.profit_amount ?? '0'))
  const variation = parseFloat(String(summary.variation ?? '0'))
  const twr12m = parseFloat(String(summary.profit_twr_12m ?? '0'))

  const profitPositive = profitAmount >= 0

  return (
    <div className="capital-panel accent-border">
      {/* Cabeçalho */}
      <div className="panel-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="panel-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
          </span>
          <h2>Carteira de Investimentos</h2>
        </div>
        <button
          className="capital-secondary-button"
          onClick={fetchData}
          disabled={loading}
          aria-label="Atualizar dados da carteira"
          style={{ fontSize: 12, padding: '8px 14px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-5.13"/>
          </svg>
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Patrimônio Total */}
        <div className="capital-kpi-card kpi-success">
          <div className="kpi-top">
            <span className="kpi-label">Patrimônio Total</span>
            <span className="kpi-icon icon-success" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </span>
          </div>
          <div className="kpi-value">{formatBRL(equity)}</div>
          <div className="kpi-caption">
            <span>Valor de mercado</span>
          </div>
        </div>

        {/* Valor Aplicado */}
        <div className="capital-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Valor Aplicado</span>
            <span className="kpi-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </span>
          </div>
          <div className="kpi-value">{formatBRL(applied)}</div>
          <div className="kpi-caption">
            <span>Capital investido</span>
          </div>
        </div>

        {/* Lucro / Prejuízo */}
        <div className={`capital-kpi-card ${profitPositive ? 'kpi-success' : 'kpi-danger'}`}>
          <div className="kpi-top">
            <span className="kpi-label">Lucro / Prejuízo</span>
            <span className={`kpi-icon ${profitPositive ? 'icon-success' : 'icon-danger'}`} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points={profitPositive ? '23 6 13.5 15.5 8.5 10.5 1 18' : '23 18 13.5 8.5 8.5 13.5 1 6'}/>
                {profitPositive
                  ? <polyline points="17 6 23 6 23 12"/>
                  : <polyline points="17 18 23 18 23 12"/>
                }
              </svg>
            </span>
          </div>
          <div className="kpi-value">{formatBRL(profitAmount)}</div>
          <div className="kpi-caption">
            <span>Resultado</span>
            <span className={`kpi-trend ${profitPositive ? 'up' : 'down'}`}>
              {formatPct(variation)}
            </span>
          </div>
        </div>

        {/* Retorno 12 meses */}
        <div className={`capital-kpi-card ${twr12m >= 0 ? 'kpi-success' : 'kpi-warning'}`}>
          <div className="kpi-top">
            <span className="kpi-label">Retorno 12 Meses</span>
            <span className={`kpi-icon ${twr12m >= 0 ? 'icon-success' : 'icon-warning'}`} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </span>
          </div>
          <div className="kpi-value">{formatPct(twr12m)}</div>
          <div className="kpi-caption">
            <span>TWR acumulado</span>
            <span className={`kpi-trend ${twr12m >= 0 ? 'up' : 'down'}`}>
              {formatBRL(summary.profit_twr_12m_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Alocação por ativo */}
      {allocation.length > 0 && (
        <div>
          <span className="eyebrow">Composição da carteira</span>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '10px 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {allocation.slice(0, 20).map((item, idx) => {
              const label = item.ticker ?? item.name ?? item.label ?? `Ativo ${idx + 1}`
              const pct = parseFloat(String(item.percentage ?? item.value ?? '0'))
              const total = item.total !== undefined ? parseFloat(String(item.total)) : null

              return (
                <li key={`${label}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: 'var(--capital-text)' }}>{label}</span>
                    <span style={{ color: 'var(--capital-muted)' }}>
                      {total !== null && !isNaN(total) ? formatBRL(total) : ''}{' '}
                      <strong style={{ color: 'var(--capital-accent)' }}>
                        {isNaN(pct) ? '' : `${pct.toFixed(1)}%`}
                      </strong>
                    </span>
                  </div>
                  {!isNaN(pct) && pct > 0 && (
                    <div className="bar-track" aria-hidden="true">
                      <span style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Rodapé */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: '1px solid var(--capital-line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span className="small-note">
          Fonte: Investidor10
        </span>
        <span className="small-note">
          {fetchedAt
            ? `Atualizado às ${fetchedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Atualizado agora'}
        </span>
      </div>
    </div>
  )
}
