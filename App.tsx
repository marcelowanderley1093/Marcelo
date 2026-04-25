
import React, { useState, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';
import { LOGO_BASE64 } from './logoBase64';
import {
  Titular,
  Conjuge,
  Herdeiro,
  Imovel,
  Veiculo,
  BemMovelRelevante,
  Empresa,
  AplicacaoFinanceira,
  Divida,
  ReceitaFutura,
  FormData
} from './types';

const initialFormData: FormData = {
  dataPreenchimento: new Date().toLocaleDateString('pt-BR'),
  responsavelPreenchimento: '',
  titular: {
    nomeCompleto: '', cpf: '', rg: '', dataNascimento: '', nacionalidade: '', profissao: '', endereco: '', telefone: '', email: '',
    estadoCivil: '', regimeBens: '', regimeBensOutro: '', dataCasamento: '', pactoAntenupcial: '', casamentosAnteriores: '',
    regimeBensAnterior: '', obrigacoesAlimenticias: '', obrigacoesAlimenticiasValor: ''
  },
  conjuge: {
    nomeCompleto: '', cpf: '', rg: '', dataNascimento: '', nacionalidade: '', profissao: '', patrimonioProprio: '', patrimonioProprioDesc: ''
  },
  outrosTitulares: '',
  herdeiros: [],
  questoesSuc: {
    filhosMesmoCasamento: '', herdeirosMenores: '', herdeirosMenoresQtde: '', herdeirosEspeciais: '', herdeirosEspeciaisDetalhe: '',
    herdeirosRestricoes: '', herdeirosRestricoesDetalhe: '', conflitos: '', conflitosDetalhe: '', tratarHerdeiroDiferente: '',
    tratarHerdeiroDiferenteExplicar: '', testamento: '', testamentoAtualizado: '', testamentoData: '', alterarTestamento: '',
    beneficiarTerceiros: '', beneficiarTerceirosQuem: ''
  },
  objetivosHolding: {
    planejamentoSucessorio: false, protecaoPatrimonial: false, economiaTributaria: false, profissionalizacaoGestao: false,
    evitarInventario: false, centralizacaoAdm: false, preservacaoPatrimonio: false, regrasGovernanca: false, outros: false, outrosDesc: ''
  },
  urgenciaPrazo: { urgencia: '', motivo: '', motivoOutro: '', prazo: '' },
  expectativas: { principalPreocupacao: '', manterControle: '', herdeirosParticipem: '', doarQuotas: '', reservaUsufruto: '' },
  imoveis: [],
  veiculos: [],
  bensMoveisRelevantes: [],
  possuiParticipacoesSocietarias: '',
  empresas: [],
  aplicacoesFinanceiras: [],
  outrosAtivosEDireitos: {
    possuiJoiasObrasArte: '', joiasObrasArteDetalhes: '', possuiSemoventes: '', semoventesDetalhes: '',
    possuiDireitosAutorais: '', direitosAutoraisDetalhes: '', possuiCriptoativos: '', criptoativosDetalhes: '',
    possuiCreditosReceber: '', creditosReceberDetalhes: '', possuiOutrosAtivos: '', outrosAtivosDetalhes: ''
  },
  dividas: [],
  processosJudiciais: { possui: '', natureza: '', naturezaOutro: '', riscoCondenacao: '', valorContingencia: '', bemPenhorado: '', bemPenhoradoQual: '' },
  regularidadeFiscal: {
    irEmDia: '', debitosReceitaFederal: '', debitosReceitaFederalValor: '', debitosFazendaEstadual: '', debitosFazendaEstadualValor: '',
    debitosFazendaMunicipal: '', debitosFazendaMunicipalValor: '', malhaFina: '', malhaFinaAno: ''
  },
  situacaoTributaria: {
    declaracaoIR: '', possuiContador: '', contadorNomeContato: '', planejamentoTributarioAnterior: '', conheceAliquotasITCMD: '',
    aliquotaITCMD: '', doacoesAnteriores: '', doacoesAnterioresQuandoValor: '', pagouITCMDDoacoes: '', aliquotaITCMDDoacoes: ''
  },
  receitasFuturas: [],
  governanca: {
    administradores: [], conselhoFamilia: '', regrasGovernanca: '', clausulasRestritivas: '', clausulasRestritivasQuais: [],
    regrasEntradaSaidaSocios: '', acordoSocios: ''
  },
  sucessaoGestao: { sucessorIdentificado: '', prepararHerdeiros: '', herdeirosComPerfil: '', herdeirosComPerfilQuem: '', contratarGestaoExterna: '' },
  planejamentoCurtoMedioPrazo: {
    venderBem6Meses: '', venderBemQualValor: '', adquirirBens: '', adquirirBensQualValor: '', fazerDoacoes: '',
    fazerDoacoesQuando: '', atividadeImobiliaria: '', iniciarAtividadeImobiliaria: '', expandirNegocios: '', expandirNegociosDetalhe: ''
  },
  liquidez: {
    valorMensalManutencao: '', despesasExtraordinarias: '', despesasExtraordinariasValor: '', recursosITCMD: '',
    recursosITCMDValor: '', comoPagarITCMD: '', comoPagarITCMDOutro: ''
  },
  infoComplementares: {
    situacaoSensivel: '', bensExterior: '', bensExteriorDetalhe: '', offshoreTrusts: '', offshoreTrustsDetalhe: '',
    expectativaHeranca: '', expectativaHerancaValor: '', seguroVida: '', seguroVidaCobertura: '', seguroVidaBeneficiarios: '',
    clausulaProtecaoDivorcio: '', conhecimentoReformaTributaria: '', consultouOutrosProfissionais: '', consultouOutrosProfissionaisQuemQuando: ''
  },
  declaracao: { localData: '' }
};

const TOTAL_STEPS = 23;


const isValidCPF = (cpf: string | null | undefined): boolean => {
  if (!cpf) return false;

  const cpfClean = cpf.replace(/[^\d]/g, '');

  if (cpfClean.length !== 11 || /^(\d)\1+$/.test(cpfClean)) {
    return false;
  }

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpfClean.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpfClean.substring(10, 11))) {
    return false;
  }

  return true;
};


