# Guia de Padrões — Projetos da Plataforma

Este documento consolida os padrões de identidade visual, arquitetura, stack tecnológica e convenções de desenvolvimento adotados no projeto CNPJ Multi. Deve ser seguido em todos os novos projetos da plataforma para garantir consistência.

---

## 1. Stack Tecnológica

### Back-end
- **Linguagem:** Java 21
- **Framework:** Spring Boot 3.2.x
- **Build:** Maven
- **Persistência:** Spring Data JPA + Hibernate
- **Banco de dados:** PostgreSQL 16
- **Migrations:** Flyway
- **E-mail:** Spring Mail
- **Agendamento:** Spring Scheduler (`@EnableScheduling`)
- **Validação:** Spring Validation (Bean Validation)
- **Utilitários:** Lombok, OpenCSV
- **Geração de CSV:** OpenCSV 5.9

### Front-end
- **Linguagem:** JavaScript (ES Modules)
- **Framework:** React 18
- **Build:** Vite 5
- **Roteamento:** React Router DOM 6
- **HTTP:** Axios
- **Estilização:** CSS puro com variáveis CSS (sem Tailwind, sem styled-components)

### Infraestrutura
- **Containerização:** Docker + Docker Compose
- **Proxy reverso:** Nginx 1.25
- **SSL:** Let's Encrypt via Certbot
- **Servidor:** Ubuntu 24.04 LTS (VPS Hostinger)
- **Analytics:** Google Analytics 4

---

## 2. Identidade Visual

### Paleta de Cores

| Variável CSS         | Hex           | Uso                                      |
|----------------------|---------------|------------------------------------------|
| `--bg`               | `#030712`     | Fundo geral da aplicação                 |
| `--bg-card`          | `#0d1117`     | Fundo dos cards e inputs                 |
| `--border`           | `#1e2a3a`     | Bordas padrão                            |
| `--primary`          | `#6B09AC`     | Cor de destaque (botões, links, foco)    |
| `--primary-h`        | `#8b1fd4`     | Hover do primário                        |
| `--primary-glow`     | `rgba(107,9,172,0.35)` | Glow/sombra dos elementos primários |
| `--cyan`             | `#06b6d4`     | Cor de contraste em gradientes           |
| `--text`             | `#e2e8f0`     | Texto principal                          |
| `--text-muted`       | `#64748b`     | Texto secundário/labels                  |
| `--text-bright`      | `#ffffff`     | Texto de destaque                        |
| `--success`          | `#10b981`     | Estados positivos                        |
| `--danger`           | `#ef4444`     | Erros e alertas críticos                 |
| `--warning`          | `#f59e0b`     | Avisos                                   |

### Gradientes
- **Botão primário:** `linear-gradient(135deg, #6B09AC, #9333ea)`
- **Textos de destaque (hero):** `linear-gradient(90deg, #6B09AC, #06b6d4)`
- **Barra de progresso:** `linear-gradient(90deg, #6B09AC, #06b6d4)`

### Tipografia
- **Família:** `'Segoe UI', system-ui, -apple-system, sans-serif`
- **Tamanho base:** `16px`
- **Títulos hero:** `2.5rem / font-weight: 800`
- **Títulos de página:** `1.875rem / font-weight: 800`
- **Título razão social resultado:** `1.4rem / font-weight: 700`
- **Texto padrão:** `1rem`
- **Texto auxiliar:** `0.875rem – 0.9rem`
- **Labels de campos:** `0.78rem / uppercase / letter-spacing: 0.08em`
- **CNPJs e códigos:** `font-family: 'Courier New', monospace`

### Bordas e Sombras
- **Border-radius padrão:** `12px` (`--radius`)
- **Border-radius largo (cards):** `18px` (`--radius-lg`)
- **Sombra padrão:** `0 4px 32px rgba(0,0,0,0.5)`
- **Foco em inputs:** `border-color: #6B09AC` + `box-shadow: 0 0 0 3px rgba(107,9,172,0.35)`

### Efeito de Fundo
Grade sutil com linhas roxas translúcidas aplicada via `body::before`:
```css
background-image:
  linear-gradient(rgba(107,9,172,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(107,9,172,0.04) 1px, transparent 1px);
background-size: 48px 48px;
```

### Navbar (Topo — somente em mobile/tablet)
- Exibida apenas em telas com largura **menor que 1024px** (breakpoint `lg`)
- Altura: `64px`
- Fundo: `rgba(3,7,18,0.9)` com `backdrop-filter: blur(16px)`
- Contém: logo à esquerda + botão hambúrguer (☰) à direita para abrir/fechar a sidebar
- Logo: altura `40px`, max-width `160px`

### Sidebar (Menu Lateral)
- **Posição:** fixa à esquerda (`position: fixed; left: 0; top: 0`)
- **Largura:** `260px` (expandida) / colapsável para `72px` (ícones apenas) em desktop
- **Altura:** `100vh`
- **Fundo:** `var(--bg-card)` com borda direita `1px solid var(--border)`
- **Logo:** exibida no topo da sidebar, altura `48px`, max-width `180px`; ocultar texto ao colapsar
- **Links de navegação:**
  - `font-size: 0.95rem`, ícone + rótulo
  - Cor muted por padrão; fundo primário translúcido + texto branco quando ativo
  - Padding: `12px 20px`; border-radius: `8px` internamente
