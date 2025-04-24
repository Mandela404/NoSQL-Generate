# NoSQL Generator

## 📋 Visão Geral

O **NoSQL Generator** é uma aplicação web completa para formatação de JSON, geração de documentos NoSQL, exportação para PDF e ferramentas de segurança. Desenvolvido com HTML, CSS e JavaScript puro, este projeto oferece uma interface moderna e responsiva para manipulação eficiente de dados JSON e NoSQL.

## ✨ Funcionalidades

### Formatação JSON
- **Formatação Automática**: Detecta e corrige erros em estruturas JSON
- **Validação em Tempo Real**: Identifica problemas de sintaxe e estrutura
- **Opções de Formatação**: Personalização de indentação e estilo

### Geração NoSQL
- **Múltiplos Bancos de Dados**: 
  - MongoDB
  - Firebase
  - DynamoDB
  - CouchDB
- **Estruturas Flexíveis**:
  - Documentos aninhados
  - Estrutura plana
  - Documentos com referências
  - Baseado em arrays
- **Opções Avançadas**:
  - Geração automática de IDs
  - Adição de timestamps
  - Sugestão de índices

### Exportação PDF
- **Tabelas Formatadas**: Apresentação clara e organizada dos dados
- **Personalização**:
  - Título e autor personalizáveis
  - Orientação da página (retrato/paisagem)
  - Marca d'água com referência ao [Mandela404](https://github.com/Mandela404)
  - Cabeçalho e rodapé com data e hora
- **Visualização Prévia**: Pré-visualização antes do download

### Ferramentas de Segurança
- **Geração de Hash**:
  - MD5
  - SHA-1
  - SHA-256
  - SHA-512
- **Criptografia**:
  - AES
  - DES
  - Triple DES
- **Operações**:
  - Criptografar
  - Descriptografar
  - Copiar resultados

### Interface de Usuário
- **Design Responsivo**: Adaptação para todos os tamanhos de tela
- **Tema Claro/Escuro**: Alternância entre modos de visualização
- **Notificações Interativas**: Feedback visual com animações
- **Painel de Log**: Registro de operações realizadas

## 🛠️ Arquitetura

O projeto foi desenvolvido com uma arquitetura modular, separando claramente as responsabilidades:

### Estrutura de Arquivos
```
NoSQL-Generator/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos da aplicação
├── js/
│   ├── app.js              # Ponto de entrada da aplicação
│   ├── jsonFormatter.js    # Formatação de JSON
│   ├── nosqlGenerator.js   # Geração de NoSQL
│   ├── pdfGenerator.js     # Exportação para PDF
│   ├── security.js         # Ferramentas de segurança
│   ├── uiComponents.js     # Componentes de interface
│   ├── logger.js           # Sistema de log
│   ├── notifications.js    # Sistema de notificações
│   ├── modal.js            # Sistema de modais
│   ├── settings.js         # Gerenciamento de configurações
│   ├── utils.js            # Funções utilitárias
│   └── nosql/              # Geradores específicos por banco
│       ├── mongodbGenerator.js
│       ├── firebaseGenerator.js
│       ├── dynamodbGenerator.js
│       └── couchdbGenerator.js
```

### Padrões de Design
- **Modularidade**: Cada funcionalidade em seu próprio módulo
- **Eventos Personalizados**: Comunicação entre módulos via eventos
- **Estado Persistente**: Salvamento de configurações no localStorage
- **Tratamento de Erros**: Sistema robusto de captura e exibição de erros

## 🚀 Como Usar

1. **Formatação JSON**:
   - Cole seu JSON no painel de entrada
   - Clique em "Formatar" para processar
   - Visualize o resultado formatado
   - Copie ou baixe o JSON formatado

2. **Geração NoSQL**:
   - Formate seu JSON primeiro
   - Selecione o tipo de banco de dados
   - Escolha a estrutura de documento
   - Configure opções adicionais
   - Clique em "Gerar" para criar documentos NoSQL
   - Copie ou baixe o código gerado

3. **Exportação PDF**:
   - Gere documentos NoSQL primeiro
   - Configure as opções do PDF
   - Clique em "Visualizar" para pré-visualizar
   - Clique em "Gerar PDF" para baixar

4. **Ferramentas de Segurança**:
   - Digite o texto a ser processado
   - Selecione o algoritmo
   - Forneça uma chave (para criptografia)
   - Clique em "Gerar Hash" ou "Criptografar"
   - Visualize e copie o resultado

## ⚙️ Requisitos Técnicos

- Navegador moderno com suporte a ES6+
- Conexão com a internet para carregar CDNs:
  - Font Awesome (ícones)
  - CryptoJS (criptografia)
  - jsPDF (geração de PDF)

## 📝 Notas de Implementação

- **Desempenho**: Otimizado para lidar com grandes volumes de dados JSON
- **Segurança**: Processamento local sem envio de dados para servidores externos
- **Acessibilidade**: Interface projetada seguindo práticas de acessibilidade
- **Compatibilidade**: Testado nos principais navegadores (Chrome, Firefox, Safari, Edge)

## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido com foco em:

- **Código Limpo**: Estrutura organizada e bem documentada
- **Modularidade**: Componentes independentes e reutilizáveis
- **Extensibilidade**: Fácil adição de novos recursos e bancos de dados
- **UX/UI**: Interface intuitiva e agradável

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.

## 🔗 Links

- [GitHub](https://github.com/Mandela404)

---

Desenvolvido por [Mandela404](https://github.com/Mandela404) - 2025
