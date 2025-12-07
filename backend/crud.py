import models
import schemas
from utils import gerar_link_google_maps_rota
from generate_pdf import gerar_pdf
from matriz import construir_matrizes_de_custo
from otimizador import otimizador_de_rota_quadro
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List
from datetime import datetime
from datetime import timedelta
from geocoders import geocode

# ==========================================================
# CRUD para MapaTransporte (NOVO)
# ==========================================================
def get_mapa_transporte(db: Session, mapa_id: int):
    """Lê um Mapa de Transporte da base de dados pelo seu ID."""
    return db.query(models.MapaTransporteDB).filter(models.MapaTransporteDB.id == mapa_id).first()

def get_mapas_transporte(db: Session, skip: int = 0, limit: int = 100):
    """Lê uma lista de Mapas de Transporte."""
    return db.query(models.MapaTransporteDB).offset(skip).limit(limit).all()

def create_mapa_transporte(db: Session, mapa: schemas.MapaTransporteCreate) -> models.MapaTransporteDB:
    """Cria um novo Mapa de Transporte."""
    db_mapa = models.MapaTransporteDB(
        nome=mapa.nome,
        descricao=mapa.descricao,
        data_inicio=mapa.data_inicio,
        regras=mapa.regras
    )
    db.add(db_mapa)
    db.commit()
    db.refresh(db_mapa)
    return db_mapa

# ==========================================================
# CRUD para Endereco
# ==========================================================

def create_endereco(db: Session, endereco: schemas.EnderecoCreate) -> models.EnderecoDB:
    db_endereco = models.EnderecoDB(**endereco.dict())
    db.add(db_endereco)
    db.commit()
    db.refresh(db_endereco)
    return db_endereco

# ==========================================================
# CRUD para Motorista
# ==========================================================

def get_motorista(db: Session, motorista_id: int):
    return (
        db.query(models.MotoristaDB)
        .options(joinedload(models.MotoristaDB.veiculo))
        .filter(models.MotoristaDB.id == motorista_id)
        .first()
    )

def get_motoristas(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.MotoristaDB)
        .options(joinedload(models.MotoristaDB.veiculo))
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_motorista(db: Session, motorista: schemas.MotoristaCreate) -> models.MotoristaDB:
    db_motorista = models.MotoristaDB(**motorista.dict())
    db.add(db_motorista)
    db.commit()
    db.refresh(db_motorista)
    return db_motorista

# ==========================================================
# CRUD para Veículo
# ==========================================================

def get_veiculo_by_placa(db: Session, placa: str):
    return db.query(models.VeiculoDB).filter(models.VeiculoDB.placa == placa).first()

def get_veiculo(db: Session, veiculo_id: int):
    return db.query(models.VeiculoDB).filter(models.VeiculoDB.id == veiculo_id).first()

def get_veiculos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.VeiculoDB).offset(skip).limit(limit).all()

def create_veiculo(db: Session, veiculo: schemas.VeiculoCreate) -> models.VeiculoDB:
    db_veiculo_existente = get_veiculo_by_placa(db, placa=veiculo.placa)
    if db_veiculo_existente:
        raise ValueError(f"Já existe um veículo cadastrado com a placa {veiculo.placa}.")
    
    db_motorista = get_motorista(db, motorista_id=veiculo.motorista_id)
    if not db_motorista:
        raise ValueError(f"Motorista com id {veiculo.motorista_id} não encontrado.")
    
    db_veiculo = models.VeiculoDB(
        placa=veiculo.placa,
        modelo=veiculo.modelo,
        cor=veiculo.cor,
        motorista_id=veiculo.motorista_id
    )
    db.add(db_veiculo)
    db.commit()
    db.refresh(db_veiculo)
    return db_veiculo

# ==========================================================
# CRUD para Passageiro
# ==========================================================

def get_passageiro(db: Session, passageiro_id: int):
    return db.query(models.PassageiroDB).filter(models.PassageiroDB.id == passageiro_id).first()

