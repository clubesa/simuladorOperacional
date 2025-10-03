
export const cnaes = [
  {
    "cnae": "47.11-3/01",
    "descricao": "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - hipermercados",
    "anexo": "I",
    "observacao": "Atividade de comércio"
  },
  {
    "cnae": "56.11-2/01",
    "descricao": "Restaurantes e similares",
    "anexo": "I",
    "observacao": "Pode incluir alimentação fora do domicílio"
  },
  {
    "cnae": "62.02-3/00",
    "descricao": "Desenvolvimento e licenciamento de programas de computador customizáveis",
    "anexo": "V",
    "observacao": "Pode migrar para Anexo III se Fator R >= 28%"
  },
  {
    "cnae": "62.03-1/00",
    "descricao": "Desenvolvimento e licenciamento de programas de computador não-customizáveis",
    "anexo": "V",
    "observacao": "Pode migrar para Anexo III se Fator R >= 28%"
  },
  {
    "cnae": "69.20-6/01",
    "descricao": "Atividades jurídicas, advocacia",
    "anexo": "IV",
    "observacao": "Não utiliza Fator R"
  },
  {
    "cnae": "74.90-1/04",
    "descricao": "Atividades de intermediação e agenciamento de serviços e negócios em geral, exceto imobiliários",
    "anexo": "V",
    "observacao": "Pode migrar para Anexo III se Fator R >= 28%"
  },
  {
    "cnae": "85.12-1/00",
    "descricao": "Educação infantil",
    "anexo": "III",
    "observacao": "Atividade de ensino"
  },
  {
    "cnae": "85.13-9/00",
    "descricao": "Ensino fundamental",
    "anexo": "III",
    "observacao": "Atividade de ensino"
  },
  {
    "cnae": "85.20-1/00",
    "descricao": "Ensino médio",
    "anexo": "III",
    "observacao": "Atividade de ensino"
  },
  {
    "cnae": "85.50-3/02",
    "descricao": "Atividades de apoio à educação, exceto caixas escolares",
    "anexo": "V", // Enquadramento inicial correto no Anexo V, sujeito ao Fator R.
    "observacao": "Pode migrar para Anexo III se Fator R >= 28%"
  }
];
export const tabelasSimplesNacional = [
      {
        "anexo": "I",
        "descricao": "Comércio",
        "faixas": [
          { "ordem": 1, "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 4.00, "parcela_deduzir": 0.00 },
          { "ordem": 2, "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 7.30, "parcela_deduzir": 5940.00 },
          { "ordem": 3, "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 9.50, "parcela_deduzir": 13860.00 },
          { "ordem": 4, "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 10.70, "parcela_deduzir": 22500.00 },
          { "ordem": 5, "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 14.30, "parcela_deduzir": 87300.00 },
          { "ordem": 6, "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 19.00, "parcela_deduzir": 378000.00 }
        ]
      },
      {
        "anexo": "II",
        "descricao": "Indústria",
        "faixas": [
          { "ordem": 1, "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 4.50, "parcela_deduzir": 0.00 },
          { "ordem": 2, "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 7.80, "parcela_deduzir": 5940.00 },
          { "ordem": 3, "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 10.00, "parcela_deduzir": 13860.00 },
          { "ordem": 4, "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 11.20, "parcela_deduzir": 22500.00 },
          { "ordem": 5, "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 14.70, "parcela_deduzir": 85500.00 },
          { "ordem": 6, "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 30.00, "parcela_deduzir": 720000.00 }
        ]
      },
      {
        "anexo": "III",
        "descricao": "Serviços",
        "faixas": [
          { "ordem": 1, "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 6.00, "parcela_deduzir": 0.00 },
          { "ordem": 2, "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 11.20, "parcela_deduzir": 9360.00 },
          { "ordem": 3, "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 13.50, "parcela_deduzir": 17640.00 },
          { "ordem": 4, "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 16.00, "parcela_deduzir": 35640.00 },
          { "ordem": 5, "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 21.00, "parcela_deduzir": 125640.00 },
          { "ordem": 6, "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 33.00, "parcela_deduzir": 648000.00 }
        ]
      },
      {
        "anexo": "IV",
        "descricao": "Serviços específicos (sem CPP no DAS)",
        "faixas": [
          { "ordem": 1, "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 4.50, "parcela_deduzir": 0.00 },
          { "ordem": 2, "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 9.00, "parcela_deduzir": 8100.00 },
          { "ordem": 3, "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 10.20, "parcela_deduzir": 12420.00 },
          { "ordem": 4, "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 14.00, "parcela_deduzir": 39780.00 },
          { "ordem": 5, "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 22.00, "parcela_deduzir": 183780.00 },
          { "ordem": 6, "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 33.00, "parcela_deduzir": 828000.00 }
        ]
      },
      {
        "anexo": "V",
        "descricao": "Serviços de maior conteúdo intelectual (Fator R < 28%)",
        "faixas": [
          { "ordem": 1, "receita_12m_min": 0.00, "receita_12m_max": 180000.00, "aliquota_percentual": 15.50, "parcela_deduzir": 0.00 },
          { "ordem": 2, "receita_12m_min": 180000.01, "receita_12m_max": 360000.00, "aliquota_percentual": 18.00, "parcela_deduzir": 4500.00 },
          { "ordem": 3, "receita_12m_min": 360000.01, "receita_12m_max": 720000.00, "aliquota_percentual": 19.50, "parcela_deduzir": 9900.00 },
          { "ordem": 4, "receita_12m_min": 720000.01, "receita_12m_max": 1800000.00, "aliquota_percentual": 20.50, "parcela_deduzir": 17100.00 },
          { "ordem": 5, "receita_12m_min": 1800000.01, "receita_12m_max": 3600000.00, "aliquota_percentual": 23.00, "parcela_deduzir": 62100.00 },
          { "ordem": 6, "receita_12m_min": 3600000.01, "receita_12m_max": 4800000.00, "aliquota_percentual": 30.50, "parcela_deduzir": 540000.00 }
        ]
      }
];
