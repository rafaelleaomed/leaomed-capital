export interface SubcategoryDef {
  name: string;
  isFixed: boolean;
  keywords: string[];
}

export interface CategoryDef {
  name: string;
  scope: 'PF' | 'PJ' | 'AMBOS';
  subcategories: SubcategoryDef[];
}

export const CATEGORY_CANONICAL_MAP: Record<string, string> = {
  'Reembolso': 'Reembolso & Devolução',
  'Reembolso & Devolução': 'Reembolso & Devolução',
  'Rendimentos de Investimentos': 'Rendimentos & Investimentos',
  'Rendimentos & Investimentos': 'Rendimentos & Investimentos',
  'Presente': 'Presentes & PIX Recebidos',
  'Presentes & PIX Recebidos': 'Presentes & PIX Recebidos',
  'Pró-Labore / Salário PJ': 'Receita PF & Pró-Labore',
  'Receita PF & Pró-Labore': 'Receita PF & Pró-Labore',
  'Empresa - Receitas': 'Faturamento Hospitalar & PJ',
  'Faturamento Hospitalar & PJ': 'Faturamento Hospitalar & PJ',
  'Transferência Entre Contas': 'Transferência / Aporte',
  'Transferência / Aporte': 'Transferência / Aporte',
  'Pet': 'Pets',
  'Casa': 'Moradia',
  'Moradia': 'Moradia',
  'Lazer': 'Lazer & Estilo de Vida',
  'Lazer & Estilo de Vida': 'Lazer & Estilo de Vida',
  'Assinaturas': 'Serviços de Assinaturas',
  'Restaurante': 'Alimentação',
  'Impostos': 'Impostos e Taxas PF'
};

export function normalizeCategoryName(name: string | undefined | null): string {
  if (!name) return '';
  const trimmed = name.trim();
  return CATEGORY_CANONICAL_MAP[trimmed] || trimmed;
}

