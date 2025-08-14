# 🚀 TalentMatch Landing Page

> Landing page moderna para plataforma de recrutamento inteligente construída com Next.js 14, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

- ✅ **Design responsivo** - Funciona perfeitamente em desktop e mobile
- ✅ **Formulário de cadastro** - Captura completa de dados dos candidatos  
- ✅ **Animações suaves** - Experiência visual moderna e fluida
- ✅ **SEO otimizado** - Metadata e estrutura otimizada para buscadores
- ✅ **TypeScript** - Tipagem completa para maior segurança
- ✅ **Componentes modulares** - Arquitetura escalável e reutilizável

## 🛠️ Stack Tecnológico

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (porta 3002)
npm run dev

# Build para produção
npm run build
npm start
```

**Acesse:** http://localhost:3002

## 📁 Estrutura do Projeto

```
talent-matching-landing-page/
├── src/
│   ├── app/                 # App Router do Next.js
│   │   ├── layout.tsx       # Layout raiz com SEO
│   │   ├── page.tsx         # Página principal
│   │   └── globals.css      # Estilos globais
│   ├── components/ui/       # Componentes reutilizáveis
│   │   ├── button.tsx       # Componente Button
│   │   └── input.tsx        # Componente Input
│   └── lib/
│       └── utils.ts         # Utilitários (cn function)
├── docs/
│   └── landingpage-original.js  # Componente React original
├── package.json             # Dependências e scripts
├── tailwind.config.ts       # Configuração Tailwind
├── tsconfig.json           # Configuração TypeScript
└── next.config.js          # Configuração Next.js
```

## 🎯 Funcionalidades da Landing Page

### 📋 Formulário de Cadastro
- Nome completo
- Email e telefone  
- Cargo atual
- Nível de experiência (Júnior/Pleno/Sênior)
- Localização
- Áreas de interesse

### 📊 Seções Principais
- **Hero Section** - Proposta de valor principal
- **Estatísticas** - Números da plataforma
- **Como Funciona** - Processo em 3 etapas
- **Footer** - Links e informações

### 🎨 Design System
- Paleta de cores azul profissional
- Tipografia Inter (Google Fonts)
- Componentes com estados hover/focus
- Animações CSS personalizadas

## 🔄 Roadmap

- [ ] Integração com API backend
- [x] Validação de formulário com Zod
- [ ] Sistema de notificações
- [x] Analytics e tracking
  - [x] Vercel Analytics
  - [x] Google Analytics 4
- [ ] Testes automatizados
- [ ] Deploy na Vercel

## 🚀 Deploy

O projeto está configurado para deploy fácil na Vercel:

```bash
npm run build
```

## 📝 Notas Técnicas

- Projeto roda na porta **3002** para evitar conflitos
- Usa **App Router** do Next.js 14 (não Pages Router)
- Componentes UI seguem padrão **shadcn/ui**
- CSS Variables para temas customizáveis
- TypeScript strict mode habilitado

## 📚 Histórico

O componente React original está preservado em `docs/landingpage-original.js` para referência histórica.
