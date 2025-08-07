import express from 'express'
import { z } from 'zod'
import { NitroRouter } from '../src'
import { error } from '../src/lib/result'
import type { TypedMiddleware } from '../src'

const app = express()
app.use(express.json())

// ===== MIDDLEWARE DE AUTENTICAÇÃO =====

interface User {
  id: number
  email: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
}

const authMiddleware: TypedMiddleware<{ user: User }> = {
  middleware: async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw error('UNAUTHORIZED', 'Token de acesso requerido')
    }
    
    // Simular diferentes usuários baseado no token
    let user: User
    switch (token) {
      case 'admin-token':
        user = { id: 1, email: 'admin@example.com', role: 'ADMIN', isActive: true }
        break
      case 'user-token':
        user = { id: 2, email: 'user@example.com', role: 'USER', isActive: true }
        break
      case 'inactive-token':
        user = { id: 3, email: 'inactive@example.com', role: 'USER', isActive: false }
        break
      default:
        throw error('UNAUTHORIZED', 'Token inválido')
    }
    
    if (!user.isActive) {
      throw error('FORBIDDEN', 'Conta inativa')
    }
    
    next()
  },
  inject: (req) => {
    const token = req.headers.authorization?.replace('Bearer ', '')!
    
    switch (token) {
      case 'admin-token':
        return { user: { id: 1, email: 'admin@example.com', role: 'ADMIN' as const, isActive: true } }
      case 'user-token':
        return { user: { id: 2, email: 'user@example.com', role: 'USER' as const, isActive: true } }
      default:
        return { user: { id: 3, email: 'inactive@example.com', role: 'USER' as const, isActive: false } }
    }
  }
}

// ===== MIDDLEWARE DE AUTORIZAÇÃO =====

const adminOnlyMiddleware: TypedMiddleware<{}> = {
  middleware: async (req, res, next) => {
    const user = (req as any).user as User
    
    if (user.role !== 'ADMIN') {
      throw error('FORBIDDEN', 'Acesso restrito a administradores')
    }
    
    next()
  }
}

// ===== SCHEMAS =====

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
})

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional()
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
})

// ===== ROTAS DE AUTENTICAÇÃO (PÚBLICAS) =====

const authRouter = new NitroRouter().group({ 
  prefix: '/auth', 
  tags: ['Authentication'] 
})

// POST /auth/login
authRouter.post('/login', async (ctx, res) => {
  const { email, password } = ctx.body
  
  console.log(`🔐 Tentativa de login: ${email}`)
  
  // Simular verificação de credenciais
  const users = {
    'admin@example.com': { password: 'admin123', token: 'admin-token', role: 'ADMIN' },
    'user@example.com': { password: 'user123', token: 'user-token', role: 'USER' }
  }
  
  const user = users[email as keyof typeof users]
  
  if (!user || user.password !== password) {
    throw error('UNAUTHORIZED', 'Credenciais inválidas')
  }
  
  // Simular criação de cookie (em produção, usar httpOnly)
  res.cookie('token', user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  })
  
  return {
    message: 'Login realizado com sucesso',
    user: {
      email,
      role: user.role,
      token: user.token // Em produção, não retornar o token
    }
  }
}, {
  body: LoginSchema,
  summary: 'Fazer login',
  description: 'Autentica o usuário e retorna um token'
})

// POST /auth/register
authRouter.post('/register', async (ctx, res) => {
  const { email, password, name } = ctx.body
  
  console.log(`📝 Registro de usuário: ${email}`)
  
  // Simular verificação se usuário já existe
  const existingUsers = ['admin@example.com', 'user@example.com']
  
  if (existingUsers.includes(email)) {
    throw error('CONFLICT', 'Email já está em uso')
  }
  
  const newUser = {
    id: Date.now(),
    email,
    name,
    role: 'USER' as const,
    isActive: true,
    createdAt: new Date().toISOString()
  }
  
  return {
    message: 'Usuário registrado com sucesso',
    user: newUser
  }
}, {
  body: RegisterSchema,
  summary: 'Registrar usuário',
  description: 'Cria uma nova conta de usuário'
})

// POST /auth/logout
authRouter.post('/logout', async (ctx, res) => {
  console.log('👋 Logout realizado')
  
  res.clearCookie('token')
  
  return { message: 'Logout realizado com sucesso' }
}, {
  summary: 'Fazer logout',
  description: 'Invalida a sessão do usuário'
})

// ===== ROTAS DE USUÁRIO (PROTEGIDAS) =====

const userRouter = new NitroRouter()
  .use(authMiddleware)
  .group({ 
    prefix: '/user', 
    tags: ['User Management'] 
  })

// GET /user/me - Dados do usuário atual
userRouter.get('/me', async (ctx, res) => {
  const { user } = ctx
  
  console.log(`👤 Usuário ${user.email} acessando próprio perfil`)
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLogin: new Date().toISOString()
  }
}, {
  summary: 'Meu perfil',
  description: 'Retorna os dados do usuário autenticado'
})

// PUT /user/me - Atualizar dados do usuário
userRouter.put('/me', async (ctx, res) => {
  const { user, body } = ctx
  
  console.log(`✏️ Usuário ${user.email} atualizando perfil`)
  
  // Usuário comum não pode alterar role ou isActive
  const allowedUpdates = { ...body }
  if (user.role !== 'ADMIN') {
    delete allowedUpdates.role
    delete allowedUpdates.isActive
  }
  
  return {
    message: 'Perfil atualizado com sucesso',
    user: {
      ...user,
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    }
  }
}, {
  body: UpdateUserSchema,
  summary: 'Atualizar perfil',
  description: 'Atualiza os dados do usuário autenticado'
})