// Helper Components (defined outside main App component to prevent re-creation on re-renders)
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-6 transition-all duration-300 ease-in-out step-card">
    <h2 className="text-xl font-bold pb-3 border-b-2" style={{color:'#4A4A4A', borderColor:'#4FBFBF', fontFamily:'Montserrat,sans-serif'}}>{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const TextInput: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    placeholder?: string; 
    type?: string;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
}> = ({ label, name, value, onChange, placeholder = '', type = 'text', onBlur, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input 
      type={type} 
      id={name} 
      name={name} 
      value={value} 
      onChange={onChange}
      onBlur={onBlur} 
      placeholder={placeholder} 
      className={`w-full px-4 py-2 border rounded-md shadow-sm transition ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}`}
      style={!error ? {outlineColor:'#4FBFBF'} : {}}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && <p id={`${name}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);


const TextArea: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }> = ({ label, name, value, onChange, placeholder = '', rows = 3 }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm transition" style={{outlineColor:'#4FBFBF'}}></textarea>
  </div>
);

const RadioGroup: React.FC<{ label: string; name: string; value: string; options: { label: string; value: string }[]; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-2">{label}</label>
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {options.map(option => (
        <div key={option.value} className="flex items-center">
          <input type="radio" id={`${name}-${option.value}`} name={name} value={option.value} checked={value === option.value} onChange={onChange} className="h-4 w-4 border-slate-300" style={{accentColor:'#4FBFBF'}} />
          <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-slate-800">{option.label}</label>
        </div>
      ))}
    </div>
  </div>
);

const Checkbox: React.FC<{ label: string; name: string; value?: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, checked, onChange }) => (
    <div className="flex items-center">
        <input type="checkbox" id={name} name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 border-slate-300 rounded" style={{accentColor:'#4FBFBF'}} />
        <label htmlFor={name} className="ml-2 block text-sm text-slate-800">{label}</label>
    </div>
);

const AddButton: React.FC<{ onClick: () => void; text: string }> = ({ onClick, text }) => (
    <button type="button" onClick={onClick} className="mt-2 flex items-center gap-2 px-4 py-2 border border-dashed rounded-md transition" style={{borderColor:'#4FBFBF', color:'#4FBFBF'}}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
        {text}
    </button>
);

const RemoveButton: React.FC<{ onClick: () => void; }> = ({ onClick }) => (
    <button type="button" onClick={onClick} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
    </button>
);

const StepTitle: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold tracking-tight" style={{color:'#4A4A4A', fontFamily:'Montserrat,sans-serif'}}>{title}</h2>
    <p className="mt-1" style={{color:'#999999'}}>{subtitle}</p>
  </div>
);


// Main App Component
export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle'|'success'|'error'>('idle');
  const formRef = useRef<HTMLDivElement>(null);


  const validateAndCheckDuplicates = useCallback((cpf: string, fieldId: string) => {
    // Clear error if field is empty
    if (!cpf.trim()) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
        return;
    }

    // Check for valid CPF format
    if (!isValidCPF(cpf)) {
        setErrors(prev => ({ ...prev, [fieldId]: 'CPF inválido.' }));
        return;
    }

    // Check for duplicates
    const allCpfs: { id: string, value: string }[] = [];
    if (formData.titular.cpf) {
        allCpfs.push({ id: 'titular-cpf', value: formData.titular.cpf });
    }
    if (formData.conjuge.cpf) {
        allCpfs.push({ id: 'conjuge-cpf', value: formData.conjuge.cpf });
    }
    formData.herdeiros.forEach(h => {
        if (h.cpf) {
            allCpfs.push({ id: `herdeiro-${h.id}-cpf`, value: h.cpf });
        }
    });

    const duplicates = allCpfs.filter(c => c.value === cpf);
    const isDuplicate = duplicates.length > 1 || (duplicates.length === 1 && duplicates[0].id !== fieldId);


    if (isDuplicate) {
        setErrors(prev => ({ ...prev, [fieldId]: 'Este CPF já foi utilizado.' }));
    } else {
        // Clear error if valid and not a duplicate
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            // Also clear errors from other fields that had this same duplicate CPF
            Object.keys(newErrors).forEach(key => {
                if (newErrors[key] === 'Este CPF já foi utilizado.') {
                     const otherCpfValue = key.startsWith('herdeiro') 
                        ? formData.herdeiros.find(h => `herdeiro-${h.id}-cpf` === key)?.cpf
                        : (key === 'titular-cpf' ? formData.titular.cpf : formData.conjuge.cpf);
                    if (otherCpfValue === cpf) {
                        delete newErrors[key];
                    }
                }
            });
            return newErrors;
        });
    }
  }, [formData.titular.cpf, formData.conjuge.cpf, formData.herdeiros]);

  const handleCpfBlur = (e: React.FocusEvent<HTMLInputElement>, fieldId: string) => {
      validateAndCheckDuplicates(e.target.value, fieldId);
  };

  const isStepValid = useCallback(() => {
    const errorKeys = Object.keys(errors);
    const activeErrors = errorKeys.filter(key => !!errors[key]);
    
    if (activeErrors.length === 0) return true;

    switch (currentStep) {
        case 1:
            return !activeErrors.some(key => key === 'titular-cpf');
        case 2:
            return !activeErrors.some(key => key === 'conjuge-cpf');
        case 3:
            return !activeErrors.some(key => key.startsWith('herdeiro-'));
        default:
            return true; 
    }
  }, [currentStep, errors]);


  const handleInputChange = useCallback((section: keyof FormData, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: e.target.value,
      },
    }));
  }, []);

   const handleCheckboxChange = useCallback((section: keyof FormData, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: e.target.checked,
      },
    }));
  }, []);

  const handleMultiCheckboxChange = useCallback((section: keyof FormData, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
        const currentValues = (prev[section] as any)[field] as string[];
        const newValues = checked
            ? [...currentValues, value]
            : currentValues.filter(item => item !== value);
        
        return {
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: newValues,
            },
        };
    });
}, []);

  const handleDynamicChange = <T extends { id: string }>(
    section: keyof FormData,
    id: string,
    field: keyof T
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    const isCpfField = field === 'cpf';
    
    setFormData(prev => {
        const list = (prev[section] as T[]).map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        return { ...prev, [section]: list };
    });

    if (isCpfField && section === 'herdeiros') {
        const fieldId = `herdeiro-${id}-cpf`;
        validateAndCheckDuplicates(value, fieldId);
    }
  };


  const addDynamicItem = <T,>(section: keyof FormData, newItem: T) => {
    setFormData(prev => ({
        ...prev,
        [section]: [...(prev[section] as T[]), newItem],
    }));
  };

  const removeDynamicItem = (section: keyof FormData, id: string) => {
    setFormData(prev => ({
        ...prev,
        [section]: (prev[section] as { id: string }[]).filter(item => item.id !== id),
    }));
  };

  const addHerdeiro = () => addDynamicItem<Herdeiro>('herdeiros', {
      id: crypto.randomUUID(), nomeCompleto: '', cpf: '', dataNascimento: '', grauParentesco: '', grauParentescoOutro: '',
      filhoCasamentoAtual: '', maiorDeIdade: '', estadoCivil: '', regimeBens: '', possuiFilhos: '', filhosNetosTitularQtde: '',
      dividasProcessos: '', dividasProcessosDetalhe: '', capacidadeGestao: '', interesseGestao: ''
  });

  const addImovel = () => addDynamicItem<Imovel>('imoveis', {
      id: crypto.randomUUID(), tipo: '', tipoOutro: '', endereco: '', matricula: '', cartorio: '', area: '', titularidade: '',
      percentualParticipacao: '', valorAquisicao: '', anoAquisicao: '', valorDeclaradoIR: '', valorVenal: '', valorMercado: '',
      alugado: '', valorAluguel: '', tipoContratoLocacao: '', prazoContratoLocacao: '', onusGravames: '', onusGravamesQuais: '',
      onusGravamesValor: '', livreDesembaracado: '', bemDeFamilia: '', benfeitoriasNaoDeclaradas: '', benfeitoriasValorEstimado: ''
  });
  
   const addVeiculo = () => addDynamicItem<Veiculo>('veiculos', {
    id: crypto.randomUUID(), tipo: '', tipoOutro: '', marcaModelo: '', ano: '', placa: '', renavam: '', valorAquisicao: '',
    valorDeclaradoIR: '', valorFIPE: '', financiamento: '', saldoDevedor: ''
  });

  const addBemMovelRelevante = () => addDynamicItem<BemMovelRelevante>('bensMoveisRelevantes', {
    id: crypto.randomUUID(), tipo: '', descricao: '', valorEstimado: ''
  });

  const addEmpresa = () => addDynamicItem<Empresa>('empresas', {
    id: crypto.randomUUID(), razaoSocial: '', cnpj: '', tipoSocietario: '', tipoSocietarioOutro: '', ramoAtividade: '',
    ramoAtividadeOutro: '', percentualParticipacao: '', valorParticipacaoIR: '', patrimonioLiquido: '', faturamentoAnual: '',
    regimeTributario: '', possuiDividas: '', dividasValor: '', processosJudiciais: '', processosJudiciaisDetalhe: '',
    outrosSocios: '', quemSaoSocios: '', acordoSocios: '', integralizarHolding: ''
  });

  const addAplicacaoFinanceira = () => addDynamicItem<AplicacaoFinanceira>('aplicacoesFinanceiras', {
      id: crypto.randomUUID(), tipo: '', instituicao: '', valorAproximado: '', integralizarHolding: ''
  });
  
  const addDivida = () => addDynamicItem<Divida>('dividas', {
    id: crypto.randomUUID(), tipo: '', credor: '', valorTotal: '', valorParcela: '', garantias: '', possuiProcessoJudicial: '', detalhesProcessoJudicial: ''
  });

  const addReceitaFutura = () => addDynamicItem<ReceitaFutura>('receitasFuturas', {
    id: crypto.randomUUID(), tipo: '', descricao: '', valorMensal: ''
  });

  const nextStep = () => setCurrentStep(prev => (prev < TOTAL_STEPS - 1 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));

  const generatePDF = async (): Promise<Blob> => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // Header com logo oficial Primetax
    pdf.setFillColor(74, 74, 74);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    pdf.setFillColor(79, 191, 191);
    pdf.rect(0, 30, pageWidth, 2, 'F');
    // Logo oficial (PNG base64) — posicionado no canto esquerdo do header
    try {
      pdf.addImage(LOGO_BASE64, 'PNG', margin, 5, 55, 20);
    } catch(e) {
      // fallback texto se imagem falhar
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('PRIMETAX SOLUTIONS', margin, 18);
    }
    // Subtítulo no lado direito
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('Questionário de Holding Familiar', pageWidth - margin, 12, { align: 'right' });
    pdf.text('Planejamento Patrimonial e Sucessório', pageWidth - margin, 19, { align: 'right' });
    y = 42;

    // Informações do titular
    pdf.setTextColor(74, 74, 74);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('DADOS DO TITULAR', margin, y);
    pdf.setFillColor(79, 191, 191);
    pdf.rect(margin, y + 1, pageWidth - 2 * margin, 0.5, 'F');
    y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const addField = (label: string, value: string) => {
      if (y > pageHeight - 25) {
        pdf.addPage();
        y = margin;
        pdf.setFillColor(74, 74, 74);
        pdf.rect(0, 0, pageWidth, 14, 'F');
        pdf.setFillColor(79, 191, 191);
        pdf.rect(0, 14, pageWidth, 1, 'F');
        try { pdf.addImage(LOGO_BASE64, 'PNG', margin, 1, 28, 12); } catch(e) {}
        y = 20;
      }
      if (!value || value === '') return;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(74, 74, 74);
      pdf.text(`${label}:`, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const lines = pdf.splitTextToSize(value, pageWidth - margin * 2 - 45);
      pdf.text(lines, margin + 45, y);
      y += Math.max(6, lines.length * 5);
    };

    const addSection = (title: string) => {
      if (y > pageHeight - 35) {
        pdf.addPage();
        y = margin;
        pdf.setFillColor(74, 74, 74);
        pdf.rect(0, 0, pageWidth, 14, 'F');
        pdf.setFillColor(79, 191, 191);
        pdf.rect(0, 14, pageWidth, 1, 'F');
        try { pdf.addImage(LOGO_BASE64, 'PNG', margin, 1, 28, 12); } catch(e) {}
        y = 20;
      }
      y += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(74, 74, 74);
      pdf.text(title, margin, y);
      pdf.setFillColor(79, 191, 191);
      pdf.rect(margin, y + 1, pageWidth - 2 * margin, 0.4, 'F');
      y += 8;
      pdf.setFontSize(10);
    };

    addField('Data', formData.dataPreenchimento);
    addField('Responsável', formData.responsavelPreenchimento);

    addSection('1. Dados do Titular');
    addField('Nome', formData.titular.nomeCompleto);
    addField('CPF', formData.titular.cpf);
    addField('RG', formData.titular.rg);
    addField('Nascimento', formData.titular.dataNascimento);
    addField('Nacionalidade', formData.titular.nacionalidade);
    addField('Profissão', formData.titular.profissao);
    addField('Endereço', formData.titular.endereco);
    addField('Telefone', formData.titular.telefone);
    addField('E-mail', formData.titular.email);
    addField('Estado Civil', formData.titular.estadoCivil);
    addField('Regime de Bens', formData.titular.regimeBens);

    addSection('2. Cônjuge');
    addField('Nome', formData.conjuge.nomeCompleto);
    addField('CPF', formData.conjuge.cpf);
    addField('Nascimento', formData.conjuge.dataNascimento);
    addField('Profissão', formData.conjuge.profissao);

    addSection('3. Herdeiros');
    formData.herdeiros.forEach((h, i) => {
      addField(`Herdeiro ${i+1}`, h.nomeCompleto);
      addField('CPF', h.cpf);
      addField('Parentesco', h.grauParentesco);
    });

    addSection('4. Objetivos da Holding');
    const objetivos = Object.entries(formData.objetivosHolding)
      .filter(([k, v]) => v === true)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())
      .join(', ');
    addField('Objetivos', objetivos);

    addSection('5. Imóveis');
    formData.imoveis.forEach((im, i) => {
      addField(`Imóvel ${i+1}`, `${im.tipo} — ${im.endereco}`);
      addField('Valor Mercado', im.valorMercado ? `R$ ${im.valorMercado}` : '');
    });

    addSection('6. Empresas');
    formData.empresas.forEach((emp, i) => {
      addField(`Empresa ${i+1}`, emp.razaoSocial);
      addField('CNPJ', emp.cnpj);
      addField('Participação', emp.percentualParticipacao ? `${emp.percentualParticipacao}%` : '');
    });

    addSection('7. Situação Tributária');
    addField('IR em dia', formData.regularidadeFiscal.irEmDia);
    addField('Débitos Receita Federal', formData.regularidadeFiscal.debitosReceitaFederal);
    addField('Malha Fina', formData.regularidadeFiscal.malhaFina);

    addSection('8. Informações Complementares');
    addField('Bens no Exterior', formData.infoComplementares.bensExterior);
    addField('Offshore/Trusts', formData.infoComplementares.offshoreTrusts);
    addField('Seguro de Vida', formData.infoComplementares.seguroVida);

    // Footer
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
      pdf.setFillColor(79, 191, 191);
      pdf.rect(0, pageHeight - 10, pageWidth, 0.5, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(153, 153, 153);
      pdf.text('Primetax Solutions — Documento Confidencial', margin, pageHeight - 4);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 4);
    }

    return pdf.output('blob');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      // Gerar PDF
      const pdfBlob = await generatePDF();
      // Download automático
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Questionario_Holding_${formData.titular.nomeCompleto || 'Cliente'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Enviar e-mail via EmailJS
      // Substitua os IDs abaixo com os seus do EmailJS
      const EMAILJS_SERVICE_ID = 'service_primetax';
      const EMAILJS_TEMPLATE_ID = 'template_holding';
      const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

      const templateParams = {
        titular_nome: formData.titular.nomeCompleto || 'Não informado',
        titular_email: formData.titular.email || 'Não informado',
        titular_cpf: formData.titular.cpf || 'Não informado',
        data_preenchimento: formData.dataPreenchimento,
        responsavel: formData.responsavelPreenchimento || 'Não informado',
        num_herdeiros: String(formData.herdeiros.length),
        num_imoveis: String(formData.imoveis.length),
        num_empresas: String(formData.empresas.length),
        to_email: 'contato@primetax.com.br',
      };

      if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      }

      setSubmitStatus('success');
    } catch (err) {
      console.error('Erro ao enviar:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  
  const renderStep = () => {
      switch (currentStep) {
        case 0:
            return (
                <SectionCard title="Instruções e Identificação Inicial">
                  <div className="rounded-lg p-4 mb-2" style={{backgroundColor:'#f0fafa', border:'1px solid #4FBFBF'}}>
                    <p className="text-sm font-bold mb-1" style={{color:'#4A4A4A', fontFamily:'Montserrat,sans-serif'}}>Bem-vindo ao Diagnóstico Patrimonial da Primetax</p>
                    <p className="text-sm" style={{color:'#4A4A4A'}}>Este questionário foi desenvolvido pela equipe da <strong>Primetax Solutions</strong> para coletar as informações necessárias à elaboração do seu planejamento patrimonial e sucessório com <strong>segurança jurídica e eficiência tributária</strong>.</p>
                    <p className="text-sm mt-2" style={{color:'#4A4A4A'}}>Todas as informações são <strong>estritamente confidenciais</strong> e utilizadas exclusivamente para fins de estruturação da holding familiar.</p>
                  </div>
                  <div className="rounded-lg p-3" style={{backgroundColor:'#fffbeb', border:'1px solid #fcd34d'}}>
                    <p className="text-sm font-semibold" style={{color:'#92400e'}}>&#9888; Importante: Responda com o máximo de detalhes possível. Caso não tenha alguma informação no momento, indique "A FORNECER" e providencie posteriormente. Informações incompletas podem comprometer a eficácia do planejamento.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
                     <TextInput label="Data" name="dataPreenchimento" value={formData.dataPreenchimento} onChange={(e) => setFormData(p => ({...p, dataPreenchimento: e.target.value}))} type="text" />
                     <TextInput label="Responsável pelo preenchimento" name="responsavelPreenchimento" value={formData.responsavelPreenchimento} onChange={(e) => setFormData(p => ({...p, responsavelPreenchimento: e.target.value}))} placeholder="Seu nome completo" />
                  </div>
                </SectionCard>
            );
        case 1:
            return (
              <>
                <StepTitle title="1. Dados dos Titulares" subtitle="Informações sobre o patriarca/matriarca e cônjuge." />
                <SectionCard title="1.1. Dados Pessoais do Titular Principal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label="Nome completo" name="nomeCompleto" value={formData.titular.nomeCompleto} onChange={handleInputChange('titular', 'nomeCompleto')} />
                        <TextInput 
                          label="CPF" 
                          name="cpf" 
                          value={formData.titular.cpf} 
                          onChange={handleInputChange('titular', 'cpf')} 
                          onBlur={(e) => handleCpfBlur(e, 'titular-cpf')}
                          error={errors['titular-cpf']}
                        />
                        <TextInput label="RG (número e órgão emissor)" name="rg" value={formData.titular.rg} onChange={handleInputChange('titular', 'rg')} />
                        <TextInput label="Data de nascimento" name="dataNascimento" value={formData.titular.dataNascimento} onChange={handleInputChange('titular', 'dataNascimento')} type="date" />
                        <TextInput label="Nacionalidade" name="nacionalidade" value={formData.titular.nacionalidade} onChange={handleInputChange('titular', 'nacionalidade')} />
                        <TextInput label="Profissão/Ocupação" name="profissao" value={formData.titular.profissao} onChange={handleInputChange('titular', 'profissao')} />
                        <TextInput label="Endereço residencial completo" name="endereco" value={formData.titular.endereco} onChange={handleInputChange('titular', 'endereco')} />
                        <TextInput label="Telefone(s) de contato" name="telefone" value={formData.titular.telefone} onChange={handleInputChange('titular', 'telefone')} />
                        <TextInput label="E-mail" name="email" value={formData.titular.email} onChange={handleInputChange('titular', 'email')} type="email" />
                    </div>
                </SectionCard>
                <SectionCard title="1.2. Estado Civil e Regime de Bens do Titular">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <RadioGroup label="Estado civil atual" name="estadoCivil" value={formData.titular.estadoCivil} onChange={handleInputChange('titular', 'estadoCivil')} options={[{label: 'Solteiro(a)', value: 'solteiro'}, {label: 'Casado(a)', value: 'casado'}, {label: 'União estável', value: 'uniao_estavel'}, {label: 'Divorciado(a)', value: 'divorciado'}, {label: 'Viúvo(a)', value: 'viuvo'}]} />
                        <RadioGroup label="Se casado(a) ou em união estável, qual o regime de bens?" name="regimeBens" value={formData.titular.regimeBens} onChange={handleInputChange('titular', 'regimeBens')} options={[{label: 'Comunhão parcial', value: 'parcial'}, {label: 'Comunhão universal', value: 'universal'}, {label: 'Separação total', value: 'separacao'}, {label: 'Participação final nos aquestos', value: 'aquestos'}, {label: 'Outro', value: 'outro'}]} />
                        {formData.titular.regimeBens === 'outro' && <TextInput label="Qual outro regime?" name="regimeBensOutro" value={formData.titular.regimeBensOutro} onChange={handleInputChange('titular', 'regimeBensOutro')} />}
                        <TextInput label="Data do casamento/início da união estável" name="dataCasamento" value={formData.titular.dataCasamento} onChange={handleInputChange('titular', 'dataCasamento')} type="date"/>
                        <RadioGroup label="Possui pacto antenupcial ou contrato de convivência?" name="pactoAntenupcial" value={formData.titular.pactoAntenupcial} onChange={handleInputChange('titular', 'pactoAntenupcial')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        <RadioGroup label="Houve casamentos/uniões anteriores?" name="casamentosAnteriores" value={formData.titular.casamentosAnteriores} onChange={handleInputChange('titular', 'casamentosAnteriores')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.titular.casamentosAnteriores === 'sim' && <TextInput label="Se sim, qual o regime de bens do casamento anterior?" name="regimeBensAnterior" value={formData.titular.regimeBensAnterior} onChange={handleInputChange('titular', 'regimeBensAnterior')} />}
                        <RadioGroup label="Há obrigações alimentícias decorrentes de relação anterior?" name="obrigacoesAlimenticias" value={formData.titular.obrigacoesAlimenticias} onChange={handleInputChange('titular', 'obrigacoesAlimenticias')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.titular.obrigacoesAlimenticias === 'sim' && <TextInput label="Valor mensal (R$)" name="obrigacoesAlimenticiasValor" value={formData.titular.obrigacoesAlimenticiasValor} onChange={handleInputChange('titular', 'obrigacoesAlimenticiasValor')} type="number" />}
                    </div>
                </SectionCard>
              </>
            );
        case 2:
            return (
              <>
                <StepTitle title="1. Dados dos Titulares (Continuação)" subtitle="Detalhes do cônjuge e outros possíveis titulares do patrimônio." />
                <SectionCard title="1.3. Dados do Cônjuge/Companheiro(a)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label="Nome completo" name="nomeCompleto" value={formData.conjuge.nomeCompleto} onChange={handleInputChange('conjuge', 'nomeCompleto')} />
                        <TextInput 
                          label="CPF" 
                          name="cpf" 
                          value={formData.conjuge.cpf} 
                          onChange={handleInputChange('conjuge', 'cpf')}
                          onBlur={(e) => handleCpfBlur(e, 'conjuge-cpf')}
                          error={errors['conjuge-cpf']}
                        />
                        <TextInput label="RG (número e órgão emissor)" name="rg" value={formData.conjuge.rg} onChange={handleInputChange('conjuge', 'rg')} />
                        <TextInput label="Data de nascimento" name="dataNascimento" value={formData.conjuge.dataNascimento} onChange={handleInputChange('conjuge', 'dataNascimento')} type="date" />
                        <TextInput label="Nacionalidade" name="nacionalidade" value={formData.conjuge.nacionalidade} onChange={handleInputChange('conjuge', 'nacionalidade')} />
                        <TextInput label="Profissão/Ocupação" name="profissao" value={formData.conjuge.profissao} onChange={handleInputChange('conjuge', 'profissao')} />
                         <RadioGroup label="Possui patrimônio próprio relevante?" name="patrimonioProprio" value={formData.conjuge.patrimonioProprio} onChange={handleInputChange('conjuge', 'patrimonioProprio')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.conjuge.patrimonioProprio === 'sim' && <TextArea label="Descrever o patrimônio" name="patrimonioProprioDesc" value={formData.conjuge.patrimonioProprioDesc} onChange={handleInputChange('conjuge', 'patrimonioProprioDesc')} />}
                    </div>
                </SectionCard>
                <SectionCard title="1.4. Outros Titulares (se houver cotitularidade)">
                    <TextArea label="Caso haja outros titulares do patrimônio (irmãos, pais, sócios, etc.), informe os dados principais de cada um." name="outrosTitulares" value={formData.outrosTitulares} onChange={(e) => setFormData(p => ({...p, outrosTitulares: e.target.value}))} placeholder="Nome, CPF, relação com o titular principal..." />
                </SectionCard>
              </>
            );
        case 3:
            return (
                <>
                <StepTitle title="2. Composição Familiar e Sucessória" subtitle="Informações sobre os herdeiros diretos." />
                <SectionCard title="2.1. Informações sobre os Herdeiros">
                    <div className="pt-6">
                        <h3 className="text-lg font-semibold text-slate-700">Detalhes dos Herdeiros</h3>
                        <div className="space-y-6 mt-4">
                            {formData.herdeiros.map((herdeiro, index) => {
                                const herdeiroCpfId = `herdeiro-${herdeiro.id}-cpf`;
                                return (
                                <div key={herdeiro.id} className="p-4 border rounded-lg bg-slate-50 relative">
                                    <div className="absolute top-2 right-2">
                                        <RemoveButton onClick={() => removeDynamicItem('herdeiros', herdeiro.id)} />
                                    </div>
                                    <h4 className="font-bold text-indigo-700 mb-4">Herdeiro {index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TextInput label="Nome completo" name="nomeCompleto" value={herdeiro.nomeCompleto} onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'nomeCompleto')} />
                                        <TextInput 
                                          label="CPF" 
                                          name="cpf" 
                                          value={herdeiro.cpf} 
                                          onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'cpf')}
                                          onBlur={(e) => handleCpfBlur(e, herdeiroCpfId)}
                                          error={errors[herdeiroCpfId]}
                                        />
                                        <TextInput label="Data de nascimento" name="dataNascimento" value={herdeiro.dataNascimento} onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'dataNascimento')} type="date" />
                                        <RadioGroup label="Grau de parentesco" name={`grauParentesco-${herdeiro.id}`} value={herdeiro.grauParentesco} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'grauParentesco')(e)} options={[{label: 'Filho(a)', value: 'filho'}, {label: 'Neto(a)', value: 'neto'}, {label: 'Outro', value: 'outro'}]} />
                                        {herdeiro.grauParentesco === 'outro' && <TextInput label="Qual?" name="grauParentescoOutro" value={herdeiro.grauParentescoOutro} onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'grauParentescoOutro')} />}
                                        <RadioGroup label="É filho(a) do casamento atual?" name={`filhoCasamentoAtual-${herdeiro.id}`} value={herdeiro.filhoCasamentoAtual} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'filhoCasamentoAtual')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        <RadioGroup label="É maior de idade?" name={`maiorDeIdade-${herdeiro.id}`} value={herdeiro.maiorDeIdade} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'maiorDeIdade')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        <RadioGroup label="Estado Civil" name={`estadoCivil-${herdeiro.id}`} value={herdeiro.estadoCivil} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'estadoCivil')(e)} options={[{label: 'Solteiro(a)', value: 'solteiro'}, {label: 'Casado(a)', value: 'casado'}, {label: 'União Estável', value: 'uniao_estavel'}, {label: 'Divorciado(a)', value: 'divorciado'}]} />
                                        { (herdeiro.estadoCivil === 'casado' || herdeiro.estadoCivil === 'uniao_estavel') && <TextInput label="Qual o regime de bens?" name="regimeBens" value={herdeiro.regimeBens} onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'regimeBens')} /> }
                                        <RadioGroup label="Possui filhos (netos do titular)?" name={`possuiFilhos-${herdeiro.id}`} value={herdeiro.possuiFilhos} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'possuiFilhos')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        {herdeiro.possuiFilhos === 'sim' && <TextInput label="Quantos?" name="filhosNetosTitularQtde" value={herdeiro.filhosNetosTitularQtde} onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'filhosNetosTitularQtde')} type="number" />}
                                        <RadioGroup label="Possui dívidas ou processos judiciais?" name={`dividasProcessos-${herdeiro.id}`} value={herdeiro.dividasProcessos} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'dividasProcessos')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        {herdeiro.dividasProcessos === 'sim' && <TextArea label="Detalhar" name="dividasProcessosDetalhe" value={herdeiro.dividasProcessosDetalhe} onChange={handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'dividasProcessosDetalhe')} />}
                                        <RadioGroup label="Possui capacidade de gestão patrimonial?" name={`capacidadeGestao-${herdeiro.id}`} value={herdeiro.capacidadeGestao} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'capacidadeGestao')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Parcial', value: 'parcial'}]} />
                                        <RadioGroup label="Tem interesse em participar da gestão da holding?" name={`interesseGestao-${herdeiro.id}`} value={herdeiro.interesseGestao} onChange={(e) => handleDynamicChange<Herdeiro>('herdeiros', herdeiro.id, 'interesseGestao')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'A definir', value: 'a_definir'}]} />
                                    </div>
                                </div>
                            )})}
                        </div>
                        <AddButton onClick={addHerdeiro} text="Adicionar Herdeiro" />
                    </div>
                </SectionCard>
                </>
            );
        case 4:
            return (
                <>
                <StepTitle title="2. Composição Familiar e Sucessória (Continuação)" subtitle="Questões específicas sobre o planejamento da sucessão." />
                <SectionCard title="2.2. Questões Sucessórias Específicas">
                    <RadioGroup label="São todos os filhos do mesmo casamento/união?" name="filhosMesmoCasamento" value={formData.questoesSuc.filhosMesmoCasamento} onChange={handleInputChange('questoesSuc', 'filhosMesmoCasamento')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    <RadioGroup label="Existem herdeiros menores de idade?" name="herdeirosMenores" value={formData.questoesSuc.herdeirosMenores} onChange={handleInputChange('questoesSuc', 'herdeirosMenores')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.herdeirosMenores === 'sim' && <TextInput label="Quantos?" name="herdeirosMenoresQtde" value={formData.questoesSuc.herdeirosMenoresQtde} onChange={handleInputChange('questoesSuc', 'herdeirosMenoresQtde')} type="number" />}
                    <RadioGroup label="Existe algum herdeiro que necessite de cuidados especiais (Pessoa com Deficiência)?" name="herdeirosEspeciais" value={formData.questoesSuc.herdeirosEspeciais} onChange={handleInputChange('questoesSuc', 'herdeirosEspeciais')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.herdeirosEspeciais === 'sim' && <TextArea label="Detalhar a situação" name="herdeirosEspeciaisDetalhe" value={formData.questoesSuc.herdeirosEspeciaisDetalhe} onChange={handleInputChange('questoesSuc', 'herdeirosEspeciaisDetalhe')} />}
                    <RadioGroup label="Deseja impor alguma restrição a algum herdeiro (ex: cláusula de inalienabilidade, incomunicabilidade)?" name="herdeirosRestricoes" value={formData.questoesSuc.herdeirosRestricoes} onChange={handleInputChange('questoesSuc', 'herdeirosRestricoes')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.herdeirosRestricoes === 'sim' && <TextArea label="Detalhar quais restrições e para quem" name="herdeirosRestricoesDetalhe" value={formData.questoesSuc.herdeirosRestricoesDetalhe} onChange={handleInputChange('questoesSuc', 'herdeirosRestricoesDetalhe')} />}
                    <RadioGroup label="Existem conflitos familiares relevantes entre os herdeiros?" name="conflitos" value={formData.questoesSuc.conflitos} onChange={handleInputChange('questoesSuc', 'conflitos')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.conflitos === 'sim' && <TextArea label="Descrever o conflito" name="conflitosDetalhe" value={formData.questoesSuc.conflitosDetalhe} onChange={handleInputChange('questoesSuc', 'conflitosDetalhe')} />}
                    <RadioGroup label="Deseja tratar algum herdeiro de forma diferente dos demais na sucessão (ex: deixar a parte disponível para um filho específico)?" name="tratarHerdeiroDiferente" value={formData.questoesSuc.tratarHerdeiroDiferente} onChange={handleInputChange('questoesSuc', 'tratarHerdeiroDiferente')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.tratarHerdeiroDiferente === 'sim' && <TextArea label="Explicar como e por quê" name="tratarHerdeiroDiferenteExplicar" value={formData.questoesSuc.tratarHerdeiroDiferenteExplicar} onChange={handleInputChange('questoesSuc', 'tratarHerdeiroDiferenteExplicar')} />}
                    <RadioGroup label="Possui testamento?" name="testamento" value={formData.questoesSuc.testamento} onChange={handleInputChange('questoesSuc', 'testamento')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.testamento === 'sim' && (
                        <div className="pl-4 border-l-2 border-indigo-200 space-y-4">
                            <RadioGroup label="O testamento está atualizado com a situação patrimonial e familiar atual?" name="testamentoAtualizado" value={formData.questoesSuc.testamentoAtualizado} onChange={handleInputChange('questoesSuc', 'testamentoAtualizado')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                            <TextInput label="Data do testamento" name="testamentoData" value={formData.questoesSuc.testamentoData} onChange={handleInputChange('questoesSuc', 'testamentoData')} type="date" />
                            <RadioGroup label="Pretende alterá-lo?" name="alterarTestamento" value={formData.questoesSuc.alterarTestamento} onChange={handleInputChange('questoesSuc', 'alterarTestamento')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        </div>
                    )}
                    <RadioGroup label="Deseja beneficiar na sucessão terceiros que não sejam herdeiros necessários (sobrinhos, afilhados, instituições)?" name="beneficiarTerceiros" value={formData.questoesSuc.beneficiarTerceiros} onChange={handleInputChange('questoesSuc', 'beneficiarTerceiros')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.questoesSuc.beneficiarTerceiros === 'sim' && <TextArea label="Quem e de que forma?" name="beneficiarTerceirosQuem" value={formData.questoesSuc.beneficiarTerceirosQuem} onChange={handleInputChange('questoesSuc', 'beneficiarTerceirosQuem')} />}
                </SectionCard>
                </>
            );
        case 5:
            return (
                <>
                    <StepTitle title="3. Objetivos e Expectativas" subtitle="Entendendo suas metas com a criação da holding." />
                    <SectionCard title="3.1. Objetivos Principais com a Holding">
                        <p className="text-sm text-slate-600">Selecione todos os objetivos que se aplicam. Isso nos ajudará a entender suas prioridades.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <Checkbox label="Planejamento Sucessório (facilitar a sucessão)" name="planejamentoSucessorio" checked={formData.objetivosHolding.planejamentoSucessorio} onChange={handleCheckboxChange('objetivosHolding', 'planejamentoSucessorio')} />
                            <Checkbox label="Proteção Patrimonial (blindagem)" name="protecaoPatrimonial" checked={formData.objetivosHolding.protecaoPatrimonial} onChange={handleCheckboxChange('objetivosHolding', 'protecaoPatrimonial')} />
                            <Checkbox label="Economia Tributária (reduzir impostos)" name="economiaTributaria" checked={formData.objetivosHolding.economiaTributaria} onChange={handleCheckboxChange('objetivosHolding', 'economiaTributaria')} />
                            <Checkbox label="Profissionalização da Gestão" name="profissionalizacaoGestao" checked={formData.objetivosHolding.profissionalizacaoGestao} onChange={handleCheckboxChange('objetivosHolding', 'profissionalizacaoGestao')} />
                            <Checkbox label="Evitar o processo de Inventário" name="evitarInventario" checked={formData.objetivosHolding.evitarInventario} onChange={handleCheckboxChange('objetivosHolding', 'evitarInventario')} />
                            <Checkbox label="Centralização Administrativa dos Bens" name="centralizacaoAdm" checked={formData.objetivosHolding.centralizacaoAdm} onChange={handleCheckboxChange('objetivosHolding', 'centralizacaoAdm')} />
                            <Checkbox label="Preservação do Patrimônio Familiar" name="preservacaoPatrimonio" checked={formData.objetivosHolding.preservacaoPatrimonio} onChange={handleCheckboxChange('objetivosHolding', 'preservacaoPatrimonio')} />
                            <Checkbox label="Estabelecer Regras de Governança Familiar" name="regrasGovernanca" checked={formData.objetivosHolding.regrasGovernanca} onChange={handleCheckboxChange('objetivosHolding', 'regrasGovernanca')} />
                            <Checkbox label="Outros" name="outros" checked={formData.objetivosHolding.outros} onChange={handleCheckboxChange('objetivosHolding', 'outros')} />
                        </div>
                        {formData.objetivosHolding.outros && (
                            <TextArea label="Descreva os outros objetivos" name="outrosDesc" value={formData.objetivosHolding.outrosDesc} onChange={handleInputChange('objetivosHolding', 'outrosDesc')} />
                        )}
                    </SectionCard>
                    <SectionCard title="3.2. Urgência e Prazo">
                        <RadioGroup label="Qual o grau de urgência para iniciar o projeto?" name="urgencia" value={formData.urgenciaPrazo.urgencia} onChange={handleInputChange('urgenciaPrazo', 'urgencia')} options={[{ label: 'Alta', value: 'alta' }, { label: 'Média', value: 'media' }, { label: 'Baixa', value: 'baixa' }]} />
                        <RadioGroup label="Existe algum motivo específico para a urgência?" name="motivo" value={formData.urgenciaPrazo.motivo} onChange={handleInputChange('urgenciaPrazo', 'motivo')} options={[{ label: 'Questão de saúde', value: 'saude' }, { label: 'Viagem programada', value: 'viagem' }, { label: 'Negócio em andamento', value: 'negocio' }, { label: 'Preocupação com mudanças na legislação', value: 'legislacao' }, { label: 'Outro', value: 'outro' }]} />
                        {formData.urgenciaPrazo.motivo === 'outro' && <TextInput label="Qual motivo?" name="motivoOutro" value={formData.urgenciaPrazo.motivoOutro} onChange={handleInputChange('urgenciaPrazo', 'motivoOutro')} />}
                        <TextInput label="Qual o prazo desejado para a conclusão do projeto?" name="prazo" value={formData.urgenciaPrazo.prazo} onChange={handleInputChange('urgenciaPrazo', 'prazo')} placeholder="Ex: 6 meses, 1 ano" />
                    </SectionCard>
                    <SectionCard title="3.3. Expectativas e Preocupações">
                        <TextArea label="Qual a principal preocupação que o levou a buscar o planejamento patrimonial?" name="principalPreocupacao" value={formData.expectativas.principalPreocupacao} onChange={handleInputChange('expectativas', 'principalPreocupacao')} />
                        <RadioGroup label="É fundamental para você manter o controle total sobre os bens enquanto viver?" name="manterControle" value={formData.expectativas.manterControle} onChange={handleInputChange('expectativas', 'manterControle')} options={[{ label: 'Sim, controle total', value: 'sim' }, { label: 'Não, posso delegar', value: 'nao' }, { label: 'Parcialmente', value: 'parcialmente' }]} />
                        <RadioGroup label="Como você gostaria que seus herdeiros participassem da gestão do patrimônio no futuro?" name="herdeirosParticipem" value={formData.expectativas.herdeirosParticipem} onChange={handleInputChange('expectativas', 'herdeirosParticipem')} options={[{ label: 'Ativamente na gestão', value: 'ativamente' }, { label: 'Apenas como sócios/quotistas', value: 'socios' }, { label: 'Não participarão', value: 'nao_participarao' }]} />
                        <RadioGroup label="Você pretende iniciar a doação das quotas da holding aos herdeiros em vida?" name="doarQuotas" value={formData.expectativas.doarQuotas} onChange={handleInputChange('expectativas', 'doarQuotas')} options={[{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'nao' }, { label: 'Ainda não decidi', value: 'indeciso' }]} />
                        {formData.expectativas.doarQuotas === 'sim' && <RadioGroup label="Se sim, pretende fazer com reserva de usufruto?" name="reservaUsufruto" value={formData.expectativas.reservaUsufruto} onChange={handleInputChange('expectativas', 'reservaUsufruto')} options={[{ label: 'Sim', value: 'sim' }, { label: 'Não', value: 'nao' }]} />}
                    </SectionCard>
                </>
            );
        case 6:
            return (
                <>
                <StepTitle title="4. Levantamento Patrimonial (Ativos)" subtitle="Detalhes sobre os imóveis que compõem o patrimônio." />
                <SectionCard title="4.1. Imóveis">
                    <p className="text-sm text-slate-600">Liste todos os imóveis (urbanos e rurais) de propriedade do titular, cônjuge ou em comum. Forneça os valores mais atualizados possíveis.</p>
                    <div className="space-y-6 mt-4">
                        {formData.imoveis.map((imovel, index) => (
                            <div key={imovel.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                <div className="absolute top-2 right-2">
                                    <RemoveButton onClick={() => removeDynamicItem('imoveis', imovel.id)} />
                                </div>
                                <h4 className="font-bold text-indigo-700">Imóvel {index + 1}</h4>
                               
                                {/* Identification */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput label="Tipo de Imóvel" name="tipo" value={imovel.tipo} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'tipo')} placeholder="Ex: Apartamento, Casa, Terreno Rural" />
                                    <TextInput label="Endereço Completo" name="endereco" value={imovel.endereco} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'endereco')} />
                                    <TextInput label="Matrícula do Imóvel" name="matricula" value={imovel.matricula} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'matricula')} />
                                    <TextInput label="Cartório de Registro de Imóveis" name="cartorio" value={imovel.cartorio} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'cartorio')} />
                                    <TextInput label="Área (m² ou ha)" name="area" value={imovel.area} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'area')} />
                                </div>

                                {/* Ownership */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                     <TextInput label="Titularidade" name="titularidade" value={imovel.titularidade} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'titularidade')} placeholder="Ex: Titular, Cônjuge, Ambos (50% cada)" />
                                     <TextInput label="Percentual de Participação (%)" name="percentualParticipacao" value={imovel.percentualParticipacao} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'percentualParticipacao')} type="number" />
                                </div>
                                
                                {/* Values */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                    <TextInput label="Valor de Aquisição (R$)" name="valorAquisicao" value={imovel.valorAquisicao} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'valorAquisicao')} type="number" />
                                    <TextInput label="Ano de Aquisição" name="anoAquisicao" value={imovel.anoAquisicao} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'anoAquisicao')} />
                                    <TextInput label="Valor Declarado no último I.R. (R$)" name="valorDeclaradoIR" value={imovel.valorDeclaradoIR} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'valorDeclaradoIR')} type="number" />
                                    <TextInput label="Valor Venal / IPTU / ITR (R$)" name="valorVenal" value={imovel.valorVenal} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'valorVenal')} type="number" />
                                    <TextInput label="Valor de Mercado" name="valorMercado" value={imovel.valorMercado} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'valorMercado')} type="number" />
                                </div>
                                
                                {/* Usage and Rent */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                    <RadioGroup label="Está alugado?" name={`alugado-${imovel.id}`} value={imovel.alugado} onChange={(e) => handleDynamicChange<Imovel>('imoveis', imovel.id, 'alugado')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                    {imovel.alugado === 'sim' && (
                                        <>
                                            <TextInput label="Valor Mensal do Aluguel (R$)" name="valorAluguel" value={imovel.valorAluguel} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'valorAluguel')} type="number" />
                                            <TextInput label="Tipo de Contrato" name="tipoContratoLocacao" value={imovel.tipoContratoLocacao} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'tipoContratoLocacao')} placeholder="Residencial, Comercial..." />
                                            <TextInput label="Prazo do Contrato" name="prazoContratoLocacao" value={imovel.prazoContratoLocacao} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'prazoContratoLocacao')} placeholder="Ex: 30 meses, Indeterminado" />
                                        </>
                                    )}
                                </div>

                                {/* Legal status */}
                                <div className="space-y-4 border-t pt-4">
                                    <RadioGroup label="Possui ônus ou gravames?" name={`onusGravames-${imovel.id}`} value={imovel.onusGravames} onChange={(e) => handleDynamicChange<Imovel>('imoveis', imovel.id, 'onusGravames')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                    {imovel.onusGravames === 'sim' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <TextArea label="Quais? (Hipoteca, alienação fiduciária, penhora, etc.)" name="onusGravamesQuais" value={imovel.onusGravamesQuais} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'onusGravamesQuais')} />
                                             <TextInput label="Valor Aproximado do Ônus (R$)" name="onusGravamesValor" value={imovel.onusGravamesValor} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'onusGravamesValor')} type="number" />
                                        </div>
                                    )}
                                     <RadioGroup label="É considerado bem de família legal?" name={`bemDeFamilia-${imovel.id}`} value={imovel.bemDeFamilia} onChange={(e) => handleDynamicChange<Imovel>('imoveis', imovel.id, 'bemDeFamilia')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                </div>
                                
                                {/* Improvements */}
                                <div className="space-y-4 border-t pt-4">
                                    <RadioGroup label="Possui benfeitorias não averbadas na matrícula?" name={`benfeitoriasNaoDeclaradas-${imovel.id}`} value={imovel.benfeitoriasNaoDeclaradas} onChange={(e) => handleDynamicChange<Imovel>('imoveis', imovel.id, 'benfeitoriasNaoDeclaradas')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                    {imovel.benfeitoriasNaoDeclaradas === 'sim' && (
                                         <TextInput label="Valor Estimado das Benfeitorias (R$)" name="benfeitoriasValorEstimado" value={imovel.benfeitoriasValorEstimado} onChange={handleDynamicChange<Imovel>('imoveis', imovel.id, 'benfeitoriasValorEstimado')} type="number" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <AddButton onClick={addImovel} text="Adicionar Imóvel" />
                </SectionCard>
                </>
            );
        case 7:
            return (
                <>
                <StepTitle title="4. Levantamento Patrimonial (Ativos)" subtitle="Detalhes sobre os veículos do patrimônio." />
                <SectionCard title="4.2. Veículos">
                    <p className="text-sm text-slate-600">Liste todos os veículos (carros, motos, embarcações, aeronaves) de propriedade do titular, cônjuge ou em comum.</p>
                    <div className="space-y-6 mt-4">
                        {formData.veiculos.map((veiculo, index) => (
                            <div key={veiculo.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                <div className="absolute top-2 right-2">
                                    <RemoveButton onClick={() => removeDynamicItem('veiculos', veiculo.id)} />
                                </div>
                                <h4 className="font-bold text-indigo-700">Veículo {index + 1}</h4>
                               
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <TextInput label="Tipo de Veículo" name="tipo" value={veiculo.tipo} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'tipo')} placeholder="Carro, Moto, Barco" />
                                    <TextInput label="Marca / Modelo" name="marcaModelo" value={veiculo.marcaModelo} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'marcaModelo')} />
                                    <TextInput label="Ano" name="ano" value={veiculo.ano} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'ano')} />
                                    <TextInput label="Placa" name="placa" value={veiculo.placa} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'placa')} />
                                    <TextInput label="RENAVAM" name="renavam" value={veiculo.renavam} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'renavam')} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
                                    <TextInput label="Valor de Aquisição (R$)" name="valorAquisicao" value={veiculo.valorAquisicao} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'valorAquisicao')} type="number" />
                                    <TextInput label="Valor Declarado no último I.R. (R$)" name="valorDeclaradoIR" value={veiculo.valorDeclaradoIR} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'valorDeclaradoIR')} type="number" />
                                    <TextInput label="Valor da Tabela FIPE (R$)" name="valorFIPE" value={veiculo.valorFIPE} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'valorFIPE')} type="number" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                    <RadioGroup label="Possui financiamento/consórcio ativo?" name={`financiamento-${veiculo.id}`} value={veiculo.financiamento} onChange={(e) => handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'financiamento')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                    {veiculo.financiamento === 'sim' && (
                                        <TextInput label="Saldo Devedor Aproximado (R$)" name="saldoDevedor" value={veiculo.saldoDevedor} onChange={handleDynamicChange<Veiculo>('veiculos', veiculo.id, 'saldoDevedor')} type="number" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <AddButton onClick={addVeiculo} text="Adicionar Veículo" />
                </SectionCard>
                </>
            );
         case 8:
            return (
                <>
                <StepTitle title="4. Levantamento Patrimonial (Ativos)" subtitle="Outros bens de valor como joias, obras de arte, etc." />
                <SectionCard title="4.3. Bens Móveis de Valor Relevante">
                    <p className="text-sm text-slate-600">Liste outros bens móveis de valor significativo, como obras de arte, joias, antiguidades, semoventes (rebanho), etc.</p>
                    <div className="space-y-6 mt-4">
                        {formData.bensMoveisRelevantes.map((bem, index) => (
                            <div key={bem.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                <div className="absolute top-2 right-2">
                                    <RemoveButton onClick={() => removeDynamicItem('bensMoveisRelevantes', bem.id)} />
                                </div>
                                <h4 className="font-bold text-indigo-700">Bem Móvel {index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput label="Tipo do Bem" name="tipo" value={bem.tipo} onChange={handleDynamicChange<BemMovelRelevante>('bensMoveisRelevantes', bem.id, 'tipo')} placeholder="Ex: Obra de Arte, Joia" />
                                    <TextInput label="Valor Estimado (R$)" name="valorEstimado" value={bem.valorEstimado} onChange={handleDynamicChange<BemMovelRelevante>('bensMoveisRelevantes', bem.id, 'valorEstimado')} type="number" />
                                </div>
                                <TextArea label="Descrição Detalhada" name="descricao" value={bem.descricao} onChange={handleDynamicChange<BemMovelRelevante>('bensMoveisRelevantes', bem.id, 'descricao')} placeholder="Detalhes que ajudem a identificar o bem." />
                            </div>
                        ))}
                    </div>
                    <AddButton onClick={addBemMovelRelevante} text="Adicionar Bem Móvel" />
                </SectionCard>
                </>
            );
        case 9:
            return (
                <>
                <StepTitle title="4. Levantamento Patrimonial (Ativos)" subtitle="Detalhes sobre as empresas e participações societárias." />
                <SectionCard title="4.4. Participações Societárias">
                    <RadioGroup 
                        label="Possui participações em empresas (sociedades)?" 
                        name="possuiParticipacoesSocietarias" 
                        value={formData.possuiParticipacoesSocietarias} 
                        onChange={(e) => setFormData(p => ({...p, possuiParticipacoesSocietarias: e.target.value}))}
                        options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} 
                    />
                    {formData.possuiParticipacoesSocietarias === 'sim' && (
                        <div className="space-y-6 mt-4">
                            {formData.empresas.map((empresa, index) => (
                                <div key={empresa.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                    <div className="absolute top-2 right-2">
                                        <RemoveButton onClick={() => removeDynamicItem('empresas', empresa.id)} />
                                    </div>
                                    <h4 className="font-bold text-indigo-700">Empresa {index + 1}</h4>
                                    
                                    {/* Identification */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TextInput label="Razão Social" name="razaoSocial" value={empresa.razaoSocial} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'razaoSocial')} />
                                        <TextInput label="CNPJ" name="cnpj" value={empresa.cnpj} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'cnpj')} />
                                        <TextInput label="Tipo Societário" name="tipoSocietario" value={empresa.tipoSocietario} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'tipoSocietario')} placeholder="Ex: LTDA, S/A" />
                                        <TextInput label="Ramo de Atividade" name="ramoAtividade" value={empresa.ramoAtividade} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'ramoAtividade')} />
                                    </div>

                                    {/* Financials */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
                                        <TextInput label="% de Participação do Titular/Cônjuge" name="percentualParticipacao" value={empresa.percentualParticipacao} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'percentualParticipacao')} type="number" />
                                        <TextInput label="Valor da Participação no I.R. (R$)" name="valorParticipacaoIR" value={empresa.valorParticipacaoIR} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'valorParticipacaoIR')} type="number" />
                                        <TextInput label="Patrimônio Líquido da Empresa (R$)" name="patrimonioLiquido" value={empresa.patrimonioLiquido} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'patrimonioLiquido')} type="number" />
                                        <TextInput label="Faturamento Anual Médio (R$)" name="faturamentoAnual" value={empresa.faturamentoAnual} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'faturamentoAnual')} type="number" />
                                        <TextInput label="Regime Tributário" name="regimeTributario" value={empresa.regimeTributario} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'regimeTributario')} placeholder="Simples Nacional, Lucro Presumido, etc." />
                                    </div>

                                    {/* Debts and Legal */}
                                    <div className="space-y-4 border-t pt-4">
                                        <RadioGroup label="Possui dívidas relevantes?" name={`possuiDividas-${empresa.id}`} value={empresa.possuiDividas} onChange={(e) => handleDynamicChange<Empresa>('empresas', empresa.id, 'possuiDividas')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        {empresa.possuiDividas === 'sim' && <TextInput label="Valor Aproximado das Dívidas (R$)" name="dividasValor" value={empresa.dividasValor} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'dividasValor')} type="number" />}
                                        <RadioGroup label="Possui processos judiciais relevantes?" name={`processosJudiciais-${empresa.id}`} value={empresa.processosJudiciais} onChange={(e) => handleDynamicChange<Empresa>('empresas', empresa.id, 'processosJudiciais')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        {empresa.processosJudiciais === 'sim' && <TextArea label="Detalhar Processos" name="processosJudiciaisDetalhe" value={empresa.processosJudiciaisDetalhe} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'processosJudiciaisDetalhe')} />}
                                    </div>

                                     {/* Other Partners */}
                                    <div className="space-y-4 border-t pt-4">
                                        <RadioGroup label="Existem outros sócios fora do núcleo familiar?" name={`outrosSocios-${empresa.id}`} value={empresa.outrosSocios} onChange={(e) => handleDynamicChange<Empresa>('empresas', empresa.id, 'outrosSocios')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        {empresa.outrosSocios === 'sim' && <TextArea label="Quem são?" name="quemSaoSocios" value={empresa.quemSaoSocios} onChange={handleDynamicChange<Empresa>('empresas', empresa.id, 'quemSaoSocios')} />}
                                        <RadioGroup label="Existe acordo de sócios?" name={`acordoSocios-${empresa.id}`} value={empresa.acordoSocios} onChange={(e) => handleDynamicChange<Empresa>('empresas', empresa.id, 'acordoSocios')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                                        <RadioGroup label="Pretende integralizar esta participação na holding?" name={`integralizarHolding-${empresa.id}`} value={empresa.integralizarHolding} onChange={(e) => handleDynamicChange<Empresa>('empresas', empresa.id, 'integralizarHolding')(e)} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Analisar', value: 'analisar'}]} />
                                    </div>
                                </div>
                            ))}
                            <AddButton onClick={addEmpresa} text="Adicionar Empresa" />
                        </div>
                    )}
                </SectionCard>
                </>
            );
        case 10:
            return (
                <>
                <StepTitle title="4. Levantamento Patrimonial (Ativos)" subtitle="Investimentos em bancos, corretoras e outras instituições." />
                <SectionCard title="4.5. Aplicações Financeiras e Investimentos">
                    <p className="text-sm text-slate-600">Liste as principais aplicações financeiras (CDB, LCI/LCA, Ações, Fundos de Investimento, Previdência Privada, etc.).</p>
                    <div className="space-y-6 mt-4">
                        {formData.aplicacoesFinanceiras.map((app, index) => (
                            <div key={app.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                <div className="absolute top-2 right-2">
                                    <RemoveButton onClick={() => removeDynamicItem('aplicacoesFinanceiras', app.id)} />
                                </div>
                                <h4 className="font-bold text-indigo-700">Aplicação {index + 1}</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput label="Tipo de Aplicação" name="tipo" value={app.tipo} onChange={handleDynamicChange<AplicacaoFinanceira>('aplicacoesFinanceiras', app.id, 'tipo')} placeholder="Ex: Ações, CDB, VGBL" />
                                    <TextInput label="Instituição Financeira" name="instituicao" value={app.instituicao} onChange={handleDynamicChange<AplicacaoFinanceira>('aplicacoesFinanceiras', app.id, 'instituicao')} placeholder="Ex: Banco Itaú, XP Investimentos" />
                                    <TextInput label="Valor Aproximado (R$)" name="valorAproximado" value={app.valorAproximado} onChange={handleDynamicChange<AplicacaoFinanceira>('aplicacoesFinanceiras', app.id, 'valorAproximado')} type="number" />
                                </div>

                                <div className="border-t pt-4">
                                    <RadioGroup 
                                        label="Pretende integralizar esta aplicação na holding?" 
                                        name={`integralizarHolding-app-${app.id}`} 
                                        value={app.integralizarHolding} 
                                        onChange={(e) => handleDynamicChange<AplicacaoFinanceira>('aplicacoesFinanceiras', app.id, 'integralizarHolding')(e)} 
                                        options={[
                                            {label: 'Sim', value: 'sim'}, 
                                            {label: 'Não', value: 'nao'}, 
                                            {label: 'Analisar', value: 'analisar'}
                                        ]} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <AddButton onClick={addAplicacaoFinanceira} text="Adicionar Aplicação" />
                </SectionCard>
                </>
            );
        case 11:
            return (
                 <>
                 <StepTitle title="4. Levantamento Patrimonial (Ativos)" subtitle="Direitos, créditos e outros bens não listados anteriormente." />
                 <SectionCard title="4.6. Outros Ativos e Direitos">
                    <p className="text-sm text-slate-600">Informe sobre outros ativos ou direitos de valor que não se enquadram nas categorias anteriores.</p>
                    <div className="space-y-4 border-t pt-4">
                        <RadioGroup label="Possui joias, obras de arte ou antiguidades de valor relevante?" name="possuiJoiasObrasArte" value={formData.outrosAtivosEDireitos.possuiJoiasObrasArte} onChange={handleInputChange('outrosAtivosEDireitos', 'possuiJoiasObrasArte')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.outrosAtivosEDireitos.possuiJoiasObrasArte === 'sim' && (
                            <TextArea label="Descrever (tipo, valor estimado, documentação)" name="joiasObrasArteDetalhes" value={formData.outrosAtivosEDireitos.joiasObrasArteDetalhes} onChange={handleInputChange('outrosAtivosEDireitos', 'joiasObrasArteDetalhes')} />
                        )}
                    </div>
                    <div className="space-y-4 border-t pt-4">
                        <RadioGroup label="Possui semoventes (rebanho, cavalos de raça, etc.)?" name="possuiSemoventes" value={formData.outrosAtivosEDireitos.possuiSemoventes} onChange={handleInputChange('outrosAtivosEDireitos', 'possuiSemoventes')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.outrosAtivosEDireitos.possuiSemoventes === 'sim' && (
                            <TextArea label="Descrever (tipo, quantidade, valor estimado, localização)" name="semoventesDetalhes" value={formData.outrosAtivosEDireitos.semoventesDetalhes} onChange={handleInputChange('outrosAtivosEDireitos', 'semoventesDetalhes')} />
                        )}
                    </div>
                    <div className="space-y-4 border-t pt-4">
                        <RadioGroup label="Possui direitos autorais, propriedade intelectual, marcas ou patentes?" name="possuiDireitosAutorais" value={formData.outrosAtivosEDireitos.possuiDireitosAutorais} onChange={handleInputChange('outrosAtivosEDireitos', 'possuiDireitosAutorais')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.outrosAtivosEDireitos.possuiDireitosAutorais === 'sim' && (
                            <TextArea label="Descrever (tipo, registro, valor estimado/receita anual)" name="direitosAutoraisDetalhes" value={formData.outrosAtivosEDireitos.direitosAutoraisDetalhes} onChange={handleInputChange('outrosAtivosEDireitos', 'direitosAutoraisDetalhes')} />
                        )}
                    </div>
                    <div className="space-y-4 border-t pt-4">
                        <RadioGroup label="Possui moedas estrangeiras em espécie ou criptoativos (Bitcoin, etc.)?" name="possuiCriptoativos" value={formData.outrosAtivosEDireitos.possuiCriptoativos} onChange={handleInputChange('outrosAtivosEDireitos', 'possuiCriptoativos')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.outrosAtivosEDireitos.possuiCriptoativos === 'sim' && (
                            <TextArea label="Descrever (tipo, quantidade, valor estimado, onde estão custodiados)" name="criptoativosDetalhes" value={formData.outrosAtivosEDireitos.criptoativosDetalhes} onChange={handleInputChange('outrosAtivosEDireitos', 'criptoativosDetalhes')} />
                        )}
                    </div>
                    <div className="space-y-4 border-t pt-4">
                        <RadioGroup label="Possui créditos a receber de terceiros (empréstimos concedidos)?" name="possuiCreditosReceber" value={formData.outrosAtivosEDireitos.possuiCreditosReceber} onChange={handleInputChange('outrosAtivosEDireitos', 'possuiCreditosReceber')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.outrosAtivosEDireitos.possuiCreditosReceber === 'sim' && (
                            <TextArea label="Descrever (devedor, valor, prazo, garantias)" name="creditosReceberDetalhes" value={formData.outrosAtivosEDireitos.creditosReceberDetalhes} onChange={handleInputChange('outrosAtivosEDireitos', 'creditosReceberDetalhes')} />
                        )}
                    </div>
                     <div className="space-y-4 border-t pt-4">
                        <RadioGroup label="Existem outros ativos ou direitos não mencionados?" name="possuiOutrosAtivos" value={formData.outrosAtivosEDireitos.possuiOutrosAtivos} onChange={handleInputChange('outrosAtivosEDireitos', 'possuiOutrosAtivos')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                        {formData.outrosAtivosEDireitos.possuiOutrosAtivos === 'sim' && (
                            <TextArea label="Descrever detalhadamente" name="outrosAtivosDetalhes" value={formData.outrosAtivosEDireitos.outrosAtivosDetalhes} onChange={handleInputChange('outrosAtivosEDireitos', 'outrosAtivosDetalhes')} />
                        )}
                    </div>
                </SectionCard>
                </>
            );
        case 12:
            return (
                 <>
                 <StepTitle title="5. Levantamento de Passivos e Contingências" subtitle="Dívidas e obrigações financeiras existentes." />
                 <SectionCard title="5.1. Dívidas e Obrigações do Titular">
                    <p className="text-sm text-slate-600">Liste todas as dívidas e ônus existentes em nome do titular e/ou cônjuge (financiamentos, empréstimos, etc.).</p>
                    <div className="space-y-6 mt-4">
                        {formData.dividas.map((divida, index) => (
                            <div key={divida.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                <div className="absolute top-2 right-2">
                                    <RemoveButton onClick={() => removeDynamicItem('dividas', divida.id)} />
                                </div>
                                <h4 className="font-bold text-indigo-700">Dívida {index + 1}</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput label="Tipo de Dívida" name="tipo" value={divida.tipo} onChange={handleDynamicChange<Divida>('dividas', divida.id, 'tipo')} placeholder="Ex: Financiamento Imobiliário" />
                                    <TextInput label="Credor" name="credor" value={divida.credor} onChange={handleDynamicChange<Divida>('dividas', divida.id, 'credor')} placeholder="Ex: Banco do Brasil" />
                                    <TextInput label="Valor Total da Dívida (R$)" name="valorTotal" value={divida.valorTotal} onChange={handleDynamicChange<Divida>('dividas', divida.id, 'valorTotal')} type="number" />
                                    <TextInput label="Valor da Parcela Mensal (R$)" name="valorParcela" value={divida.valorParcela} onChange={handleDynamicChange<Divida>('dividas', divida.id, 'valorParcela')} type="number" />
                                </div>
                                <TextInput label="Garantias Vinculadas" name="garantias" value={divida.garantias} onChange={handleDynamicChange<Divida>('dividas', divida.id, 'garantias')} placeholder="Ex: Imóvel X, Avalista" />
                                <div className="space-y-4 border-t pt-4">
                                    <RadioGroup 
                                        label="Possui processos judiciais?" 
                                        name={`possuiProcessoJudicial-${divida.id}`} 
                                        value={divida.possuiProcessoJudicial} 
                                        onChange={(e) => handleDynamicChange<Divida>('dividas', divida.id, 'possuiProcessoJudicial')(e)} 
                                        options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} 
                                    />
                                    {divida.possuiProcessoJudicial === 'sim' && (
                                        <TextArea 
                                            label="Detalhes dos Processos Judiciais" 
                                            name="detalhesProcessoJudicial" 
                                            value={divida.detalhesProcessoJudicial} 
                                            onChange={handleDynamicChange<Divida>('dividas', divida.id, 'detalhesProcessoJudicial')} 
                                            placeholder="Informe o número do processo, vara, partes envolvidas e o status atual." 
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <AddButton onClick={addDivida} text="Adicionar Dívida" />
                </SectionCard>
                </>
            );
        case 13:
            return (
                <>
                <StepTitle title="5. Levantamento de Passivos e Contingências" subtitle="Processos judiciais que possam impactar o patrimônio." />
                <SectionCard title="5.2. Processos Judiciais">
                    <p className="text-sm text-slate-600">Informe sobre processos judiciais relevantes em nome do titular e/ou cônjuge (como autor ou réu).</p>
                    <RadioGroup label="Possui processos judiciais relevantes (cíveis, trabalhistas, tributários)?" name="possui" value={formData.processosJudiciais.possui} onChange={handleInputChange('processosJudiciais', 'possui')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.processosJudiciais.possui === 'sim' && (
                        <div className="pl-4 border-l-2 border-indigo-200 space-y-4 mt-4">
                            <RadioGroup label="Natureza do processo" name="natureza" value={formData.processosJudiciais.natureza} onChange={handleInputChange('processosJudiciais', 'natureza')} options={[{label: 'Cível', value: 'civel'}, {label: 'Trabalhista', value: 'trabalhista'}, {label: 'Tributário', value: 'tributario'}, {label: 'Outro', value: 'outro'}]} />
                            {formData.processosJudiciais.natureza === 'outro' && <TextInput label="Qual?" name="naturezaOutro" value={formData.processosJudiciais.naturezaOutro} onChange={handleInputChange('processosJudiciais', 'naturezaOutro')} />}
                            <RadioGroup label="Risco de condenação/perda" name="riscoCondenacao" value={formData.processosJudiciais.riscoCondenacao} onChange={handleInputChange('processosJudiciais', 'riscoCondenacao')} options={[{label: 'Provável', value: 'provavel'}, {label: 'Possível', value: 'possivel'}, {label: 'Remoto', value: 'remoto'}]} />
                            <TextInput label="Valor da contingência (estimativa de perda em R$)" name="valorContingencia" value={formData.processosJudiciais.valorContingencia} onChange={handleInputChange('processosJudiciais', 'valorContingencia')} type="number" />
                            <RadioGroup label="Existe algum bem penhorado ou bloqueado?" name="bemPenhorado" value={formData.processosJudiciais.bemPenhorado} onChange={handleInputChange('processosJudiciais', 'bemPenhorado')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                            {formData.processosJudiciais.bemPenhorado === 'sim' && <TextArea label="Qual bem?" name="bemPenhoradoQual" value={formData.processosJudiciais.bemPenhoradoQual} onChange={handleInputChange('processosJudiciais', 'bemPenhoradoQual')} />}
                        </div>
                    )}
                </SectionCard>
                </>
            );
        case 14:
            return (
                <>
                <StepTitle title="5. Levantamento de Passivos e Contingências" subtitle="Situação fiscal perante os órgãos governamentais." />
                <SectionCard title="5.3. Regularidade Fiscal e Tributária">
                    <RadioGroup label="A declaração de Imposto de Renda (PF) está em dia?" name="irEmDia" value={formData.regularidadeFiscal.irEmDia} onChange={handleInputChange('regularidadeFiscal', 'irEmDia')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    <RadioGroup label="Possui débitos em aberto com a Receita Federal?" name="debitosReceitaFederal" value={formData.regularidadeFiscal.debitosReceitaFederal} onChange={handleInputChange('regularidadeFiscal', 'debitosReceitaFederal')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.regularidadeFiscal.debitosReceitaFederal === 'sim' && <TextInput label="Valor aproximado (R$)" name="debitosReceitaFederalValor" value={formData.regularidadeFiscal.debitosReceitaFederalValor} onChange={handleInputChange('regularidadeFiscal', 'debitosReceitaFederalValor')} type="number" />}
                    <RadioGroup label="Possui débitos com a Fazenda Estadual (ICMS, IPVA)?" name="debitosFazendaEstadual" value={formData.regularidadeFiscal.debitosFazendaEstadual} onChange={handleInputChange('regularidadeFiscal', 'debitosFazendaEstadual')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.regularidadeFiscal.debitosFazendaEstadual === 'sim' && <TextInput label="Valor aproximado (R$)" name="debitosFazendaEstadualValor" value={formData.regularidadeFiscal.debitosFazendaEstadualValor} onChange={handleInputChange('regularidadeFiscal', 'debitosFazendaEstadualValor')} type="number" />}
                    <RadioGroup label="Possui débitos com a Fazenda Municipal (IPTU, ISS)?" name="debitosFazendaMunicipal" value={formData.regularidadeFiscal.debitosFazendaMunicipal} onChange={handleInputChange('regularidadeFiscal', 'debitosFazendaMunicipal')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.regularidadeFiscal.debitosFazendaMunicipal === 'sim' && <TextInput label="Valor aproximado (R$)" name="debitosFazendaMunicipalValor" value={formData.regularidadeFiscal.debitosFazendaMunicipalValor} onChange={handleInputChange('regularidadeFiscal', 'debitosFazendaMunicipalValor')} type="number" />}
                    <RadioGroup label="Já caiu em 'malha fina'?" name="malhaFina" value={formData.regularidadeFiscal.malhaFina} onChange={handleInputChange('regularidadeFiscal', 'malhaFina')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.regularidadeFiscal.malhaFina === 'sim' && <TextInput label="Qual(is) ano(s)?" name="malhaFinaAno" value={formData.regularidadeFiscal.malhaFinaAno} onChange={handleInputChange('regularidadeFiscal', 'malhaFinaAno')} />}
                </SectionCard>
                </>
            );
        case 15:
            return (
                <>
                <StepTitle title="6. Informações Tributárias e Financeiras" subtitle="Detalhes sobre a situação fiscal atual e planejamentos anteriores." />
                <SectionCard title="6.1. Situação Tributária Atual">
                    <RadioGroup label="Costuma fazer a declaração de IR no modelo completo ou simplificado?" name="declaracaoIR" value={formData.situacaoTributaria.declaracaoIR} onChange={handleInputChange('situacaoTributaria', 'declaracaoIR')} options={[{label: 'Completo', value: 'completo'}, {label: 'Simplificado', value: 'simplificado'}]} />
                    <RadioGroup label="Possui contador(a)?" name="possuiContador" value={formData.situacaoTributaria.possuiContador} onChange={handleInputChange('situacaoTributaria', 'possuiContador')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.situacaoTributaria.possuiContador === 'sim' && <TextInput label="Nome e contato do(a) contador(a)" name="contadorNomeContato" value={formData.situacaoTributaria.contadorNomeContato} onChange={handleInputChange('situacaoTributaria', 'contadorNomeContato')} />}
                    <RadioGroup label="Já realizou algum tipo de planejamento tributário anteriormente?" name="planejamentoTributarioAnterior" value={formData.situacaoTributaria.planejamentoTributarioAnterior} onChange={handleInputChange('situacaoTributaria', 'planejamentoTributarioAnterior')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    <RadioGroup label="Conhece as alíquotas de ITCMD (imposto sobre herança e doação) do seu estado?" name="conheceAliquotasITCMD" value={formData.situacaoTributaria.conheceAliquotasITCMD} onChange={handleInputChange('situacaoTributaria', 'conheceAliquotasITCMD')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.situacaoTributaria.conheceAliquotasITCMD === 'sim' && <TextInput label="Qual a alíquota?" name="aliquotaITCMD" value={formData.situacaoTributaria.aliquotaITCMD} onChange={handleInputChange('situacaoTributaria', 'aliquotaITCMD')} />}
                    <RadioGroup label="Já realizou doações em vida para herdeiros?" name="doacoesAnteriores" value={formData.situacaoTributaria.doacoesAnteriores} onChange={handleInputChange('situacaoTributaria', 'doacoesAnteriores')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.situacaoTributaria.doacoesAnteriores === 'sim' && <TextArea label="Quando, para quem e qual o valor?" name="doacoesAnterioresQuandoValor" value={formData.situacaoTributaria.doacoesAnterioresQuandoValor} onChange={handleInputChange('situacaoTributaria', 'doacoesAnterioresQuandoValor')} />}
                </SectionCard>
                </>
            );
        case 16:
            return (
                <>
                <StepTitle title="6. Informações Tributárias e Financeiras" subtitle="Previsão de rendas que garantirão o sustento futuro." />
                <SectionCard title="6.2. Expectativas de Receitas Futuras">
                    <p className="text-sm text-slate-600">Informe as fontes de receita futuras previstas para o titular e/ou cônjuge, que serão utilizadas para manutenção do padrão de vida.</p>
                    <div className="space-y-6 mt-4">
                        {formData.receitasFuturas.map((receita, index) => (
                            <div key={receita.id} className="p-4 border rounded-lg bg-slate-50 relative space-y-4">
                                <div className="absolute top-2 right-2">
                                    <RemoveButton onClick={() => removeDynamicItem('receitasFuturas', receita.id)} />
                                </div>
                                <h4 className="font-bold text-indigo-700">Fonte de Receita {index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TextInput label="Tipo de Receita" name="tipo" value={receita.tipo} onChange={handleDynamicChange<ReceitaFutura>('receitasFuturas', receita.id, 'tipo')} placeholder="Ex: Aluguel, Pró-labore, Aposentadoria" />
                                    <TextInput label="Valor Mensal Estimado (R$)" name="valorMensal" value={receita.valorMensal} onChange={handleDynamicChange<ReceitaFutura>('receitasFuturas', receita.id, 'valorMensal')} type="number" />
                                </div>
                                <TextArea label="Descrição / Origem" name="descricao" value={receita.descricao} onChange={handleDynamicChange<ReceitaFutura>('receitasFuturas', receita.id, 'descricao')} placeholder="Ex: Aluguel do imóvel da Rua X, Pró-labore da Empresa Y" />
                            </div>
                        ))}
                    </div>
                    <AddButton onClick={addReceitaFutura} text="Adicionar Fonte de Receita" />
                </SectionCard>
                </>
            );
        case 17:
            return (
                 <>
                 <StepTitle title="7. Governança e Gestão" subtitle="Definição de como a holding será administrada." />
                 <SectionCard title="7.1. Estrutura de Gestão Desejada (Governança)">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Quem serão os administradores da holding?</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Checkbox label="O(a) titular principal" name="administradores-titular" value="Titular" checked={formData.governanca.administradores.includes('Titular')} onChange={handleMultiCheckboxChange('governanca', 'administradores')} />
                            <Checkbox label="O(a) cônjuge/companheiro(a)" name="administradores-conjuge" value="Cônjuge" checked={formData.governanca.administradores.includes('Cônjuge')} onChange={handleMultiCheckboxChange('governanca', 'administradores')} />
                            <Checkbox label="Todos os herdeiros" name="administradores-todos" value="Todos os herdeiros" checked={formData.governanca.administradores.includes('Todos os herdeiros')} onChange={handleMultiCheckboxChange('governanca', 'administradores')} />
                            <Checkbox label="Alguns herdeiros específicos" name="administradores-alguns" value="Alguns herdeiros" checked={formData.governanca.administradores.includes('Alguns herdeiros')} onChange={handleMultiCheckboxChange('governanca', 'administradores')} />
                             <Checkbox label="Um gestor profissional externo" name="administradores-externo" value="Gestor externo" checked={formData.governanca.administradores.includes('Gestor externo')} onChange={handleMultiCheckboxChange('governanca', 'administradores')} />
                        </div>
                    </div>
                    <RadioGroup label="Pretende criar um Conselho de Família?" name="conselhoFamilia" value={formData.governanca.conselhoFamilia} onChange={handleInputChange('governanca', 'conselhoFamilia')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Não sei', value: 'nao_sei'}]} />
                    <TextArea label="Existem regras específicas de governança que deseja implementar?" name="regrasGovernanca" value={formData.governanca.regrasGovernanca} onChange={handleInputChange('governanca', 'regrasGovernanca')} placeholder="Ex: Política de distribuição de lucros, regras para investimentos, etc." />
                    <RadioGroup label="Deseja incluir cláusulas restritivas de proteção?" name="clausulasRestritivas" value={formData.governanca.clausulasRestritivas} onChange={handleInputChange('governanca', 'clausulasRestritivas')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.governanca.clausulasRestritivas === 'sim' && (
                        <div className="pl-4 border-l-2 border-indigo-200">
                             <label className="block text-sm font-medium text-slate-600 mb-2">Quais cláusulas?</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Checkbox label="Incomunicabilidade (proteger de casamentos)" name="clausula-incomunicabilidade" value="Incomunicabilidade" checked={formData.governanca.clausulasRestritivasQuais.includes('Incomunicabilidade')} onChange={handleMultiCheckboxChange('governanca', 'clausulasRestritivasQuais')} />
                                <Checkbox label="Impenhorabilidade (proteger de dívidas)" name="clausula-impenhorabilidade" value="Impenhorabilidade" checked={formData.governanca.clausulasRestritivasQuais.includes('Impenhorabilidade')} onChange={handleMultiCheckboxChange('governanca', 'clausulasRestritivasQuais')} />
                                <Checkbox label="Inalienabilidade (impedir a venda)" name="clausula-inalienabilidade" value="Inalienabilidade" checked={formData.governanca.clausulasRestritivasQuais.includes('Inalienabilidade')} onChange={handleMultiCheckboxChange('governanca', 'clausulasRestritivasQuais')} />
                                <Checkbox label="Direito de preferência" name="clausula-preferencia" value="Direito de preferência" checked={formData.governanca.clausulasRestritivasQuais.includes('Direito de preferência')} onChange={handleMultiCheckboxChange('governanca', 'clausulasRestritivasQuais')} />
                            </div>
                        </div>
                    )}
                </SectionCard>
                </>
            );
        case 18:
            return (
                <>
                <StepTitle title="7. Governança e Gestão" subtitle="Planejamento para a transição da gestão para as próximas gerações." />
                <SectionCard title="7.2. Sucessão na Gestão">
                    <RadioGroup label="Já existe um sucessor definido para a gestão dos negócios/patrimônio?" name="sucessorIdentificado" value={formData.sucessaoGestao.sucessorIdentificado} onChange={handleInputChange('sucessaoGestao', 'sucessorIdentificado')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Em definição', value: 'em_definicao'}]} />
                    <RadioGroup label="Como pretende preparar os herdeiros para a gestão futura?" name="prepararHerdeiros" value={formData.sucessaoGestao.prepararHerdeiros} onChange={handleInputChange('sucessaoGestao', 'prepararHerdeiros')} options={[{label: 'Através de mentoria', value: 'mentoria'}, {label: 'Cursos e formação', value: 'cursos'}, {label: 'Participação gradual nos negócios', value: 'gradual'}, {label: 'Não pensei nisso', value: 'nao_pensei'}]} />
                    <RadioGroup label="Algum dos herdeiros já demonstra perfil e interesse para assumir a liderança?" name="herdeirosComPerfil" value={formData.sucessaoGestao.herdeirosComPerfil} onChange={handleInputChange('sucessaoGestao', 'herdeirosComPerfil')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.sucessaoGestao.herdeirosComPerfil === 'sim' && <TextInput label="Quem?" name="herdeirosComPerfilQuem" value={formData.sucessaoGestao.herdeirosComPerfilQuem} onChange={handleInputChange('sucessaoGestao', 'herdeirosComPerfilQuem')} />}
                    <RadioGroup label="Considera a possibilidade de contratar uma gestão profissional externa no futuro?" name="contratarGestaoExterna" value={formData.sucessaoGestao.contratarGestaoExterna} onChange={handleInputChange('sucessaoGestao', 'contratarGestaoExterna')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Apenas em último caso', value: 'ultimo_caso'}]} />
                </SectionCard>
                </>
            );
        case 19:
            return (
                 <>
                 <StepTitle title="8. Planejamento e Liquidez" subtitle="Planos de curto e médio prazo para compra ou venda de bens." />
                 <SectionCard title="8.1. Movimentações Patrimoniais Previstas">
                    <RadioGroup label="Pretende vender algum bem relevante nos próximos 6 meses?" name="venderBem6Meses" value={formData.planejamentoCurtoMedioPrazo.venderBem6Meses} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'venderBem6Meses')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.planejamentoCurtoMedioPrazo.venderBem6Meses === 'sim' && <TextInput label="Qual bem e por qual valor?" name="venderBemQualValor" value={formData.planejamentoCurtoMedioPrazo.venderBemQualValor} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'venderBemQualValor')} />}
                    <RadioGroup label="Pretende adquirir novos bens relevantes (imóveis, empresas)?" name="adquirirBens" value={formData.planejamentoCurtoMedioPrazo.adquirirBens} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'adquirirBens')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.planejamentoCurtoMedioPrazo.adquirirBens === 'sim' && <TextInput label="O que e qual o valor estimado?" name="adquirirBensQualValor" value={formData.planejamentoCurtoMedioPrazo.adquirirBensQualValor} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'adquirirBensQualValor')} />}
                    <RadioGroup label="Pretende fazer novas doações em breve?" name="fazerDoacoes" value={formData.planejamentoCurtoMedioPrazo.fazerDoacoes} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'fazerDoacoes')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.planejamentoCurtoMedioPrazo.fazerDoacoes === 'sim' && <TextInput label="Quando e para quem?" name="fazerDoacoesQuando" value={formData.planejamentoCurtoMedioPrazo.fazerDoacoesQuando} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'fazerDoacoesQuando')} />}
                    <RadioGroup label="Pretende iniciar ou já exerce atividade imobiliária (compra, venda, aluguel) de forma profissional?" name="atividadeImobiliaria" value={formData.planejamentoCurtoMedioPrazo.atividadeImobiliaria} onChange={handleInputChange('planejamentoCurtoMedioPrazo', 'atividadeImobiliaria')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                </SectionCard>
                </>
            );
        case 20:
            return (
                <>
                <StepTitle title="8. Planejamento e Liquidez" subtitle="Análise dos recursos disponíveis para despesas e custos do projeto." />
                <SectionCard title="8.2. Necessidades de Liquidez">
                    <TextInput label="Qual o valor mensal aproximado para manutenção do seu padrão de vida e de seus dependentes? (R$)" name="valorMensalManutencao" value={formData.liquidez.valorMensalManutencao} onChange={handleInputChange('liquidez', 'valorMensalManutencao')} type="number" />
                    <RadioGroup label="Há previsão de despesas extraordinárias nos próximos anos (casamentos, faculdade dos filhos, etc.)?" name="despesasExtraordinarias" value={formData.liquidez.despesasExtraordinarias} onChange={handleInputChange('liquidez', 'despesasExtraordinarias')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.liquidez.despesasExtraordinarias === 'sim' && <TextInput label="Qual despesa e o valor estimado?" name="despesasExtraordinariasValor" value={formData.liquidez.despesasExtraordinariasValor} onChange={handleInputChange('liquidez', 'despesasExtraordinariasValor')} />}
                    <RadioGroup label="Possui recursos líquidos (dinheiro em conta, aplicações de resgate rápido) para arcar com os custos de constituição da holding e eventual pagamento de ITCMD?" name="recursosITCMD" value={formData.liquidez.recursosITCMD} onChange={handleInputChange('liquidez', 'recursosITCMD')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Parcialmente', value: 'parcialmente'}]} />
                    {formData.liquidez.recursosITCMD !== 'nao' && <TextInput label="Qual valor disponível?" name="recursosITCMDValor" value={formData.liquidez.recursosITCMDValor} onChange={handleInputChange('liquidez', 'recursosITCMDValor')} type="number" />}
                    <RadioGroup label="Caso não tenha recursos, como pretende custear o projeto?" name="comoPagarITCMD" value={formData.liquidez.comoPagarITCMD} onChange={handleInputChange('liquidez', 'comoPagarITCMD')} options={[{label: 'Venda de um bem', value: 'venda'}, {label: 'Empréstimo', value: 'emprestimo'}, {label: 'Não sei ainda', value: 'nao_sei'}, {label: 'Outro', value: 'outro'}]} />
                    {formData.liquidez.comoPagarITCMD === 'outro' && <TextInput label="Qual outra forma?" name="comoPagarITCMDOutro" value={formData.liquidez.comoPagarITCMDOutro} onChange={handleInputChange('liquidez', 'comoPagarITCMDOutro')} />}
                </SectionCard>
                </>
            );
        case 21:
            return (
                <>
                <StepTitle title="9. Informações Complementares" subtitle="Dados adicionais importantes para um planejamento completo." />
                <SectionCard title="9. Informações Complementares">
                    <TextArea label="Existe alguma situação familiar ou pessoal sensível que não tenha sido abordada e que possa impactar o planejamento (ex: doenças graves, vícios, etc.)?" name="situacaoSensivel" value={formData.infoComplementares.situacaoSensivel} onChange={handleInputChange('infoComplementares', 'situacaoSensivel')} />
                    <RadioGroup label="Possui bens no exterior?" name="bensExterior" value={formData.infoComplementares.bensExterior} onChange={handleInputChange('infoComplementares', 'bensExterior')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.infoComplementares.bensExterior === 'sim' && <TextArea label="Detalhar (país, tipo de bem, valor estimado)" name="bensExteriorDetalhe" value={formData.infoComplementares.bensExteriorDetalhe} onChange={handleInputChange('infoComplementares', 'bensExteriorDetalhe')} />}
                    <RadioGroup label="Possui empresas offshore ou trusts?" name="offshoreTrusts" value={formData.infoComplementares.offshoreTrusts} onChange={handleInputChange('infoComplementares', 'offshoreTrusts')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.infoComplementares.offshoreTrusts === 'sim' && <TextArea label="Detalhar (jurisdição, estrutura)" name="offshoreTrustsDetalhe" value={formData.infoComplementares.offshoreTrustsDetalhe} onChange={handleInputChange('infoComplementares', 'offshoreTrustsDetalhe')} />}
                    <RadioGroup label="Possui expectativa de receber herança relevante no futuro?" name="expectativaHeranca" value={formData.infoComplementares.expectativaHeranca} onChange={handleInputChange('infoComplementares', 'expectativaHeranca')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.infoComplementares.expectativaHeranca === 'sim' && <TextInput label="Valor estimado (R$)" name="expectativaHerancaValor" value={formData.infoComplementares.expectativaHerancaValor} onChange={handleInputChange('infoComplementares', 'expectativaHerancaValor')} type="number" />}
                    <RadioGroup label="Possui seguro de vida?" name="seguroVida" value={formData.infoComplementares.seguroVida} onChange={handleInputChange('infoComplementares', 'seguroVida')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.infoComplementares.seguroVida === 'sim' && (
                        <div className="pl-4 border-l-2 border-indigo-200 space-y-4">
                            <TextInput label="Valor da cobertura (R$)" name="seguroVidaCobertura" value={formData.infoComplementares.seguroVidaCobertura} onChange={handleInputChange('infoComplementares', 'seguroVidaCobertura')} type="number" />
                            <TextInput label="Beneficiários" name="seguroVidaBeneficiarios" value={formData.infoComplementares.seguroVidaBeneficiarios} onChange={handleInputChange('infoComplementares', 'seguroVidaBeneficiarios')} />
                        </div>
                    )}
                    <RadioGroup label="Há interesse em discutir cláusulas de proteção patrimonial contra futuro divórcio dos herdeiros?" name="clausulaProtecaoDivorcio" value={formData.infoComplementares.clausulaProtecaoDivorcio} onChange={handleInputChange('infoComplementares', 'clausulaProtecaoDivorcio')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    <RadioGroup label="Tem acompanhado as discussões sobre a Reforma Tributária e seus possíveis impactos?" name="conhecimentoReformaTributaria" value={formData.infoComplementares.conhecimentoReformaTributaria} onChange={handleInputChange('infoComplementares', 'conhecimentoReformaTributaria')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}, {label: 'Pouco', value: 'pouco'}]} />
                    <RadioGroup label="Já consultou outros profissionais sobre este tema?" name="consultouOutrosProfissionais" value={formData.infoComplementares.consultouOutrosProfissionais} onChange={handleInputChange('infoComplementares', 'consultouOutrosProfissionais')} options={[{label: 'Sim', value: 'sim'}, {label: 'Não', value: 'nao'}]} />
                    {formData.infoComplementares.consultouOutrosProfissionais === 'sim' && <TextArea label="Quem e quando?" name="consultouOutrosProfissionaisQuemQuando" value={formData.infoComplementares.consultouOutrosProfissionaisQuemQuando} onChange={handleInputChange('infoComplementares', 'consultouOutrosProfissionaisQuemQuando')} />}
                </SectionCard>
                </>
            );
        case 22:
            return (
                <>
                <StepTitle title="10. Declaração e Finalização" subtitle="Confirmação da veracidade das informações e envio." />
                <SectionCard title="10. Declaração">
                    <div className="prose prose-slate max-w-none bg-slate-50 p-4 rounded-md">
                        <p>
                            Declaro, para todos os fins de direito, que as informações aqui prestadas são verdadeiras e completas,
                            refletindo a atual situação pessoal, familiar e patrimonial, e estou ciente de que a omissão
                            ou falsidade de informações pode comprometer a validade e a eficácia do planejamento sucessório
                            e patrimonial a ser elaborado.
                        </p>
                        <p>
                            Autorizo o uso destes dados para a finalidade exclusiva de elaboração de estudos, pareceres e
                            instrumentos jurídicos relacionados ao projeto de constituição de holding familiar.
                        </p>
                    </div>
                    <div className="pt-4 space-y-4">
                         <Checkbox 
                            label="Li e concordo com os termos da declaração." 
                            name="declaracao-agree" 
                            checked={declarationAgreed}
                            onChange={(e) => setDeclarationAgreed(e.target.checked)}
                         />
                         <TextInput label="Local e Data" name="localData" value={formData.declaracao.localData} onChange={handleInputChange('declaracao', 'localData')} placeholder="Cidade, DD de mês de AAAA"/>
                    </div>
                </SectionCard>
                </>
            );
        default:
            return <div>Step {currentStep + 1} - Em desenvolvimento</div>
      }
  }


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{backgroundColor:'#F5F5F5'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header Primetax */}
        <div className="rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="flex items-center justify-between px-6 py-5" style={{background:'linear-gradient(135deg, #4A4A4A 0%, #333333 100%)'}}>
            <div>
              <img src="/logo_primetax.png" alt="Primetax Solutions" style={{height:'48px', maxWidth:'220px', objectFit:'contain'}} />
              <p className="text-xs mt-1" style={{color:'#999999'}}>Planejamento Patrimonial e Sucessório</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white" style={{fontFamily:'Montserrat,sans-serif'}}>Questionário</p>
              <p className="text-xs" style={{color:'#4FBFBF'}}>Holding Familiar</p>
            </div>
          </div>
          <div className="h-1" style={{backgroundColor:'#4FBFBF'}}></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg px-5 py-4 shadow-sm">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold" style={{color:'#4FBFBF', fontFamily:'Montserrat,sans-serif'}}>Progresso</span>
                <span className="text-sm font-semibold" style={{color:'#4A4A4A'}}>Etapa {currentStep + 1} de {TOTAL_STEPS}</span>
            </div>
            <div className="w-full rounded-full h-2" style={{backgroundColor:'#E5E7EB'}}>
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor:'#4FBFBF' }}></div>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div ref={formRef}>
            {renderStep()}
          </div>

          {/* Status de envio */}
          {submitStatus === 'success' && (
            <div className="rounded-lg p-4 text-center" style={{backgroundColor:'#d1fae5', border:'1px solid #6ee7b7'}}>
              <p className="font-bold text-green-800" style={{fontFamily:'Montserrat,sans-serif'}}>Questionário enviado com sucesso!</p>
              <p className="text-sm text-green-700 mt-1">O PDF foi gerado e baixado automaticamente. Nossa equipe entrará em contato em breve.</p>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="rounded-lg p-4 text-center" style={{backgroundColor:'#fee2e2', border:'1px solid #fca5a5'}}>
              <p className="font-bold text-red-800" style={{fontFamily:'Montserrat,sans-serif'}}>Erro ao enviar.</p>
              <p className="text-sm text-red-700 mt-1">O PDF foi gerado, mas houve um problema ao enviar o e-mail. Por favor, entre em contato diretamente.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-md font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{backgroundColor:'#E5E7EB', color:'#4A4A4A', fontFamily:'Montserrat,sans-serif'}}
            >
              ← Anterior
            </button>
            {currentStep < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-8 py-2 rounded-md font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{backgroundColor:'#4FBFBF', fontFamily:'Montserrat,sans-serif'}}
              >
                Próximo →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!declarationAgreed || isSubmitting}
                className="px-8 py-2 rounded-md font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                style={{backgroundColor: isSubmitting ? '#999' : '#4A4A4A', fontFamily:'Montserrat,sans-serif'}}
              >
                {isSubmitting ? 'Gerando PDF...' : '📄 Enviar e Gerar PDF'}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center pb-6">
          <p className="text-xs" style={{color:'#999999'}}>© {new Date().getFullYear()} Primetax Solutions — Documento Confidencial</p>
          <p className="text-xs mt-1" style={{color:'#4FBFBF'}}>contato@primetax.com.br</p>
        </div>
      </div>
    </div>
  );
}
