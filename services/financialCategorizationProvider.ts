import { USER_TAXONOMY, CategoryDef } from '@/utils/taxonomy'
import { CATEGORIZATION_CONFIG, isSensitiveCategory } from '@/config/categorizationConfig'

export interface SanitizedTransactionInput {
  description: string
  amount: number
  date: string
  account_scope: 'PF' | 'PJ'
  payment_method?: string
  known_previous_category?: string | null
  known_previous_subcategory?: string | null
}

export interface CategorizationDecision {
  category: string
  subcategory: string
  decision_type: 'deterministic' | 'probabilistic'
  certainty_label: string
  choice_confidence: number | null         // Confiança calibrada da primitiva Choice (0.00 a 1.00)
  is_fixed_probability: number | null      // Probabilidade calibrada da primitiva Noul para despesa fixa (0.00 a 1.00)
  needs_review_probability: number | null  // Probabilidade calibrada da primitiva Noul para ambiguidade (0.00 a 1.00)
  is_fixed: boolean
  review_required: boolean
  provider: string
  model: string
  question_version: string
  raw_response?: any
  latency_ms: number
  error_message?: string
}

export interface IFinancialCategorizationProvider {
  classify(input: SanitizedTransactionInput): Promise<CategorizationDecision>
}

/**
 * Provedor Oficial TypeSafe AI (Jev) via HTTP Nativo Fetch
 * Executa apenas Server-Side.
 */
export class JevCategorizationProvider implements IFinancialCategorizationProvider {
  private apiKey: string
  private endpoint: string
  private model: string

  constructor(apiKey?: string, endpoint?: string, model?: string) {
    this.apiKey = apiKey || process.env.TYPESAFE_API_KEY || ''
    this.endpoint = endpoint || process.env.TYPESAFE_API_ENDPOINT || 'https://api.typesafe.ai/v1/systemone'
    this.model = model || process.env.TYPESAFE_MODEL || 'jev-latest'
  }

  async classify(input: SanitizedTransactionInput): Promise<CategorizationDecision> {
    const startTime = Date.now()

    if (!this.apiKey) {
      return {
        category: 'NÃO_IDENTIFICADO',
        subcategory: 'NÃO_IDENTIFICADO',
        decision_type: 'probabilistic',
        certainty_label: 'chave_ausente',
        choice_confidence: 0,
        is_fixed_probability: null,
        needs_review_probability: 1.0,
        is_fixed: false,
        review_required: true,
        provider: 'jev',
        model: this.model,
        question_version: CATEGORIZATION_CONFIG.PRIVACY.questionVersion,
        latency_ms: 0,
        error_message: 'TYPESAFE_API_KEY não configurada no ambiente server-side.'
      }
    }

    // Filtra taxonomia de acordo com o escopo PF/PJ
    const availableCategories = USER_TAXONOMY.filter(
      c => c.scope === input.account_scope || c.scope === 'AMBOS'
    )
    const categoryOptions = [...availableCategories.map(c => c.name), 'NÃO_IDENTIFICADO']

    // Constrói estado JSON para avaliação
    const stateContext = JSON.stringify({
      description: input.description,
      amount: input.amount,
      date: input.date,
      scope: input.account_scope,
      payment_method: input.payment_method || 'Não especificado',
      context: 'Classificação contábil para plataforma financeira médica LeãoMed Capital'
    })

    // Monta perguntas para o Jev
    const questionsPayload = {
      category: {
        type: 'choice',
        instructions: `Selecione a categoria financeira exata para este lançamento de ${input.account_scope}: "${input.description}". Se não corresponder claramente a nenhuma das categorias permitidas, escolha "NÃO_IDENTIFICADO".`,
        options: categoryOptions
      },
      is_fixed: {
        type: 'noul',
        instructions: 'Este lançamento apresenta características de despesa fixa, assinatura recorrente, contrato de longo prazo ou tributo obrigatório?'
      },
      needs_review: {
        type: 'noul',
        instructions: 'O lançamento contém ambiguidade, descrição genérica (ex: PIX avulso, transferência sem destino, taxa desconhecida) suficiente para exigir revisão manual humana?'
      }
    }

    const payload = {
      model: this.model,
      state: stateContext,
      questions: questionsPayload
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CATEGORIZATION_CONFIG.CONCURRENCY.itemTimeoutMs)

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`Jev HTTP ${response.status}: ${errorText || response.statusText}`)
      }

      const result = await response.json()
      const latency = Date.now() - startTime

      // Extrai respostas das primitivas
      const categoryResult = result.answers?.category || result.results?.category || {}
      const isFixedResult = result.answers?.is_fixed || result.results?.is_fixed || {}
      const needsReviewResult = result.answers?.needs_review || result.results?.needs_review || {}

      let chosenCategory = categoryResult.choice || categoryResult.selected || 'NÃO_IDENTIFICADO'
      const choiceConfidence = typeof categoryResult.confidence === 'number' ? categoryResult.confidence : 0.5
      const isFixedProb = typeof isFixedResult.probability === 'number' ? isFixedResult.probability : (isFixedResult.value ? 0.9 : 0.1)
      const needsReviewProb = typeof needsReviewResult.probability === 'number' ? needsReviewResult.probability : (needsReviewResult.value ? 0.9 : 0.1)

      // Validação estrita: se a categoria não existir em categoryOptions, força NÃO_IDENTIFICADO
      if (!categoryOptions.includes(chosenCategory)) {
        chosenCategory = 'NÃO_IDENTIFICADO'
      }

      // Segunda chamada opcional para Subcategoria da Categoria Escolhida
      let chosenSubcategory = 'Outros'
      if (chosenCategory !== 'NÃO_IDENTIFICADO') {
        const matchedCategoryDef = availableCategories.find(c => c.name === chosenCategory)
        if (matchedCategoryDef && matchedCategoryDef.subcategories.length > 0) {
          const subcatOptions = [...matchedCategoryDef.subcategories.map(s => s.name), 'NÃO_IDENTIFICADO']

          // Chamada rápida para subcategoria
          const subcatPayload = {
            model: this.model,
            state: stateContext,
            questions: {
              subcategory: {
                type: 'choice',
                instructions: `Dentro da categoria "${chosenCategory}", selecione a subcategoria exata para "${input.description}". Se incerto, escolha "NÃO_IDENTIFICADO".`,
                options: subcatOptions
              }
            }
          }

          try {
            const subcatResp = await fetch(this.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
              },
              body: JSON.stringify(subcatPayload)
            })
            if (subcatResp.ok) {
              const subcatJson = await subcatResp.json()
              const subAns = subcatJson.answers?.subcategory || subcatJson.results?.subcategory || {}
              if (subAns.choice && subcatOptions.includes(subAns.choice)) {
                chosenSubcategory = subAns.choice
              }
            }
          } catch (_) {
            // Em caso de falha na subcategoria, mantém a primeira válida
            chosenSubcategory = matchedCategoryDef.subcategories[0]?.name || 'Outros'
          }
        }
      }

      const isFixed = isFixedProb >= 0.5
      const isSensitive = isSensitiveCategory(chosenCategory, chosenSubcategory)
      const reviewRequired = needsReviewProb >= 0.5 || choiceConfidence < CATEGORIZATION_CONFIG.THRESHOLDS.lowConfidence || isSensitive

      return {
        category: chosenCategory,
        subcategory: chosenSubcategory,
        decision_type: 'probabilistic',
        certainty_label: 'jev-systemone',
        choice_confidence: choiceConfidence,
        is_fixed_probability: isFixedProb,
        needs_review_probability: needsReviewProb,
        is_fixed: isFixed,
        review_required: reviewRequired,
        provider: 'jev',
        model: this.model,
        question_version: CATEGORIZATION_CONFIG.PRIVACY.questionVersion,
        raw_response: result,
        latency_ms: latency
      }

    } catch (err: any) {
      clearTimeout(timeoutId)
      const latency = Date.now() - startTime
      return {
        category: 'NÃO_IDENTIFICADO',
        subcategory: 'NÃO_IDENTIFICADO',
        decision_type: 'probabilistic',
        certainty_label: 'erro_api',
        choice_confidence: 0,
        is_fixed_probability: null,
        needs_review_probability: 1.0,
        is_fixed: false,
        review_required: true,
        provider: 'jev',
        model: this.model,
        question_version: CATEGORIZATION_CONFIG.PRIVACY.questionVersion,
        latency_ms: latency,
        error_message: err?.message || 'Falha de comunicação com o endpoint do Jev'
      }
    }
  }
}

