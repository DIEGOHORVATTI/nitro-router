import express from 'express'
import { z } from 'zod'

import { NitroRouter, type TypedMiddleware } from '../dist'

const app = express()
app.use(express.json())

// ===== MIDDLEWARES =====

// Middleware de autenticação
const authMiddleware: TypedMiddleware<{ user: { id: number; email: string; role: string } }> = {
  middleware: async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' })
    }

    // Simular validação de token
    if (token !== 'valid-token') {
      return res.status(401).json({ error: 'Token inválido' })
    }

    next()
  },
  inject: (req) => ({
    user: { id: 1, email: 'admin@example.com', role: 'admin' },
  }),
}

// Middleware de log
const logMiddleware: TypedMiddleware<{ requestId: string }> = {
  middleware: async (req, res, next) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[${requestId}] ${req.method} ${req.path}`)
    next()
  },
  inject: (req) => ({
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }),
}

// Middleware de validação de role
const adminMiddleware: TypedMiddleware<{}> = {
  middleware: async (req, res, next) => {
    const user = (req as any).user

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
    }

    next()
  },
}

// ===== SCHEMAS =====

const PostSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false),
})

const PostQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  tag: z.string().optional(),
  published: z.coerce.boolean().optional(),
})

// ===== ROUTERS =====

// Router principal com middleware global
const api = new NitroRouter({
  prefix: '/api/v1',
  tags: ['Blog API'],
}).use(logMiddleware)

// Rotas públicas
const publicRoutes = api.group({
  prefix: '/posts',
  tags: ['Posts', 'Public'],
})

// Rotas protegidas (com autenticação)
const protectedRoutes = api.use(authMiddleware).group({
  prefix: '/posts',
  tags: ['Posts', 'Protected'],
})

// Rotas admin (com autenticação + role admin)
const adminRoutes = api
  .use(authMiddleware)
  .use(adminMiddleware)
  .group({
    prefix: '/admin/posts',
    tags: ['Posts', 'Admin'],
  })

// ===== ROTAS PÚBLICAS =====

// GET /api/v1/posts - Listar posts públicos
publicRoutes.get(
  '/',
  async (ctx, res) => {
    const { page, limit, tag, published } = ctx.query
    const { requestId } = ctx

    console.log(`[${requestId}] Buscando posts públicos`)

    // Simular busca no banco
    const posts = [
      { id: 1, title: 'Post Público 1', content: 'Conteúdo...', published: true, tags: ['tech'] },
      { id: 2, title: 'Post Público 2', content: 'Conteúdo...', published: true, tags: ['news'] },
    ]

    let filteredPosts = posts.filter((p) => published === undefined || p.published === published)

    if (tag) {
      filteredPosts = filteredPosts.filter((p) => p.tags.includes(tag))
    }

    return {
      posts: filteredPosts.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: filteredPosts.length },
      filter: { tag, published },
    }
  },
  {
    query: PostQuerySchema,
    summary: 'Listar posts públicos',
    description: 'Retorna uma lista paginada de posts publicados',
  }
)

// GET /api/v1/posts/:id - Buscar post público
publicRoutes.get(
  '/:id',
  async (ctx, res) => {
    const postId = parseInt(ctx.params.id)
    const { requestId } = ctx

    console.log(`[${requestId}] Buscando post ${postId}`)

    const post = {
      id: postId,
      title: 'Post Exemplo',
      content: 'Conteúdo do post...',
      author: 'Autor Exemplo',
      published: true,
      createdAt: new Date().toISOString(),
    }

    return post
  },
  {
    summary: 'Buscar post por ID',
    description: 'Retorna os detalhes de um post específico',
  }
)

// ===== ROTAS PROTEGIDAS =====

// POST /api/v1/posts - Criar post (requer autenticação)
protectedRoutes.post(
  '/',
  async (ctx, res) => {
    const postData = ctx.body
    const { user, requestId } = ctx

    console.log(`[${requestId}] Usuário ${user.email} criando post`)

    const newPost = {
      id: Date.now(),
      ...postData,
      author: user.email,
      createdAt: new Date().toISOString(),
    }

    return newPost
  },
  {
    body: PostSchema,
    summary: 'Criar novo post',
    description: 'Cria um novo post (requer autenticação)',
  }
)

// PUT /api/v1/posts/:id - Atualizar post
protectedRoutes.put(
  '/:id',
  async (ctx, res) => {
    const postId = parseInt(ctx.params.id)
    const updates = ctx.body
    const { user, requestId } = ctx

    console.log(`[${requestId}] Usuário ${user.email} atualizando post ${postId}`)

    return {
      id: postId,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    }
  },
  {
    body: PostSchema.partial(),
    summary: 'Atualizar post',
    description: 'Atualiza um post existente (requer autenticação)',
  }
)

// ===== ROTAS ADMIN =====

// GET /api/v1/admin/posts - Listar todos os posts (incluindo não publicados)
adminRoutes.get(
  '/',
  async (ctx, res) => {
    const { page, limit } = ctx.query || { page: 1, limit: 10 }
    const { user, requestId } = ctx

    console.log(`[${requestId}] Admin ${user.email} listando todos os posts`)

    const allPosts = [
      { id: 1, title: 'Post 1', published: true, author: 'user1@example.com' },
      { id: 2, title: 'Post 2', published: false, author: 'user2@example.com' },
      { id: 3, title: 'Post 3', published: true, author: 'user3@example.com' },
    ]

    return {
      posts: allPosts.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: allPosts.length },
      message: 'Lista completa (incluindo não publicados)',
    }
  },
  {
    query: PostQuerySchema.omit({ published: true }), // Admin pode ver todos
    summary: 'Listar todos os posts (Admin)',
    description: 'Lista todos os posts, incluindo não publicados (apenas admin)',
  }
)

// DELETE /api/v1/admin/posts/:id - Deletar post (apenas admin)
adminRoutes.delete(
  '/:id',
  async (ctx, res) => {
    const postId = parseInt(ctx.params.id)
    const { user, requestId } = ctx

    console.log(`[${requestId}] Admin ${user.email} deletando post ${postId}`)

    return {
      message: `Post ${postId} deletado com sucesso`,
      deletedBy: user.email,
      deletedAt: new Date().toISOString(),
    }
  },
  {
    summary: 'Deletar post (Admin)',
    description: 'Remove um post do sistema (apenas administradores)',
  }
)

// ===== CONFIGURAÇÃO DO EXPRESS =====

app.use(api.export())

// Middleware de erro global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(err.details && { details: err.details }),
  })
})

// Iniciar servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📝 Rotas disponíveis:`)
  console.log(`   GET  http://localhost:${PORT}/api/v1/posts`)
  console.log(`   GET  http://localhost:${PORT}/api/v1/posts/:id`)
  console.log(`   POST http://localhost:${PORT}/api/v1/posts (com token)`)
  console.log(`   PUT  http://localhost:${PORT}/api/v1/posts/:id (com token)`)
  console.log(`   GET  http://localhost:${PORT}/api/v1/admin/posts (admin)`)
  console.log(`   DEL  http://localhost:${PORT}/api/v1/admin/posts/:id (admin)`)
  console.log(``)
  console.log(`🔑 Para testar rotas protegidas, use:`)
  console.log(`   Authorization: Bearer valid-token`)
})

export default app
