# Documento de Requisitos — Administração de Locações de Espaço (Sprint 1)

## Introdução

Este documento descreve os requisitos funcionais da Sprint 1 do sistema de **Administração de Locações de Espaço**. O sistema permite que proprietários gerenciem espaços disponíveis para locação (salas, vagas, ambientes), controlando usuários, grupos, tipos de locação e os próprios espaços. O acesso ao sistema é autenticado via o microserviço `ms-controle-acesso` e o modelo de dados segue a estrutura multiempresa da plataforma.

O escopo desta sprint cobre exclusivamente as funcionalidades de administração do proprietário: autenticação, seleção de empresa, cadastro de usuários, tipos de locação, grupos e espaços.

---

## Glossário

- **Sistema**: A aplicação web de administração de locações de espaço.
- **Proprietário**: Perfil de usuário com acesso total às rotinas administrativas (usuários, tipos de locação, grupos, espaços).
- **Locatário**: Perfil de usuário com acesso restrito às funcionalidades de consulta e locação (escopo da Sprint 2).
- **Empresa**: Entidade organizacional à qual os dados pertencem, identificada por UUID e descrição.
- **EmpresaSistema**: Associação entre uma empresa e o sistema, utilizada para determinar o escopo multiempresa dos dados.
- **ms-controle-acesso**: Microserviço externo responsável pela autenticação de usuários e pelo armazenamento centralizado de contas.
- **Fluxo de Ativação de Conta**: Processo pelo qual um novo usuário cadastrado pelo proprietário recebe um e-mail com link contendo token de ativação, acessa a tela pública `/ativar` do sistema, define sua senha e ativa a conta via `POST /usuarios/ativar` do ms-controle-acesso. O token tem validade de 24 horas.
- **Grupo**: Agrupamento lógico de espaços pertencentes a um mesmo prédio ou sala, com status ativo/inativo.
- **EspacoTipoLocacao**: Cadastro reutilizável que define a modalidade, dias da semana e horários de funcionamento de um tipo de locação.
- **Espaço**: Unidade física disponível para locação, vinculada a um grupo, a um tipo de locação e a uma empresa.
- **ModalidadeLocacaoEnum**: Enumeração da modalidade de locação — `0=MES`, `1=DIA`, `2=HORA`.
- **StatusEnum**: Enumeração de status — `0=inativo`, `1=ativo`.
- **DiaSemanaEnum / Bitmask**: Os dias da semana são armazenados no banco como um `INTEGER` bitmask onde cada bit representa um dia (bit 0=Dom, bit 1=Seg, bit 2=Ter, bit 3=Qua, bit 4=Qui, bit 5=Sex, bit 6=Sab). No front-end é representado como `Set<DiaSemanaEnum>`.
- **Sidebar**: Menu lateral de navegação, conforme especificado no GUIA_DE_PADROES.md.
- **Drawer**: Comportamento da sidebar em dispositivos móveis e tablets, abrindo como painel deslizante sobre o conteúdo.

---

## Requisitos

---

### Requisito 1: Autenticação via ms-controle-acesso

**User Story:** Como usuário do sistema, quero me autenticar com minhas credenciais, para que eu possa acessar as funcionalidades conforme meu perfil.

#### Critérios de Aceite

1. THE Sistema SHALL exibir uma tela de login com campos de e-mail e senha antes de permitir acesso a qualquer funcionalidade protegida.
2. WHEN o usuário submete credenciais válidas, THE Sistema SHALL autenticar o usuário via `POST /usuarios/login` do ms-controle-acesso e armazenar o token JWT retornado na sessão.
3. IF as credenciais informadas forem inválidas, THEN THE Sistema SHALL exibir uma mensagem de erro descritiva sem revelar qual campo está incorreto.
4. WHEN a sessão do usuário expirar, THE Sistema SHALL redirecionar o usuário para a tela de login e descartar o token de sessão armazenado.
5. IF o ms-controle-acesso estiver indisponível durante o login, THEN THE Sistema SHALL exibir uma mensagem de erro informando que o serviço de autenticação está temporariamente indisponível.

