from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

# def otimizar_rota_mapa(matriz_custo, veiculos_info):
#     """Resolve o Problema de Roteamento de Veículos (VRP) e retorna o plano."""
#     print("\n--- Iniciando Otimização com Google OR-Tools ---")
#     # 1. Criar o gerenciador e o modelo de roteamento
#     num_locais = len(matriz_custo)
#     num_veiculos = veiculos_info['quantidade']
    
#     # CRIA LISTAS PARA OS PONTOS DE INÍCIO E FIM
#     inicios = [veiculos_info['origem']] * num_veiculos
#     fins = [veiculos_info['destino']] * num_veiculos
    
#     print("Pontos de Início:", inicios)
#     print("Pontos de Fim:", fins)
    
#     manager = pywrapcp.RoutingIndexManager(num_locais, num_veiculos, inicios, fins)
#     routing = pywrapcp.RoutingModel(manager)

#     # 2. Criar o "callback" de custo (a ponte entre a matriz e o OR-Tools)
#     def transit_callback(from_index, to_index):
#         """Retorna o tempo de viagem entre dois pontos."""
#         from_node = manager.IndexToNode(from_index)
#         to_node = manager.IndexToNode(to_index)
#         return matriz_custo[from_node][to_node]

#     transit_callback_index = routing.RegisterTransitCallback(transit_callback)
#     routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

#     # # 3. Adicionar a restrição de capacidade dos veículos
#     # def demand_callback(from_index):
#     #     """Retorna a demanda de cada local (1 pessoa por parada de recolha)."""
#     #     from_node = manager.IndexToNode(from_index)
#     #     if from_node == veiculos_info['origem'] or from_node == veiculos_info['destino']:
#     #         return 0 # Depósito e destino não têm demanda
#     #     return 1 # Cada parada de recolha tem uma demanda de 1

#     # demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
#     # routing.AddDimensionWithVehicleCapacity(
#     #     demand_callback_index,
#     #     0,  # Slack (folga) nulo
#     #     veiculos_info['capacidade'],  # Lista com a capacidade de cada veículo
#     #     True,  # Começar a contagem de carga do zero
#     #     'Capacity')

#     # 4. Definir parâmetros de busca e resolver
#     search_parameters = pywrapcp.DefaultRoutingSearchParameters()
#     search_parameters.first_solution_strategy = (
#         routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

#     solution = routing.SolveWithParameters(search_parameters)

#     # 5. Extrair e retornar a solução
#     if solution:
#         print("--- Otimização Concluída com Sucesso! ---")
#         rotas = []
#         for vehicle_id in range(veiculos_info['quantidade']):
#             index = routing.Start(vehicle_id)
#             rota_veiculo = []
#             while not routing.IsEnd(index):
#                 node_index = manager.IndexToNode(index)
#                 rota_veiculo.append(node_index)
#                 index = solution.Value(routing.NextVar(index))
#             # Adiciona o ponto final à rota
#             rota_veiculo.append(manager.IndexToNode(index))
#             rotas.append(rota_veiculo)
#         return rotas
#     else:
#         print("Não foi encontrada uma solução.")
#         return None

# Backup
# def otimizador_de_rota_quadro(matriz_tempos, matriz_distancias):
#     """Resolve o Problema de Roteamento de Veículos (VRP) e retorna o plano."""
#     print("\n--- Iniciando Otimização com Google OR-Tools ---")
#     # 1. Criar o gerenciador e o modelo de roteamento
#     num_locais = len(matriz_tempos)
#     num_veiculos = 1

#     inicios = [0]
#     fins = [num_locais - 1]

#     manager = pywrapcp.RoutingIndexManager(num_locais, num_veiculos, inicios, fins)
#     routing = pywrapcp.RoutingModel(manager)

#     # 2. Criar o "callback" de custo (a ponte entre a matriz e o OR-Tools)
#     def time_callback(from_index, to_index):
#         """Retorna o tempo de viagem entre dois pontos."""
#         from_node = manager.IndexToNode(from_index)
#         to_node = manager.IndexToNode(to_index)
#         return matriz_tempos[from_node][to_node]

