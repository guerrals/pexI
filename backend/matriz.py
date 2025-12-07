import os
import requests
from utils import formatar_tempo

def construir_matrizes_de_custo(coordenadas):
    """Constrói uma matriz de tempo de viagem usando o GraphHopper local."""
    print("--- Construindo Matriz de Custos (Tempo e Distância) ---")
    graphhopper_url = os.getenv("GRAPHHOPPER_BASE_URL", "http://localhost:8989")
    num_locais = len(coordenadas)
    matriz_tempos = [[0] * num_locais for _ in range(num_locais)]
    matriz_distancias = [[0] * num_locais for _ in range(num_locais)]
    
    for i in range(num_locais):
        for j in range(num_locais):
            if i == j:
                continue
            origem, destino = coordenadas[i], coordenadas[j]
            url = f"{graphhopper_url}/route?point={origem[0]},{origem[1]}&point={destino[0]},{destino[1]}&type=json&profile=car"
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                tempo_segundos = data['paths'][0]['time'] // 1000
                matriz_tempos[i][j] = tempo_segundos
                matriz_distancias[i][j] = int(data['paths'][0]['distance'])
            except requests.exceptions.RequestException as e:
                print(f"[ERRO] Falha ao conectar com o GraphHopper: {e}")
    print("--- Matriz de Tempos e Matriz de Distância Concluída ---")
    return matriz_tempos, matriz_distancias
