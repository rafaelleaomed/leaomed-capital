import { GranularTransaction } from './granularTransactionStore'

/**
 * Transações 100% sintéticas e fictícias para a demonstração pública (/demo).
 * Totalmente isoladas, sem nenhuma referência a pessoas, contas ou dados reais.
 */
export const DEMO_SYNTHETIC_TRANSACTIONS: GranularTransaction[] = [
  {
    id: 'demo_tx_001',
    entityType: 'PJ',
    date: '2026-04-10',
    description: 'Honorários Médicos - Plantão Hospitalar',
    amount: 15400.00,
    accountOrCard: 'Conta Inter PJ',
    category: 'Receitas PJ',
    subcategory: 'Plantões Hospitalares',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_002',
    entityType: 'PJ',
    date: '2026-04-12',
    description: 'Honorários Consultório Médico',
    amount: 8200.00,
    accountOrCard: 'Conta Inter PJ',
    category: 'Receitas PJ',
    subcategory: 'Consultas Particulares',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_003',
    entityType: 'PJ',
    date: '2026-04-15',
    description: 'Guia DAS Simples Nacional',
    amount: -2180.50,
    accountOrCard: 'Conta Inter PJ',
    category: 'Tributos PJ',
    subcategory: 'Simples Nacional',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_004',
    entityType: 'PJ',
    date: '2026-04-15',
    description: 'Mensalidade Assessoria Contábil',
    amount: -850.00,
    accountOrCard: 'Conta Inter PJ',
    category: 'Serviços PJ',
    subcategory: 'Contabilidade',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_005',
    entityType: 'PJ',
    date: '2026-04-18',
    description: 'Transferência Pró-Labore para Conta PF',
    amount: -18000.00,
    accountOrCard: 'Conta Inter PJ',
    category: 'Transferência PJ -> PF',
    subcategory: 'Pró-Labore / Distribuição',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_006',
    entityType: 'PF',
    date: '2026-04-18',
    description: 'Recebimento Pró-Labore da PJ',
    amount: 18000.00,
    accountOrCard: 'Conta Corrente PF',
    category: 'Receita PF',
    subcategory: 'Pró-Labore Recebido',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_007',
    entityType: 'PF',
    date: '2026-04-05',
    description: 'Condomínio Residencial',
    amount: -1450.00,
    accountOrCard: 'Conta Corrente PF',
    category: 'Moradia',
    subcategory: 'Condomínio',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_008',
    entityType: 'PF',
    date: '2026-04-08',
    description: 'Parcela Financiamento Imobiliário',
    amount: -3200.00,
    accountOrCard: 'Conta Corrente PF',
    category: 'Moradia',
    subcategory: 'Financiamento',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_009',
    entityType: 'PF',
    date: '2026-04-10',
    description: 'Supermercado Central',
    amount: -840.50,
    accountOrCard: 'Cartão de Crédito',
    category: 'Alimentação',
    subcategory: 'Supermercado',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_010',
    entityType: 'PF',
    date: '2026-04-12',
    description: 'Combustível Posto Cidade',
    amount: -310.00,
    accountOrCard: 'Cartão de Crédito',
    category: 'Transporte',
    subcategory: 'Combustível',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_011',
    entityType: 'PF',
    date: '2026-04-14',
    description: 'Farmácia Modelo',
    amount: -175.20,
    accountOrCard: 'Cartão de Crédito',
    category: 'Saúde',
    subcategory: 'Medicamentos',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_012',
    entityType: 'PF',
    date: '2026-04-16',
    description: 'Plano de Saúde Familiar',
    amount: -1890.00,
    accountOrCard: 'Conta Corrente PF',
    category: 'Saúde',
    subcategory: 'Plano de Saúde',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'demo_tx_013',
    entityType: 'PF',
    date: '2026-04-20',
    description: 'Aporte Tesouro IPCA+ 2035',
    amount: -3000.00,
    accountOrCard: 'Conta Corrente PF',
    category: 'Investimentos',
    subcategory: 'Renda Fixa',
    isFixed: false,
    isIgnored: true, // Ignorado no cálculo de despesa operacional (é aporte patrimonial)
    source: 'INITIAL_AUDIT'
  }
]
