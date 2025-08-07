# Exemplos do Nitro Router

Esta pasta contém exemplos práticos de como usar a biblioteca Nitro Router. Cada exemplo demonstra diferentes recursos e casos de uso.

## 📁 Estrutura dos Exemplos

### 1. `basic-usage.ts` - Uso Básico

**Demonstra:**

- CRUD completo de usuários
- Validação com Zod schemas
- Tipagem automática
- Documentação OpenAPI

**Como executar:**

```bash
npm run dev examples/basic-usage.ts
# Acesse: http://localhost:3000
```

**Endpoints:**

- `GET /api/users` - Listar usuários com paginação
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### 2. `middleware-example.ts` - Sistema de Middleware

**Demonstra:**

- Middleware tipado
- Autenticação Bearer token
- Sistema de roles (admin/user)
- Logs automáticos
- Grupos de rotas

**Como executar:**

```bash
npm run dev examples/middleware-example.ts
# Acesse: http://localhost:3001
```

**Endpoints:**

- `GET /api/v1/posts` - Posts públicos
- `POST /api/v1/posts` - Criar post (requer auth)
- `GET /api/v1/admin/posts` - Todos os posts (admin only)
- `DELETE /api/v1/admin/posts/:id` - Deletar post (admin only)

**Tokens de teste:**

- `Authorization: Bearer valid-token` - Usuário comum
- Admin automático quando autenticado

### 3. `file-upload-example.ts` - Upload de Arquivos

**Demonstra:**

- Middleware de upload simulado
- Validação de tipos de arquivo
- Sistema de compartilhamento
- Gestão de permissões

**Como executar:**

```bash
npm run dev examples/file-upload-example.ts
# Acesse: http://localhost:3002
```

**Endpoints:**

- `POST /api/files` - Upload de arquivo (multipart/form-data)
- `GET /api/files` - Listar arquivos do usuário
- `GET /api/files/:id` - Buscar arquivo específico
- `PUT /api/files/:id` - Atualizar informações
- `DELETE /api/files/:id` - Deletar arquivo
- `POST /api/files/:id/share` - Compartilhar arquivo
- `DELETE /api/files/:id/share/:userId` - Remover compartilhamento

**Auth:** `Authorization: Bearer valid-token`

### 4. `auth-example.ts` - Autenticação Completa

**Demonstra:**

- Sistema completo de auth
- Login/logout com cookies
- Registro de usuários
- Diferentes níveis de acesso
- Rotas administrativas
- Gestão de usuários

**Como executar:**

```bash
npm run dev examples/auth-example.ts
# Acesse: http://localhost:3003
```

**Endpoints Públicos:**

- `POST /auth/login` - Fazer login
- `POST /auth/register` - Registrar usuário
- `POST /auth/logout` - Fazer logout

**Endpoints de Usuário (requer auth):**

- `GET /user/me` - Meu perfil
- `PUT /user/me` - Atualizar perfil
- `POST /user/change-password` - Alterar senha

**Endpoints Admin (requer admin):**

- `GET /admin/users` - Listar todos os usuários
- `GET /admin/users/:id` - Buscar usuário específico
- `PUT /admin/users/:id` - Atualizar qualquer usuário
- `DELETE /admin/users/:id` - Deletar usuário

**Credenciais de teste:**

- Admin: `admin@example.com` / `admin123` (token: `admin-token`)
- User: `user@example.com` / `user123` (token: `user-token`)

### 5. `documentation-server.ts` - Servidor de Documentação

**Demonstra:**

- Geração automática de documentação OpenAPI
- Interface Swagger UI
- Tutorial interativo
- Agregação de exemplos

**Como executar:**

```bash
npm run dev examples/documentation-server.ts
# Acesse: http://localhost:4000
```

**Páginas:**

- `/` - Página inicial com links
- `/docs` - Documentação Swagger UI
- `/openapi.json` - Especificação OpenAPI
- `/examples` - Lista de exemplos
- `/tutorial` - Tutorial step-by-step

## 🚀 Como Executar Todos os Exemplos

### Executar individualmente:

```bash
# Exemplo básico
npm run dev examples/basic-usage.ts

# Middleware
npm run dev examples/middleware-example.ts

# Upload de arquivos
npm run dev examples/file-upload-example.ts

# Autenticação
npm run dev examples/auth-example.ts

# Documentação
npm run dev examples/documentation-server.ts
```

### Executar todos simultaneamente:

```bash
# Terminal 1
npm run dev examples/basic-usage.ts

# Terminal 2
npm run dev examples/middleware-example.ts

# Terminal 3
npm run dev examples/file-upload-example.ts

# Terminal 4
npm run dev examples/auth-example.ts

# Terminal 5
npm run dev examples/documentation-server.ts
```

## 🧪 Como Testar

### 1. Usando curl:

```bash
# Exemplo básico - Listar usuários
curl http://localhost:3000/api/users

# Criar usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "João", "email": "joao@example.com", "age": 25}'

# Middleware - Post público
curl http://localhost:3001/api/v1/posts

# Middleware - Criar post (protegido)
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer valid-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Meu Post", "content": "Conteúdo do post"}'

# Auth - Login
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Auth - Perfil do usuário
curl http://localhost:3003/user/me \
  -H "Authorization: Bearer admin-token"
```

### 2. Usando Postman/Insomnia:

Importe as collections ou configure manualmente:

**Headers para rotas protegidas:**

```
Authorization: Bearer valid-token
Content-Type: application/json
```

**Headers para upload:**

```
Authorization: Bearer valid-token
Content-Type: multipart/form-data
```

## 📚 Conceitos Demonstrados

### Type Safety

```typescript
// Tipagem automática de parâmetros, body e query
router.post(
  '/users/:id',
  async (ctx, res) => {
    const id = ctx.params.id // string
    const body = ctx.body // Tipo inferido do schema
    const query = ctx.query // Tipo inferido do schema
  },
  { body: UserSchema }
)
```

### Middleware Tipado

```typescript
const authMiddleware: TypedMiddleware<{ user: User }> = {
  middleware: async (req, res, next) => {
    // Lógica de autenticação
    next()
  },
  inject: (req) => ({ user: authenticatedUser }),
}

router.use(authMiddleware) // Todas as rotas posteriores terão ctx.user
```

### Validação Automática

```typescript
const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
})

router.post('/users', handler, {
  body: UserSchema, // Validação automática + tipagem
})
```

### Grupos de Rotas

```typescript
const api = new NitroRouter({ prefix: '/api/v1' })
const userRoutes = api.group({ prefix: '/users', tags: ['Users'] })
const adminRoutes = api.use(authMiddleware).group({ prefix: '/admin' })
```

### Documentação Automática

```typescript
router.post('/users', handler, {
  body: UserSchema,
  summary: 'Criar usuário',
  description: 'Cria um novo usuário no sistema',
  tags: ['Users'],
})

// Gera OpenAPI automaticamente
const docs = openApi({ title: 'Minha API', version: '1.0.0' })
```

## 🔗 Links Úteis

- [Documentação Principal](../README.md)
- [Zod Documentation](https://zod.dev/)
- [Express.js](https://expressjs.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
