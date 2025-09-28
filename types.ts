export enum TaxRegime {
  SIMPLES_NACIONAL = 'Simples Nacional',
  LUCRO_REAL = 'Lucro Real',
  LUCRO_PRESUMIDO = 'Lucro Presumido',
}

export type TaxType =
  | 'Simples Nacional'
  | 'ISS'
  | 'PIS'
  | 'Cofins'
  | 'IRPJ'
  | 'Adicional IRPJ'
  | 'CSLL'
  | 'IBS/CBS'
  | 'CBS'
  | 'IBS'
  | 'CBS (Teste 2026)'
  | 'IBS (Teste 2026)';

export type AnexoType = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface Cnae {
  cnae: string;
  descricao: string;
  anexo: AnexoType;
  observacao: string;
}

export interface Faixa {
  ordem: number;
  receita_12m_min: number;
  receita_12m_max: number;
  aliquota_percentual: number;
  parcela_deduzir: number;
}

export interface Anexo {
  anexo: AnexoType;
  descricao: string;
  faixas: Faixa[];
}


export interface CalculatorParams {
  simulationYear: number;
  regime: TaxRegime;
  receita: number; // Monthly revenue
  custo: number;
  presuncao: number;
  pat: boolean;
  cnaeCode: string;
  // Simples Nacional specific
  rbt12?: number; // Revenue last 12 months
  folha?: number; // Payroll last 12 months
  // Tax Reform specific
  creditGeneratingCosts: number;
}

export interface TaxResult {
  total: number;
  breakdown: { name: string; value: number; rate?: string; category: 'receita' | 'resultado' | 'informativo' }[];
  effectiveRate: number;
}