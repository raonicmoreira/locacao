# Plano de Implementação — Administração de Locações de Espaço (Sprint 1)

## Visão Geral

Implementação incremental da aplicação web multiempresa de administração de locações de espaço. O back-end é Java 21 + Spring Boot 3.2.x com PostgreSQL 16 e Flyway; o front-end é React 18 + Vite 5 com CSS puro. A autenticação delega ao microserviço `ms-controle-acesso`.

A ordem das tarefas garante que nenhum código fique "órfão": infraestrutura e modelos de dados vêm primeiro, depois cada módulo funcional é implementado de ponta a ponta (back → front), e a tarefa final conecta tudo.

---

## Tarefas

- [x] 1. Estrutura base do projeto e configuração de infraestrutura
  - Criar a estrutura de diretórios `backend/` e `frontend/` conforme o GUIA_DE_PADROES.md
  - Gerar o projeto Spring Boot 3.2.x com Maven (pacote `br.com.locacaoespacos`), adicionando as dependências: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-webflux` (para WebClient), `postgresql`, `flyway-core`, `lombok`
  - Configurar `application.yml` com datasource PostgreSQL, `ddl-auto: none`, Flyway habilitado, e variáveis de ambiente para host/usuário/senha do banco e URL base do `ms-controle-acesso`
  - Criar `docker-compose.yml` com serviços `postgres`, `backend`, `frontend` e `nginx`, respeitando os limites de memória do GUIA_DE_PADROES.md
  - Criar `.env.example` com todas as variáveis necessárias (sem valores reais)
  - Inicializar projeto Vite 5 + React 18 em `frontend/` e instalar dependências: `react-router-dom`, `axios`
  - Copiar `index.css` com todas as variáveis CSS e classes globais do GUIA_DE_PADROES.md
  - _Requisitos: 9.1, 9.2, 9.3_

- [ ] 2. Migrations Flyway e entidades de domínio
  - [x] 2.1 Criar as migrations Flyway na ordem definida no design
    - `V1__create_sistema.sql` — tabela `sistema` com colunas `id UUID PK`, `codigo INTEGER UNIQUE`, `descricao VARCHAR`, `atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()`
    - `V2__create_empresa.sql` — tabela `empresa` com colunas `id UUID PK`, `descricao VARCHAR`, `atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()`
    - `V3__create_empresa_sistema.sql` — tabela `empresa_sistema` com colunas `id UUID PK`, `id_sistema UUID FK`, `id_empresa UUID FK`, `atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()`, UNIQUE constraint em `(id_sistema, id_empresa)`
    - `V4__create_grupo.sql` — tabela `grupo` com colunas `id UUID PK`, `id_empresa_sistema UUID FK`, `descricao VARCHAR NOT NULL`, `status INTEGER NOT NULL`, `atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()`, índice em `id_empresa_sistema`
    - `V5__create_espaco_tipo_locacao.sql` — tabela `espaco_tipo_locacao` com todas as colunas do design, índice em `id_empresa_sistema`
    - `V6__create_espaco.sql` — tabela `espaco` com todas as colunas do design, índices em `id_empresa_sistema` e `id_grupo`
    - `V7__seed_sistema.sql` — inserção do registro de sistema base
    - _Requisitos: 8.3, 8.4, 8.5, 8.6_

  - [x] 2.2 Implementar entidades JPA e enums Java
    - Criar `StatusEnum`, `ModalidadeLocacaoEnum` e `DiaSemanaEnum` com os valores e bits definidos no design
    - Implementar método estático `fromValor(int)` em cada enum
    - Criar entidades JPA `Sistema`, `Empresa`, `EmpresaSistema`, `Grupo`, `EspacoTipoLocacao`, `Espaco` com anotações Lombok (`@Builder`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`) e mapeamentos JPA corretos
    - Criar utilitário `BitmaskUtils` com métodos estáticos `toMask(Set<DiaSemanaEnum>)` e `fromMask(Integer)`
    - _Requisitos: 5.4, 5.5, 8.3_

  - [ ]* 2.3 Escrever testes de propriedade para `BitmaskUtils` (Propriedade 3)
    - Adicionar dependência `jqwik` no `pom.xml`
    - **Propriedade 3: Round trip bitmask dias da semana**
    - **Valida: Requisito 5.5**
    - Implementar `@Property(tries = 200)` que gera `Set<DiaSemanaEnum>` arbitrário, converte para bitmask e de volta, e afirma igualdade com o conjunto original
    - Implementar `@Property(tries = 200)` inverso: bitmask inteiro (0–127) → `Set<DiaSemanaEnum>` → bitmask, afirmando igualdade
    - Anotar cada teste com `// Feature: locacao-espacos, Propriedade 3: round-trip bitmask dias da semana`

  - [x] 2.4 Criar interfaces `Repository` Spring Data JPA
    - `SistemaRepository`, `EmpresaRepository`, `EmpresaSistemaRepository`, `GrupoRepository`, `EspacoTipoLocacaoRepository`, `EspacoRepository`
    - Em `GrupoRepository`: adicionar método `findByIdEmpresaSistema(UUID)`, `findByIdEmpresaSistemaAndStatus(UUID, Integer)`, `countByIdAndIdEmpresaSistema(UUID, UUID)`
    - Em `EspacoTipoLocacaoRepository`: métodos equivalentes de listagem completa, filtragem por status e verificação de existência
    - Em `EspacoRepository`: `findByIdEmpresaSistema(UUID)`, `countByIdGrupo(UUID)`, `countByIdEspacoTipoLocacao(UUID)`
    - _Requisitos: 8.1, 8.2_

