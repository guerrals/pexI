// Utilitários de validação para formulários

// Validação de nome
export const validateNome = (nome: string): string => {
  if (!nome.trim()) {
    return 'Nome é obrigatório';
  }
  if (nome.trim().length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres';
  }
  if (nome.trim().length > 100) {
    return 'Nome deve ter no máximo 100 caracteres';
  }
  return '';
};

// Validação de telefone celular brasileiro
export const validateTelefoneCelular = (telefone: string): string => {
  if (!telefone.trim()) {
    return 'Telefone celular é obrigatório';
  }
  
  // Remove todos os caracteres não numéricos
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  // Validação para telefone celular brasileiro (11 dígitos)
  if (telefoneLimpo.length !== 11) {
    return 'Telefone celular deve ter 11 dígitos (ex: 11999999999)';
  }
  
  // Verifica se o DDD é válido (11-99)
  const ddd = telefoneLimpo.substring(0, 2);
  const dddsValidos = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];
  
  if (!dddsValidos.includes(ddd)) {
    return 'DDD inválido';
  }
  
  return '';
};

// Formatar telefone celular brasileiro
export const formatarTelefoneCelular = (telefone: string): string => {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length <= 2) {
    return telefoneLimpo;
  } else if (telefoneLimpo.length <= 7) {
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2)}`;
  } else if (telefoneLimpo.length <= 11) {
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 7)}-${telefoneLimpo.substring(7)}`;
  }
  
  return telefoneLimpo;
};

// Validação de placa de veículo
export const validatePlaca = (placa: string): string => {
  if (!placa.trim()) {
    return 'Placa é obrigatória';
  }
  return '';
};

// Validação de modelo de veículo
export const validateModelo = (modelo: string): string => {
  if (!modelo.trim()) {
    return 'Modelo é obrigatório';
  }
  if (modelo.trim().length < 2) {
    return 'Modelo deve ter pelo menos 2 caracteres';
  }
  if (modelo.trim().length > 50) {
    return 'Modelo deve ter no máximo 50 caracteres';
  }
  return '';
};

// Validação de cor
export const validateCor = (cor: string): string => {
  if (!cor.trim()) {
    return 'Cor é obrigatória';
  }
  if (cor.trim().length < 2) {
    return 'Cor deve ter pelo menos 2 caracteres';
  }
  if (cor.trim().length > 30) {
    return 'Cor deve ter no máximo 30 caracteres';
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cor.trim())) {
    return 'Cor deve conter apenas letras e espaços';
  }
  return '';
};

// Validação de CEP
export const validateCep = (cep: string): string => {
  if (!cep.trim()) {
    return 'CEP é obrigatório';
  }
  
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length !== 8) {
    return 'CEP deve ter 8 dígitos';
  }
  
  if (!/^[0-9]{8}$/.test(cepLimpo)) {
    return 'CEP deve conter apenas números';
  }
  
  return '';
};

// Validação de rua
export const validateRua = (rua: string): string => {
  if (!rua.trim()) {
    return 'Rua é obrigatória';
  }
  if (rua.trim().length < 2) {
    return 'Rua deve ter pelo menos 2 caracteres';
  }
  if (rua.trim().length > 100) {
    return 'Rua deve ter no máximo 100 caracteres';
  }
  return '';
};

// Validação de bairro
export const validateBairro = (bairro: string): string => {
  if (!bairro.trim()) {
    return 'Bairro é obrigatório';
  }
  if (bairro.trim().length < 2) {
    return 'Bairro deve ter pelo menos 2 caracteres';
  }
  if (bairro.trim().length > 50) {
    return 'Bairro deve ter no máximo 50 caracteres';
  }
  return '';
};

// Validação de cidade
export const validateCidade = (cidade: string): string => {
  if (!cidade.trim()) {
    return 'Cidade é obrigatória';
  }
  if (cidade.trim().length < 2) {
    return 'Cidade deve ter pelo menos 2 caracteres';
  }
  if (cidade.trim().length > 50) {
    return 'Cidade deve ter no máximo 50 caracteres';
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cidade.trim())) {
    return 'Cidade deve conter apenas letras e espaços';
  }
  return '';
};

// Validação de estado (UF)
export const validateEstado = (estado: string): string => {
  if (!estado.trim()) {
    return 'Estado é obrigatório';
  }
  
  const estadoLimpo = estado.trim().toUpperCase();
  const estadosValidos = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  if (!estadosValidos.includes(estadoLimpo)) {
    return 'Estado deve ser uma UF válida (ex: SP, RJ, MG)';
  }
  
  return '';
};

// Validação de número
export const validateNumero = (numero: string): string => {
  if (!numero.trim()) {
    return 'Número é obrigatório';
  }
  
  const numeroLimpo = numero.trim();
  
  if (!/^[0-9]+$/.test(numeroLimpo)) {
    return 'Número deve conter apenas dígitos';
  }
  
  if (numeroLimpo.length > 10) {
    return 'Número deve ter no máximo 10 dígitos';
  }
  
  return '';
};

// Validação de função
export const validateFuncao = (funcao: string): string => {
  if (!funcao) {
    return 'Função é obrigatória';
  }
  return '';
};

// Validação de motorista ID
export const validateMotoristaId = (motoristaId: number): string => {
  if (!motoristaId || motoristaId <= 0) {
    return 'Motorista é obrigatório';
  }
  return '';
};
