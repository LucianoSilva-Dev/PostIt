# Diretrizes Técnicas

Este documento descreve as tecnologias escolhidas e os padrões de escrita de código e arquitetura a serem seguidos durante a construção do projeto.

## 1. Stack Tecnológico

### Frontend
- **HTML5:** Marcação semântica para criar as duas telas da aplicação.
- **CSS3 (Vanilla):** Estilização visual (sem uso de frameworks utilitários como TailwindCSS). As animações de flutuação, efeitos de zoom in/out e rotação aleatória dos post-its serão construídas com propriedades nativas (keyframes, transform, transitions) para o máximo de performance. O background da tela de exibição será tratado visualmente para se assemelhar a um quadro negro de sala de aula.
- **JavaScript (Vanilla):** Manipulação da DOM. O JS será responsável por:
  - Consumir a API via `fetch` para enviar/receber novos post-its.
  - Implementar um algoritmo de posicionamento (bounding box ou empacotamento) que permita aos post-its ficarem sobrepostos pelo papel, **mas garantindo que o texto nunca sobreponha o outro texto**.

### Backend
- **Node.js + Express:** API simples e rápida para expor endpoints de criação (POST) e listagem (GET) dos post-its. 
- **Prisma (ORM) + PostgreSQL:** Banco de dados relacional e mapeamento objeto-relacional (ORM) fortemente tipado para armazenar o conteúdo dos post-its, a cor do texto escolhida e seus identificadores.

## 2. Padrões Livres de Desenvolvimento

Para garantir a manutenção e expansão do projeto, devem ser seguidos os seguintes princípios fundamentais de engenharia de software:

### KISS (Keep It Simple, Stupid)
- A solução para qualquer problema do projeto deve ser a mais simples possível.
- Já que o projeto possui apenas duas telas, não construiremos arquiteturas hiper-complexas como SPAs com frameworks complexos de renderização (React, Next) no frontend, usando a simplicidade do Vanilla JS para resolver o problema de forma enxuta.
- Rotas e lógicas do backend também devem ser diretas e com poucas camadas de abstração desnecessárias.

### DRY (Don't Repeat Yourself)
- Reduziremos ativamente a duplicação de códigos, funções e definições CSS.
- Componentes visuais repetidos e funções utilitárias (ex: verificar colisões, animar caixas, validação de inputs) devem ser centralizados em arquivos `.js` e `.css` unificados que alimentem as telas. 

### YAGNI (You Aren't Gonna Need It)
- O desenvolvimento será focado explicitamente no escopo da funcionalidade definida (adicionar texto + cor da fonte, exibir no quadro negro com sobreposição controlada).
- Não adicionaremos suporte a funcionalidades extras como "editar post-its", "autenticação de usuário" ou "gestão de níveis de acesso" até que elas sejam explicitamente requisitadas. Isso evita a perda de tempo mantendo código inútil.

## 3. Estrutura de Pastas

Para manter uma escalabilidade saudável e uma separação estrita de responsabilidades, os códigos do projeto deverão ser estruturados em diretórios completamente isolados para Frontend e Backend:

```text
PostIt/
├── frontend/             # Diretório Raiz do Cliente UI
│   ├── index.html        # Página de Submissão do post-it (Formulário)
│   ├── board.html        # Página de Exibição em tela cheia (Quadro Negro)
│   ├── css/
│   │   ├── style.css     # Estilos globais e reset de CSS
│   │   ├── form.css      # Estilos visuais do formulário de submissão
│   │   └── board.css     # Estilos do UI quadro negro e animações dos post-its
│   └── js/
│       ├── api.js        # Utilitário para realizar requisições (fetch) ao backend
│       ├── submit.js     # Lógica da primeira tela de enviar textos e cores
│       └── board.js      # Lógicas de polling/SSE, renderização na tela e algoritmo de não-colisão de caixas de texto
│
└── backend/              # Diretório Raiz do Servidor Node.js
    ├── server.js         # Ponto de entrada e configuração do Express
    ├── package.json      # Gerenciamento de dependências e scripts do backend
    ├── routes/           # Controladores das rotas de API (ex: `POST /api/postit`)
    └── prisma/
        └── schema.prisma # Definição da tipagem do DB relacional em Postgres
```

## 4. Instruções para Agentes de IA

Este projeto conta com instruções especializadas (**Skills**) que foram instaladas localmente pelo desenvolvedor. Estas skills estão armazenadas fisicamente na pasta `.agents/skills/`.

**Diretriz Obrigatória de Desenvolvimento:** Durante todo e qualquer momento de atuação em tarefas de código neste repositório, o agente de Inteligência Artificial **deve** usar nativamente o seu contexto para:
1. Buscar, ler e aplicar as regras descritas nos módulos de skills (ex: `frontend-design` em `.agents/skills/frontend-design/SKILL.md`).
2. Jamais inferir um estilo genérico e cru de design, estética e tipografia sem antes absorver todas as restrições criativas explicitadas no arquivo da referida skill.
3. Assegurar que as diretrizes dinâmicas indicadas pelas skills reflitam em todo refatoramento, criação ou validação de componente UI.
