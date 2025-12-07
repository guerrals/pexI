from typing import List
from dotenv import load_dotenv
from sqlalchemy.orm import Session
load_dotenv()

# FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi import FastAPI
from fastapi import Depends
from fastapi import HTTPException

import crud
import schemas
import models
import generate_pdf
from database import get_db
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Otimização de Rotas para Mapa de Transporte",
    description="API para gerir e otimizar o transporte de equipas de produção.",
    version="0.0.1"
)

# Lista de "origens" (endereços de front-end) que têm permissão para aceder à sua API
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite as origens da lista
    allow_credentials=True,      # Permite o envio de cookies/autenticação
    allow_methods=["*"],         # Permite todos os métodos (GET, POST, PUT, etc.)
    allow_headers=["*"],         # Permite todos os cabeçalhos
)

# ==========================================================
# ROTAS DE CADASTRO DE RECURSOS
# ==========================================================

@app.post("/api/motoristas/", response_model=schemas.Motorista, tags=["Recursos: Motoristas"])
def create_motorista(motorista: schemas.MotoristaCreate, db: Session = Depends(get_db)):
    """Cadastra um novo motorista no sistema."""
    # (Poderíamos adicionar uma verificação de unicidade aqui, mas já está no CRUD)
    return crud.create_motorista(db=db, motorista=motorista)

@app.get("/api/motoristas/", response_model=List[schemas.Motorista], tags=["Recursos: Motoristas"])
def read_motoristas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os motoristas cadastrados."""
    motoristas = crud.get_motoristas(db, skip=skip, limit=limit)
    return motoristas

@app.post("/api/veiculos/", response_model=schemas.Veiculo, tags=["Recursos: Veículos"])
def create_veiculo(veiculo: schemas.VeiculoCreate, db: Session = Depends(get_db)):
    """Cadastra um novo veículo, associando a um motorista existente."""
    try:
        return crud.create_veiculo(db=db, veiculo=veiculo)
    except ValueError as e:
        # Captura os erros de lógica de negócio do CRUD (ex: motorista não encontrado)
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/veiculos/", response_model=List[schemas.Veiculo], tags=["Recursos: Veículos"])
def read_veiculos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os veículos cadastrados."""
    veiculos = crud.get_veiculos(db, skip=skip, limit=limit)
    return veiculos

@app.post("/api/passageiros/", response_model=schemas.Passageiro, tags=["Recursos: Passageiros"])
def create_passageiro(passageiro: schemas.PassageiroCreate, db: Session = Depends(get_db)):
    """Cadastra um novo passageiro e o seu endereço."""
    try:
        return crud.create_passageiro(db=db, passageiro=passageiro)
    except ValueError as e:
        # Captura os erros de lógica de negócio do CRUD (ex: motorista não encontrado)
        raise HTTPException(status_code=404, detail=str(e))

@app.put("/api/passageiros/{passageiro_id}", response_model=schemas.Passageiro, tags=["Recursos: Passageiros"])
def update_passageiro(passageiro_id: int, passageiro: schemas.PassageiroUpdate, db: Session = Depends(get_db)):
    """Atualiza as informações de um passageiro existente."""
    db_passageiro = crud.update_passageiro(db=db, passageiro_id=passageiro_id, passageiro_update=passageiro)
    if db_passageiro is None:
        raise HTTPException(status_code=404, detail="Passageiro não encontrado")
    return db_passageiro

