import express from 'express'
import { z } from 'zod'

import { NitroRouter, error, type TypedMiddleware } from '../dist'

const app = express()
app.use(express.json())

// ===== SIMULAÇÃO DE MIDDLEWARE DE UPLOAD =====

// Simulando multer para o exemplo
const simulateMulterFile = (): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'example.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('fake-file-content'),
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
})

// Middleware de upload simulado
const uploadMiddleware: TypedMiddleware<{ file: Express.Multer.File }> = {
  middleware: async (req, res, next) => {
    // Simular validação de arquivo
    const contentType = req.headers['content-type']

    if (!contentType?.includes('multipart/form-data')) {
      throw error('BAD_REQUEST', 'Content-Type deve ser multipart/form-data')
    }

    console.log('📁 Processando upload de arquivo...')
    next()
  },
  inject: (req) => ({
    file: simulateMulterFile(),
  }),
}

// ===== MIDDLEWARES DE AUTENTICAÇÃO =====

const authMiddleware: TypedMiddleware<{ user: { id: number; email: string } }> = {
  middleware: async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw error('UNAUTHORIZED', 'Token de acesso requerido')
    }

    if (token !== 'valid-token') {
      throw error('UNAUTHORIZED', 'Token inválido')
    }

    next()
  },
  inject: (req) => ({
    user: { id: 1, email: 'user@example.com' },
  }),
}

// ===== SCHEMAS =====

const FileUploadSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo é obrigatório'),
  description: z.string().optional(),
  folder: z.string().optional(),
  isPublic: z.boolean().default(false),
})

const FileQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  folder: z.string().optional(),
  type: z.enum(['image', 'document', 'all']).default('all'),
})

const ShareFileSchema = z.object({
  targetUserEmail: z.string().email('Email inválido'),
  permission: z.enum(['read', 'write']).default('read'),
})

// ===== ROUTER DE ARQUIVOS =====

const fileRouter = new NitroRouter().use(authMiddleware).group({
  prefix: '/files',
  tags: ['Files'],
})

// POST /files - Upload de arquivo
fileRouter.post(
  '/',
  async (ctx, res) => {
    const { body, file, user } = ctx

    console.log(`📤 Usuário ${user.email} fazendo upload: ${file.originalname}`)

    // Simular salvamento do arquivo
    const savedFile = {
      id: Date.now(),
      name: body.name,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      description: body.description,
      folder: body.folder || 'root',
      isPublic: body.isPublic,
      owner: user.email,
      url: `/files/${Date.now()}-${file.originalname}`,
      createdAt: new Date().toISOString(),
    }

    return {
      message: 'Arquivo enviado com sucesso',
      file: savedFile,
    }
  },
  {
    body: FileUploadSchema,
    contentType: 'multipart/form-data',
    summary: 'Upload de arquivo',
    description: 'Faz upload de um arquivo para o servidor',
    injectContext: [uploadMiddleware],
  }
)

// GET /files - Listar arquivos do usuário
fileRouter.get(
  '/',
  async (ctx, res) => {
    const { query, user } = ctx
    const { page, limit, folder, type } = query

    console.log(`📋 Usuário ${user.email} listando arquivos`)

    // Simular busca de arquivos
    let files = [
      {
        id: 1,
        name: 'documento.pdf',
        folder: 'documents',
        mimetype: 'application/pdf',
        owner: user.email,
      },
      { id: 2, name: 'foto.jpg', folder: 'images', mimetype: 'image/jpeg', owner: user.email },
      {
        id: 3,
        name: 'planilha.xlsx',
        folder: 'documents',
        mimetype: 'application/vnd.ms-excel',
        owner: user.email,
      },
    ]

    // Filtrar por pasta
    if (folder) {
      files = files.filter((f) => f.folder === folder)
    }

    // Filtrar por tipo
    if (type !== 'all') {
      files = files.filter((f) => {
        if (type === 'image') return f.mimetype.startsWith('image/')
        if (type === 'document')
          return (
            f.mimetype.includes('pdf') ||
            f.mimetype.includes('excel') ||
            f.mimetype.includes('word')
          )
        return true
      })
    }

    return {
      files: files.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: files.length },
      filters: { folder, type },
    }
  },
  {
    query: FileQuerySchema,
    summary: 'Listar arquivos',
    description: 'Lista todos os arquivos do usuário com filtros opcionais',
  }
)

