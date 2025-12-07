import axios from 'axios';

// Interface para a resposta da API BrasilCEP
export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Serviço para busca de CEP
export const cepService = {
  // Buscar informações do CEP
  buscarCep: async (cep: string): Promise<CepResponse | null> => {
    try {
      // Remove caracteres não numéricos do CEP
      const cepLimpo = cep.replace(/\D/g, '');
      
      // Valida se o CEP tem 8 dígitos
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = response.data;

      // Verifica se houve erro na API
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  },

  // Formatar CEP para exibição (00000-000)
  formatarCep: (cep: string): string => {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  },

  // Validar formato do CEP
  validarCep: (cep: string): boolean => {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  },
};