- [x] 3. Infraestrutura de segurança e tratamento de erros do back-end
  - [x] 3.1 Implementar classes de exceção customizadas e `GlobalExceptionHandler`
    - Criar `NegocioException` (422), `RecursoNaoEncontradoException` (404), `ConflitoDependenciaException` (409) e `AcessoNegadoException` (403)
    - Implementar `GlobalExceptionHandler` com `@RestControllerAdvice` mapeando cada exceção para o formato padrão `{ "timestamp", "status", "erro" }`
    - _Requisitos: 9.6, 9.7_

  - [x] 3.2 Implementar `SecurityConfig` e validação de JWT via `ms-controle-acesso`
    - Configurar `SecurityConfig` liberando os endpoints `/api/auth/**` e protegendo todos os demais
    - Implementar filtro JWT que extrai o token do header `Authorization: Bearer` e valida com o `ms-controle-acesso`
    - Armazenar no `SecurityContext` o `id_empresa_sistema` da sessão ativa para uso nos Services
    - _Requisitos: 1.2, 1.4, 2.4_

  - [x] 3.3 Implementar `ControleAcessoClient` (WebClient)
    - Criar `WebClientConfig` com `WebClient.Builder` configurado com a URL base do `ms-controle-acesso`
    - Implementar `ControleAcessoClient` com os seguintes métodos: `login(email, senha)`, `ativarConta(token, senha)`, `buscarPorEmail(email)`, `listarUsuariosPorEmpresa(codigoSistema, codigoEmpresa)`, `criarUsuario(nome, email, urlAtivacao)`, `associarPerfil(idUsuario, codigoSistema, codigoEmpresa, idPerfil)`, `removerAssociacao(idUsuario, codigoSistema, codigoEmpresa)`
    - Tratar erros 401, 404 e falha de conexão retornando exceções tipadas
    - _Requisitos: 1.3, 1.5, 4.3, 4.7_

  - [ ]* 3.4 Escrever testes unitários para `GlobalExceptionHandler`
    - Verificar que `NegocioException` → 422, `RecursoNaoEncontradoException` → 404, `ConflitoDependenciaException` → 409, `AcessoNegadoException` → 403
    - Verificar que o corpo da resposta segue o formato `{ "timestamp", "status", "erro" }`
    - _Requisitos: 9.6, 9.7_

- [x] 4. Checkpoint — Verificar que o projeto compila e as migrations rodam sem erro
  - Garantir que `mvn clean package` conclui sem erros de compilação
  - Verificar que o Flyway aplica todas as migrations V1–V7 ao subir a aplicação
  - Pedir ao usuário confirmação antes de continuar se houver dúvidas.