---

### Requisito 2: Seleção de Empresa

**User Story:** Como usuário autenticado, quero selecionar a empresa com a qual desejo trabalhar, para que os dados exibidos e as ações realizadas pertençam ao contexto correto.

#### Critérios de Aceite

1. WHEN o usuário autenticado tiver acesso a mais de uma empresa, THE Sistema SHALL exibir uma tela de seleção de empresa antes de redirecionar para a tela principal.
2. WHEN o usuário autenticado tiver acesso a exatamente uma empresa, THE Sistema SHALL selecionar essa empresa automaticamente e redirecionar para a tela principal sem exibir a tela de seleção.
3. WHEN o usuário selecionar uma empresa na tela de seleção, THE Sistema SHALL armazenar o identificador da empresa selecionada na sessão ativa.
4. THE Sistema SHALL utilizar o identificador de empresa armazenado na sessão para filtrar todos os dados exibidos e persistidos durante a sessão.
5. IF o usuário autenticado não tiver acesso a nenhuma empresa cadastrada, THEN THE Sistema SHALL exibir uma mensagem informando que não há empresas associadas ao seu cadastro e não permitir acesso à tela principal.

---

### Requisito 3: Layout e Navegação

**User Story:** Como usuário do sistema, quero navegar entre as seções por meio de um menu lateral responsivo, para que eu possa acessar as funcionalidades com facilidade em qualquer dispositivo.

#### Critérios de Aceite

1. THE Sistema SHALL exibir uma sidebar fixa à esquerda com largura de 260px em dispositivos com largura de tela maior ou igual a 1024px.
2. WHERE o usuário optar por colapsar a sidebar em desktop, THE Sistema SHALL reduzir a largura da sidebar para 72px exibindo apenas os ícones dos itens de navegação.
3. WHILE a largura da tela for menor que 1024px, THE Sistema SHALL ocultar a sidebar por padrão e exibir uma navbar de topo com altura de 64px contendo o botão hambúrguer.
4. WHEN o usuário clicar no botão hambúrguer em dispositivos com largura menor que 1024px, THE Sistema SHALL exibir a sidebar como drawer deslizante sobre o conteúdo com um overlay escuro atrás.
5. WHEN o usuário clicar no overlay escuro em dispositivos com largura menor que 1024px, THE Sistema SHALL fechar o drawer da sidebar.
6. THE Sistema SHALL aplicar a transição de abertura e fechamento do drawer com duração de 0.3 segundos usando a função de temporização `ease`.
7. THE Sistema SHALL exibir na sidebar apenas os itens de menu correspondentes ao perfil do usuário autenticado na sessão ativa.

---

### Requisito 4: Cadastro e Gestão de Usuários

**User Story:** Como proprietário, quero cadastrar e gerenciar os usuários com acesso ao sistema na minha empresa, para que eu possa controlar quem pode acessar quais funcionalidades.

#### Critérios de Aceite