// GET /files/:id - Buscar arquivo específico
fileRouter.get(
  '/:id',
  async (ctx, res) => {
    const { params, user } = ctx
    const fileId = parseInt(params.id)

    console.log(`🔍 Usuário ${user.email} buscando arquivo ${fileId}`)

    const file = {
      id: fileId,
      name: 'exemplo.pdf',
      originalName: 'documento-exemplo.pdf',
      size: 2048,
      mimetype: 'application/pdf',
      folder: 'documents',
      isPublic: false,
      owner: user.email,
      url: `/files/${fileId}-exemplo.pdf`,
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    }

    return file
  },
  {
    summary: 'Buscar arquivo por ID',
    description: 'Retorna informações detalhadas de um arquivo específico',
  }
)

// PUT /files/:id - Atualizar informações do arquivo
fileRouter.put(
  '/:id',
  async (ctx, res) => {
    const { params, body, user } = ctx
    const fileId = parseInt(params.id)

    console.log(`✏️ Usuário ${user.email} atualizando arquivo ${fileId}`)

    const updatedFile = {
      id: fileId,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    }

    return {
      message: 'Arquivo atualizado com sucesso',
      file: updatedFile,
    }
  },
  {
    body: FileUploadSchema.partial(),
    summary: 'Atualizar arquivo',
    description: 'Atualiza as informações de um arquivo',
  }
)

// DELETE /files/:id - Deletar arquivo
fileRouter.delete(
  '/:id',
  async (ctx, res) => {
    const { params, user } = ctx
    const fileId = parseInt(params.id)

    console.log(`🗑️ Usuário ${user.email} deletando arquivo ${fileId}`)

    return {
      message: `Arquivo ${fileId} deletado com sucesso`,
      deletedAt: new Date().toISOString(),
      deletedBy: user.email,
    }
  },
  {
    summary: 'Deletar arquivo',
    description: 'Remove um arquivo do sistema',
  }
)

// POST /files/:id/share - Compartilhar arquivo
fileRouter.post(
  '/:id/share',
  async (ctx, res) => {
    const { params, body, user } = ctx
    const fileId = parseInt(params.id)

    console.log(
      `🤝 Usuário ${user.email} compartilhando arquivo ${fileId} com ${body.targetUserEmail}`
    )

    return {
      message: 'Arquivo compartilhado com sucesso',
      share: {
        fileId,
        sharedBy: user.email,
        sharedWith: body.targetUserEmail,
        permission: body.permission,
        sharedAt: new Date().toISOString(),
      },
    }
  },
  {
    body: ShareFileSchema,
    summary: 'Compartilhar arquivo',
    description: 'Compartilha um arquivo com outro usuário',
  }
)

// DELETE /files/:id/share/:targetUserId - Remover compartilhamento
fileRouter.delete(
  '/:id/share/:targetUserId',
  async (ctx, res) => {
    const { params, user } = ctx
    const fileId = parseInt(params.id)
    const targetUserId = parseInt(params.targetUserId)

    console.log(`❌ Usuário ${user.email} removendo compartilhamento do arquivo ${fileId}`)

    return {
      message: 'Compartilhamento removido com sucesso',
      fileId,
      targetUserId,
      removedBy: user.email,
      removedAt: new Date().toISOString(),
    }
  },
  {
    summary: 'Remover compartilhamento',
    description: 'Remove o compartilhamento de um arquivo',
  }
)

// ===== CONFIGURAÇÃO DO EXPRESS =====

app.use('/api', fileRouter.export())

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro:', err.message)

  const status = err.status || 500
  const message = err.message || 'Erro interno do servidor'

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  })
})

// Rota para testar upload
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gerenciamento de Arquivos',
    endpoints: {
      upload: 'POST /api/files',
      list: 'GET /api/files',
      get: 'GET /api/files/:id',
      update: 'PUT /api/files/:id',
      delete: 'DELETE /api/files/:id',
      share: 'POST /api/files/:id/share',
      unshare: 'DELETE /api/files/:id/share/:targetUserId',
    },
    authentication: 'Bearer valid-token',
  })
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`🚀 API de Arquivos rodando na porta ${PORT}`)
  console.log(`📋 Endpoints disponíveis:`)
  console.log(`   GET  / - Informações da API`)
  console.log(`   POST /api/files - Upload de arquivo`)
  console.log(`   GET  /api/files - Listar arquivos`)
  console.log(`   GET  /api/files/:id - Buscar arquivo`)
  console.log(`   PUT  /api/files/:id - Atualizar arquivo`)
  console.log(`   DEL  /api/files/:id - Deletar arquivo`)
  console.log(`   POST /api/files/:id/share - Compartilhar`)
  console.log(`   DEL  /api/files/:id/share/:userId - Remover compartilhamento`)
  console.log(``)
  console.log(`🔑 Use: Authorization: Bearer valid-token`)
})

export default app