/**
 * Provedor Mock para Desenvolvimento Local e Testes Sintéticos
 */
export class MockCategorizationProvider implements IFinancialCategorizationProvider {
  async classify(input: SanitizedTransactionInput): Promise<CategorizationDecision> {
    const desc = input.description.toLowerCase()

    let category = 'Alimentação'
    let subcategory = 'Restaurantes'
    let isFixed = false
    let confidence = 0.94
    let isFixedProb = 0.15
    let needsReviewProb = 0.10

    if (desc.includes('posto') || desc.includes('ipiranga') || desc.includes('combustivel')) {
      category = 'Transporte'
      subcategory = 'Combustível'
      confidence = 0.96
    } else if (desc.includes('darf') || desc.includes('simples')) {
      category = 'Empresa - Despesas Fixas'
      subcategory = 'DARF'
      isFixed = true
      isFixedProb = 0.95
      confidence = 0.98
    } else if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('assinatura')) {
      category = 'Serviços de assinaturas'
      subcategory = 'Netflix'
      isFixed = true
      isFixedProb = 0.92
      confidence = 0.95
    } else if (desc.includes('drogasil') || desc.includes('araujo') || desc.includes('farmacia')) {
      category = 'Saúde'
      subcategory = 'Remédios'
      confidence = 0.92
    } else if (desc.includes('aluguel') || desc.includes('condominio')) {
      category = 'Casa'
      subcategory = 'Aluguel'
      isFixed = true
      isFixedProb = 0.98
      confidence = 0.97
    } else if (
      desc.includes('desconhecid') || 
      desc.includes('pix avulso') || 
      desc.includes('pix enviado') || 
      desc.includes('ted avulsa') || 
      desc.includes('diversos') || 
      desc.includes('ambíguo') || 
      desc.includes('ambiguo')
    ) {
      category = 'NÃO_IDENTIFICADO'
      subcategory = 'NÃO_IDENTIFICADO'
      confidence = 0.35
      needsReviewProb = 0.90
    }

    const reviewRequired = needsReviewProb >= 0.5 || isSensitiveCategory(category, subcategory) || confidence < 0.70

    return {
      category,
      subcategory,
      decision_type: 'probabilistic',
      certainty_label: 'mock-simulator',
      choice_confidence: confidence,
      is_fixed_probability: isFixedProb,
      needs_review_probability: needsReviewProb,
      is_fixed: isFixed,
      review_required: reviewRequired,
      provider: 'mock',
      model: 'jev-mock-v1',
      question_version: CATEGORIZATION_CONFIG.PRIVACY.questionVersion,
      latency_ms: 45
    }
  }
}
