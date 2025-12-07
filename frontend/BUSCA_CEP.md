# Funcionalidade de Busca Automática de CEP

## Descrição

Implementada a funcionalidade de busca automática de endereço através do CEP no formulário de cadastro de passageiros, utilizando a API ViaCEP (BrasilCEP).

## Funcionalidades Implementadas

### 🔍 **Busca Automática**
- **API Utilizada**: ViaCEP (https://viacep.com.br/)
- **Trigger**: Digitação de CEP válido (8 dígitos)
- **Debounce**: Aguarda 1 segundo após parar de digitar para fazer a requisição
- **Preenchimento**: Preenche automaticamente rua, bairro, cidade e estado

### 📝 **Formatação Automática**
- **Máscara**: CEP formatado automaticamente como `00000-000`
- **Validação**: Aceita apenas números e formata automaticamente
- **Limpeza**: Remove caracteres não numéricos automaticamente

### 🎨 **Interface Visual**
- **Ícone de Busca**: Ícone de lupa no campo CEP
- **Indicador de Carregamento**: Spinner durante a busca
- **Mensagens de Feedback**: 
  - Sucesso: "Endereço preenchido automaticamente!"
  - Erro: "CEP não encontrado ou inválido"
- **Helper Text**: Instruções dinâmicas no campo

### ⚡ **Otimizações**
- **Debounce**: Evita requisições desnecessárias
- **Validação**: Só faz requisição para CEPs válidos
- **Tratamento de Erro**: Feedback claro para o usuário
- **Performance**: Requisições otimizadas

## Como Funciona

1. **Usuário digita CEP**: Campo aceita apenas números
2. **Formatação automática**: CEP é formatado como `00000-000`
3. **Validação**: Sistema verifica se CEP tem 8 dígitos
4. **Debounce**: Aguarda 1 segundo após parar de digitar
5. **Requisição**: Busca dados na API ViaCEP
6. **Preenchimento**: Preenche automaticamente os campos de endereço
7. **Feedback**: Mostra mensagem de sucesso ou erro

## Campos Preenchidos Automaticamente

- **Rua**: `logradouro` da API
- **Bairro**: `bairro` da API  
- **Cidade**: `localidade` da API
- **Estado**: `uf` da API
- **CEP**: Formatado como `00000-000`

## Tratamento de Erros

- **CEP Inválido**: Mensagem de erro específica
- **CEP Não Encontrado**: Feedback claro para o usuário
- **Erro de Rede**: Tratamento de falhas de conexão
- **API Indisponível**: Fallback gracioso

## Arquivos Modificados

- `src/services/cepService.ts` - Novo serviço para integração com ViaCEP
- `src/components/PassageirosTab.tsx` - Implementação da funcionalidade no formulário

## Exemplo de Uso

```typescript
// O usuário digita: 01310100
// Sistema formata para: 01310-100
// Sistema busca na API ViaCEP
// Sistema preenche automaticamente:
// - Rua: Avenida Paulista
// - Bairro: Bela Vista  
// - Cidade: São Paulo
// - Estado: SP
```

Esta funcionalidade melhora significativamente a experiência do usuário, reduzindo erros de digitação e acelerando o processo de cadastro.
