# Nitro Router

Uma biblioteca TypeScript type-safe para criação de rotas Express com validação automática, middleware tipado e geração de documentação OpenAPI.

## 🚀 Características

- **Type Safety**: Total tipagem TypeScript com inferência automática de tipos
- **Validação Automática**: Validação de body e query usando Zod schemas
- **Middleware Tipado**: Sistema de middleware que preserva tipagem através das rotas
- **Documentação OpenAPI**: Geração automática de documentação OpenAPI/Swagger
- **Sistema de Grupos**: Organize rotas com prefixos e tags
- **Error Handling**: Sistema robusto de tratamento de erros com códigos HTTP
- **Express Compatible**: Totalmente compatível com Express.js

## 📦 Instalação

```bash
npm install nitro_router zod express
# ou
bun add nitro_router zod express
```

## 🎯 Uso Básico

### Criando um Router Simples

```typescript
import { RouteBuilder } from 'nitro_router'
import { z } from 'zod'
import express from 'express'

const app = express()
app.use(express.json())

// Criar uma instância do RouteBuilder
const routes = new RouteBuilder()

// Definir um schema para validação
const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
})

// Criar uma rota POST
routes.post(
  '/users',
  async (ctx, res) => {
    // ctx.body é automaticamente tipado como z.infer<typeof UserSchema>
    const user = ctx.body
    console.log(`Criando usuário: ${user.name} (${user.email})`)

    return { id: 1, ...user }
  },
  {
    body: UserSchema,
    summary: 'Criar um novo usuário',
    tags: ['Users'],
  }
)

// Criar uma rota GET com parâmetros
routes.get(
  '/users/:id',
  async (ctx, res) => {
    // ctx.params.id é automaticamente tipado como string
    const userId = ctx.params.id

    return { id: userId, name: 'João', email: 'joao@example.com' }
  },
  {
    summary: 'Buscar usuário por ID',
    tags: ['Users'],
  }
)

// Exportar o router para o Express
app.use('/api', routes.export())

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})
```

### Sistema de Middleware Tipado

```typescript
// Definir um middleware de autenticação
const authMiddleware = {
  middleware: async (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' })
    }
    next()
  },
  inject: (req) => ({
    user: { id: 1, name: 'Admin' },
  }),
}

// Usar o middleware no router
const protectedRoutes = new RouteBuilder().use(authMiddleware)

protectedRoutes.get(
  '/profile',
  async (ctx, res) => {
    // ctx.user está disponível e tipado automaticamente
    return { message: `Olá, ${ctx.user.name}!` }
  },
  {
    summary: 'Obter perfil do usuário',
    tags: ['Auth'],
  }
)
```

### Sistema de Grupos

```typescript
const api = new RouteBuilder({
  prefix: '/api/v1',
  tags: ['API v1'],
})

// Criar grupo de rotas de usuários
const userRoutes = api.group({
  prefix: '/users',
  tags: ['Users'],
})

// Criar grupo de rotas de produtos
const productRoutes = api.group({
  prefix: '/products',
  tags: ['Products'],
})

userRoutes.get(
  '/',
  async (ctx, res) => {
    return { users: [] }
  },
  { summary: 'Listar usuários' }
)

userRoutes.get(
  '/:id',
  async (ctx, res) => {
    return { id: ctx.params.id }
  },
  { summary: 'Buscar usuário' }
)

productRoutes.get(
  '/',
  async (ctx, res) => {
    return { products: [] }
  },
  { summary: 'Listar produtos' }
)

// Todas as rotas estarão disponíveis em:
// GET /api/v1/users
// GET /api/v1/users/:id
// GET /api/v1/products
```

### Validação de Query Parameters

```typescript
const SearchSchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

routes.get(
  '/search',
  async (ctx, res) => {
    // ctx.query é tipado automaticamente
    const { q, page, limit } = ctx.query

    return {
      query: q,
      page,
      limit,
      results: [],
    }
  },
  {
    query: SearchSchema,
    summary: 'Pesquisar itens',
    description: 'Endpoint para pesquisa com paginação',
  }
)
```

### Middleware Local (Por Rota)

```typescript
const validationMiddleware = {
  middleware: async (req, res, next) => {
    // Lógica de validação específica
    next()
  },
  inject: (req) => ({
    validated: true,
  }),
}

routes.post(
  '/special',
  async (ctx, res) => {
    // ctx.validated está disponível apenas nesta rota
    if (ctx.validated) {
      return { message: 'Dados validados!' }
    }
  },
  {
    injectContext: [validationMiddleware],
    summary: 'Endpoint especial com validação',
  }
)
```

## 📚 API Reference

### RouteBuilder

A classe principal para construir rotas.

#### Constructor

```typescript
new RouteBuilder<Ext>(options?: Partial<RouteConfig>)
```

**Opções:**

- `prefix`: Prefixo para todas as rotas
- `name`: Nome do grupo de rotas
- `tags`: Tags para documentação
- `router`: Instância do Router Express
- `middlewares`: Middlewares globais

#### Métodos

##### `use<MExt>(middleware: TypedMiddleware<MExt>)`

Adiciona um middleware tipado que será aplicado a todas as rotas subsequentes.

##### `group(options: Group)`

Cria um novo grupo de rotas com configurações específicas.

##### `get/post/put/patch/delete(path, handler, options?)`

