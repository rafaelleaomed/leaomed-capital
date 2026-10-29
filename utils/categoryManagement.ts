export interface ClassifiableTransaction {
  description: string
  category: string
  subcategory: string
}

export interface ClassificationUpdate {
  category: string
  subcategory: string
}

export interface CategoryMergeRecommendation {
  sourceCategory: string
  targetCategory: string
  reason: string
}

/**
 * Normaliza somente diferenças visuais seguras. Pontuação e palavras são
 * preservadas para que nomes parecidos não sejam tratados como iguais.
 */
export function normalizeExactTransactionName(value: string): string {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
}

export function applyClassificationToExactName<T extends ClassifiableTransaction>(
  transactions: T[],
  sourceDescription: string,
  update: ClassificationUpdate,
): { transactions: T[]; updatedCount: number } {
  const targetName = normalizeExactTransactionName(sourceDescription)
  let updatedCount = 0
  const next = transactions.map(transaction => {
    if (!targetName || normalizeExactTransactionName(transaction.description) !== targetName) {
      return transaction
    }
    updatedCount += 1
    return {
      ...transaction,
      category: update.category,
      subcategory: update.subcategory,
    }
  })
  return { transactions: next, updatedCount }
}

export function getCategoryMergeRecommendations(): CategoryMergeRecommendation[] {
  return [
    { sourceCategory: 'Casa', targetCategory: 'Moradia', reason: 'Categorias equivalentes de despesas residenciais.' },
    { sourceCategory: 'Lazer', targetCategory: 'Lazer & Estilo de Vida', reason: 'Categorias equivalentes de lazer e estilo de vida.' },
    { sourceCategory: 'Assinaturas', targetCategory: 'Serviços de Assinaturas', reason: 'Mesmo grupo de serviços recorrentes.' },
    { sourceCategory: 'Pet', targetCategory: 'Pets', reason: 'Diferença apenas de nomenclatura.' },
    { sourceCategory: 'Restaurante', targetCategory: 'Alimentação', reason: 'Restaurantes já são tratados como subcategoria de alimentação.' },
    { sourceCategory: 'Impostos', targetCategory: 'Impostos e Taxas PF', reason: 'Nome mais específico para impostos pessoais.' },
    { sourceCategory: 'Reembolso', targetCategory: 'Reembolso & Devolução', reason: 'Categoria consolidada para reembolsos e estornos.' },
    { sourceCategory: 'Rendimentos de Investimentos', targetCategory: 'Rendimentos & Investimentos', reason: 'Mesma finalidade financeira.' },
    { sourceCategory: 'Pró-Labore / Salário PJ', targetCategory: 'Receita PF & Pró-Labore', reason: 'Categoria consolidada de remuneração pessoal.' },
    { sourceCategory: 'Empresa - Receitas', targetCategory: 'Faturamento Hospitalar & PJ', reason: 'Categoria consolidada de receitas da empresa.' },
    { sourceCategory: 'Transferência Entre Contas', targetCategory: 'Transferência / Aporte', reason: 'Movimentações internas equivalentes.' },
  ]
}

export function validateCategoryLabel(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') throw new Error(`${fieldName} inválida.`)
  const clean = value.trim().replace(/\s+/g, ' ')
  if (clean.length < 1 || clean.length > 100) throw new Error(`${fieldName} deve ter entre 1 e 100 caracteres.`)
  return clean
}
