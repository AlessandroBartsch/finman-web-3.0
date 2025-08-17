# FinMan 3.0 - Frontend

Sistema de Gerenciamento Financeiro - Interface Web

## 🚀 Tecnologias Utilizadas

- **React 19.1.1** - Biblioteca JavaScript para interfaces
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 7.1.2** - Build tool e servidor de desenvolvimento
- **Bootstrap 5.3.7** - Framework CSS para design responsivo
- **React Bootstrap Icons 1.11.6** - Ícones
- **React Router DOM 7.8.0** - Roteamento
- **Axios 1.11.0** - Cliente HTTP para APIs

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 Acesso

- **Desenvolvimento:** http://localhost:5173
- **Backend API:** http://localhost:8080

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   └── Layout.tsx          # Layout principal com sidebar
├── pages/
│   ├── Dashboard.tsx       # Página inicial com estatísticas
│   ├── Users.tsx          # Gerenciamento de clientes
│   └── Loans.tsx          # Gerenciamento de empréstimos
├── services/
│   └── api.ts             # Configuração Axios e serviços
├── types/
│   └── index.ts           # Definições TypeScript
├── App.tsx                # Componente principal
├── main.tsx              # Ponto de entrada
└── index.css             # Estilos globais
```

## ✨ Funcionalidades Implementadas

### 🎯 Dashboard
- **Cards de Estatísticas** com cores temáticas
- **Atividades Recentes** com ícones de status
- **Ações Rápidas** para navegação
- **Resumo Mensal** com métricas

### 👥 Gerenciamento de Clientes
- **Listagem** com busca e filtros
- **Cadastro** de novos clientes com informações de indicação
- **Edição** de informações incluindo situação (ativo/desativado)
- **Exclusão** com confirmação
- **Interface responsiva** para mobile
- **Sistema de Documentos** integrado com upload, visualização e download
- **Controle de situação** com campos condicionais para clientes desativados

### 💰 Gerenciamento de Empréstimos
- **Listagem** com filtros por status e busca por cliente
- **Visualização** de parcelas integrada
- **Simulação** de empréstimos
- **Controle de status** dos empréstimos
- **Pagamento de parcelas** (completo ou parcial)
- **Negociação de atrasos** com comentários
- **Cálculo automático** de juros de atraso
- **Informações detalhadas** de parcelas pagas
- **Rastreamento de excedente** de juros de atraso
- **Comentários de negociação** para parcelas pagas

### 🎨 Design System
- **Bootstrap 5** para componentes
- **Cores temáticas** (primary, success, info, warning)
- **Layout responsivo** com sidebar colapsável
- **Ícones consistentes** do React Bootstrap Icons

## 🔧 Configuração da API

O frontend está configurado para se conectar com o backend Spring Boot na porta 8080. As configurações estão em `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📱 Responsividade

- **Desktop:** Sidebar fixa, layout completo
- **Tablet:** Cards em grid 2x2
- **Mobile:** Sidebar colapsável, cards empilhados

## 🎯 Próximas Funcionalidades

- [x] Página de Empréstimos
- [x] Visualização de Parcelas (integrada aos empréstimos)
- [x] Sistema de Documentos (integrado aos clientes)
- [x] Pagamento de Parcelas
- [x] Negociação de Atrasos
- [x] Informações Detalhadas de Parcelas
- [ ] Autenticação e autorização
- [ ] Relatórios e gráficos
- [ ] Notificações em tempo real

## 🚀 Deploy

```bash
# Build para produção
npm run build

# Os arquivos estarão em dist/
# Servir com qualquer servidor estático
```

## 📄 Licença

Este projeto faz parte do sistema FinMan 3.0 - Sistema de Gerenciamento Financeiro.

---

**Desenvolvido com ❤️ usando React + Bootstrap**
