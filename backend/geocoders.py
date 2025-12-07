import requests
import os
from constants import NOMINATIM_TEXT
from constants import LOCATION_IQ_TEXT
from constants import INSERCAO_MANUAL
from constants import SUCESSO_TEXT
from constants import AVISO_TEXT
from constants import ERROR_TEXT

enderecos = [
    "R. Câmara Cascudo, 1961, Portal do Sol - Extremoz",
    "R. Caminho Novo, 100 - Nossa Senhora da Apresentação",
    "Av. Três Américas, 475 - Lagoa Azul, Natal - RN, 59129-690",
    "Cond. Parque Residencial Serrambi V R. Lajes, 91 - Nova Parnamirim",
    "R. Praia de Muriú, 2001 - Nova Parnamirim",
    "R. Serra do Carmo, 60 - Nova Parnamirim",
    "R. Caraú, 50 - Nova Parnamirim",
    "R. Aeroporto de Ponta Porã, 122 - Emaus, Parnamirim/RN",
    "R. Miramangue, 315 - Planalto",
    "Condomínio Quatro Estações Av. das Brancas Dunas, 65 - Candelária",
    "R. Eletricista Elias Ferreira, 2600 - Candelária",
    "R. Lucia viveiros, 255 (Cond. Central Park) - Neópolis",
    "Rua Milton Santos 13. Lagoa Nova - Natal/RN",
    "Av. Lima e Silva, 1527 - Nossa Senhora de Nazaré",
    "R. Estácio de Sá, 75 - Lagoa Nova",
    "R. Francisco Simplicio, 145 - Vila de Ponta Negra",
    "Av. Praia de Muriú, 9148 - Ponta Negra",
    "R. Ismael Pereira da Silva, 1756 - Capim Macio",
    "Av. Governador José Varela, 2951 - Capim Macio, Natal/RN",
    "R. Sampaio Correia - Nossa Sra. de Nazaré, Natal - RN, 59060-150",
    "R. Delmiro Gouveia, 2855 - Neópolis",
    "R. Alberto Maranhão, 1122 - Tirol",
    "Rua Parque Embu-guaçu 156 - Nova Esperança, Parnamirim/RN",
    "Rua Parque Abrolhos, 99 - Nova Esperança. Parnamirim",
    "R. Princesa Isabel, 749 - Cidade Alta, Natal - RN, 59012-400"
]

enderecos_invalidos = [
        (-5.741643, -35.2679834),
        (-5.885666, -35.2021986),
        (-5.8562527, -35.2534115),
        (-5.8446895, -35.2159314),
        (-5.8606901, -35.2135356),
        (-5.8646144, -35.191077),
        (-5.8064121, -35.2334489),
        (-5.9467014, -35.2774133),
        (-5.9513001, -35.2768802)
    ]

def geocode_nominatim_local(endereco):
    """Tenta geocodificar usando o servidor Nominatim local."""
    url_nominatim = os.getenv("NOMINATIM_BASE_URL", "http://localhost:8080")
    url = f"{url_nominatim}/search?q={endereco}&format=json"
    try:
        response = requests.get(url, timeout=2)
        response.raise_for_status()
        data = response.json()
        if data:
            lat, lon = data[0]['lat'], data[0]['lon']
            return (lat, lon)
    except requests.exceptions.RequestException as error:
        print(error)
    return None

def geocode_locationiq(endereco):
    """Tenta geocodificar usando a API online do LocationIQ."""
    api_key = os.getenv("LOCATIONIQ_API_KEY")
    if not api_key:
        return None
    url_locationiq = os.getenv("LOCATIONIQ_BASE_URL", "https://us1.locationiq.com/v1/search.php")
    url = f"{url_locationiq}?key={api_key}&q={endereco}&format=json"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data:
            lat, lon = data[0]['lat'], data[0]['lon']
            return (lat, lon)
        print(f"\t\t  [{LOCATION_IQ_TEXT}] - [{AVISO_TEXT}] Endereço não encontrado: {endereco}")
    except requests.exceptions.RequestException as e:
        print(e)
    return None

def geocode(enderecos):
    """
    Função principal de geocodificação.
    Tenta o Nominatim local primeiro e usa o LocationIQ como fallback.
    """
    print("--- Iniciando Geocodificação ---")
    coordenadas = []
    # Ensejo para teste com dados do MT fornecido - Remover Abaixo
    index_de_endereco_invalido = 0
    
    # Ensejo para teste com dados do MT fornecido - Remover Acima
    for endereco in enderecos:
        coordenadas_endereco = geocode_nominatim_local(endereco)
        if not coordenadas_endereco:
            coordenadas_endereco = None # geocode_locationiq(endereco)
            if not coordenadas_endereco:
                coordenadas_invalidas = True
                while coordenadas_invalidas:
                    try:
                        # Ensejo para teste com dados do MT fornecido - Remover Inicio
                        coordenadas_endereco = enderecos_invalidos[index_de_endereco_invalido]
                        coordenadas_invalidas = False
                        index_de_endereco_invalido += 1
                        # Ensejo para teste com dados do MT fornecido - Remover Fim
                    except Exception as error:
                        print("Error: ", error)
        coordenadas.append(coordenadas_endereco)
    print("--- Geocodificação Concluída ---\n")
    return coordenadas