def get_passageiros(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PassageiroDB).offset(skip).limit(limit).all()

def create_passageiro(db: Session, passageiro: schemas.PassageiroCreate) -> models.PassageiroDB:
    db_endereco_id = None
    if passageiro.endereco:
        db_endereco = create_endereco(db=db, endereco=passageiro.endereco)
        db_endereco_id = db_endereco.id

    db_passageiro = models.PassageiroDB(
        nome=passageiro.nome,
        contato=passageiro.contato,
        funcao=passageiro.funcao,
        autonomo=passageiro.autonomo,
        endereco_id=db_endereco_id
    )
    db.add(db_passageiro)
    db.commit()
    db.refresh(db_passageiro)
    return db_passageiro

def update_passageiro(db: Session, passageiro_id: int, passageiro_update: schemas.PassageiroUpdate) -> models.PassageiroDB:
    """Atualiza os dados de um passageiro e/ou do seu endereço."""
    db_passageiro = get_passageiro(db, passageiro_id=passageiro_id)
    if not db_passageiro:
        return None

    # Pega os dados do schema Pydantic e converte para um dicionário, excluindo os não definidos
    update_data = passageiro_update.dict(exclude_unset=True)

    # Atualiza os campos do passageiro
    for key, value in update_data.items():
        if key != 'endereco':
            setattr(db_passageiro, key, value)

    # Lógica para atualizar/criar/remover o endereço
    if 'endereco' in update_data:
        endereco_data = passageiro_update.endereco
        if endereco_data is None and db_passageiro.endereco:
            # Remove o endereço existente se o payload enviar "endereco": null
            db.delete(db_passageiro.endereco)
            db_passageiro.endereco_id = None
        elif endereco_data and db_passageiro.endereco:
            # Atualiza o endereço existente
            for key, value in endereco_data.dict(exclude_unset=True).items():
                setattr(db_passageiro.endereco, key, value)
        elif endereco_data and not db_passageiro.endereco:
            # Cria um novo endereço se o passageiro não tiver um
            novo_endereco = create_endereco(db, schemas.EnderecoCreate(**endereco_data.dict()))
            db_passageiro.endereco_id = novo_endereco.id

    db.add(db_passageiro)
    db.commit()
    db.refresh(db_passageiro)
    return db_passageiro

def delete_passageiro(db: Session, passageiro_id: int):
    """Apaga um passageiro da base de dados."""
    db_passageiro = get_passageiro(db, passageiro_id=passageiro_id)
    if not db_passageiro:
        return None
    
    # REGRA DE NEGÓCIO: Não permitir apagar um passageiro que está associado a um quadro.
    if db_passageiro.quadro_id:
        raise ValueError(f"Não é possível apagar o passageiro '{db_passageiro.nome}', pois ele está associado ao Quadro ID {db_passageiro.quadro.nome}.")

    # Se o passageiro tem um endereço, também o apagamos.
    if db_passageiro.endereco:
        db.delete(db_passageiro.endereco)

    db.delete(db_passageiro)
    db.commit()
    return db_passageiro

# ==========================================================
# CRUD para Quadro
# ==========================================================

def get_quadro(db: Session, quadro_id: int):
    return db.query(models.QuadroDB).filter(models.QuadroDB.id == quadro_id).first()

def get_quadros(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.QuadroDB).offset(skip).limit(limit).all()

def create_quadro(db: Session, quadro: schemas.QuadroCreate) -> models.QuadroDB:
    db_mapa = get_mapa_transporte(db, mapa_id=quadro.mapa_transporte_id)
    if not db_mapa:
        raise ValueError(f"Mapa de Transporte com id {quadro.mapa_transporte_id} não encontrado.")

    db_origem = create_endereco(db=db, endereco=quadro.origem)
    db_destino = create_endereco(db=db, endereco=quadro.destino)
    db_quadro = models.QuadroDB(
        nome=quadro.nome,
        descricao=quadro.descricao,
        horario_saida=quadro.horario_saida if quadro.horario_saida else None,
        origem_id=db_origem.id,
        destino_id=db_destino.id,
        mapa_transporte_id=quadro.mapa_transporte_id
    )
    db.add(db_quadro)
    db.commit()
    db.refresh(db_quadro)
    return db_quadro