#     def distance_callback(from_index, to_index):
#         from_node = manager.IndexToNode(from_index)
#         to_node = manager.IndexToNode(to_index)
#         return matriz_distancias[from_node][to_node]

#     transit_callback_index = routing.RegisterTransitCallback(time_callback)
#     routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

#     distance_callback_index = routing.RegisterTransitCallback(distance_callback)
#     # Adicionamos a dimensão de distância
#     routing.AddDimension(
#         distance_callback_index,
#         0,      # Sem tempo de espera nos nós
#         300000, # Capacidade máxima (ex: 300km em metros), um número grande
#         True,   # Começar cumulativo do zero
#         'Distance'
#     )
#     distance_dimension = routing.GetDimensionOrDie('Distance')


#     # 3. Definir parâmetros de busca e resolver
#     search_parameters = pywrapcp.DefaultRoutingSearchParameters()
#     search_parameters.first_solution_strategy = (
#         routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

#     solution = routing.SolveWithParameters(search_parameters)

#     # 4. Extrair e retornar a solução
#     if solution:
#         print("\n--- Otimização Concluída com Sucesso! ---")
#         # Percorrendo os nós para obter a rota otimizada
#         index = routing.Start(0)
#         rota_veiculo = []
#         while not routing.IsEnd(index):
#             node_index = manager.IndexToNode(index)
#             rota_veiculo.append(node_index)
#             index = solution.Value(routing.NextVar(index))
#         rota_veiculo.append(manager.IndexToNode(index))

#         # Acessando o último nó para obter a distância acumulada
#         distance_dimension = routing.GetDimensionOrDie('Distance')
#         end_index = routing.End(0)
#         variavel_distancia_final = distance_dimension.CumulVar(end_index)
#         distancia_total_valor = solution.Value(variavel_distancia_final)
#         return rota_veiculo, distancia_total_valor
#     else:
#         print("Não foi encontrada uma solução.")
#         return None, None

def otimizador_de_rota_quadro(matriz_tempo, matriz_distancia):
    """
    Resolve o TSP e retorna a rota, os totais e os detalhes de cada parada.
    """
    num_locais = len(matriz_tempo)
    num_veiculos = 1
    inicios, fins = [0], [num_locais - 1]

    manager = pywrapcp.RoutingIndexManager(num_locais, num_veiculos, inicios, fins)
    routing = pywrapcp.RoutingModel(manager)

    # --- Dimensão de Tempo (Principal) ---
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return matriz_tempo[from_node][to_node]

    time_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(time_callback_index)
    routing.AddDimension(time_callback_index, 0, 86400, True, 'Time') # Max 24h em segundos
    time_dimension = routing.GetDimensionOrDie('Time')

    # --- Dimensão de Distância (Secundária) ---
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return matriz_distancia[from_node][to_node]

    distance_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.AddDimension(distance_callback_index, 0, 10000000, True, 'Distance') # Max 10000km em metros
    distance_dimension = routing.GetDimensionOrDie('Distance')

    # --- Resolução ---
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        paradas_detalhadas = []
        
        index = routing.Start(0)
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            # Extrai os dados acumulados para esta parada
            tempo_acumulado = solution.Value(time_dimension.CumulVar(index))
            distancia_acumulada = solution.Value(distance_dimension.CumulVar(index))
            
            paradas_detalhadas.append({
                "indice_parada": node_index,
                "tempo_acumulado_s": tempo_acumulado,
                "distancia_acumulada_m": distancia_acumulada
            })
            
            index = solution.Value(routing.NextVar(index))
        
        # Adiciona o ponto final
        final_node_index = manager.IndexToNode(index)
        
        # Pega os totais (que são os valores acumulados no ponto final)
        tempo_total = solution.Value(time_dimension.CumulVar(index))
        distancia_total = solution.Value(distance_dimension.CumulVar(index))

        paradas_detalhadas.append({
            "indice_parada": final_node_index,
            "tempo_acumulado_s": tempo_total,
            "distancia_acumulada_m": distancia_total
        })

        return {
            "distancia_metros": distancia_total,
            "tempo_segundos": tempo_total,
            "detalhes_paradas": paradas_detalhadas
        }
    else:
        return None