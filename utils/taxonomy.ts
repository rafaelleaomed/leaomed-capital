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
  'Assinaturas': 'Serviços de Assinaturas',
  'Restaurante': 'Alimentação',
  'Impostos': 'Impostos e Taxas PF'
};

export function normalizeCategoryName(name: string | undefined | null): string {
  if (!name) return '';
  const trimmed = name.trim();
  return CATEGORY_CANONICAL_MAP[trimmed] || trimmed;
}

export const USER_TAXONOMY: CategoryDef[] = [
  // ===================== MÓDULO PJ (Inter PJ) =====================
  {
    name: 'Empresa - Despesas Fixas',
    scope: 'PJ',
    subcategories: [
      { name: 'IRPJ', isFixed: true, keywords: ['irpj', 'imposto de renda pj'] },
      { name: 'CSLL', isFixed: true, keywords: ['csll', 'contribuicao social'] },
      { name: 'COFINS', isFixed: true, keywords: ['cofins'] },
      { name: 'PIS', isFixed: true, keywords: ['pis'] },
      { name: 'INSS', isFixed: true, keywords: ['inss', 'gps'] },
      { name: 'ISS', isFixed: true, keywords: ['iss', 'issqn', 'prefeitura'] },
      { name: 'DARF', isFixed: true, keywords: ['darf', 'simples nacional', 'pgdas'] },
      { name: 'Mensalidade Contabilidade', isFixed: true, keywords: ['contabilidade', 'contador', 'contabil'] },
      { name: 'Outras taxas', isFixed: false, keywords: ['taxa bancaria pj', 'tarifa inter pj'] }
    ]
  },
  {
    name: 'Empresa - Receitas',
    scope: 'PJ',
    subcategories: [
      { name: 'Camarinha BRUTO', isFixed: true, keywords: ['camarinha', 'plantao camarinha'] },
      { name: 'UPAs Contagem', isFixed: false, keywords: ['upa contagem', 'contagem'] },
      { name: 'Sabará', isFixed: false, keywords: ['sabara'] },
      { name: 'Cruzeiro', isFixed: false, keywords: ['cruzeiro'] }
    ]
  },

  // ===================== MÓDULO PF (Itaú / Nubank / C6 Carbon) =====================
  {
    name: 'Transporte',
    scope: 'PF',
    subcategories: [
      { name: 'Parcela T-Cross Financiamento', isFixed: true, keywords: ['t-cross fin', 'financiamento tcross', 'banco volkswagen'] },
      { name: 'Parcela T-Cross Cartão', isFixed: true, keywords: ['t-cross cartao', 'tcross', 't-cross'] },
      { name: 'Combustível', isFixed: false, keywords: ['posto', 'ipiranga', 'shell', 'petrobras', 'combustivel', 'auto posto'] },
      { name: 'Estacionamentos', isFixed: false, keywords: ['estacionamento', 'estapar', 'indigo', 'pare bem'] },
      { name: 'Táxi/Uber', isFixed: false, keywords: ['uber', '99app', '99 tecnologia', 'cabify', 'taxi'] },
      { name: 'Seguro', isFixed: true, keywords: ['seguro auto', 'porto seguro', 'tokio marine', 'azul seguros'] },
      { name: 'Portas WRV', isFixed: false, keywords: ['wrv', 'portas wrv'] },
      { name: 'Taxas/imprevistos/acessórios', isFixed: false, keywords: ['acessorio', 'revisao', 'insulfilm'] },
      { name: 'Sem parar', isFixed: true, keywords: ['sem parar', 'conectcar', 'veloe', 'pedagio'] },
      { name: 'IPVA', isFixed: false, keywords: ['ipva', 'licenciamento', 'detran'] },
      { name: 'Lavagem', isFixed: false, keywords: ['lava jato', 'lavagem', 'estetica automotiva'] },
      { name: 'Manutenção', isFixed: false, keywords: ['oficina', 'mecanico', 'pneu', 'automec'] }
    ]
  },
  {
    name: 'Casa',
    scope: 'PF',
    subcategories: [
      { name: 'Aluguel', isFixed: true, keywords: ['aluguel', 'quintoandar', 'locacao'] },
      { name: 'Condomínio', isFixed: true, keywords: ['condominio', 'cond.'] },
      { name: 'Supermercado', isFixed: false, keywords: ['supermercado', 'carrefour', 'pao de acucar', 'atacadao', 'verdemar', 'bh supermercados', 'super nosso'] },
      { name: 'Luz', isFixed: true, keywords: ['cemig', 'enel', 'light', 'energia'] },
      { name: 'Internet', isFixed: true, keywords: ['claro internet', 'vivo fibra', 'oi fibra', 'internet'] },
      { name: 'Celular', isFixed: true, keywords: ['vivo controle', 'claro celular', 'tim celular'] },
      { name: 'IPTU', isFixed: true, keywords: ['iptu'] },
      { name: 'TV TCL', isFixed: true, keywords: ['tv tcl', 'tcl'] },
      { name: 'Lava e seca', isFixed: true, keywords: ['lava e seca', 'lava seca'] },
      { name: 'Sofa', isFixed: true, keywords: ['sofa'] },
      { name: 'Adega', isFixed: true, keywords: ['adega'] },
      { name: 'AirFryer', isFixed: true, keywords: ['airfryer', 'fritadeira'] },
      { name: 'IPTV', isFixed: true, keywords: ['iptv'] },
      { name: 'Tela janelas', isFixed: false, keywords: ['tela janelas', 'rede de protecao'] },
      { name: 'Lixeira - Utensílios', isFixed: false, keywords: ['lixeira', 'utensilios'] },
      { name: 'Cafeteira', isFixed: false, keywords: ['nespresso', 'cafeteira'] },
      { name: 'Panelas', isFixed: false, keywords: ['panelas', 'tramontina'] },
      { name: 'Cadeira Gamer', isFixed: false, keywords: ['cadeira gamer', 'dt3', 'thunderx3'] }
    ]
  },
  {
    name: 'Financiamento',
    scope: 'PF',
    subcategories: [
      { name: 'Parcela Gramados Parks', isFixed: true, keywords: ['gramado parks', 'gramado park', 'buona vitta resort'] },
      { name: 'Condomínio Buona Vitta', isFixed: true, keywords: ['buona vitta', 'condominio buona'] }
    ]
  },
  {
    name: 'Saúde',
    scope: 'PF',
    subcategories: [
      { name: 'Plano de Saúde', isFixed: true, keywords: ['unimed', 'bradesco saude', 'amil', 'sulamerica'] },
      { name: 'Academia', isFixed: true, keywords: ['smart fit', 'smartfit', 'bodytech', 'academia'] },
      { name: 'Seguro AZOS', isFixed: true, keywords: ['azos', 'seguro azos'] },
      { name: 'Remédios', isFixed: false, keywords: ['drogasil', 'droga raia', 'araujo', 'drogaria araujo', 'farmacia pacheco'] },
      { name: 'Farmácia - outros', isFixed: false, keywords: ['farmacia'] },
      { name: 'Médicos/Psicólogo/Terapeutas', isFixed: false, keywords: ['consulta medica', 'psicologo', 'terapia'] },
      { name: 'Corte de cabelo', isFixed: false, keywords: ['barbearia', 'corte cabelo', 'salao'] },
      { name: 'Tratamentos/Cosméticos', isFixed: false, keywords: ['dermatologia', 'estetica', 'cosmeticos'] }
    ]
  },
  {
    name: 'Pets',
    scope: 'PF',
    subcategories: [
      { name: 'Areia/ração/brinquedos', isFixed: false, keywords: ['petz', 'cobasi', 'racao', 'pet shop'] },
      { name: 'Castração/internações', isFixed: false, keywords: ['veterinario', 'clinica veterinaria'] },
      { name: 'Remedios/veterinario', isFixed: false, keywords: ['farmacia veterinaria', 'vet'] }
    ]
  },
  {
    name: 'Compras',
    scope: 'PF',
    subcategories: [
      { name: 'Presentes', isFixed: false, keywords: ['presente', 'presentes'] },
      { name: 'Suplementos', isFixed: false, keywords: ['growth', 'creatina', 'whey', 'max titanium', 'suplementos'] },
      { name: 'S26Ultra', isFixed: true, keywords: ['s26', 's26ultra', 'samsung s26'] },
      { name: 'Aliexpress/Shopee', isFixed: false, keywords: ['aliexpress', 'shopee', 'shein', 'mercado livre'] },
      { name: 'BoateBus', isFixed: false, keywords: ['boatebus', 'boate bus'] },
      { name: 'Alianças', isFixed: true, keywords: ['alianca', 'aliancas', 'solitario'] },
      { name: 'Doações', isFixed: false, keywords: ['doacao', 'doacoes'] },
      { name: 'Tela S23Ultra', isFixed: false, keywords: ['tela s23'] },
      { name: 'Perfumes', isFixed: false, keywords: ['sephora', 'perfumaria', 'perfume'] },
      { name: 'Roupas', isFixed: false, keywords: ['zara', 'renner', 'riachuelo', 'reserva', 'roupas'] }
    ]
  },
  {
    name: 'Lazer',
    scope: 'PF',
    subcategories: [
      { name: 'Jogos Mineirão', isFixed: false, keywords: ['mineirao', 'futebolcard', 'ingresso cruzeiro'] },
      { name: 'Bares/Baladas', isFixed: false, keywords: ['bar', 'balada', 'pub', 'choperia'] },
      { name: 'Resenhas/Aniversários', isFixed: false, keywords: ['aniversario', 'resenha', 'churrasco'] },
      { name: 'Futebol/Esportes', isFixed: false, keywords: ['pelada', 'quadra', 'futebol'] },
      { name: 'Apostas/Bets/Jogos', isFixed: false, keywords: ['bet', 'betano', 'sportingbet', 'blaze', 'aposta'] }
    ]
  },
  {
    name: 'Alimentação',
    scope: 'PF',
    subcategories: [
      { name: 'Almoço/Lanches', isFixed: false, keywords: ['almoco', 'lanche', 'restaurante', 'mcdonalds', 'burguer king', 'padaria'] },
      { name: 'Marmitas', isFixed: false, keywords: ['marmita', 'marmitaria'] },
      { name: 'Padaria', isFixed: false, keywords: ['padaria', 'panificadora'] }
    ]
  },
  {
    name: 'Restaurantes',
    scope: 'PF',
    subcategories: [
      { name: 'Almoço/Jantar GRI', isFixed: false, keywords: ['gri', 'outback', 'cocobambu', 'restaurante'] },
      { name: 'Ifood', isFixed: false, keywords: ['ifood', 'rappi', 'aiqfome'] },
      { name: 'Sorvete', isFixed: false, keywords: ['sorveteria', 'sorvete', 'bacio di latte', 'gelato'] },
      { name: 'ZéDelivery', isFixed: false, keywords: ['ze delivery', 'zedelivery', 'bebidas'] }
    ]
  },
  {
    name: 'Serviços de assinaturas',
    scope: 'PF',
    subcategories: [
      { name: 'Mobilis', isFixed: true, keywords: ['mobilis', 'mobills'] },
      { name: 'Myprofit', isFixed: true, keywords: ['myprofit'] },
      { name: 'Investidor10', isFixed: true, keywords: ['investidor10'] },
      { name: 'Empiricus SOROS', isFixed: true, keywords: ['empiricus'] },
      { name: 'Curso IA Danilo', isFixed: true, keywords: ['danilo', 'curso ia'] },
      { name: 'Netflix', isFixed: true, keywords: ['netflix'] },
      { name: 'Amazon Prime', isFixed: true, keywords: ['amazon prime'] },
      { name: 'Amazon Music', isFixed: true, keywords: ['amazon music'] },
      { name: 'ChatGPT', isFixed: true, keywords: ['openai', 'chatgpt'] },
      { name: 'Lovable', isFixed: true, keywords: ['lovable'] },
      { name: 'Ifood Club', isFixed: true, keywords: ['ifood club'] },
      { name: 'OneDrive', isFixed: true, keywords: ['microsoft storage', 'onedrive'] },
      { name: 'Youtube Premium', isFixed: true, keywords: ['youtube'] },
      { name: 'Sócio Cruzeiro', isFixed: true, keywords: ['socio cruzeiro', 'socio torcedor'] }
    ]
  },
  {
    name: 'Viagem',
    scope: 'PF',
    subcategories: [
      { name: 'Hospedagem', isFixed: false, keywords: ['airbnb', 'booking', 'hotel', 'pousada'] },
      { name: 'Passagens/transportes', isFixed: false, keywords: ['latam', 'gol', 'azul linhas', 'passagem aerea'] },
      { name: 'Jollimont', isFixed: false, keywords: ['jollimont', 'vinicola'] },
      { name: 'Alimentação/bebidas/supermercado', isFixed: false, keywords: ['viagem supermercado', 'viagem alimentacao'] },
      { name: 'Combustivel', isFixed: false, keywords: ['viagem combustivel'] },
      { name: 'Compras', isFixed: false, keywords: ['viagem compras'] }
    ]
  },
  {
    name: 'Impostos e taxas',
    scope: 'PF',
    subcategories: [
      { name: 'Anuidade CRM', isFixed: true, keywords: ['crm', 'crememg', 'anuidade crm'] },
      { name: 'IRPF', isFixed: false, keywords: ['irpf', 'imposto de renda pf'] }
    ]
  }
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
    name: 'Moradia',
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
      { name: 'Farmácia', isFixed: false, keywords: ['farmacia', 'drogaria'] },
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
      { name: 'Impostos empresa 1', isFixed: true, keywords: ['darf', 'simples nacional', 'imposto pj 1'] },
      { name: 'Impostos empresa 2', isFixed: true, keywords: ['imposto pj 2'] },
      { name: 'Impostos empresa 3', isFixed: true, keywords: ['imposto pj 3'] },
      { name: 'Impostos empresa 4', isFixed: true, keywords: ['imposto pj 4'] },
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