def associar_recursos_ao_quadro(db: Session, quadro_id: int, associacoes: schemas.AssociacaoQuadro):
    db_quadro = (
        db.query(models.QuadroDB)
        .options(joinedload(models.QuadroDB.passageiros))
        .filter(models.QuadroDB.id == quadro_id)
        .first()
    )
    if not db_quadro:
        raise ValueError(f"Quadro com id {quadro_id} não encontrado.")

    db_passageiros = db.query(models.PassageiroDB).filter(models.PassageiroDB.id.in_(associacoes.passageiros_ids)).all()
    if len(db_passageiros) != len(associacoes.passageiros_ids):
        raise ValueError("Um ou mais IDs de passageiros não foram encontrados.")

    if associacoes.veiculo_id is not None:
        # Verifica se o veículo já está em uso por OUTRO quadro
        db_veiculo = get_veiculo(db, veiculo_id=associacoes.veiculo_id)
        if db_veiculo:
            db_quadro.veiculo_id = db_veiculo.id
    else:
        # Se nenhum ID foi enviado, desassocia o veículo
        db_quadro.veiculo_id = None
    
    db_quadro.passageiros = db_passageiros
        
    db.commit()
    db.refresh(db_quadro)
    return db_quadro

def delete_quadro(db: Session, quadro_id: int):
    """Apaga um quadro da base de dados."""
    # Busca o quadro, carregando também os passageiros associados
    db_quadro = (
        db.query(models.QuadroDB)
        .options(joinedload(models.QuadroDB.passageiros)) # Carrega passageiros para desassociar
        .filter(models.QuadroDB.id == quadro_id)
        .first()
    )
    
    if not db_quadro:
        return None # Quadro não encontrado

    # 1. Desassociar Passageiros:
    # Define o quadro_id de todos os passageiros deste quadro como None
    for passageiro in db_quadro.passageiros:
        passageiro.quadro_id = None
        # Não precisamos fazer db.add(passageiro), o SQLAlchemy gere a alteração

    # 2. Apagar o Quadro:
    # O cascade="all, delete-orphan" na relação QuadroDB.rota garantirá que a RotaDB
    # e as suas ParadaDBs associadas sejam apagadas automaticamente.
    db.delete(db_quadro)
    
    # 3. Commit das alterações (desassociação e deleção)
    db.commit()
    
    # Retorna o objeto que foi apagado (sem as relações que foram cascateadas)
    # Note: Após o commit, o objeto está "detached", então as relações podem não estar acessíveis.
    # Retornamos apenas para confirmação.
    return db_quadro

# ==========================================================
# LÓGICA DE OTIMIZAÇÃO E ROTA
# ==========================================================

def montar_payload_vrp_from_db(origem: str, destino: str, passageiros: List[models.PassageiroDB]):
    enderecos_formated = []
    enderecos_formated.append(origem)
    for passageiro in passageiros:
        if not passageiro.autonomo:
            enderecos_formated.append(passageiro.endereco)
    enderecos_formated.append(destino)
    lista_coordenadas = geocode(enderecos_formated)
    return lista_coordenadas

