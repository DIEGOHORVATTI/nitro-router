import express from 'express'

import { NitroRouter, z } from '../../src'

import apiDocumentationHTML from './core/utils/apiDocumentationHTML'
import errorHandler from './core/infra/http/middleware/errorHandler'

const app = express()
app.use(express.json())

const PORT = 8000
const url = `http://localhost:${PORT}`

// Criar uma instância do NitroRouter
const route = new NitroRouter()

route.get(
  '/',
  () => {
    return { message: 'Bem-vindo à API!' }
  },
  {
    summary: 'Página inicial',
    tags: ['Home'],
  }
)

// Criar uma rota POST
// ctx.body é automaticamente tipado como z.infer<typeof UserSchema>
route.post(
  '/users',
  async ({ body: { name, email } }) => {
    console.log(`Criando usuário: ${name} (${email})`)

    return { id: 1, name, email }
  },
  {
    body: z.object({
      name: z.string().min(2),
      email: z.email(),
      age: z.number().min(18),
    }),
    summary: 'Criar um novo usuário',
    tags: ['Users'],
  }
)

// Criar uma rota GET com parâmetros
// ctx.params.id é automaticamente tipado como string
route.get(
  '/users/:id',
  async ({ params: { id } }) => {
    return { id, name: 'João', email: 'joao@example.com' }
  },
  {
    summary: 'Buscar usuário por ID',
    tags: ['Users'],
  }
)

// Exportar o router para o Express
app.use(route.export())

app.use(errorHandler)

app.get('/docs', (_, res) => {
  res.send(
    apiDocumentationHTML({
      openapi: '3.0.0',
      info: {
        title: 'Minha API',
        version: '1.0.0',
        description: 'Documentação da API',
      },
      servers: [{ url, description: 'Servidor de desenvolvimento' }],
    })
  )
})

app.listen(PORT, () => {
  console.log(`
───────────────────────────୨ৎ────────────────────────
𖤍 Server: ${url}

𖤍 Documentation: ${url}/docs
───────────────────────────୨ৎ────────────────────────
`)
})