export const DEFAULT_MEDICAL_TAXONOMY: CategoryDef[] = [
  {
    name: 'Receitas Médicas',
    scope: 'PJ',
    subcategories: [
      { name: 'Hospital 01', isFixed: true, keywords: ['hospital', 'plantao'] },
      { name: 'Hospital 02', isFixed: true, keywords: ['hospital 2', 'santa casa', 'mater dei'] },
      { name: 'Convênio 01', isFixed: true, keywords: ['convenio 1', 'unimed'] },
      { name: 'Convênio 02', isFixed: true, keywords: ['convenio 2', 'bradesco', 'amil'] },
      { name: 'Ambulatório', isFixed: true, keywords: ['ambulatorio'] },
      { name: 'Consultório', isFixed: true, keywords: ['consultorio', 'clinica'] },
      { name: 'Particulares', isFixed: false, keywords: ['particular', 'consulta particular'] },
      { name: 'Plantões', isFixed: false, keywords: ['plantao', 'plantao extra'] },
      { name: 'Aluguéis', isFixed: true, keywords: ['aluguel', 'locacao'] },
      { name: 'Dividendos Fundos Imobiliários', isFixed: false, keywords: ['dividendos fii', 'rendimento fii'] },
      { name: 'Dividendos Ações', isFixed: false, keywords: ['jcp', 'dividendos acoes'] },
      { name: 'Outros', isFixed: false, keywords: ['outros', 'reembolso'] }
    ]
  },
  {
    name: 'Casa',
    scope: 'PF',
    subcategories: [
      { name: 'Condomínio', isFixed: true, keywords: ['condominio'] },
      { name: 'Conta de energia', isFixed: true, keywords: ['cemig', 'enel', 'luz', 'energia'] },
      { name: 'Telefones celulares', isFixed: true, keywords: ['celular', 'vivo', 'claro', 'tim'] },
      { name: 'Internet', isFixed: true, keywords: ['internet', 'fibra'] },
      { name: 'TV por assinatura', isFixed: true, keywords: ['tv por assinatura', 'tv cabo'] },
      { name: 'Netflix', isFixed: true, keywords: ['netflix', 'streaming', 'spotify'] },
      { name: 'IPTU', isFixed: true, keywords: ['iptu'] },
      { name: 'Supermercado', isFixed: false, keywords: ['supermercado', 'mercado'] },
      { name: 'Empregados', isFixed: true, keywords: ['diarista', 'empregada', 'domestica'] },
      { name: 'Itens para casa', isFixed: false, keywords: ['itens para casa', 'utensilios'] },
      { name: 'Eletrodomésticos', isFixed: false, keywords: ['eletrodomesticos', 'eletro'] },
      { name: 'Outros', isFixed: false, keywords: ['outros moradia'] }
    ]
  },
  {
    name: 'Saúde',
    scope: 'PF',
    subcategories: [
      { name: 'Plano de Saúde', isFixed: true, keywords: ['plano de saude', 'unimed', 'bradesco saude'] },
      { name: 'Médicos/Psicólogo/Terapeutas', isFixed: false, keywords: ['terapia', 'psicologo', 'consulta'] },
      { name: 'Dentista', isFixed: false, keywords: ['dentista', 'odonto'] },
      { name: 'Remédios', isFixed: false, keywords: ['farmacia', 'drogaria'] },
      { name: 'Seguro saúde', isFixed: true, keywords: ['seguro saude', 'seguro vida'] },
      { name: 'Outros', isFixed: false, keywords: ['outros saude'] }
    ]
  },
  {
    name: 'Transporte',
    scope: 'PF',
    subcategories: [
      { name: 'Manutenção Veículo', isFixed: false, keywords: ['manutencao', 'oficina', 'mecanico'] },
      { name: 'Itens para carro', isFixed: false, keywords: ['pneu', 'autopecas', 'acessorios'] },
      { name: 'IPVA + Seguro Obrigatório', isFixed: false, keywords: ['ipva', 'seguro obrigatorio'] },
      { name: 'Seguro', isFixed: true, keywords: ['seguro auto', 'porto seguro'] },
      { name: 'Combustível', isFixed: false, keywords: ['combustivel', 'posto', 'gasolina', 'etanol'] },
      { name: 'Estacionamentos', isFixed: false, keywords: ['estacionamento', 'valet'] },
      { name: 'Transporte público', isFixed: false, keywords: ['metro', 'onibus'] },
      { name: 'Multas', isFixed: false, keywords: ['multa'] },
      { name: 'Pedágios', isFixed: false, keywords: ['pedagio', 'sem parar'] },
      { name: 'Táxi/Uber', isFixed: false, keywords: ['uber', '99', 'taxi'] },
      { name: 'Outros', isFixed: false, keywords: ['outros transporte'] }
    ]
  },
  {
    name: 'Despesas Pessoais',
    scope: 'PF',
    subcategories: [
      { name: 'Congressos', isFixed: false, keywords: ['congresso', 'simposio'] },
      { name: 'Anuidades sociedades', isFixed: true, keywords: ['crm', 'cfm', 'anuidade', 'sociedade medica'] },
      { name: 'Cursos', isFixed: false, keywords: ['curso', 'pos graduacao', 'treinamento'] },
      { name: 'Cabeleireiro', isFixed: false, keywords: ['cabeleireiro', 'barbeiro', 'salao'] },
      { name: 'Vestuário', isFixed: false, keywords: ['roupa', 'calcados', 'vestuario', 'jaleco'] },
      { name: 'Academia', isFixed: true, keywords: ['academia', 'smartfit', 'bodytech', 'personal'] },
      { name: 'Outros', isFixed: false, keywords: ['outros pessoal'] }
    ]
  },
  {
    name: 'Filhos',
    scope: 'PF',
    subcategories: [
      { name: 'Escola', isFixed: true, keywords: ['escola', 'colegio', 'mensalidade escolar'] },
      { name: 'Mesada', isFixed: true, keywords: ['mesada'] },
      { name: 'Alimentação', isFixed: false, keywords: ['alimentacao filhos', 'lanche'] },
      { name: 'Extras', isFixed: false, keywords: ['extras filhos', 'material escolar'] },
      { name: 'Saúde', isFixed: false, keywords: ['pediatra', 'vacinas'] },
      { name: 'Outros', isFixed: false, keywords: ['outros filhos'] }
    ]
  },
  {
    name: 'Lazer',
    scope: 'PF',
    subcategories: [
      { name: 'Restaurantes', isFixed: false, keywords: ['restaurante', 'bar', 'jantar'] },
      { name: 'Balada', isFixed: false, keywords: ['balada', 'festa', 'show'] },
      { name: 'Comida delivery', isFixed: false, keywords: ['ifood', 'delivery', 'rappi'] },
      { name: 'Viagens / gastos de férias', isFixed: false, keywords: ['viagem', 'ferias'] },
      { name: 'Passagens', isFixed: false, keywords: ['passagem', 'voo', 'latam', 'azul', 'gol'] },
      { name: 'Hospedagens', isFixed: false, keywords: ['hotel', 'airbnb', 'pousada', 'resort'] },
      { name: 'Passeios', isFixed: false, keywords: ['passeio', 'ingressos', 'cinema'] },
      { name: 'Outros', isFixed: false, keywords: ['outros lazer'] }
    ]
  },
  {
    name: 'Empresa - Despesas Fixas',
    scope: 'PJ',
    subcategories: [
      { name: 'DARF', isFixed: true, keywords: ['darf', 'simples nacional', 'imposto pj 1'] },
      { name: 'IRPJ', isFixed: true, keywords: ['imposto pj 2'] },
      { name: 'CSLL', isFixed: true, keywords: ['imposto pj 3'] },
      { name: 'COFINS / PIS', isFixed: true, keywords: ['imposto pj 4'] },
      { name: 'ISS', isFixed: true, keywords: ['iss', 'issqn', 'prefeitura'] },
      { name: 'Mensalidade Contador', isFixed: true, keywords: ['contador', 'contabilidade', 'honorarios'] },
      { name: 'Despesas Gerais Médicas', isFixed: false, keywords: ['despesas medicas', 'insumos clinicos'] },
      { name: 'Outros', isFixed: false, keywords: ['outros pj'] }
    ]
  },
  {
    name: 'Despesas Temporárias / Variáveis',
    scope: 'PF',
    subcategories: [
      { name: 'Manutenção e reparos', isFixed: false, keywords: ['reparo', 'manutencao'] },
      { name: 'Cursos', isFixed: false, keywords: ['curso avulso'] },
      { name: 'PET', isFixed: false, keywords: ['pet', 'veterinario', 'racao', 'petshop'] },
      { name: 'Festa', isFixed: false, keywords: ['festa', 'comemoracao'] },
      { name: 'Doações', isFixed: false, keywords: ['doacao'] },
      { name: 'Presentes', isFixed: false, keywords: ['presente'] },
      { name: 'Presentes parcelados', isFixed: true, keywords: ['presente parcelado'] },
      { name: 'Utilidades domésticas e decoração', isFixed: false, keywords: ['decoracao', 'utilidades'] },
      { name: 'Outros', isFixed: false, keywords: ['outros variaveis'] }
    ]
  },
  {
    name: 'Despesas Financeiras & Cartões',
    scope: 'PF',
    subcategories: [
      { name: 'Tarifas Bancárias 01', isFixed: true, keywords: ['tarifa bancaria 1', 'manutencao conta'] },
      { name: 'Tarifas Bancárias 02', isFixed: true, keywords: ['tarifa bancaria 2'] },
      { name: 'Extras diários', isFixed: false, keywords: ['extras diarios', 'pequenos gastos'] },
      { name: 'IOF', isFixed: false, keywords: ['iof'] },
      { name: 'Seguro cartão', isFixed: true, keywords: ['seguro cartao'] },
      { name: 'Anuidade cartão', isFixed: true, keywords: ['anuidade cartao'] },
      { name: 'Taxas tesouro direto', isFixed: false, keywords: ['taxa b3', 'taxa tesouro'] },
      { name: 'Outros', isFixed: false, keywords: ['outras tarifas'] }
    ]
  }
];