- [x] 5. Módulo de autenticação (back-end + front-end)
  - [x] 5.1 Implementar `AuthController` e `AuthService`
    - Criar DTOs: `LoginRequest` (email, senha), `LoginResponse` (token, nome, empresas[]), `EmpresaResponse` (id, descricao), `AtivarContaRequest` (token, senha)
    - Implementar `POST /api/auth/login`: delega ao `ControleAcessoClient`, consulta `EmpresaSistema` para montar a lista de empresas, retorna `LoginResponse`
    - Implementar `POST /api/auth/ativar`: delega ao `ControleAcessoClient.ativarConta`, trata erro 400 com `NegocioException`
    - _Requisitos: 1.2, 1.3, 1.5, 4.1.3, 4.1.4, 4.1.5_

  - [ ]* 5.2 Escrever testes unitários para `AuthService`
    - Testar login com sucesso (uma empresa → lista com 1 item, múltiplas empresas → lista completa)
    - Testar login com credenciais inválidas → `NegocioException` com mensagem sem indicar qual campo
    - Testar ativação com token inválido → `NegocioException`
    - Testar indisponibilidade do ms-controle-acesso → exceção mapeada para 503
    - _Requisitos: 1.2, 1.3, 1.5, 4.1.3, 4.1.5_

  - [x] 5.3 Implementar tela de Login no front-end (`Login.jsx`)
    - Criar formulário com campos e-mail e senha, botão "Entrar" com estado de loading
    - Chamar `authApi.login(email, senha)` e armazenar token JWT no `localStorage`
    - Se uma empresa → armazenar na sessão e redirecionar para `/usuarios`
    - Se múltiplas empresas → redirecionar para `/selecionar-empresa`
    - Exibir mensagem de erro nos casos 1.3 e 1.5
    - _Requisitos: 1.1, 1.2, 1.3, 1.5_

  - [x] 5.4 Implementar tela de Seleção de Empresa (`SelecionarEmpresa.jsx`)
    - Exibir lista de empresas retornadas pelo login
    - Ao selecionar, armazenar o identificador de empresa na sessão e redirecionar para `/usuarios`
    - Exibir mensagem se nenhuma empresa estiver associada
    - _Requisitos: 2.1, 2.2, 2.3, 2.5_

  - [x] 5.5 Implementar tela pública de Ativação de Conta (`AtivarConta.jsx`)
    - Criar rota pública `/ativar` acessível sem token JWT
    - Exibir formulário com campos senha e confirmação de senha
    - Validar no front-end: senha ≠ confirmação → erro no campo de confirmação; mínimo 8 caracteres com letras e números → bloqueio de submissão
    - Chamar `authApi.ativar(token, senha)` e redirecionar para `/login` em caso de sucesso
    - Exibir mensagem de token inválido/expirado em caso de erro 400
    - _Requisitos: 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5, 4.1.6, 4.1.7_

  - [ ]* 5.6 Escrever testes de componente para `AtivarConta` (Vitest + Testing Library)
    - Testar exibição do formulário ao acessar `/ativar?token=xxx`
    - Testar exibição de erro quando senha e confirmação divergem
    - Testar exibição de erro quando token é inválido/expirado (mock do `authApi`)
    - _Requisitos: 4.1.5, 4.1.6, 4.1.7_

  - [x] 5.7 Implementar utilitários de sessão e proteção de rotas (`auth.js`, `ProtectedRoute.jsx`)
    - Implementar `auth.js` com helpers: `getToken()`, `setToken(t)`, `clearToken()`, `getEmpresa()`, `setEmpresa(e)`, `clearEmpresa()`, `isTokenValid()`
    - Implementar `ProtectedRoute` que verifica JWT válido + empresa selecionada + perfil permitido; redireciona para `/login` caso alguma verificação falhe
    - _Requisitos: 2.4, 3.7, 4.1, 5.1, 6.1, 7.1_

  - [ ]* 5.8 Escrever testes de componente para `ProtectedRoute` (Vitest + Testing Library)
    - Testar redirecionamento sem JWT
    - Testar redirecionamento sem empresa selecionada
    - Testar redirecionamento com perfil não autorizado
    - _Requisitos: 4.1, 5.1, 6.1, 7.1_

