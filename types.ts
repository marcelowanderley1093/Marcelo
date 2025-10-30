export interface Titular {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nacionalidade: string;
  profissao: string;
  endereco: string;
  telefone: string;
  email: string;
  estadoCivil: string;
  regimeBens: string;
  regimeBensOutro: string;
  dataCasamento: string;
  pactoAntenupcial: string;
  casamentosAnteriores: string;
  regimeBensAnterior: string;
  obrigacoesAlimenticias: string;
  obrigacoesAlimenticiasValor: string;
}

export interface Conjuge {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nacionalidade: string;
  profissao: string;
  patrimonioProprio: string;
  patrimonioProprioDesc: string;
}

export interface Herdeiro {
  id: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  grauParentesco: string;
  grauParentescoOutro: string;
  filhoCasamentoAtual: string;
  maiorDeIdade: string;
  estadoCivil: string;
  regimeBens: string;
  possuiFilhos: string;
  filhosNetosTitularQtde: string;
  dividasProcessos: string;
  dividasProcessosDetalhe: string;
  capacidadeGestao: string;
  interesseGestao: string;
}

export interface Imovel {
  id: string;
  tipo: string;
  tipoOutro: string;
  endereco: string;
  matricula: string;
  cartorio: string;
  area: string;
  titularidade: string;
  percentualParticipacao: string;
  valorAquisicao: string;
  anoAquisicao: string;
  valorDeclaradoIR: string;
  valorVenal: string;
  valorMercado: string;
  alugado: string;
  valorAluguel: string;
  tipoContratoLocacao: string;
  prazoContratoLocacao: string;
  onusGravames: string;
  onusGravamesQuais: string;
  onusGravamesValor: string;
  livreDesembaracado: string;
  bemDeFamilia: string;
  benfeitoriasNaoDeclaradas: string;
  benfeitoriasValorEstimado: string;
}

export interface Veiculo {
  id: string;
  tipo: string;
  tipoOutro: string;
  marcaModelo: string;
  ano: string;
  placa: string;
  renavam: string;
  valorAquisicao: string;
  valorDeclaradoIR: string;
  valorFIPE: string;
  financiamento: string;
  saldoDevedor: string;
}

export interface BemMovelRelevante {
  id: string;
  tipo: string;
  descricao: string;
  valorEstimado: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  cnpj: string;
  tipoSocietario: string;
  tipoSocietarioOutro: string;
  ramoAtividade: string;
  ramoAtividadeOutro: string;
  percentualParticipacao: string;
  valorParticipacaoIR: string;
  patrimonioLiquido: string;
  faturamentoAnual: string;
  regimeTributario: string;
  possuiDividas: string;
  dividasValor: string;
  processosJudiciais: string;
  processosJudiciaisDetalhe: string;
  outrosSocios: string;
  quemSaoSocios: string;
  acordoSocios: string;
  integralizarHolding: string;
}

export interface AplicacaoFinanceira {
    id: string;
    tipo: string;
    instituicao: string;
    valorAproximado: string;
    integralizarHolding: string;
}

export interface Divida {
    id: string;
    tipo: string;
    credor: string;
    valorTotal: string;
    valorParcela: string;
    garantias: string;
    possuiProcessoJudicial: string;
    detalhesProcessoJudicial: string;
}

export interface ReceitaFutura {
  id: string;
  tipo: string;
  descricao: string;
  valorMensal: string;
}