@app.delete("/passageiros/{passageiro_id}", response_model=schemas.Passageiro, tags=["Recursos: Passageiros"])
def delete_passageiro(passageiro_id: int, db: Session = Depends(get_db)):
    """Apaga um passageiro do sistema."""
    try:
        db_passageiro = crud.delete_passageiro(db=db, passageiro_id=passageiro_id)
        if db_passageiro is None:
            raise HTTPException(status_code=404, detail="Passageiro não encontrado")
        return db_passageiro
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@app.get("/api/passageiros/", response_model=List[schemas.Passageiro], tags=["Recursos: Passageiros"])
def read_passageiros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os passageiros cadastrados."""
    passageiros = crud.get_passageiros(db, skip=skip, limit=limit)
    return passageiros

# ==========================================================
# ROTAS DE PLANEJAMENTO E EXECUÇÃO
# ==========================================================

# ==========================================================
# ROTAS PARA MAPA DE TRANSPORTE
# ==========================================================

@app.post("/api/mapas_transporte/", response_model=schemas.MapaTransporte, tags=["Planejamento: Mapa de Transporte"])
def create_mapa_transporte(mapa: schemas.MapaTransporteCreate, db: Session = Depends(get_db)):
    """Cria um novo Mapa de Transporte."""
    try:
        return crud.create_mapa_transporte(db=db, mapa=mapa)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/mapas_transporte/", response_model=List[schemas.MapaTransporte], tags=["Planejamento: Mapa de Transporte"])
def read_mapas_transporte(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os Mapas de Transporte."""
    mapas = crud.get_mapas_transporte(db, skip=skip, limit=limit)
    return mapas

@app.get("/api/mapas_transporte/{mapa_id}", response_model=schemas.MapaTransporte, tags=["Planejamento: Mapa de Transporte"])
def read_mapa_transporte(mapa_id: int, db: Session = Depends(get_db)):
    """Obtém os detalhes de um quadro específico."""
    db_mapa_transporte = crud.get_mapa_transporte(db, mapa_id=mapa_id)
    if db_mapa_transporte is None:
        raise HTTPException(status_code=404, detail="Mapa não encontrado")
    return db_mapa_transporte

@app.post("/api/mapas_transporte/{mapa_id}/gerar_rota/", response_model=List[schemas.Rota], tags=["Execução: Geração de Rota"])
def gerar_rota_para_mapa_de_transporte(mapa_id: int, db: Session = Depends(get_db)):
    """
    Dispara a otimização de uma rota para um quadro específico, salva o resultado
    e retorna a rota otimizada.
    """
    try:
        rotas_salva = crud.gerar_e_salvar_rota_otimizada_mt(db=db, mapa_id=mapa_id)
        return rotas_salva
    except ValueError as e:
        # Erros de negócio (ex: quadro não encontrado, falta de passageiros)
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Outros erros (ex: falha na comunicação com o GraphHopper)
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro interno ao gerar a rota: {e}")

@app.get("/api/mapas_transporte/{mapa_id}/pdf", tags=["Execução"])
def download_mapa_pdf(mapa_id: int, db: Session = Depends(get_db)):
    """
    Gera um PDF consolidado com todos os quadros e rotas de um Mapa de Transporte.
    """
    db_mapa = crud.get_mapa_transporte(db, mapa_id=mapa_id)
    if not db_mapa:
        raise HTTPException(status_code=404, detail="Mapa de Transporte não encontrado")
    # Chama a nova função que gera o PDF consolidado
    caminho_do_pdf = generate_pdf.gerar_pdf(db_mapa)
    
    return FileResponse(
        path=caminho_do_pdf,
        media_type='application/pdf',
        filename=f"mapa_consolidado_{db_mapa.nome}.pdf"
    )


# ==========================================================
# ROTAS PARA QUADRO
# ==========================================================

@app.post("/api/quadros/", response_model=schemas.Quadro, tags=["Planejamento: Quadro"])
def create_quadro(quadro: schemas.QuadroCreate, db: Session = Depends(get_db)):
    """Cria um novo Quadro de Transporte (ainda sem veículo ou passageiros)."""
    try:
        return crud.create_quadro(db=db, quadro=quadro)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/quadros/", response_model=List[schemas.Quadro], tags=["Planejamento: Quadro"])