- [x] 6. Layout base: Sidebar e NavbarMobile
  - Implementar `Sidebar.jsx` com largura 260px em desktop, colapsável para 72px, drawer em mobile com overlay escuro, transição `transform 0.3s ease`, itens de navegação filtrados por perfil da sessão
  - Implementar `NavbarMobile.jsx` exibida apenas em telas < 1024px, altura 64px, com botão hambúrguer que abre o drawer da sidebar
  - Configurar `App.jsx` com todas as rotas (pública `/ativar`, pública `/login`, protegida `/selecionar-empresa`, protegidas com `ProtectedRoute` para as demais)
  - Aplicar `margin-left: 260px` (ou 72px quando colapsada) no `main-content` em desktop
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 7. Módulo de Usuários (back-end + front-end)
  - [x] 7.1 Implementar `UsuarioService` e `UsuarioController`
    - Criar DTOs: `UsuarioResponse` (id, nome, email, perfil), `VerificarEmailRequest` (email), `CriarUsuarioRequest` (nome, email, perfil), `AtualizarPerfilRequest` (idPerfil)
    - Implementar `GET /api/usuarios`: lista usuários da empresa via `ControleAcessoClient.listarUsuariosPorEmpresa`
    - Implementar `POST /api/usuarios/verificar-email`: consulta `ControleAcessoClient.buscarPorEmail` e retorna o usuário encontrado ou indicação de não cadastrado
    - Implementar `POST /api/usuarios`: cria usuário no ms-controle-acesso se necessário e associa à empresa; trata erro 400 do ms-CA propagando a mensagem sem persistir a associação
    - Implementar `POST /api/usuarios/{idUsuario}/perfil`: chama `ControleAcessoClient.associarPerfil`
    - Implementar `DELETE /api/usuarios/{idUsuario}`: chama `ControleAcessoClient.removerAssociacao`
    - Anotar todos os endpoints com verificação de perfil `PROPRIETARIO` (lançar `AcessoNegadoException` se não for)
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 7.2 Escrever testes unitários para `UsuarioService`
    - Testar listagem de usuários por empresa
    - Testar fluxo de cadastro com e-mail já existente (associa diretamente)
    - Testar fluxo de cadastro com e-mail novo (cria conta, associa)
    - Testar erro do ms-CA ao criar → exceção propagada sem associação
    - Testar remoção de usuário (desvinculação)
    - _Requisitos: 4.2, 4.4, 4.5, 4.7, 4.8_

  - [ ]* 7.3 Escrever teste de propriedade para controle de acesso por perfil (Propriedade 1)
    - **Propriedade 1: Controle de acesso por perfil**
    - **Valida: Requisitos 4.1, 5.1, 6.1, 7.1**
    - Implementar `@Property(tries = 100)` que gera perfis arbitrários (excluindo `PROPRIETARIO`) e verifica que requisições aos endpoints de gestão retornam 403
    - Anotar com `// Feature: locacao-espacos, Propriedade 1: controle de acesso por perfil`

  - [x] 7.4 Implementar tela de Usuários no front-end (`Usuarios.jsx`)
    - Exibir tabela de usuários com colunas: nome, e-mail, perfil, ações (alterar perfil, remover)
    - Implementar formulário de cadastro com campo e-mail com verificação ao sair do campo (`blur`): se encontrado exibir nome e seletor de perfil; se não encontrado exibir campo nome + seletor de perfil
    - Validar campos obrigatórios antes de submeter (nome, e-mail, perfil)
    - Exibir mensagem de sucesso informando que o usuário receberá e-mail para definir senha
    - Exibir mensagem de erro descritiva quando o ms-CA retornar erro
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9_