def gerar_e_salvar_rota_otimizada(db: Session, quadro_id: int):
    db_quadro = get_quadro(db, quadro_id=quadro_id)
    
    if not db_quadro:
        raise ValueError("Quadro não encontrado.")
    if not db_quadro.passageiros:
        raise ValueError("O quadro precisa de ter pelo menos um passageiro associados.")
    
    if db_quadro.rota:
        print(f"Rota ID {db_quadro.rota.id} já existe para o Quadro ID {quadro_id}. Apagando rota antiga...")
        db.delete(db_quadro.rota)
        db.commit()
        db.refresh(db_quadro)

    locais_ordenados = [db_quadro.origem]
    for passageiro in db_quadro.passageiros:
        locais_ordenados.append(passageiro.endereco)
    locais_ordenados.append(db_quadro.destino)

    coordenadas = montar_payload_vrp_from_db(db_quadro.origem.__str__(), db_quadro.destino.__str__(), db_quadro.passageiros)
    matriz_tempos, matriz_distancias = construir_matrizes_de_custo(coordenadas)
    rota_solucao = otimizador_de_rota_quadro(matriz_tempos, matriz_distancias)

    if not rota_solucao:
        raise ValueError("Falha ao obter solução do otimizador.")

    tempo_total_segundos = rota_solucao["tempo_segundos"]
    distancia_total_metros = rota_solucao["distancia_metros"]
    momento_partida = datetime.combine(db_quadro.mapa_transporte.data_inicio.date(), db_quadro.horario_saida)
    momento_chegada = momento_partida + timedelta(seconds=tempo_total_segundos)
    detalhes_paradas = rota_solucao["detalhes_paradas"]
    nova_rota_db = models.RotaDB(
        id_rota_str=f"rota_{db_quadro.id}_{datetime.now().timestamp()}",
        duracao_total_estimada=tempo_total_segundos,
        distancia_total_estimada_km=distancia_total_metros / 1000.0,
        horario_chegada_estimado=momento_chegada,
        quadro_id=db_quadro.id
    )
    paradas_com_endereco = []
    for ordem, detalhe_parada in enumerate(detalhes_paradas[1:-1], start=1):
        indice_do_local = detalhe_parada["indice_parada"]
        endereco_da_parada = locais_ordenados[indice_do_local]
        passageiro_da_parada = next(
            (p for p in db_quadro.passageiros if p.endereco_id == endereco_da_parada.id), 
            None
        )

        tempo_acumulado_s = detalhe_parada["tempo_acumulado_s"]
        horario_saida_calculado = (datetime.combine(datetime.today(), db_quadro.horario_saida) + timedelta(seconds=tempo_acumulado_s)).time()
        nova_parada_db = models.ParadaDB(
            ordem=ordem,
            horario_saida=horario_saida_calculado,
            passageiro_id=passageiro_da_parada.id,
            endereco_id=passageiro_da_parada.endereco.id,
        )
        nova_parada_db.endereco = endereco_da_parada
        paradas_com_endereco.append(nova_parada_db)
        nova_rota_db.paradas.append(nova_parada_db)
    if paradas_com_endereco:
        paradas_com_endereco = sorted(paradas_com_endereco, key=lambda parada: parada.ordem)
    link_google_maps = gerar_link_google_maps_rota(
        origem=db_quadro.origem,
        destino=db_quadro.destino,
        paradas=paradas_com_endereco
    )
    nova_rota_db.google_maps_link = link_google_maps

    db_quadro.rota = nova_rota_db
    db.commit()
    db.refresh(db_quadro)

    print(f"Rota ID={nova_rota_db.id} otimizada e salva na base de dados.")
    return db_quadro.rota

def gerar_e_salvar_rota_otimizada_mt(db: Session, mapa_id: int):
    db_mapa_transporte = get_mapa_transporte(db, mapa_id=mapa_id)
    if not db_mapa_transporte:
        raise ValueError("Mapa de Transporte não encontrado.")
    rotas = []
    for db_quadro in db_mapa_transporte.quadros:
        rota = gerar_e_salvar_rota_otimizada(db, db_quadro.id)
        rotas.append(rota)
    return rotas

