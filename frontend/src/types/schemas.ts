// Constante para Funcao
export const Funcao = {
  CAMERA: "Câmera",
  ELETRICA: "Elétrica",
  SOM: "Som",
  PRODUCAO: "Produção",
  OUTRO: "Outro",
} as const;

export type Funcao = typeof Funcao[keyof typeof Funcao];

// Mapa de Transporte
export interface MapaTransporteCreate {
  nome: string;
  descricao?: string | null;
  data_inicio: string;
  regras: string;
}

export interface MapaTransporte extends MapaTransporteCreate {
  id: number;
  quadros: Quadro[];
}

// Quadro
export interface QuadroCreate {
  nome: string;
  horario_saida: string; // ISO date string
  descricao?: string;
  origem: EnderecoCreate,
  destino: EnderecoCreate
}


// Endereço
export interface EnderecoCreate {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  numero: string;
}

export interface EnderecoUpdate {
  rua?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  numero?: string;
}


export interface Endereco extends EnderecoCreate {
  id: number;
}

// Motorista
export interface MotoristaCreate {
  nome: string;
  contato: string;
}

export interface Motorista extends MotoristaCreate {
  id: number;
  veiculo_id: number;
}

// Veículo
export interface VeiculoCreate {
  placa: string;
  modelo: string;
  cor: string;
  motorista_id: number; // ID de um Motorista existente
}

export interface Veiculo extends VeiculoCreate {
  id: number;
  quadro_id: number;
  motorista: Motorista;
}

// Passageiro
export interface PassageiroCreate {
  nome: string;
  contato: string;
  funcao: Funcao;
  autonomo: boolean;
  endereco: EnderecoCreate;
}

export interface PassageiroUpdate {
  nome?: string;
  contato?: string;
  funcao?: Funcao;
  autonomo?: boolean;
  endereco?: EnderecoUpdate;
}

export interface Passageiro extends PassageiroCreate {
  id: number;  
  endereco: Endereco;
}

// Associação de recursos ao quadro
export interface QuadroAssociacao {
  veiculo_id: number | null;
  passageiros_ids: number[];
}

// Rota otimizada
export interface Rota {
  id: number;
  quadro: Quadro;
  google_maps_link?: string;
  horario_chegada_estimado?: string;
  paradas: Array<{
    id: number;
    ordem: number;
    passageiro: {
      id: number;
      nome: string;
      contato: string;
      funcao: string;
      endereco: {
        id: number;
        rua: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        numero: string;
      };
    };
    horario_saida: string; // ISO datetime string
  }>;
  distancia_total_estimada_km?: number; // em km
  duracao_total_estimada?: number; // em minutos
  status: 'pendente' | 'processando' | 'concluida' | 'erro';
  data_criacao: string; // ISO datetime string
}


export interface Quadro extends QuadroCreate {
  id: number;
  mapa_transporte_id: number;
  veiculo?: {
    id: number;
    placa: string;
    modelo: string;
    cor: string;
    motorista: {
      id: number;
      nome: string;
      contato: string;
    };
  } | null;
  passageiros?: Array<Passageiro>;
  rota?: Rota;
}

export interface OrdemParadasRequest {
  passageiros_ids: number[];
}