- [x] 8. Módulo de Grupos (back-end + front-end)
  - [x] 8.1 Implementar `GrupoService` e `GrupoController`
    - Criar DTOs: `GrupoRequest` (descricao, status), `GrupoResponse` (id, descricao, status, statusDescricao, atualizadoEm)
    - Implementar `GET /api/grupos`: retorna todos os grupos do `id_empresa_sistema` da sessão (ativos e inativos)
    - Implementar `POST /api/grupos`: valida `@NotBlank(descricao)`, persiste com status ativo e `id_empresa_sistema` da sessão
    - Implementar `POST /api/grupos/{id}`: valida existência + pertencimento à empresa; atualiza descricao e status
    - Implementar `DELETE /api/grupos/{id}`: verifica `espacoRepository.countByIdGrupo(id) == 0`; se > 0 lança `ConflitoDependenciaException`
    - Anotar todos os endpoints com verificação de perfil `PROPRIETARIO`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 8.2 Escrever testes de propriedade para `GrupoService` (Propriedades 2, 6 e 7)
    - **Propriedade 2: Isolamento de dados multiempresa**
    - **Valida: Requisitos 2.4, 8.2**
    - Implementar `@Property(tries = 100)` que gera listas de grupos com `id_empresa_sistema` variados e verifica que a listagem retorna somente os da empresa da sessão
    - **Propriedade 6: Proteção de exclusão com dependência vinculada**
    - **Valida: Requisitos 5.11, 6.7**
    - Implementar `@Property(tries = 100)` com `@ForAll @Positive int qtdEspacos` verificando que `grupoService.excluir` lança `ConflitoDependenciaException` quando `countByIdGrupo > 0`
    - **Propriedade 7: Listagem inclui todos os registros independentemente do status**
    - **Valida: Requisitos 5.2, 6.2**
    - Implementar `@Property(tries = 100)` que gera listas de grupos com mix de status e verifica que `listarTodos` retorna todos sem omissão
    - Anotar cada teste com `// Feature: locacao-espacos, Propriedade N: <título>`

  - [ ]* 8.3 Escrever testes unitários para `GrupoService`
    - Testar criação de grupo associando ao `id_empresa_sistema` correto
    - Testar edição de grupo existente
    - Testar exclusão de grupo sem espaços vinculados
    - Testar tentativa de exclusão de grupo com espaços → `ConflitoDependenciaException`
    - _Requisitos: 6.3, 6.4, 6.6, 6.7_

  - [x] 8.4 Implementar tela de Grupos no front-end (`Grupos.jsx`)
    - Exibir tabela de grupos com colunas: descrição, status (badge visual para inativo), ações (editar, excluir)
    - Implementar formulário inline/modal de cadastro e edição com campo descrição (obrigatório) e seletor de status
    - Bloquear submissão com campo descrição vazio
    - Exibir modal de confirmação antes de excluir
    - Exibir mensagem de erro ao tentar excluir grupo com espaços vinculados
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 9. Módulo de Tipos de Locação (back-end + front-end)
  - [x] 9.1 Implementar `EspacoTipoLocacaoService` e `EspacoTipoLocacaoController`
    - Criar DTOs `EspacoTipoLocacaoRequest` e `EspacoTipoLocacaoResponse` conforme o design
    - Implementar `GET /api/tipos-locacao`: retorna todos (ativos e inativos) do `id_empresa_sistema`
    - Implementar `GET /api/tipos-locacao/ativos`: retorna somente `status = 1` (usado no formulário de espaço)
    - Implementar `POST /api/tipos-locacao` e `POST /api/tipos-locacao/{id}`: incluindo validação condicional por modalidade no Service (não via Bean Validation) que lança `NegocioException` ao violar as regras de presença de campos
    - Implementar `DELETE /api/tipos-locacao/{id}`: verifica `espacoRepository.countByIdEspacoTipoLocacao(id) == 0`; se > 0 lança `ConflitoDependenciaException`
    - Converter `diasSemana` (Integer bitmask) ↔ `Set<DiaSemanaEnum>` usando `BitmaskUtils`
    - Anotar todos os endpoints com verificação de perfil `PROPRIETARIO`
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.9, 5.10, 5.11_

  - [ ]* 9.2 Escrever testes de propriedade para `EspacoTipoLocacaoService` (Propriedades 4, 5, 6, 7 e 8)
    - **Propriedade 4: Campos obrigatórios respeitam a modalidade de locação**
    - **Valida: Requisitos 5.3, 5.6, 5.7, 5.8**
    - Implementar `@Property(tries = 200)` com `@ForAll` gerando `EspacoTipoLocacaoRequest` válidos por modalidade e verificando que `validar()` não lança exceção e os campos condicionais estão corretos
    - **Propriedade 5: Rejeição de tipo de locação com campos inválidos para a modalidade**
    - **Valida: Requisito 5.10**
    - Implementar `@Property(tries = 200)` gerando requests que violam as regras de presença de campos e verificando que `NegocioException` é lançada sem persistência
    - **Propriedade 6: Proteção de exclusão com dependência vinculada** (para `EspacoTipoLocacao`)
    - **Valida: Requisitos 5.11, 6.7**
    - Implementar `@Property(tries = 100)` com `@ForAll @Positive int qtdEspacos` verificando que `excluir` lança `ConflitoDependenciaException`
    - **Propriedade 7: Listagem inclui todos os registros independentemente do status**
    - **Valida: Requisitos 5.2, 6.2**
    - Implementar `@Property(tries = 100)` para tipos de locação
    - **Propriedade 8: Filtragem de registros ativos para formulário de espaço**
    - **Valida: Requisitos 7.5, 7.6**
    - Implementar `@Property(tries = 100)` verificando que `listarAtivos` retorna exclusivamente registros com `status = 1`
    - Anotar cada teste com `// Feature: locacao-espacos, Propriedade N: <título>`

  - [ ]* 9.3 Escrever testes unitários para `EspacoTipoLocacaoService`
    - Testar criação com modalidade MES (campos opcionais nulos)
    - Testar criação com modalidade DIA (dias obrigatórios, horários nulos)
    - Testar criação com modalidade HORA (dias + horários obrigatórios)
    - Testar cada caso de violação de campos por modalidade → `NegocioException`
    - Testar proteção de exclusão com espaços vinculados → `ConflitoDependenciaException`
    - _Requisitos: 5.3, 5.6, 5.7, 5.8, 5.10, 5.11_

  - [x] 9.4 Implementar tela de Tipos de Locação no front-end (`TiposLocacao.jsx`)
    - Exibir tabela com colunas: descrição, modalidade, dias da semana, horário, status (badge para inativo), ações
    - Implementar formulário de cadastro/edição com exibição condicional de campos por modalidade:
      - MES → ocultar dias da semana e horários
      - DIA → exibir checkboxes de dias (Dom–Sab), ocultar horários
      - HORA → exibir checkboxes de dias e campos de horário início/fim
    - Validar campos obrigatórios por modalidade antes de submeter; exibir erro nos campos ausentes
    - Converter checkboxes de dias ↔ bitmask usando `utils/bitmask.js`
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

  - [ ]* 9.5 Escrever testes de utilitário para `bitmask.js` (Vitest)
    - Testar `toBitmask`/`fromBitmask` para todos os 128 subsets possíveis de dias da semana (round trip)
    - _Requisito: 5.5_

  - [ ]* 9.6 Escrever testes de componente para `TipoLocacaoModal` (Vitest + Testing Library)
    - Testar que campos de dias da semana são exibidos/ocultados conforme a modalidade selecionada
    - Testar que campos de horário são exibidos apenas para modalidade HORA
    - _Requisitos: 5.6, 5.7, 5.8_