def get_rota(db: Session, rota_id: int):
    """
    Lê uma rota da base de dados pelo seu ID, pré-carregando todas as 
    relações necessárias para a exibição no front-end.
    """
    return (
        db.query(models.RotaDB)
        .options(
            # Carrega o quadro e suas relações diretas
            joinedload(models.RotaDB.quadro).joinedload(models.QuadroDB.veiculo).joinedload(models.VeiculoDB.motorista),
            joinedload(models.RotaDB.quadro).joinedload(models.QuadroDB.origem),
            joinedload(models.RotaDB.quadro).joinedload(models.QuadroDB.destino),
            
            # Carrega as paradas e as suas relações aninhadas
            joinedload(models.RotaDB.paradas).joinedload(models.ParadaDB.passageiro).joinedload(models.PassageiroDB.endereco),
            joinedload(models.RotaDB.paradas).joinedload(models.ParadaDB.endereco)
        )
        .filter(models.RotaDB.id == rota_id)
        .first()
    )

def get_mapa_consolidado_pdf_filepath(db: Session, mapa_id: int) -> str:
    """
    Busca os dados de um Mapa de Transporte e chama o gerador de PDF consolidado.
    """
    # A função get_mapa_transporte já está configurada com 'joinedload' para buscar tudo
    db_mapa = get_mapa_transporte(db, mapa_id=mapa_id)
    if not db_mapa:
        raise ValueError(f"Mapa de Transporte com id {mapa_id} não encontrado.")

    # Chama a função que itera sobre os quadros/rotas e desenha o PDF
    filepath = gerar_pdf(db_mapa=db_mapa)
    
    return filepath

def salvar_ordem_paradas(db: Session, quadro_id: int, passageiros_ids_ordenados: List[int]):
    """
    Recebe uma lista de IDs de passageiros na ordem definida pelo utilizador
    e cria/atualiza os objetos ParadaDB.
    """
    db_quadro = get_quadro(db, quadro_id=quadro_id)
    if not db_quadro:
        raise ValueError("Quadro não encontrado.")

    if db_quadro.rota:
        db.delete(db_quadro.rota)
        db.commit()
        db.refresh(db_quadro)

    # 3. Mapear IDs para objetos PassageiroDB (apenas os não autônomos)
    passageiros_map = {p.id: p for p in db_quadro.passageiros}
    paradas_passageiros_ordenados = []
    for pid in passageiros_ids_ordenados:
        if pid in passageiros_map:
            paradas_passageiros_ordenados.append(passageiros_map[pid])
        else:
            raise ValueError(f"Passageiro ID {pid} inválido, autônomo ou sem endereço.")

    nova_rota_db = models.RotaDB(
        id_rota_str=f"rota_{db_quadro.id}_{datetime.now().timestamp()}",
        duracao_total_estimada=None,
        distancia_total_estimada_km=None,
        horario_chegada_estimado=None,
        quadro_id=db_quadro.id
    )
    paradas_para_link = []
    # 5. Criar as ParadaDB (SIMPLIFICADA, sem horários calculados)
    for i, passageiro_da_parada in enumerate(paradas_passageiros_ordenados):
        ordem_da_parada = i + 1
        
        nova_parada_db = models.ParadaDB(
            ordem=ordem_da_parada,
            horario_saida=None, # <-- Não calculamos mais o horário
            passageiro_id=passageiro_da_parada.id,
            endereco_id=passageiro_da_parada.endereco_id
        )
        nova_parada_db.endereco = passageiro_da_parada.endereco # Anexa o objeto
        nova_rota_db.paradas.append(nova_parada_db)
        paradas_para_link.append(nova_parada_db)

    # 6. Gerar link do Google Maps (usando os endereços em texto)
    link_google_maps = gerar_link_google_maps_rota(
        origem=db_quadro.origem,
        destino=db_quadro.destino,
        paradas=paradas_para_link
    )
    nova_rota_db.google_maps_link = link_google_maps
    
    db.add(nova_rota_db)
    db.commit()
    db.refresh(nova_rota_db)
    return nova_rota_db