1. THE Sistema SHALL restringir o acesso à funcionalidade de gestão de usuários exclusivamente a usuários com perfil Proprietário.
2. THE Sistema SHALL exibir a lista de usuários associados à empresa da sessão ativa via `GET /usuarios/sistema/{codigoSistema}/empresa/{codigoEmpresa}`, contendo nome, e-mail e perfil de cada usuário.
3. WHEN o proprietário digitar um endereço de e-mail no campo de e-mail do formulário de cadastro, THE Sistema SHALL consultar o ms-controle-acesso via `GET /usuarios/email/{email}` para verificar se já existe uma conta com aquele endereço.
4. WHEN o ms-controle-acesso confirmar que o e-mail informado já possui conta cadastrada, THE Sistema SHALL exibir o nome do usuário encontrado e disponibilizar a seleção de perfil (Proprietário ou Locatário) para associação à empresa da sessão ativa via `POST /usuarios/{idUsuario}/sistema/{codigoSistema}/empresa/{codigoEmpresa}/perfil`.
5. WHEN o ms-controle-acesso confirmar que o e-mail informado não possui conta cadastrada, THE Sistema SHALL solicitar o preenchimento do campo nome e, ao confirmar o cadastro, disparar a criação da conta via `POST /usuarios` informando `nome`, `email` e a `urlAtivacao` correspondente à rota pública `/ativar` do sistema, e em seguida associar o novo usuário à empresa com o perfil selecionado em um único fluxo transparente ao usuário.
6. WHEN o cadastro de novo usuário for concluído com sucesso, THE Sistema SHALL exibir uma mensagem informando que o usuário receberá um e-mail para definir sua senha.
7. IF o ms-controle-acesso retornar erro durante a criação de conta de novo usuário, THEN THE Sistema SHALL exibir uma mensagem de erro descritiva e não persistir a associação do usuário à empresa.
7. WHEN o proprietário alterar o perfil de um usuário já associado, THE Sistema SHALL atualizar o perfil do usuário na empresa da sessão ativa.
8. WHEN o proprietário remover um usuário, THE Sistema SHALL desvincular o usuário da empresa da sessão ativa sem excluir a conta no ms-controle-acesso.
9. THE Sistema SHALL exibir os campos obrigatórios nome, e-mail e perfil no formulário de cadastro e impedir a submissão enquanto qualquer campo obrigatório estiver vazio.

---

### Requisito 4.1: Ativação de Conta de Novo Usuário

**User Story:** Como novo usuário cadastrado pelo proprietário, quero acessar um link recebido por e-mail para definir minha senha, para que eu possa ativar minha conta e acessar o sistema.

#### Critérios de Aceite

1. THE Sistema SHALL disponibilizar uma rota pública `/ativar` acessível sem autenticação.
2. WHEN o usuário acessar a rota `/ativar?token={token}`, THE Sistema SHALL exibir um formulário com os campos senha e confirmação de senha.
3. WHEN o usuário submeter o formulário de ativação com senha e confirmação válidas e correspondentes, THE Sistema SHALL chamar `POST /usuarios/ativar` do ms-controle-acesso com o token e a senha informada.
4. WHEN o ms-controle-acesso confirmar a ativação com sucesso, THE Sistema SHALL exibir uma mensagem de sucesso e redirecionar o usuário para a tela de login.
5. IF o token de ativação for inválido ou estiver expirado (erro retornado pelo ms-controle-acesso), THEN THE Sistema SHALL exibir uma mensagem informando que o link é inválido ou expirou e orientar o usuário a solicitar um novo convite ao administrador.
6. IF os campos senha e confirmação de senha não coincidirem, THEN THE Sistema SHALL exibir mensagem de erro no campo de confirmação e não submeter o formulário.
7. THE Sistema SHALL exigir senha com no mínimo 8 caracteres contendo letras e números e bloquear a submissão caso a regra não seja atendida.

---

### Requisito 5: Gestão de Tipos de Locação (EspacoTipoLocacao)

**User Story:** Como proprietário, quero cadastrar e gerenciar tipos de locação reutilizáveis, para que eu possa associá-los aos espaços sem precisar reconfigurar as regras a cada cadastro.

#### Critérios de Aceite