// Generic category templates contain no user records or private institutions.
export const USER_TAXONOMY: CategoryDef[] = [
  ...DEFAULT_MEDICAL_TAXONOMY,
  ...[
  {
    "name": "Alimentação",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Supermercado",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Restaurantes",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Delivery",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Serviços de Assinaturas",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Streaming & Assinaturas",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Inteligência Artificial",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Netflix",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Educação",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Cursos & Congressos",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Livros",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Compras",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Vestuário & Acessórios",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Compras Online",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Compras & Presentes",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Lazer & Estilo de Vida",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Lazer & Viagens",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Cuidados Pessoais",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Impostos e Taxas PF",
    "scope": "PF",
    "subcategories": [
      {
        "name": "IOF",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Taxas",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Pets",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Veterinário",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Alimentação",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Receita PF & Pró-Labore",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Pró-Labore",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Outras Receitas",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Faturamento Hospitalar & PJ",
    "scope": "PJ",
    "subcategories": [
      {
        "name": "Plantões",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Consultório",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Procedimentos",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Reembolso & Devolução",
    "scope": "AMBOS",
    "subcategories": [
      {
        "name": "Reembolso",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Devolução",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Rendimentos & Investimentos",
    "scope": "AMBOS",
    "subcategories": [
      {
        "name": "Dividendos",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Juros",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Presentes & PIX Recebidos",
    "scope": "PF",
    "subcategories": [
      {
        "name": "Presentes",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "PIX",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Transferência / Aporte",
    "scope": "AMBOS",
    "subcategories": [
      {
        "name": "Transferência",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Aporte",
        "isFixed": false,
        "keywords": []
      }
    ]
  },
  {
    "name": "Pagamento de Fatura",
    "scope": "AMBOS",
    "subcategories": [
      {
        "name": "Fatura de Cartão",
        "isFixed": false,
        "keywords": []
      },
      {
        "name": "Deduplicado / Débito de Cartão",
        "isFixed": false,
        "keywords": []
      }
    ]
  }
] as CategoryDef[]
];

export const USER_TAXONOMY_MAP: Record<string, string[]> = USER_TAXONOMY.reduce((acc, cat) => {
  acc[cat.name] = cat.subcategories.map(s => s.name);
  return acc;
}, {} as Record<string, string[]>);

export function getCategoriesByScope(scope?: 'PF' | 'PJ' | 'AMBOS'): Record<string, string[]> {
  const filtered = USER_TAXONOMY.filter(cat => {
    if (!scope || scope === 'AMBOS') return true;
    return cat.scope === scope || cat.scope === 'AMBOS';
  });
  return filtered.reduce((acc, cat) => {
    acc[cat.name] = cat.subcategories.map(s => s.name);
    return acc;
  }, {} as Record<string, string[]>);
}

export function getSubcategoriesForCategory(categoryName: string): string[] {
  const found = USER_TAXONOMY.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  return found ? found.subcategories.map(s => s.name) : ['Diversos'];
}

export interface InvestmentTargetDef {
  assetClass: string;
  targetPercentage: number;
}

export const USER_INVESTMENT_TARGETS: InvestmentTargetDef[] = [
  { assetClass: 'Ações', targetPercentage: 10.0 },
  { assetClass: 'CDB', targetPercentage: 15.0 },
  { assetClass: 'LCI / LCA', targetPercentage: 10.0 },
  { assetClass: 'Tesouro Selic', targetPercentage: 15.0 },
  { assetClass: 'Tesouro IPCA', targetPercentage: 10.0 },
  { assetClass: 'Poupança', targetPercentage: 5.0 },
  { assetClass: 'Fundos Imobiliários', targetPercentage: 5.0 },
  { assetClass: 'Fundo DI', targetPercentage: 5.0 },
  { assetClass: 'Ações no Exterior', targetPercentage: 5.0 },
  { assetClass: 'Ouro', targetPercentage: 5.0 },
  { assetClass: 'Dólar', targetPercentage: 5.0 },
  { assetClass: 'Criptomoedas', targetPercentage: 5.0 },
  { assetClass: 'Previdência Privada', targetPercentage: 0.0 },
  { assetClass: 'Outros', targetPercentage: 5.0 }
];

/**
 * Taxonomia Médica Padrão Inicial (Template Oficial para Novos Usuários e Modo Demo)
 * Baseada no blueprint de gestão médica (Receitas hospitalares/consultório, despesas fixas, despesas PJ e investimentos).
 */
