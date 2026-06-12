# 📚 Documentação da API - MS Controle de Acesso

**Versão:** 1.0.0

---

## 🚀 Como Acessar

Após iniciar a aplicação:

- **Swagger UI**: http://localhost:8080/controle-acesso-rest-api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/controle-acesso-rest-api/api-docs

```bash
mvn spring-boot:run
```

---

## 🔐 Autenticação

Os endpoints marcados com 🔒 exigem **Bearer Token JWT** no header:

```
Authorization: Bearer <token>
```

O token é obtido no endpoint de login.

---

## 📋 Endpoints

### 👤 Usuários — `/usuarios`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/usuarios` | Cadastrar usuário | — |
| POST | `/usuarios/login` | Realizar login | — |
| POST | `/usuarios/ativar` | Ativar conta e definir senha | — |
| POST | `/usuarios/solicitar-troca-senha` | Enviar email de redefinição | — |
| POST | `/usuarios/redefinir-senha` | Redefinir senha com token | — |
| POST | `/usuarios/{idUsuario}/sistema/{codigoSistema}/empresa/{codigoEmpresa}/perfil` | Associar perfil ao usuário | 🔒 |
| GET | `/usuarios/email/{email}` | Buscar usuário por email | 🔒 |
| GET | `/usuarios/sistema/{codigoSistema}/empresa/{codigoEmpresa}` | Listar usuários por sistema/empresa | 🔒 |

---

#### `POST /usuarios` — Cadastrar usuário

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao.silva@empresa.com",
  "urlAtivacao": "https://app.empresa.com/ativar"
}
```

**Response 201:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "nome": "João Silva",
  "email": "joao.silva@empresa.com",
  "status": 0
}
```

**Response 400:**
```json
{
  "erros": [
    { "codigo": "-2", "descricao": "Email já cadastrado" }
  ]
}
```

---

#### `POST /usuarios/login` — Realizar login

**Request:**
```json
{
  "email": "joao.silva@empresa.com",
  "senha": "Senha@123",
  "codigoSistema": "PONTO_CERTO"
}
```

**Response 200:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "nome": "João Silva",
  "email": "joao.silva@empresa.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "empresas": [
    {
      "codigo": "EMP001",
      "nome": "Empresa Exemplo LTDA",
      "cpfCnpj": "12.345.678/0001-99"
    }
  ]
}
```

**Response 401:**
```json
{
  "erros": [
    { "codigo": "-1", "descricao": "Usuário ou senha inválidos." }
  ]
}
```

---

#### `POST /usuarios/ativar` — Ativar usuário

**Request:**
```json
{
  "token": "token-de-ativacao-recebido-por-email",
  "senha": "Senha@123"
}
```

**Response 200:** _(sem body)_

**Response 400:**
```json
{
  "erros": [
    { "codigo": "-3", "descricao": "Token de ativação inválido ou expirado." }
  ]
}
```

---

#### `POST /usuarios/solicitar-troca-senha` — Solicitar troca de senha

**Request:**
```json
{
  "email": "joao.silva@empresa.com",
  "urlRedefinicao": "https://app.empresa.com/redefinir-senha"
}
```

**Response 200:** _(sem body)_

**Response 404:**
```json
{
  "erros": [
    { "codigo": "-4", "descricao": "Usuário não encontrado." }
  ]
}
```

---

#### `POST /usuarios/redefinir-senha` — Redefinir senha

**Request:**
```json
{
  "token": "token-de-redefinicao-recebido-por-email",
  "novaSenha": "NovaSenha@456"
}
```

**Response 200:** _(sem body)_

**Response 400:**
```json
{
  "erros": [
    { "codigo": "-3", "descricao": "Token de redefinição inválido ou expirado." }
  ]
}
```

---

#### `POST /usuarios/{idUsuario}/sistema/{codigoSistema}/empresa/{codigoEmpresa}/perfil` — Associar perfil 🔒

**Path Params:** `idUsuario` (UUID), `codigoSistema` (String), `codigoEmpresa` (String)

**Request:**
```json
{
  "idPerfil": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

**Response 200:** _(sem body)_

---

#### `GET /usuarios/email/{email}` — Buscar por email 🔒

**Response 200:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "nome": "João Silva",
  "email": "joao.silva@empresa.com",
  "status": 1
}
```

---

#### `GET /usuarios/sistema/{codigoSistema}/empresa/{codigoEmpresa}` — Listar usuários 🔒

**Response 200:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nome": "João Silva",
    "email": "joao.silva@empresa.com",
    "status": 1
  }
]
```