1. THE Sistema SHALL restringir o acesso à funcionalidade de gestão de tipos de locação exclusivamente a usuários com perfil Proprietário.
2. THE Sistema SHALL exibir a lista completa de tipos de locação da empresa da sessão ativa (ativos e inativos), deixando visualmente destacados os registros com status inativo.
3. THE Sistema SHALL disponibilizar os seguintes campos no formulário de cadastro e edição de tipo de locação: descrição (obrigatório), modalidade (obrigatório), dias da semana (obrigatório quando modalidade ≠ MES), horário de início (obrigatório quando modalidade = HORA) e horário de fim (obrigatório quando modalidade = HORA).
4. THE Sistema SHALL armazenar a modalidade de locação como `INTEGER` no banco (`0=MES`, `1=DIA`, `2=HORA`) e representá-la no front-end como `ModalidadeLocacaoEnum`.
5. THE Sistema SHALL armazenar os dias da semana como `INTEGER` bitmask no banco (bit 0=Dom, bit 1=Seg, bit 2=Ter, bit 3=Qua, bit 4=Qui, bit 5=Sex, bit 6=Sab) e representá-los no front-end como `Set<DiaSemanaEnum>` exibido como checkboxes de Domingo a Sábado.
6. WHEN o proprietário selecionar a modalidade `MES`, THE Sistema SHALL ocultar os campos de dias da semana e horários.
7. WHEN o proprietário selecionar a modalidade `DIA`, THE Sistema SHALL exibir os checkboxes de dias da semana e ocultar os campos de horário.
8. WHEN o proprietário selecionar a modalidade `HORA`, THE Sistema SHALL exibir os checkboxes de dias da semana e os campos de horário de início e fim.
9. THE Sistema SHALL armazenar o status do tipo de locação como `INTEGER` (`0=inativo`, `1=ativo`) e permitir que o proprietário ative ou desative um tipo de locação existente.
10. IF o proprietário tentar salvar um tipo de locação com campos obrigatórios não preenchidos conforme a modalidade selecionada, THEN THE Sistema SHALL exibir mensagens de erro nos campos ausentes e não persistir o registro.
11. IF o proprietário tentar excluir um tipo de locação que esteja associado a algum espaço, THEN THE Sistema SHALL exibir uma mensagem de erro informando que o tipo não pode ser excluído enquanto houver espaços associados.

---

### Requisito 6: Gestão de Grupos

**User Story:** Como proprietário, quero criar e gerenciar grupos de espaços, para que eu possa organizar espaços de um mesmo prédio ou sala de forma lógica.

#### Critérios de Aceite

1. THE Sistema SHALL restringir o acesso à funcionalidade de gestão de grupos exclusivamente a usuários com perfil Proprietário.
2. THE Sistema SHALL exibir a lista completa de grupos da empresa da sessão ativa (ativos e inativos), deixando visualmente destacados os registros com status inativo.
3. WHEN o proprietário cadastrar um novo grupo informando a descrição, THE Sistema SHALL persistir o grupo com status ativo associado à empresa da sessão ativa e exibir o novo grupo na lista.
4. WHEN o proprietário editar um grupo existente, THE Sistema SHALL permitir a alteração da descrição e do status e refletir as alterações na lista imediatamente.
5. THE Sistema SHALL armazenar o status do grupo como `INTEGER` (`0=inativo`, `1=ativo`).
6. WHEN o proprietário excluir um grupo que não possua espaços vinculados, THE Sistema SHALL remover o grupo da empresa da sessão ativa.
7. IF o proprietário tentar excluir um grupo que possua espaços vinculados, THEN THE Sistema SHALL exibir uma mensagem de erro informando que o grupo não pode ser excluído enquanto houver espaços associados a ele.
8. THE Sistema SHALL exigir o preenchimento do campo descrição no formulário de cadastro e edição de grupos e impedir a submissão enquanto o campo estiver vazio.

---

### Requisito 7: Cadastro e Gestão de Espaços

**User Story:** Como proprietário, quero cadastrar, editar e excluir espaços disponíveis para locação, para que eu possa manter atualizado o portfólio de espaços da empresa.

#### Critérios de Aceite

