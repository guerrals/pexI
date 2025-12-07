from typing import Optional
from sqlalchemy import (Column, Integer, String, Boolean, Float, DateTime, Table, Time, Enum as SQLAlchemyEnum,
                        ForeignKey, Text)
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from database import Base

quadro_passageiro_association = Table('quadro_passageiro_association', Base.metadata,
    Column('quadro_id', Integer, ForeignKey('quadros.id'), primary_key=True),
    Column('passageiro_id', Integer, ForeignKey('passageiros.id'), primary_key=True)
)

class Funcao(str, PyEnum):
    CAMERA = "Câmera"
    ELETRICA = "Elétrica"
    SOM = "Som"
    PRODUCAO = "Produção"
    OUTRO = "Outro"


class MotoristaDB(Base):
    __tablename__ = "motoristas"
    id = Column(Integer, primary_key=True)
    nome = Column(String, unique=True)
    contato = Column(String)
    veiculo = relationship("VeiculoDB", back_populates="motorista")

    @property
    def veiculo_id(self) -> Optional[int]:
        """Retorna o ID do quadro associado, se houver."""
        if self.veiculo:
            return self.veiculo.id
        return None


class EnderecoDB(Base):
    __tablename__ = "enderecos"
    id = Column(Integer, primary_key=True)
    rua = Column(String)
    bairro = Column(String)
    cidade = Column(String)
    estado = Column(String)
    cep = Column(String)
    numero = Column(String)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    
    def __str__(self):
        return f"{self.rua}, {self.numero}, {self.bairro}, {self.cidade}, {self.estado}, {self.cep}"
    

class VeiculoDB(Base):
    __tablename__ = "veiculos"
    id = Column(Integer, primary_key=True)
    placa = Column(String, unique=True)
    modelo = Column(String)
    cor = Column(String)
    
    motorista_id = Column(Integer, ForeignKey("motoristas.id"))
    motorista = relationship("MotoristaDB", back_populates="veiculo")
    quadro = relationship("QuadroDB", back_populates="veiculo", uselist=False)

    @property
    def quadro_id(self) -> Optional[int]:
        """Retorna o ID do quadro associado, se houver."""
        if self.quadro:
            return self.quadro.id
        return None


class PassageiroDB(Base):
    __tablename__ = "passageiros"
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    contato = Column(String)
    funcao = Column(SQLAlchemyEnum(Funcao))
    autonomo = Column(Boolean, default=False)
    endereco_id = Column(Integer, ForeignKey("enderecos.id"))

    endereco = relationship("EnderecoDB", lazy="joined")
    quadros = relationship(
        "QuadroDB", 
        secondary=quadro_passageiro_association, # Aponta para a tabela de associação
        back_populates="passageiros"
    )


class MapaTransporteDB(Base):
    __tablename__ = "mapas_transporte"
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    descricao = Column(String, nullable=True)
    data_inicio = Column(DateTime)
    regras = Column(String, nullable=True)

    quadros = relationship(
        "QuadroDB",
        back_populates="mapa_transporte", 
        cascade="all, delete-orphan",
        lazy="joined"
    )


class QuadroDB(Base):
    __tablename__ = "quadros"
    id = Column(Integer, primary_key=True)
    nome = Column(String)
    descricao = Column(Text, nullable=True)
    horario_saida = Column(Time, nullable=True)

    origem_id = Column(Integer, ForeignKey("enderecos.id"))
    destino_id = Column(Integer, ForeignKey("enderecos.id"))
    veiculo_id = Column(Integer, ForeignKey("veiculos.id"), nullable=True, unique=True)
    mapa_transporte_id = Column(Integer, ForeignKey("mapas_transporte.id"))

    veiculo = relationship("VeiculoDB", back_populates="quadro", lazy="joined")
    origem = relationship("EnderecoDB", foreign_keys=[origem_id], lazy="joined")
    destino = relationship("EnderecoDB", foreign_keys=[destino_id], lazy="joined")
    passageiros = relationship(
        "PassageiroDB",
        secondary=quadro_passageiro_association, # Aponta para a mesma tabela
        back_populates="quadros",
        lazy="joined" # Mantém o eager loading
    )
    mapa_transporte = relationship("MapaTransporteDB", back_populates="quadros", lazy="joined")
    rota = relationship("RotaDB", back_populates="quadro", uselist=False, cascade="all, delete-orphan")


class RotaDB(Base):
    __tablename__ = "rotas"
    id = Column(Integer, primary_key=True)
    id_rota_str = Column(String, unique=True)
    duracao_total_estimada = Column(Float)
    distancia_total_estimada_km = Column(Float)
    horario_chegada_estimado = Column(DateTime, nullable=True) 
    google_maps_link = Column(String, nullable=True)

    quadro_id = Column(Integer, ForeignKey("quadros.id"), unique=True)
    quadro = relationship("QuadroDB", back_populates="rota")
    
    veiculo_id = Column(Integer, ForeignKey("veiculos.id"))
    veiculo = relationship("VeiculoDB")
    paradas = relationship("ParadaDB", back_populates="rota", cascade="all, delete-orphan")


class ParadaDB(Base):
    __tablename__ = "paradas"
    id = Column(Integer, primary_key=True)
    ordem = Column(Integer)
    horario_saida = Column(Time, nullable=True)
    rota_id = Column(Integer, ForeignKey("rotas.id"))
    passageiro_id = Column(Integer, ForeignKey("passageiros.id"))
    endereco_id = Column(Integer, ForeignKey("enderecos.id"))

    rota = relationship("RotaDB", back_populates="paradas")
    passageiro = relationship("PassageiroDB")
    endereco = relationship("EnderecoDB", lazy="joined")