- **Comportamento responsivo:**
  - **Desktop (≥ 1024px):** sidebar sempre visível, podendo ser colapsada para `72px`
  - **Mobile/Tablet (< 1024px):** sidebar oculta por padrão; abre como **drawer** deslizante sobre o conteúdo ao clicar no hambúrguer; overlay escuro atrás
- **Overlay mobile:** `background: rgba(0,0,0,0.6)`, fecha a sidebar ao clicar
- **Transição:** `transform 0.3s ease` para abrir/fechar o drawer
- O conteúdo principal deve ter `margin-left: 260px` no desktop (ou `72px` quando colapsada)

### Logo
- Formato: PNG com fundo transparente
- Dimensões do arquivo: `600 x 180px` (técnica @2x para telas Retina)
- Na sidebar desktop: exibida com `height: 48px`
- Na navbar mobile: exibida com `height: 40px`

### Responsividade (Mobile-First)
Todos os layouts devem ser compatíveis com smartphones e tablets. Breakpoints padrão:

| Breakpoint | Largura mínima | Uso |
|---|---|---|
| `sm` | `480px` | Smartphones maiores |
| `md` | `768px` | Tablets portrait |
| `lg` | `1024px` | Tablets landscape / desktop inicial |
| `xl` | `1280px` | Desktop padrão |

**Regras gerais:**
- Layout em coluna única em mobile, grid em telas maiores
- Fonte base mantida em `16px`; nunca reduzir abaixo de `14px` em mobile
- Inputs, botões e áreas de toque com altura mínima de `44px`
- Cards e containers com padding reduzido em mobile (`16px` em vez de `24px+`)
- Tabelas com scroll horizontal (`overflow-x: auto`) em telas pequenas
- Imagens sempre com `max-width: 100%`
- Testar sempre nos breakpoints: 375px (iPhone SE), 768px (iPad), 1024px (iPad landscape)

---

## 3. Arquitetura do Back-end

### Estrutura de Pacotes
```
br.com.[projeto]/
├── api/
│   ├── [Recurso]Controller.java     — endpoints REST
│   ├── GlobalExceptionHandler.java  — tratamento centralizado de erros
│   └── dto/                         — DTOs de request e response
├── domain/                          — entidades JPA
├── repository/                      — interfaces Spring Data JPA
├── service/                         — lógica de negócio
├── scheduler/                       — jobs agendados
├── exception/                       — exceções customizadas
└── [Projeto]Application.java        — classe principal
```

### Convenções de API REST
- Base path: `/api/`
- Verbos: `GET` para consultas, `POST` para criação/ações, sem `PUT/DELETE` em APIs públicas
- Respostas de erro padronizadas via `GlobalExceptionHandler`:
```json
{
  "timestamp": "2026-05-01T10:00:00",
  "status": 404,
  "erro": "Mensagem descritiva"
}
```
- CNPJs na URL: sempre enviar apenas os 14 dígitos numéricos, sem máscara, para evitar conflito com a barra `/`

### Migrations
- Gerenciadas pelo Flyway
- Nomenclatura: `V{número}__{descricao_com_underscores}.sql`
- Nunca alterar uma migration já aplicada — criar uma nova versão `V{n+1}`
- Localização: `src/main/resources/db/migration/`

### Configuração (`application.yml`)
- `spring.jpa.hibernate.ddl-auto: none` — Flyway gerencia o schema
- Variáveis de ambiente para todos os valores sensíveis (senhas, chaves, hosts)
- Configurações específicas da aplicação sob o prefixo `app:`

### DTOs
- Usar `@Builder` + `@Getter` + `@JsonInclude(NON_NULL)` nos DTOs de response
- Nunca expor entidades JPA diretamente nas respostas da API

---

## 4. Arquitetura do Front-end

### Estrutura de Arquivos
```
src/
├── api/          — funções de chamada à API (axios)
├── pages/        — componentes de página
├── utils/        — utilitários (formatadores, validações)
├── App.jsx       — roteamento principal
├── main.jsx      — entry point
└── index.css     — estilos globais com variáveis CSS
```

### Convenções React
- Componentes funcionais com hooks
- Um arquivo por página em `pages/`
- Funções utilitárias reutilizáveis em `utils/formatters.js`
- Chamadas HTTP centralizadas em `api/[recurso]Api.js`
- CNPJs sempre limpos (só dígitos) antes de enviar na URL

### Estilização
- CSS puro com variáveis CSS definidas em `:root`
- Classes utilitárias globais em `index.css` (`.card`, `.btn`, `.badge`, `.alert`, etc.)
- Estilos inline apenas para variações pontuais de um componente
- Sem frameworks CSS externos