def read_quadros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os quadros de transporte criados."""
    quadros = crud.get_quadros(db, skip=skip, limit=limit)
    return quadros

@app.get("/api/quadros/{quadro_id}", response_model=schemas.Quadro, tags=["Planejamento: Quadro"])
def read_quadro(quadro_id: int, db: Session = Depends(get_db)):
    """Obtém os detalhes de um quadro específico."""
    db_quadro = crud.get_quadro(db, quadro_id=quadro_id)
    if db_quadro is None:
        raise HTTPException(status_code=404, detail="Quadro não encontrado")
    return db_quadro

@app.put("/api/quadros/{quadro_id}/associar/", response_model=schemas.Quadro, tags=["Planejamento: Associar ao Quadro"])
def update_quadro_associacoes(quadro_id: int, associacoes: schemas.AssociacaoQuadro, db: Session = Depends(get_db)):
    """Associa um veículo e uma lista de passageiros a um quadro existente."""
    try:
        return crud.associar_recursos_ao_quadro(db=db, quadro_id=quadro_id, associacoes=associacoes)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.delete("/api/quadros/{quadro_id}", response_model=schemas.Quadro, tags=["Planeamento"])
def delete_quadro(quadro_id: int, db: Session = Depends(get_db)):
    """Apaga um Quadro de Transporte e desassocia seus passageiros."""
    db_quadro_apagado = crud.delete_quadro(db=db, quadro_id=quadro_id)
    if db_quadro_apagado is None:
        raise HTTPException(status_code=404, detail="Quadro não encontrado")
    # Retornamos o objeto apagado como confirmação (pode estar sem relações carregadas)
    return db_quadro_apagado

@app.post("/api/quadros/{quadro_id}/gerar_rota/", response_model=schemas.Rota, tags=["Execução: Geração de Rota"])
def gerar_rota_para_mapa_de_transporte(quadro_id: int, db: Session = Depends(get_db)):
    """
    Dispara a otimização de uma rota para um quadro específico, salva o resultado
    e retorna a rota otimizada.
    """
    try:
        rotas_salva = crud.gerar_e_salvar_rota_otimizada(db=db, quadro_id=quadro_id)
        return rotas_salva
    except ValueError as e:
        # Erros de negócio (ex: quadro não encontrado, falta de passageiros)
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Outros erros (ex: falha na comunicação com o GraphHopper)
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro interno ao gerar a rota: {e}")

@app.get("/api/rotas/{rota_id}", response_model=schemas.Rota, tags=["Execução: Exibição de Rota"])
def read_rota(rota_id: int, db: Session = Depends(get_db)):
    """Obtém os detalhes de uma rota otimizada específica."""
    db_rota = crud.get_rota(db, rota_id=rota_id)
    if db_rota is None:
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    return db_rota

# ==========================================================
# ENDPOINTS DE GERAÇÃO DE PDF
# ==========================================================

@app.get("/api/mapas_transporte/{mapa_id}/pdf", tags=["Execução e PDF"])
def download_mapa_consolidado_pdf(mapa_id: int, db: Session = Depends(get_db)):
    """Gera um PDF consolidado com todos os quadros e rotas de um Mapa de Transporte."""
    try:
        caminho_do_pdf = crud.get_mapa_consolidado_pdf_filepath(db=db, mapa_id=mapa_id)
        
        return FileResponse(
            path=caminho_do_pdf,
            media_type='application/pdf',
            filename=f"mapa_consolidado_{mapa_id}.pdf"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro ao gerar o PDF: {e}")

# Em main.py
@app.put("/api/quadros/{quadro_id}/salvar_ordem_paradas/", response_model=schemas.Rota, tags=["Planeamento"])
def salvar_ordem_paradas_endpoint(quadro_id: int, request: schemas.OrdemParadasRequest, db: Session = Depends(get_db)):
    try:
        rota_atualizada = crud.salvar_ordem_paradas(db, quadro_id, request.passageiros_ids)
        return rota_atualizada
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
