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
│   └── Users.tsx          # Gerenciamento de clientes
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
- **Cadastro** de novos clientes
- **Edição** de informações
- **Exclusão** com confirmação
- **Interface responsiva** para mobile
- **Sistema de Documentos** com upload, visualização e download

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

- [ ] Página de Empréstimos
- [ ] Página de Parcelas
- [ ] Página de Documentos
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
