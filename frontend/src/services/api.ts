import axios from 'axios';
import type {
  MapaTransporte,
  MapaTransporteCreate,
  Quadro, 
  QuadroCreate, 
  QuadroAssociacao, 
  Rota, 
  Motorista, 
  MotoristaCreate, 
  Veiculo, 
  VeiculoCreate, 
  Passageiro, 
  PassageiroCreate,
  PassageiroUpdate,
  OrdemParadasRequest,
} from '../types/schemas';
import type {  } from '../types/schemas';

const API_BASE_URL = 'http://localhost:8000';

// Instância do axios configurada
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços para Motoristas
export const motoristaService = {
  // Listar todos os motoristas
  listar: async (): Promise<Motorista[]> => {
    const response = await api.get('/api/motoristas/');
    return response.data;
  },

  // Criar novo motorista
  criar: async (motorista: MotoristaCreate): Promise<Motorista> => {
    const response = await api.post('/api/motoristas/', motorista);
    return response.data;
  },
};

// Serviços para Veículos
export const veiculoService = {
  // Listar todos os veículos
  listar: async (): Promise<Veiculo[]> => {
    const response = await api.get('/api/veiculos/');
    return response.data;
  },

  // Criar novo veículo
  criar: async (veiculo: VeiculoCreate): Promise<Veiculo> => {
    const response = await api.post('/api/veiculos/', veiculo);
    return response.data;
  },
};

// Serviços para Passageiros
export const passageiroService = {
  // Listar todos os passageiros
  listar: async (): Promise<Passageiro[]> => {
    const response = await api.get('/api/passageiros/');
    return response.data;
  },

  // Criar novo passageiro
  criar: async (passageiro: PassageiroCreate): Promise<Passageiro> => {
    const response = await api.post('/api/passageiros/', passageiro);
    return response.data;
  },
  atualizar: (id: number, data: PassageiroUpdate) => api.put<Passageiro>(`/api/passageiros/${id}`, data).then(res => res.data),
  apagar: (id: number) => api.delete<Passageiro>(`/api/passageiros/${id}`).then(res => res.data),
};

// Serviços para Quadros
export const quadroService = {
  // Listar todos os quadros
  listar: async (): Promise<Quadro[]> => {
    const response = await api.get('/api/quadros/');
    return response.data;
  },

  // Criar novo quadro
  criar: async (quadro: QuadroCreate): Promise<Quadro> => {
    const response = await api.post('/api/quadros/', quadro);
    return response.data;
  },

  // Buscar quadro por ID
  buscarPorId: async (quadro_id: number): Promise<Quadro> => {
    const response = await api.get(`/api/quadros/${quadro_id}`);
    return response.data;
  },

  // Associar recursos ao quadro
  associarRecursos: async (id: string, associacao: QuadroAssociacao): Promise<Quadro> => {
    const response = await api.put(`/api/quadros/${id}/associar/`, associacao);
    return response.data;
  },

  // Gerar rota otimizada
  gerarRota: async (id: number): Promise<Rota> => {
    const response = await api.post(`/api/quadros/${id}/gerar_rota/`);
    return response.data;
  },

  salvarOrdemParadas: (id: number, idsOrdenados: number[]) => {
    // Monta o payload que o backend espera
    const payload: OrdemParadasRequest = {
      passageiros_ids: idsOrdenados,
    };
    // Faz a chamada PUT para o novo endpoint
    return api.put<Rota>(`/api/quadros/${id}/salvar_ordem_paradas/`, payload).then(res => res.data);
  },

  apagar: async (id: number): Promise<Quadro> => {
    const response = await api.delete(`/api/quadros/${id}/`)
    return response.data
  }
};

// Serviços para Mapa de Transporte
export const mapaTransporteService = {
  // Listar todos os mapas de transporte
  listar: async (): Promise<MapaTransporte[]> => {
    const response = await api.get('/api/mapas_transporte/');
    return response.data;
  },

  // Criar novo quadro
  criar: async (mapa_transporte: MapaTransporteCreate): Promise<MapaTransporte> => {
    const response = await api.post('/api/mapas_transporte/', mapa_transporte);
    return response.data;
  },

  // Buscar quadro por ID
  buscarPorId: async (id: number): Promise<MapaTransporte> => {
    const response = await api.get(`/api/mapas_transporte/${id}`);
    return response.data;
  },

  gerarRotas: async (id: number): Promise<Rota[]> => {
    const response = await api.post(`/api/mapas_transporte/${id}/gerar_rota/`);
    return response.data;
  },

  gerarPdf: (id: number) => {
    return api.get(`/api/mapas_transporte/${id}/pdf`, {
      responseType: 'blob',
    });
  }
}

// Serviços para Rota
export const rotaService = {
  /**
   * Busca os detalhes completos de uma rota otimizada pelo seu ID.
   * @param id - O ID da rota a ser buscada.
   */
  buscarPorId: (id: number) => api.get<Rota>(`/api/rotas/${id}`).then(res => res.data),
};