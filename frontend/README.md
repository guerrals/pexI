# Frontend - Cadastro de Recursos

Este é o frontend da aplicação de logística de transportes, desenvolvido com React, TypeScript e Material-UI.

## Tecnologias Utilizadas

- **React** com Vite
- **TypeScript**
- **Material-UI (MUI) v5**
- **Axios** para requisições HTTP
- **React Router** para roteamento

## Funcionalidades

A aplicação permite o cadastro e gerenciamento de:

- **Motoristas**: Nome e contato
- **Veículos**: Placa, modelo, cor e motorista responsável
- **Passageiros**: Nome, contato, função e endereço completo

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── MotoristasTab.tsx
│   ├── VeiculosTab.tsx
│   ├── PassageirosTab.tsx
│   └── MotoristaForm.tsx
├── pages/              # Páginas da aplicação
│   └── RecursosPage.tsx
├── services/           # Serviços de API
│   └── api.ts
├── types/              # Definições de tipos TypeScript
│   └── schemas.ts
├── App.tsx             # Componente principal
└── main.tsx            # Ponto de entrada
```

## Como Executar

1. Instalar dependências:
```bash
bun install
```

2. Executar o servidor de desenvolvimento:
```bash
bun dev
```

3. Acessar a aplicação em `http://localhost:5173`

## API Backend

A aplicação se conecta com a API backend em `http://localhost:8000` através dos seguintes endpoints:

- `GET /motoristas/` - Listar motoristas
- `POST /motoristas/` - Criar motorista
- `GET /veiculos/` - Listar veículos
- `POST /veiculos/` - Criar veículo
- `GET /passageiros/` - Listar passageiros
- `POST /passageiros/` - Criar passageiro

## Características da Interface

- **Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Navegação por Abas**: Interface intuitiva com abas para cada tipo de recurso
- **Formulários Modais**: Criação de novos itens através de modais
- **Feedback Visual**: Indicadores de carregamento e mensagens de sucesso/erro
- **Validação**: Validação de formulários com mensagens de erro