### Classes CSS Globais Disponíveis
| Classe | Uso |
|--------|-----|
| `.container` | Wrapper centralizado (max 960px) |
| `.card` | Card com fundo escuro e borda |
| `.card-title` | Título de seção dentro do card |
| `.btn .btn-primary` | Botão principal com gradiente roxo |
| `.btn .btn-outline` | Botão secundário com borda |
| `.btn-full` | Botão com largura 100% |
| `.form-input` | Input/textarea estilizado |
| `.form-label` | Label de campo |
| `.form-error` | Mensagem de erro abaixo do campo |
| `.form-hint` | Dica abaixo do campo |
| `.badge-green/red/yellow/gray/purple` | Badges de status |
| `.alert-error/success/info` | Alertas |
| `.result-grid` | Grid responsivo para campos de resultado |
| `.result-field` | Campo label + valor no resultado |
| `.socio-item` | Card de item em lista (sócios, filiais) |
| `.search-hero` | Seção hero centralizada com busca |
| `.page-header` | Cabeçalho de página interna |
| `.info-box` | Box informativo com fundo roxo translúcido |
| `.progress-bar-wrap / .progress-bar-fill` | Barra de progresso |
| `.divider` | Linha divisória horizontal |
| `.spinner` | Indicador de carregamento animado |
| `.sidebar` | Menu lateral fixo com largura 260px |
| `.sidebar-collapsed` | Sidebar colapsada (72px, somente ícones) |
| `.sidebar-overlay` | Overlay escuro para fechar sidebar em mobile |
| `.main-content` | Área de conteúdo com margin-left para compensar a sidebar |
| `.navbar-mobile` | Barra de topo exibida apenas em mobile/tablet (< 1024px) |

---

## 5. Infraestrutura Docker

### Estrutura do `docker-compose.yml`
Todo projeto deve ter os serviços:
- `postgres` — banco de dados
- `backend` — aplicação Java
- `frontend` — build React servido por Nginx interno
- `nginx` — proxy reverso com SSL

### Limites de Memória (VPS 4GB)
```yaml
postgres:  1536M
backend:   1536M
# nginx e frontend: sem limite explícito (consumo baixo)
```

### Variáveis de Ambiente
Sempre via arquivo `.env` (nunca commitado). Disponibilizar `.env.example` com as chaves necessárias sem valores.

### Volumes
- Dados do banco: volume nomeado `pgdata`
- Certificados SSL: volumes `certbot-certs` e `certbot-www`

### SSL
- Certificado via Let's Encrypt + Certbot
- Renovação automática via cron: `0 3 * * *`
- Nginx configurado para redirecionar HTTP → HTTPS

---

## 6. Banco de Dados

### Convenções
- Nomes de tabelas e colunas: `snake_case`
- Toda tabela deve ter coluna `atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()`
- Chaves primárias UUID para entidades de controle/jobs: `UUID DEFAULT gen_random_uuid()`
- Chaves primárias BIGSERIAL para tabelas com alto volume de inserção

### Índices
Sempre criar índices para:
- Colunas usadas em `WHERE` frequentes
- Colunas de status com queries parciais (ex: `WHERE status IN ('PENDENTE', 'PROCESSANDO')`)
- Foreign keys implícitas (CNPJ básico referenciando outra tabela)

---

## 7. Convenções Gerais

### Git
- Branch principal: `main`
- Deploy via `git pull` no servidor após push
- Commits em português, descritivos, com prefixo: `feat:`, `fix:`, `refactor:`, `docs:`

### Segurança
- Porta do banco (`5432`) exposta somente via firewall da Hostinger (IP específico) ou túnel SSH
- Porta `22` (SSH): sempre aberta
- Portas `80` e `443`: abertas para qualquer origem
- Nenhuma senha ou chave secreta nos arquivos commitados

### Deploy
```bash
# Atualizar o projeto no servidor
ssh root@[IP_DO_SERVIDOR]
cd /opt/[nome-do-projeto]
git pull
docker compose up -d --build [serviço]   # rebuild seletivo
docker compose logs [serviço] -f         # acompanhar logs
```

---

## 8. Checklist para Novo Projeto

- [ ] Criar repositório Git privado
- [ ] Estrutura de pastas: `backend/`, `frontend/`, `nginx/`
- [ ] `docker-compose.yml` seguindo o padrão acima
- [ ] `.env.example` com todas as variáveis necessárias
- [ ] `.gitignore` incluindo `.env`, `target/`, `node_modules/`, `dist/`
- [ ] Copiar `index.css` com todas as variáveis e classes globais (incluindo sidebar e responsividade)
- [ ] Implementar componente `Sidebar` com comportamento de drawer em mobile
- [ ] Implementar componente `NavbarMobile` exibido apenas em telas < 1024px
- [ ] Testar layout nos breakpoints: 375px, 768px, 1024px e 1280px
- [ ] Logo PNG com fundo transparente, 600x180px
- [ ] Configurar Google Analytics GA4
- [ ] Configurar SSL com Let's Encrypt após apontar domínio
- [ ] Configurar cron de renovação do certificado
- [ ] Adicionar firewall no painel da Hostinger (portas 22, 80, 443)