// POST /user/change-password - Alterar senha
userRouter.post('/change-password', async (ctx, res) => {
  const { user, body } = ctx
  const { currentPassword, newPassword } = body
  
  console.log(`🔑 Usuário ${user.email} alterando senha`)
  
  // Simular verificação da senha atual
  // Em produção, comparar hash da senha
  
  return {
    message: 'Senha alterada com sucesso',
    changedAt: new Date().toISOString()
  }
}, {
  body: ChangePasswordSchema,
  summary: 'Alterar senha',
  description: 'Altera a senha do usuário'
})

// ===== ROTAS ADMINISTRATIVAS =====

const adminRouter = new NitroRouter()
  .use(authMiddleware)
  .use(adminOnlyMiddleware)
  .group({ 
    prefix: '/admin/users', 
    tags: ['Admin', 'User Management'] 
  })

// GET /admin/users - Listar todos os usuários
adminRouter.get('/', async (ctx, res) => {
  const { user } = ctx
  
  console.log(`👨‍💼 Admin ${user.email} listando usuários`)
  
  const users = [
    { id: 1, email: 'admin@example.com', role: 'ADMIN', isActive: true },
    { id: 2, email: 'user@example.com', role: 'USER', isActive: true },
    { id: 3, email: 'inactive@example.com', role: 'USER', isActive: false }
  ]
  
  return {
    users,
    total: users.length,
    timestamp: new Date().toISOString()
  }
}, {
  summary: 'Listar usuários (Admin)',
  description: 'Lista todos os usuários do sistema (apenas administradores)'
})

// GET /admin/users/:id - Buscar usuário específico
adminRouter.get('/:id', async (ctx, res) => {
  const { user, params } = ctx
  const userId = parseInt(params.id)
  
  console.log(`👨‍💼 Admin ${user.email} buscando usuário ${userId}`)
  
  const targetUser = {
    id: userId,
    email: 'user@example.com',
    role: 'USER',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: '2025-01-07T10:00:00Z'
  }
  
  return targetUser
}, {
  summary: 'Buscar usuário (Admin)',
  description: 'Retorna dados de um usuário específico'
})

// PUT /admin/users/:id - Atualizar usuário
adminRouter.put('/:id', async (ctx, res) => {
  const { user, params, body } = ctx
  const userId = parseInt(params.id)
  
  console.log(`👨‍💼 Admin ${user.email} atualizando usuário ${userId}`)
  
  return {
    message: `Usuário ${userId} atualizado com sucesso`,
    updatedBy: user.email,
    updates: body,
    updatedAt: new Date().toISOString()
  }
}, {
  body: UpdateUserSchema,
  summary: 'Atualizar usuário (Admin)',
  description: 'Atualiza qualquer usuário do sistema'
})

// DELETE /admin/users/:id - Deletar usuário
adminRouter.delete('/:id', async (ctx, res) => {
  const { user, params } = ctx
  const userId = parseInt(params.id)
  
  if (userId === user.id) {
    throw error('BAD_REQUEST', 'Não é possível deletar sua própria conta')
  }
  
  console.log(`👨‍💼 Admin ${user.email} deletando usuário ${userId}`)
  
  return {
    message: `Usuário ${userId} deletado com sucesso`,
    deletedBy: user.email,
    deletedAt: new Date().toISOString()
  }
}, {
  summary: 'Deletar usuário (Admin)',
  description: 'Remove um usuário do sistema'
})

// ===== CONFIGURAÇÃO DO EXPRESS =====

const api = new NitroRouter({ prefix: '/api/v1' })

app.use(authRouter.export())
app.use(userRouter.export())
app.use(adminRouter.export())

// Página inicial com instruções
app.get('/', (req, res) => {
  res.json({
    message: 'API de Autenticação e Autorização - Nitro Router',
    endpoints: {
      public: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        logout: 'POST /auth/logout'
      },
      user: {
        profile: 'GET /user/me',
        updateProfile: 'PUT /user/me',
        changePassword: 'POST /user/change-password'
      },
      admin: {
        listUsers: 'GET /admin/users',
        getUser: 'GET /admin/users/:id',
        updateUser: 'PUT /admin/users/:id',
        deleteUser: 'DELETE /admin/users/:id'
      }
    },
    credentials: {
      admin: { email: 'admin@example.com', password: 'admin123', token: 'admin-token' },
      user: { email: 'user@example.com', password: 'user123', token: 'user-token' }
    }
  })
})

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro:', err.message)
  
  const status = err.status || 500
  res.status(status).json({
    error: err.message,
    timestamp: new Date().toISOString(),
    path: req.path
  })
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`🚀 API de Auth rodando na porta ${PORT}`)
  console.log(`📋 Teste os endpoints:`)
  console.log(`   POST http://localhost:${PORT}/auth/login`)
  console.log(`   POST http://localhost:${PORT}/auth/register`)
  console.log(`   GET  http://localhost:${PORT}/user/me (com token)`)
  console.log(`   GET  http://localhost:${PORT}/admin/users (admin only)`)
  console.log(``)
  console.log(`🔑 Credenciais de teste:`)
  console.log(`   Admin: admin@example.com / admin123`)
  console.log(`   User:  user@example.com / user123`)
})

export default app