---

### 🏷️ Perfis — `/perfis`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/perfis/sistema/{codigoSistema}/empresa/{codigoEmpresa}` | Criar perfil | — |
| GET | `/perfis/sistema/{codigoSistema}/empresa/{codigoEmpresa}` | Listar perfis | — |
| GET | `/perfis/{id}` | Buscar perfil por ID | — |
| GET | `/perfis/sistema/{codigoSistema}/empresa/{codigoEmpresa}/usuario/{idUsuario}` | Buscar perfil do usuário | — |

---

#### `POST /perfis/sistema/{codigoSistema}/empresa/{codigoEmpresa}` — Criar perfil

**Request (com permissões):**
```json
{
  "nome": "GESTOR",
  "descricao": "Perfil de gestão",
  "acessoTotal": false,
  "permissoes": [
    {
      "idModulo": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "podeCriar": true,
      "podeAlterar": true,
      "podeExcluir": false,
      "podeVisualizar": true
    }
  ]
}
```

**Request (acesso total):**
```json
{
  "nome": "ADMIN",
  "descricao": "Administrador com acesso total",
  "acessoTotal": true,
  "permissoes": []
}
```

**Response 201:**
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "nome": "GESTOR",
  "descricao": "Perfil de gestão",
  "ativo": true,
  "acessoTotal": false,
  "permissoes": [
    {
      "idModulo": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "descricaoModulo": "Relatórios",
      "podeCriar": true,
      "podeAlterar": true,
      "podeExcluir": false,
      "podeVisualizar": true
    }
  ]
}
```

---

#### `GET /perfis/sistema/{codigoSistema}/empresa/{codigoEmpresa}` — Listar perfis

**Response 200:**
```json
[
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "nome": "GESTOR",
    "descricao": "Perfil de gestão",
    "ativo": true,
    "acessoTotal": false
  }
]
```

---

#### `GET /perfis/{id}` — Buscar perfil por ID

**Response 200:**
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "nome": "GESTOR",
  "descricao": "Perfil de gestão",
  "ativo": true,
  "acessoTotal": false,
  "permissoes": [
    {
      "idModulo": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "descricaoModulo": "Relatórios",
      "podeCriar": true,
      "podeAlterar": true,
      "podeExcluir": false,
      "podeVisualizar": true
    }
  ]
}
```

---

### 📦 Módulos — `/modulos`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/modulos/sistema/{codigoSistema}` | Criar módulos | — |
| GET | `/modulos/sistema/{codigoSistema}` | Listar módulos do sistema | — |

---

#### `POST /modulos/sistema/{codigoSistema}` — Criar módulos

**Request:**
```json
[
  { "descricao": "Relatórios" },
  { "descricao": "Cadastros" },
  { "descricao": "Financeiro" }
]
```

**Response 201:** _(sem body)_

**Response 400:**
```json
{
  "erros": [
    { "codigo": "-2", "descricao": "Lista de módulos não pode ser vazia" }
  ]
}
```

---

#### `GET /modulos/sistema/{codigoSistema}` — Listar módulos

**Response 200:**
```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "descricao": "Relatórios",
    "dataCriacao": "2025-01-15T10:30:00",
    "dataAtualizacao": "2025-01-15T10:30:00"
  }
]
```

---

## 📝 Formato de Erro Padrão

Todos os erros seguem o mesmo formato:

```json
{
  "erros": [
    {
      "codigo": "-1",
      "descricao": "Mensagem descritiva do erro"
    }
  ]
}
```

---

Mengão é campeão! 🔴⚫