Métodos para definir rotas HTTP com validação e tipagem automática.

##### `export()`

Retorna o router Express configurado.

### RouteOptions

Opções disponíveis para cada rota:

```typescript
{
  body?: ZodSchema,           // Schema para validação do body
  query?: ZodSchema,          // Schema para validação da query
  contentType?: string,       // Tipo de conteúdo (application/json | multipart/form-data)
  tags?: string[],           // Tags para documentação
  summary?: string,          // Resumo da rota
  description?: string,      // Descrição detalhada
  injectContext?: TypedMiddleware[]  // Middlewares específicos da rota
}
```

### TypedMiddleware

Interface para middlewares tipados:

```typescript
{
  middleware: (req, res, next) => unknown,  // Função middleware
  inject?: (req) => ExtensionObject        // Função para injetar dados no contexto
}
```

## 📖 Documentação OpenAPI

### Gerando Documentação

```typescript
import openApi from 'nitro_router/lib/docs'

// Gerar documentação OpenAPI
const documentation = openApi({
  openapi: '3.0.0',
  info: {
    title: 'Minha API',
    version: '1.0.0',
    description: 'Documentação da API',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor de desenvolvimento' }],
})

// Servir documentação via Swagger UI
import swaggerUi from 'swagger-ui-express'
app.use('/docs', swaggerUi.serve, swaggerUi.setup(documentation))
```

## 🔧 Tratamento de Erros

O Nitro Router inclui um sistema robusto de tratamento de erros:

```typescript
import { error } from 'nitro_router/lib/result'

routes.get('/error-example', async (ctx, res) => {
  if (!ctx.query.valid) {
    throw error('BAD_REQUEST', 'Parâmetro válido é obrigatório')
  }

  return { success: true }
})

// Middleware global de erro (Express)
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).json({
      error: err.message,
      details: err.details,
    })
  } else {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
```

## 🎨 Exemplos Avançados

### API Completa com Autenticação

```typescript
import { RouteBuilder } from 'nitro_router'
import { z } from 'zod'

// Middleware de autenticação
const authMiddleware = {
  middleware: async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      throw error('UNAUTHORIZED', 'Token de acesso requerido')
    }
    // Verificar token...
    next()
  },
  inject: (req) => ({
    user: { id: 1, email: 'user@example.com', role: 'admin' },
  }),
}

// Schemas
const CreatePostSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10),
  tags: z.array(z.string()).optional(),
})

const UpdatePostSchema = CreatePostSchema.partial()

const PostQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  tag: z.string().optional(),
})

// Router principal
const api = new RouteBuilder({
  prefix: '/api/v1',
  tags: ['Blog API'],
})

// Rotas públicas
const publicRoutes = api.group({
  prefix: '/posts',
  tags: ['Posts'],
})

// Rotas protegidas
const protectedRoutes = api.use(authMiddleware).group({
  prefix: '/posts',
  tags: ['Posts', 'Admin'],
})

// GET /api/v1/posts - Listar posts (público)
publicRoutes.get(
  '/',
  async (ctx, res) => {
    const { page, limit, tag } = ctx.query

    return {
      posts: [],
      pagination: { page, limit, total: 0 },
      filter: { tag },
    }
  },
  {
    query: PostQuerySchema,
    summary: 'Listar posts públicos',
    description: 'Retorna uma lista paginada de posts publicados',
  }
)

// GET /api/v1/posts/:id - Buscar post (público)
publicRoutes.get(
  '/:id',
  async (ctx, res) => {
    const postId = ctx.params.id

    return {
      id: postId,
      title: 'Exemplo de Post',
      content: 'Conteúdo do post...',
      author: 'Autor',
      createdAt: new Date().toISOString(),
    }
  },
  {
    summary: 'Buscar post por ID',
    description: 'Retorna os detalhes de um post específico',
  }
)

// POST /api/v1/posts - Criar post (protegido)
protectedRoutes.post(
  '/',
  async (ctx, res) => {
    const postData = ctx.body
    const user = ctx.user

    // Lógica para criar post...

    return {
      id: Date.now(),
      ...postData,
      author: user.email,
      createdAt: new Date().toISOString(),
    }
  },
  {
    body: CreatePostSchema,
    summary: 'Criar novo post',
    description: 'Cria um novo post (requer autenticação)',
  }
)

// PUT /api/v1/posts/:id - Atualizar post (protegido)
protectedRoutes.put(
  '/:id',
  async (ctx, res) => {
    const postId = ctx.params.id
    const updates = ctx.body
    const user = ctx.user

    return {
      id: postId,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    }
  },
  {
    body: UpdatePostSchema,
    summary: 'Atualizar post',
    description: 'Atualiza um post existente (requer autenticação)',
  }
)

// DELETE /api/v1/posts/:id - Deletar post (protegido)
protectedRoutes.delete(
  '/:id',
  async (ctx, res) => {
    const postId = ctx.params.id

    // Lógica para deletar...

    return { message: `Post ${postId} deletado com sucesso` }
  },
  {
    summary: 'Deletar post',
    description: 'Remove um post (requer autenticação)',
  }
)

// Usar no Express
app.use(api.export())
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adicionar nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Documentação do Zod](https://zod.dev/)
- [Express.js](https://expressjs.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript](https://www.typescriptlang.org/)
