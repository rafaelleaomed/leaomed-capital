/**
 * Taxonomia Oficial do Sistema baseada na Planilha e Extratos Reais do Usuário
 */

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
  { assetClass: 'Previdência Privada', targetPercentage: 5.0 },
  { assetClass: 'Debêntures', targetPercentage: 0.0 }
];
