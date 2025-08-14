import express from 'express'
import { z } from 'zod'

import { NitroRouter } from '../dist'

const app = express()
app.use(express.json())

// Criar uma instância do NitroRouter
const router = new NitroRouter()

// Schema para validação de usuário
const UserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Idade mínima é 18 anos'),
})

const UserQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
})

// GET /users - Listar usuários com paginação
router.get(
  '/users',
  async (ctx, res) => {
    const { page, limit, search } = ctx.query

    // Simular busca no banco de dados
    const users = [
      { id: 1, name: 'João Silva', email: 'joao@example.com', age: 25 },
      { id: 2, name: 'Maria Santos', email: 'maria@example.com', age: 30 },
    ]

    const filteredUsers = search
      ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
      : users

    return {
      users: filteredUsers.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / limit),
      },
    }
  },
  {
    query: UserQuerySchema,
    summary: 'Listar usuários',
    description: 'Retorna uma lista paginada de usuários com busca opcional',
    tags: ['Users'],
  }
)

// GET /users/:id - Buscar usuário por ID
router.get(
  '/users/:id',
  async (ctx, res) => {
    const userId = parseInt(ctx.params.id)

    // Simular busca no banco
    const user = { id: userId, name: 'João Silva', email: 'joao@example.com', age: 25 }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return user
  },
  {
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico',
    tags: ['Users'],
  }
)

// POST /users - Criar usuário
router.post(
  '/users',
  async (ctx, res) => {
    const userData = ctx.body

    // Simular criação no banco
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    }

    return newUser
  },
  {
    body: UserSchema,
    summary: 'Criar usuário',
    description: 'Cria um novo usuário no sistema',
    tags: ['Users'],
  }
)

// PUT /users/:id - Atualizar usuário
router.put(
  '/users/:id',
  async (ctx, res) => {
    const userId = parseInt(ctx.params.id)
    const updates = ctx.body

    // Simular atualização
    const updatedUser = {
      id: userId,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return updatedUser
  },
  {
    body: UserSchema.partial(),
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente',
    tags: ['Users'],
  }
)

// DELETE /users/:id - Deletar usuário
router.delete(
  '/users/:id',
  async (ctx, res) => {
    const userId = parseInt(ctx.params.id)

    // Simular deleção
    return {
      message: `Usuário ${userId} deletado com sucesso`,
      deletedAt: new Date().toISOString(),
    }
  },
  {
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema',
    tags: ['Users'],
  }
)

// Usar o router no Express
app.use('/api', router.export())

// Iniciar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Acesse: http://localhost:${PORT}/api/users`)
})

export default app