export interface FormData {
  dataPreenchimento: string;
  responsavelPreenchimento: string;
  titular: Titular;
  conjuge: Conjuge;
  outrosTitulares: string; // Simple text for now
  herdeiros: Herdeiro[];
  // FIX: Corrected syntax from `questoesSuc]:` to `questoesSuc:`.
  questoesSuc: {
    filhosMesmoCasamento: string;
    herdeirosMenores: string;
    herdeirosMenoresQtde: string;
    herdeirosEspeciais: string;
    herdeirosEspeciaisDetalhe: string;
    herdeirosRestricoes: string;
    herdeirosRestricoesDetalhe: string;
    conflitos: string;
    conflitosDetalhe: string;
    tratarHerdeiroDiferente: string;
    tratarHerdeiroDiferenteExplicar: string;
    testamento: string;
    testamentoAtualizado: string;
    testamentoData: string;
    alterarTestamento: string;
    beneficiarTerceiros: string;
    beneficiarTerceirosQuem: string;
  };
  objetivosHolding: {
    planejamentoSucessorio: boolean;
    protecaoPatrimonial: boolean;
    economiaTributaria: boolean;
    profissionalizacaoGestao: boolean;
    evitarInventario: boolean;
    centralizacaoAdm: boolean;
    preservacaoPatrimonio: boolean;
    regrasGovernanca: boolean;
    outros: boolean;
    outrosDesc: string;
  };
  urgenciaPrazo: {
    urgencia: string;
    motivo: string;
    motivoOutro: string;
    prazo: string;
  };
  expectativas: {
    principalPreocupacao: string;
    manterControle: string;
    herdeirosParticipem: string;
    doarQuotas: string;
    reservaUsufruto: string;
  };
  imoveis: Imovel[];
  veiculos: Veiculo[];
  bensMoveisRelevantes: BemMovelRelevante[];
  possuiParticipacoesSocietarias: string;
  empresas: Empresa[];
  aplicacoesFinanceiras: AplicacaoFinanceira[];
  outrosAtivosEDireitos: {
    possuiJoiasObrasArte: string;
    joiasObrasArteDetalhes: string;
    possuiSemoventes: string;
    semoventesDetalhes: string;
    possuiDireitosAutorais: string;
    direitosAutoraisDetalhes: string;
    possuiCriptoativos: string;
    criptoativosDetalhes: string;
    possuiCreditosReceber: string;
    creditosReceberDetalhes: string;
    possuiOutrosAtivos: string;
    outrosAtivosDetalhes: string;
  };
  dividas: Divida[];
  processosJudiciais: {
    possui: string;
    natureza: string;
    naturezaOutro: string;
    riscoCondenacao: string;
    valorContingencia: string;
    bemPenhorado: string;
    bemPenhoradoQual: string;
  },
  regularidadeFiscal: {
    irEmDia: string;
    debitosReceitaFederal: string;
    debitosReceitaFederalValor: string;
    debitosFazendaEstadual: string;
    debitosFazendaEstadualValor: string;
    debitosFazendaMunicipal: string;
    debitosFazendaMunicipalValor: string;
    malhaFina: string;
    malhaFinaAno: string;
  },
  situacaoTributaria: {
    declaracaoIR: string;
    possuiContador: string;
    contadorNomeContato: string;
    planejamentoTributarioAnterior: string;
    conheceAliquotasITCMD: string;
    aliquotaITCMD: string;
    doacoesAnteriores: string;
    doacoesAnterioresQuandoValor: string;
    pagouITCMDDoacoes: string;
    aliquotaITCMDDoacoes: string;
  },
  receitasFuturas: ReceitaFutura[];
  governanca: {
    administradores: string[];
    conselhoFamilia: string;
    regrasGovernanca: string;
    clausulasRestritivas: string;
    clausulasRestritivasQuais: string[];
    regrasEntradaSaidaSocios: string;
    acordoSocios: string;
  },
  sucessaoGestao: {
    sucessorIdentificado: string;
    prepararHerdeiros: string;
    herdeirosComPerfil: string;
    herdeirosComPerfilQuem: string;
    contratarGestaoExterna: string;
  },
  planejamentoCurtoMedioPrazo: {
    venderBem6Meses: string;
    venderBemQualValor: string;
    adquirirBens: string;
    adquirirBensQualValor: string;
    fazerDoacoes: string;
    fazerDoacoesQuando: string;
    atividadeImobiliaria: string;
    iniciarAtividadeImobiliaria: string;
    expandirNegocios: string;
    expandirNegociosDetalhe: string;
  },
  liquidez: {
    valorMensalManutencao: string;
    despesasExtraordinarias: string;
    despesasExtraordinariasValor: string;
    recursosITCMD: string;
    recursosITCMDValor: string;
    comoPagarITCMD: string;
    comoPagarITCMDOutro: string;
  },
  infoComplementares: {
    situacaoSensivel: string;
    bensExterior: string;
    bensExteriorDetalhe: string;
    offshoreTrusts: string;
    offshoreTrustsDetalhe: string;
    expectativaHeranca: string;
    expectativaHerancaValor: string;
    seguroVida: string;
    seguroVidaCobertura: string;
    seguroVidaBeneficiarios: string;
    clausulaProtecaoDivorcio: string;
    conhecimentoReformaTributaria: string;
    consultouOutrosProfissionais: string;
    consultouOutrosProfissionaisQuemQuando: string;
  },
  declaracao: {
    localData: string;
  }
}