import models
from urllib.parse import quote_plus
from typing import List

def formatar_tempo(segundos_totais: float) -> str:
    """
    Transforma um número total de segundos num formato de texto legível,
    incluindo horas, minutos e segundos.
    Ex: 3735 -> "1 hora, 2 minutos e 15 segundos"
    """
    if not isinstance(segundos_totais, float) or segundos_totais < 0:
        return "Entrada inválida"
        
    if segundos_totais == 0:
        return "0 segundos"

    # Calcula as horas, minutos e segundos
    horas = segundos_totais // 3600
    segundos_restantes = segundos_totais % 3600
    minutos = segundos_restantes // 60
    segundos = segundos_restantes % 60

    # Cria as partes do texto
    partes_texto = []

    if horas > 0:
        texto_horas = f"{horas} hora{'s' if horas > 1 else ''}"
        partes_texto.append(texto_horas)

    if minutos > 0:
        texto_minutos = f"{minutos} minuto{'s' if minutos > 1 else ''}"
        partes_texto.append(texto_minutos)

    if segundos > 0:
        texto_segundos = f"{segundos} segundo{'s' if segundos > 1 else ''}"
        partes_texto.append(texto_segundos)

    # Junta as partes de forma inteligente para criar uma frase natural
    if len(partes_texto) > 1:
        # Junta tudo com vírgulas, exceto o último elemento que é juntado com " e "
        return ", ".join(partes_texto[:-1]) + " e " + partes_texto[-1]
    elif partes_texto:
        # Se houver apenas uma parte (ex: "5 minutos"), retorna diretamente
        return partes_texto[0]
    else:
        # Caso raro de entrada ser 0 e passar a verificação inicial
        return "0 segundos"

def formatar_distancia(metros: float) -> str:
    """
    Transforma uma distância em metros num formato de texto legível (km ou m).

    Exemplos:
        - 750 -> "750 metros"
        - 1000 -> "1,0 km"
        - 15500.7 -> "15,5 km"
    """
    if not isinstance(metros, (int, float)) or metros < 0:
        return "Distância inválida"
    
    if metros == 0:
        return "0 metros"

    # Se a distância for inferior a 1 km, mostrar em metros.
    if metros < 1000:
        metros_int = round(metros)
        return f"{metros_int} metro{'s' if metros_int != 1 else ''}"
    
    # Se for 1 km ou mais, mostrar em quilómetros com uma casa decimal.
    else:
        quilometros = metros / 1000.0
        # O ':,.1f' formata o número com 1 casa decimal e usa a vírgula como separador.
        return f"{quilometros:,.1f} km".replace(",", "X").replace(".", ",").replace("X", ".")

# Formata e codifica o endereço para a URL
def formatar_endereco(end: models.EnderecoDB) -> str:
    quote_plus_str = quote_plus(f"{end.rua}, {end.numero}, {end.bairro}, {end.cidade}, {end.estado}")
    return quote_plus_str

def gerar_link_google_maps_rota(origem: models.EnderecoDB, destino: models.EnderecoDB, paradas: List[models.ParadaDB]) -> str:
    """Função auxiliar para construir a URL do Google Maps com a rota."""
    base_url = "https://www.google.com/maps/dir/?api=1"
    origin_param = f"&origin={formatar_endereco(origem)}"
    destination_param = f"&destination={formatar_endereco(destino)}"
    waypoints_param = ""
    if paradas:
        enderecos_paradas = "|".join([formatar_endereco(p.endereco) for p in paradas])
        waypoints_param = f"&waypoints={enderecos_paradas}"
        
    return f"{base_url}{origin_param}{destination_param}{waypoints_param}"

def gerar_link_google_maps(endereco: models.EnderecoDB):
    base_url = "https://www.google.com/maps/dir/?q="
    endereco_formatado = formatar_endereco(endereco)
    return f"{base_url}{endereco_formatado}"

import re

def formatar_celular_br(numero: str) -> str:
    """
    Formata uma string de número de telefone para o padrão brasileiro (XX) X XXXX-XXXX.
    Retorna a string formatada ou a string original se não for possível formatar.
    
    Exemplos:
        - "84999999999" -> "(84) 9 9999-9999"
        - "84 9 8888 7777" -> "(84) 9 8888-7777"
        - "1191234567" -> "(11) 9 1234-567" (Incompleto, formata o que for possível)
    """
    if not numero or not isinstance(numero, str):
        return ""

    # 1. Remove tudo exceto os dígitos
    digitos = re.sub(r'\D', '', numero)

    # 2. Verifica o comprimento (padrão 11 dígitos)
    tamanho = len(digitos)
    
    # Se não tiver dígitos suficientes para o DDD, retorna os dígitos limpos
    if tamanho < 2:
        return digitos
        
    # Formatação com 11 dígitos (DDD + 9 + Número)
    if tamanho == 11:
        return f"({digitos[0:2]}) {digitos[2:3]} {digitos[3:7]}-{digitos[7:11]}"
        
    # Formatação com 10 dígitos (DDD + Número sem o 9) - Menos comum hoje
    elif tamanho == 10:
        return f"({digitos[0:2]}) {digitos[2:6]}-{digitos[6:10]}"
        
    # Se o número de dígitos for diferente, tenta formatar o máximo possível
    # (Ou pode optar por retornar a string de dígitos limpa ou lançar um erro)
    else:
        # Formata o DDD
        ddd = f"({digitos[0:2]})"
        resto = digitos[2:]
        
        # Formata o número (tentando o padrão com 9)
        if len(resto) > 0:
            numero_formatado = f"{resto[0:1]}"
            if len(resto) > 1:
                numero_formatado += f" {resto[1:5]}"
            if len(resto) > 5:
                numero_formatado += f"-{resto[5:9]}" # Pega no máximo 4 dígitos aqui
            return f"{ddd} {numero_formatado}"
        else:
            return ddd