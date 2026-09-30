/**
 * Configuração Oficial do Sistema de Categorização Inteligente (Jev / TypeSafe AI & Regras)
 */

export interface CategorizationThresholds {
  highConfidence: number    // >= 0.90: Alta confiança (elegível para auto-apply pós-shadow mode se for baixo risco)
  mediumConfidence: number  // 0.70 a 0.89: Sugestão para validação em 1 clique
  lowConfidence: number     // < 0.70: Revisão manual obrigatória
}

export const CATEGORIZATION_CONFIG = {
  // Flag do Modo Sombra: Quando true, NENHUMA transação é modificada automaticamente pelo Jev.
  // Apenas grava em ai_suggested_category para avaliação e benchmark do usuário.
  SHADOW_MODE: process.env.NEXT_PUBLIC_SHADOW_MODE !== 'false', // Default: true

  // Habilita/Desabilita integração com Jev
  ENABLE_JEV: process.env.ENABLE_JEV_CATEGORIZATION !== 'false',

  // Limiares de Confiança para Choice/Score
  THRESHOLDS: {
    highConfidence: 0.90,
    mediumConfidence: 0.70,
    lowConfidence: 0.70
  } as CategorizationThresholds,

  // Categorias Sensíveis / Alto Risco Financeiro:
  // NUNCA são aplicadas automaticamente, mesmo que a confiança do Jev seja 1.00.
  // Exigem sempre confirmação humana explícita.
  SENSITIVE_CATEGORIES: [
    'impostos',
    'imposto',
    'darf',
    'simples nacional',
    'iss',
    'irpj',
    'csll',
    'inss',
    'investimentos',
    'investimentos & aplicações',
    'resgate de investimentos',
    'resgate',
    'aporte',
    'transferência',
    'transferencias',
    'empréstimo',
    'financiamento',
    'pagamento de fatura',
    'pró-labore',
    'prolabore',
    'empresa médica pj',
    'empresa - despesas fixas',
    'empresa - receitas',
    'faturamento hospitalar & pj'
  ],

  // Governança de Logs e Privacidade
  PRIVACY: {
    // Se false, nunca armazena o payload de entrada na tabela de logs (armazena apenas input_hash SHA-256)
    storeAiInputs: process.env.STORE_AI_INPUTS === 'true', // Default: false
    // Retenção de logs em dias
    logRetentionDays: parseInt(process.env.AI_LOG_RETENTION_DAYS || '90', 10),
    // Versão da pergunta para rastreabilidade de schema no Jev
    questionVersion: 'v1.2-medical-pf-pj'
  },

  // Fila de Execução e Limitação de Concorrência
  CONCURRENCY: {
    maxConcurrentRequests: 3, // Máximo de 3 chamadas simultâneas ao endpoint do Jev
    itemTimeoutMs: 5000,       // 5 segundos de timeout por chamada
    maxRetries: 2,             // Até 2 retentativas em caso de erro transitório 429/5xx
    retryBackoffMs: 500        // Backoff exponencial base de 500ms
  },

  // Estimativa de Custos (USD por 1.000 chamadas System One)
  COST_ESTIMATE: {
    perDecisionUsd: 0.00035, // Custo médio de 1 chamada Jev System One com 3 perguntas
    tokenCountEst: 150       // Equivalente de tokens médios por estado
  }
}

/**
 * Verifica se uma categoria é sensível / alto risco
 */
export function isSensitiveCategory(categoryName: string, subcategoryName?: string): boolean {
  if (!categoryName) return false
  const cat = categoryName.toLowerCase().trim()
  const sub = (subcategoryName || '').toLowerCase().trim()

  return CATEGORIZATION_CONFIG.SENSITIVE_CATEGORIES.some(sens => 
    cat.includes(sens) || sub.includes(sens)
  )
}