1. THE Sistema SHALL restringir o acesso à funcionalidade de gestão de espaços exclusivamente a usuários com perfil Proprietário.
2. THE Sistema SHALL exibir a lista de espaços da empresa da sessão ativa, contendo grupo, descrição, tipo de locação, status e valor de cada espaço.
3. THE Sistema SHALL disponibilizar os seguintes campos no formulário de cadastro e edição de espaços: grupo (obrigatório), descrição (obrigatório), tipo de locação (obrigatório), status (obrigatório), valor (obrigatório), endereço (opcional) e observações (opcional).
4. THE Sistema SHALL armazenar o status do espaço como `INTEGER` (`0=inativo`, `1=ativo`) e representá-lo no front-end como `StatusEnum`.
5. WHEN o proprietário preencher o campo tipo de locação no formulário de espaço, THE Sistema SHALL exibir apenas os tipos de locação com status ativo da empresa da sessão ativa para seleção.
6. WHEN o proprietário preencher o campo grupo no formulário de espaço, THE Sistema SHALL exibir apenas os grupos com status ativo da empresa da sessão ativa para seleção.
7. WHEN o proprietário clicar em "Criar novo tipo de locação" no formulário de espaço, THE Sistema SHALL abrir um modal de cadastro de tipo de locação e, ao salvar com sucesso, associar automaticamente o novo tipo ao espaço em edição.
8. WHEN o proprietário cadastrar um espaço com todos os campos obrigatórios preenchidos, THE Sistema SHALL persistir o espaço associado à empresa da sessão ativa e exibir o novo espaço na lista.
9. WHEN o proprietário editar um espaço existente, THE Sistema SHALL atualizar o registro do espaço com os novos valores informados.
10. WHEN o proprietário excluir um espaço, THE Sistema SHALL remover o espaço da empresa da sessão ativa.
11. IF o proprietário tentar salvar um espaço com campos obrigatórios não preenchidos, THEN THE Sistema SHALL exibir mensagens de erro em cada campo ausente e não persistir o registro.

---

### Requisito 8: Estrutura de Dados Multiempresa

**User Story:** Como desenvolvedor da plataforma, quero que todos os dados do sistema estejam vinculados à empresa correta, para que o isolamento de dados entre empresas seja garantido em toda a aplicação.

#### Critérios de Aceite

1. THE Sistema SHALL associar cada registro de grupo, tipo de locação e espaço ao `id_empresa_sistema` correspondente à empresa da sessão ativa.
2. THE Sistema SHALL filtrar todas as consultas de dados utilizando o `id_empresa_sistema` da sessão ativa, de modo que registros de outras empresas nunca sejam retornados.
3. THE Sistema SHALL utilizar UUID como chave primária nas tabelas `sistema`, `empresa`, `empresa_sistema`, `grupo`, `espaco_tipo_locacao` e `espaco`.
4. THE Sistema SHALL manter a coluna `atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()` em todas as tabelas gerenciadas pelo sistema, conforme convenção do GUIA_DE_PADROES.md.
5. THE Sistema SHALL gerenciar todas as alterações de schema de banco de dados exclusivamente por meio de migrations Flyway, seguindo a nomenclatura `V{número}__{descricao_com_underscores}.sql`.
6. THE Sistema SHALL criar índices nas colunas `id_empresa_sistema` das tabelas `grupo`, `espaco_tipo_locacao` e `espaco`, e na coluna `id_grupo` da tabela `espaco`.

---

### Requisito 9: Padrões Técnicos e de Interface

**User Story:** Como desenvolvedor da plataforma, quero que o sistema siga os padrões definidos no GUIA_DE_PADROES.md, para que haja consistência visual e técnica com os demais projetos da plataforma.

#### Critérios de Aceite

1. THE Sistema SHALL implementar o back-end em Java 21 com Spring Boot 3.2.x, utilizando Maven como ferramenta de build.
2. THE Sistema SHALL implementar o front-end em React 18 com Vite 5, utilizando CSS puro com variáveis CSS para estilização, sem frameworks CSS externos.
3. THE Sistema SHALL aplicar a paleta de cores, tipografia, bordas, sombras e efeitos de fundo definidos no GUIA_DE_PADROES.md em todas as telas.
4. THE Sistema SHALL garantir que todos os inputs, botões e áreas de toque tenham altura mínima de 44px em dispositivos móveis.
5. THE Sistema SHALL exibir tabelas com scroll horizontal (`overflow-x: auto`) em telas com largura inferior a 768px.
6. THE Sistema SHALL retornar respostas de erro da API no formato padronizado `{ "timestamp": "...", "status": <código>, "erro": "<mensagem>" }` para todas as exceções tratadas.
7. THE Sistema SHALL centralizar o tratamento de exceções da API no componente `GlobalExceptionHandler`, conforme convenção do GUIA_DE_PADROES.md.
8. THE Sistema SHALL utilizar DTOs com `@Builder`, `@Getter` e `@JsonInclude(NON_NULL)` nas respostas da API, sem expor entidades JPA diretamente.
