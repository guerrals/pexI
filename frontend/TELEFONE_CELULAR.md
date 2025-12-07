# Validação de Telefone Celular Brasileiro

## Descrição

Implementada validação específica e formatação automática para campos de telefone celular brasileiro em todos os formulários de cadastro de recursos.

## Funcionalidades Implementadas

### 📱 **Validação de Telefone Celular**

#### **Requisitos de Validação**
- **11 dígitos**: Formato padrão brasileiro (DDD + 9 dígitos)
- **Início com 9**: Celular deve começar com 9
- **DDD válido**: Lista completa de DDDs brasileiros válidos
- **Apenas números**: Remove automaticamente caracteres não numéricos

#### **DDDs Válidos Suportados**
- **São Paulo**: 11, 12, 13, 14, 15, 16, 17, 18, 19
- **Rio de Janeiro**: 21, 22, 24
- **Espírito Santo**: 27, 28
- **Minas Gerais**: 31, 32, 33, 34, 35, 37, 38
- **Paraná**: 41, 42, 43, 44, 45, 46
- **Santa Catarina**: 47, 48, 49
- **Rio Grande do Sul**: 51, 53, 54, 55
- **Distrito Federal**: 61
- **Goiás**: 62, 64
- **Tocantins**: 63
- **Mato Grosso**: 65, 66
- **Mato Grosso do Sul**: 67
- **Acre**: 68
- **Rondônia**: 69
- **Bahia**: 71, 73, 74, 75, 77
- **Sergipe**: 79
- **Pernambuco**: 81, 87
- **Alagoas**: 82
- **Paraíba**: 83
- **Rio Grande do Norte**: 84
- **Ceará**: 85, 88
- **Piauí**: 86, 89
- **Pará**: 91, 93, 94
- **Amazonas**: 92, 97
- **Roraima**: 95
- **Amapá**: 96
- **Maranhão**: 98, 99

### 🎨 **Formatação Automática**

#### **Formato de Exibição**
- **Padrão**: `(DDD) 99999-9999`
- **Exemplo**: `(11) 99999-9999`

#### **Formatação Progressiva**
- **1-2 dígitos**: `11`
- **3-7 dígitos**: `(11) 99999`
- **8-11 dígitos**: `(11) 99999-9999`

### ⚡ **Validações em Tempo Real**

#### **Feedback Imediato**
- **Formatação**: Aplicada conforme o usuário digita
- **Validação**: Erros mostrados em tempo real
- **Mensagens específicas**:
  - "Telefone celular é obrigatório"
  - "Telefone celular deve ter 11 dígitos (ex: 11999999999)"
  - "Telefone celular deve começar com 9"
  - "DDD inválido"

### 📝 **Implementação nos Formulários**

#### **Motoristas**
- Campo: "Telefone Celular"
- Placeholder: "(11) 99999-9999"
- Validação: `validateTelefoneCelular()`
- Formatação: `formatarTelefoneCelular()`

#### **Passageiros**
- Campo: "Telefone Celular"
- Placeholder: "(11) 99999-9999"
- Validação: `validateTelefoneCelular()`
- Formatação: `formatarTelefoneCelular()`

#### **Exibição nas Listas**
- Motoristas: "Telefone: (11) 99999-9999"
- Passageiros: "Telefone: (11) 99999-9999"

### 🔧 **Funções de Validação**

#### **validateTelefoneCelular(telefone: string)**
```typescript
// Validações realizadas:
// 1. Campo obrigatório
// 2. Exatamente 11 dígitos
// 3. Deve começar com 9
// 4. DDD deve ser válido
// 5. Apenas números permitidos
```

#### **formatarTelefoneCelular(telefone: string)**
```typescript
// Formatação aplicada:
// 1. Remove caracteres não numéricos
// 2. Aplica máscara (DDD) 99999-9999
// 3. Formatação progressiva conforme digitação
```

### 📱 **Exemplos de Uso**

#### **Entrada do Usuário**
```typescript
// Usuário digita: 11999999999
// Sistema formata para: (11) 99999-9999
// Validação: ✅ Válido
```

#### **Casos de Erro**
```typescript
// ❌ "119999999" - Muito curto
// ❌ "21999999999" - Não começa com 9
// ❌ "00999999999" - DDD inválido
// ❌ "11abc99999" - Contém letras
```

### 🛡️ **Segurança e Integridade**

#### **Sanitização**
- Remove automaticamente caracteres não numéricos
- Previne entrada de dados maliciosos
- Garante formato consistente

#### **Validação Robusta**
- Verifica estrutura completa do número
- Valida DDD contra lista oficial
- Garante que é celular (início com 9)

### 🚀 **Benefícios**

- **Consistência**: Formato padronizado em toda aplicação
- **Usabilidade**: Formatação automática melhora UX
- **Validação**: Previne números inválidos
- **Integridade**: Garante dados corretos no banco
- **Padrão Brasileiro**: Segue convenções nacionais

### 📋 **Arquivos Modificados**

- `src/utils/validations.ts` - Novas funções de validação
- `src/components/MotoristaForm.tsx` - Validação para motoristas
- `src/components/PassageirosTab.tsx` - Validação para passageiros
- `src/components/MotoristasTab.tsx` - Exibição atualizada

Esta implementação garante que todos os telefones cadastrados sejam válidos e estejam no formato padrão brasileiro para celulares.