- [ ] 10. Checkpoint — Verificar que todos os testes passam e os módulos de Grupos e Tipos de Locação funcionam end-to-end
  - Executar `mvn test` e garantir que todos os testes unitários e de propriedade passam
  - Executar `npx vitest --run` e garantir que todos os testes de componente e utilitário passam
  - Pedir ao usuário confirmação antes de continuar se houver dúvidas.

- [ ] 11. Módulo de Espaços (back-end + front-end)
  - [ ] 11.1 Implementar `EspacoService` e `EspacoController`
    - Criar DTOs `EspacoRequest` e `EspacoResponse` conforme o design (incluindo `grupoDescricao` e `tipoLocacaoDescricao` na response)
    - Implementar `GET /api/espacos`: retorna todos os espaços do `id_empresa_sistema`, carregando `grupoDescricao` e `tipoLocacaoDescricao` via JOIN ou projeção
    - Implementar `POST /api/espacos`: valida existência e pertencimento de `idGrupo` e `idEspacoTipoLocacao` ao `id_empresa_sistema`; persiste o espaço
    - Implementar `POST /api/espacos/{id}`: valida existência do espaço + pertencimento; atualiza todos os campos
    - Implementar `DELETE /api/espacos/{id}`: remove o espaço (sem verificação de dependência — espaços podem ser excluídos livremente)
    - Anotar todos os endpoints com verificação de perfil `PROPRIETARIO`
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.8, 7.9, 7.10_

  - [ ]* 11.2 Escrever testes de propriedade para `EspacoService` (Propriedades 2, 9 e 10)
    - **Propriedade 2: Isolamento de dados multiempresa** (para `Espaco`)
    - **Valida: Requisitos 2.4, 8.2**
    - Verificar que `GET /api/espacos` retorna somente espaços da empresa da sessão
    - **Propriedade 9: Persistência de espaço — round trip**
    - **Valida: Requisitos 7.8, 7.9**
    - Implementar `@Property(tries = 100)` que gera `EspacoRequest` válidos e verifica que `GET /api/espacos` retorna um registro com os mesmos valores de `idGrupo`, `descricao`, `idEspacoTipoLocacao`, `status` e `valor`
    - **Propriedade 10: Exclusão de espaço remove da listagem**
    - **Valida: Requisito 7.10**
    - Implementar `@Property(tries = 100)` que cria um espaço, executa DELETE e verifica que o espaço não aparece na listagem subsequente
    - Anotar cada teste com `// Feature: locacao-espacos, Propriedade N: <título>`

  - [ ]* 11.3 Escrever testes unitários para `EspacoService`
    - Testar criação com todos os campos obrigatórios
    - Testar que grupo ou tipo de locação de outra empresa lança `RecursoNaoEncontradoException`
    - Testar listagem retorna `grupoDescricao` e `tipoLocacaoDescricao` corretos
    - Testar exclusão remove o registro
    - _Requisitos: 7.1, 7.8, 7.9, 7.10, 8.2_

  - [ ] 11.4 Implementar tela de Espaços no front-end (`Espacos.jsx`) e `TipoLocacaoModal`
    - Exibir tabela de espaços com colunas: grupo, descrição, tipo de locação, status, valor, ações (editar, excluir)
    - Implementar formulário de cadastro/edição com campos: grupo (select — apenas ativos), descrição, tipo de locação (select — apenas ativos), status, valor, endereço (opcional), observações (opcional)
    - Implementar botão "Criar novo tipo de locação" que abre `TipoLocacaoModal` inline
    - Ao salvar `TipoLocacaoModal` com sucesso: fechar modal, atualizar o select de tipos e pré-selecionar o tipo recém-criado
    - Validar campos obrigatórios antes de submeter; exibir erro em cada campo ausente
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_

