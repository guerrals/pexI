import time
import unicodedata
from pydantic import BaseModel
from pydantic import model_validator
from pydantic import field_validator
from datetime import datetime
from typing import List
from typing import Optional
from datetime import time
from models import Funcao

# --- Schemas para Endereco ---

class EnderecoBase(BaseModel):
    rua: str
    bairro: str
    cidade: str
    estado: str
    cep: str
    numero: str

class EnderecoCreate(EnderecoBase):
    pass

class EnderecoUpdate(BaseModel):
    rua: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    numero: Optional[str] = None

class Endereco(EnderecoBase):
    id: int
    class Config:
        from_attributes = True

# --- Schemas para Motorista ---

class MotoristaBase(BaseModel):
    nome: str
    contato: str

class MotoristaCreate(MotoristaBase):
    pass

class Motorista(MotoristaBase):
    id: int
    veiculo_id: Optional[int] = None
    class Config:
        from_attributes = True

# --- Schemas para Veiculo ---

class VeiculoBase(BaseModel):
    placa: str
    modelo: str
    cor: str

class VeiculoCreate(VeiculoBase):
    motorista_id: int
    
    @field_validator('placa')
    def validar_placa(cls, v):
        placa_limpa = v.strip().upper()
        if not placa_limpa.replace(" ", "").replace("-", "").isalnum():
            raise ValueError('A placa deve conter apenas letras e números.')
        
        if len(placa_limpa) != 7 and (not "-" in placa_limpa or " " in placa_limpa):
            raise ValueError('A placa deve ter exatamente 7 caracteres.')  
        return placa_limpa

class Veiculo(VeiculoBase):
    id: int
    motorista: Motorista
    quadro_id: Optional[int] = None
    class Config:
        from_attributes = True

# --- Schemas para Passageiro ---

class PassageiroBase(BaseModel):
    nome: str
    contato: str
    funcao: Funcao
    autonomo: bool = False

class PassageiroUpdate(BaseModel):
    nome: Optional[str] = None
    contato: Optional[str] = None
    funcao: Optional[Funcao] = None
    autonomo: Optional[bool] = None
    endereco: Optional[EnderecoUpdate] = None

class PassageiroCreate(PassageiroBase):
    endereco: Optional[EnderecoCreate] = None

    @field_validator('funcao', mode='before')
    @classmethod
    def normalize_and_validate_funcao(cls, v):
        """
        Este validador é executado ANTES da validação padrão do Pydantic.
        Ele permite entradas flexíveis como "camera" ou "câmera" e as converte
        para o valor canónico do Enum.
        """
        if not isinstance(v, str):
            return v # Se não for uma string, deixa a validação padrão do Pydantic falhar

        # Normaliza a entrada do utilizador (remove acentos, converte para minúsculas)
        normalized_input = "".join(
            c for c in unicodedata.normalize("NFKD", v) 
            if not unicodedata.combining(c)
        ).lower()

        # Compara a entrada normalizada com os valores do Enum (também normalizados)
        for member in Funcao:
            normalized_member_value = "".join(
                c for c in unicodedata.normalize("NFKD", member.value) 
                if not unicodedata.combining(c)
            ).lower()
            
            if normalized_input == normalized_member_value:
                # Se encontrar correspondência, retorna o valor ORIGINAL e VÁLIDO do Enum
                return member.value # Ex: retorna "Câmera" com acento

        # Se não encontrar nenhuma correspondência, retorna a entrada original para que
        # a validação padrão do Pydantic falhe e retorne um erro claro ao cliente.
        return v

    @model_validator(mode='before')
    @classmethod
    def validar_endereco_para_nao_autonomos(cls, values):
        """
        Verifica a regra de negócio: se 'autonomo' é False, 'endereco' deve ser fornecido.
        Se 'autonomo' é True, garante que 'endereco' é nulo.
        """
        autonomo = values.get('autonomo', False)
        endereco = values.get('endereco')

        if not autonomo and not endereco:
            raise ValueError('O endereço é obrigatório para passageiros não autônomos.')
        
        # Opcional, mas boa prática: se for autônomo, ignoramos qualquer endereço enviado
        if autonomo and endereco:
            values['endereco'] = None
            
        return values

class Passageiro(PassageiroBase):
    id: int
    endereco: Optional[Endereco] = None

    class Config:
        from_attributes = True

# --- Schemas para Parada ---

class ParadaBase(BaseModel):
    ordem: int
    horario_saida: Optional[time] = None

class ParadaCreate(ParadaBase):
    passageiro_id: int
    endereco_id: int

class Parada(ParadaBase):
    id: int
    passageiro: Passageiro
    endereco: Endereco
    class Config:
        from_attributes = True

# --- Schemas para Rota ---

class RotaBase(BaseModel):
    id_rota_str: str
    duracao_total_estimada: Optional[int] = None
    distancia_total_estimada_km: Optional[float] = None
    horario_chegada_estimado: Optional[datetime] = None
    google_maps_link: Optional[str] = None

class RotaCreate(RotaBase):
    veiculo_id: Optional[int] = None
    origem_id: int
    destino_id: int
    paradas: List[ParadaCreate]

class Rota(RotaBase):
    id: int
    veiculo: Optional[Veiculo] = None
    paradas: List["Parada"]
    quadro: "Quadro"
    class Config:
        from_attributes = True

class RotaQuadro(RotaBase):
    id: int
    paradas: List["Parada"]
    horario_chegada_estimado: Optional[datetime] = None
    google_maps_link: Optional[str] = None
    class Config:
        from_attributes = True

# --- Schemas para Quadro ---

class QuadroBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    horario_saida: Optional[time] = None

class QuadroCreate(QuadroBase):
    origem: EnderecoCreate
    destino: EnderecoCreate
    mapa_transporte_id: int

class AssociacaoQuadro(BaseModel):
    veiculo_id: Optional[int] = None
    passageiros_ids: List[int]

class Quadro(QuadroBase):
    id: int
    nome: str
    descricao: Optional[str] = None
    origem: Endereco
    destino: Endereco
    veiculo: Optional[Veiculo] = None
    passageiros: List[Passageiro] = []
    mapa_transporte_id: int
    rota: Optional["RotaQuadro"] = None

    class Config:
        from_attributes = True

# --- Schemas para MapaTransporte ---

class MapaTransporteBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    data_inicio: datetime
    regras: Optional[str] = None

class MapaTransporteCreate(MapaTransporteBase):
    pass

class MapaTransporte(MapaTransporteBase):
    id: int
    quadros: List['Quadro'] = []
    class Config:
        from_attributes = True

class OrdemParadasRequest(BaseModel):
    passageiros_ids: List[int]

# Resolvendo referências futuras
MapaTransporte.model_rebuild()
Quadro.model_rebuild()
Rota.model_rebuild()