- [ ] 12. Responsividade e acessibilidade mínima
  - Garantir que todas as tabelas possuem `overflow-x: auto` em telas < 768px
  - Garantir que inputs, botões e áreas de toque têm altura mínima de 44px em mobile
  - Testar layout nos breakpoints 375px, 768px, 1024px e 1280px
  - Garantir que formulários utilizam `<label>` associados aos campos e que mensagens de erro são anunciadas via `role="alert"` ou `aria-live`
  - _Requisitos: 9.4, 9.5_

- [ ] 13. Testes de integração back-end
  - [ ]* 13.1 Escrever testes de integração para o fluxo de autenticação
    - Mockar o `ms-controle-acesso` com WireMock
    - Testar login com sucesso → token retornado e empresa selecionada na sessão
    - Testar login com credenciais inválidas → 401 com mensagem padronizada
    - Testar login com ms-CA indisponível → 503
    - Testar ativação com token válido → 200
    - Testar ativação com token inválido → 400 com mensagem correta
    - _Requisitos: 1.2, 1.3, 1.5, 4.1.4, 4.1.5_

  - [ ]* 13.2 Escrever testes de integração para CRUD de Grupos, Tipos de Locação e Espaços
    - Usar banco H2 em memória ou Testcontainers PostgreSQL
    - Testar CRUD completo de grupo (criar → listar → editar → excluir)
    - Testar proteção: excluir grupo com espaços → 409
    - Testar CRUD completo de tipo de locação incluindo validação condicional por modalidade
    - Testar proteção: excluir tipo com espaços → 409
    - Testar CRUD completo de espaço
    - Testar isolamento multiempresa: dados de empresa B não retornados na sessão de empresa A
    - _Requisitos: 2.4, 5.3, 5.10, 5.11, 6.3, 6.7, 7.8, 7.10, 8.2_

- [ ] 14. Checkpoint final — Garantir que todos os testes passam e wiring completo
  - Executar `mvn test` (unitários + propriedade + integração) — todos devem passar
  - Executar `npx vitest --run` — todos devem passar
  - Verificar que Flyway aplica todas as migrations sem erro ao subir a aplicação
  - Verificar que o endpoint `/api/auth/login` retorna 401 para credenciais inválidas
  - Verificar que rotas protegidas retornam 403 sem token JWT válido
  - Pedir ao usuário confirmação antes de concluir se houver dúvidas.

---

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para uma entrega MVP mais rápida
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Os checkpoints (tarefas 4, 10, 14) garantem validação incremental a cada conjunto de módulos
- Os testes de propriedade validam garantias universais de correção (isolamento multiempresa, bitmask, modalidade, exclusão com dependência, round trip de persistência)
- Os testes unitários validam exemplos específicos e casos de borda
- O padrão de nomenclatura de migrations Flyway é `V{número}__{descricao_com_underscores}.sql` — nunca alterar uma migration já aplicada
