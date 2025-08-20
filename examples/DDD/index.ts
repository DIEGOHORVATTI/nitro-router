import express from 'express'

import { NitroRouter, openApi, z } from '../../'

const app = express()
app.use(express.json())

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
    params: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({
      id: z.string(),
    }),
    tags: ['Users'],
  }
)

// Exportar o router para o Express
app.use(route.export())

// Configurar a documentação OpenAPI
// Gerar documentação OpenAPI
const documentation = openApi({
  openapi: '3.0.0',
  info: {
    title: 'Minha API',
    version: '1.0.0',
    description: 'Documentação da API',
  },
  servers: [{ url: 'http://localhost:8000', description: 'Servidor de desenvolvimento' }],
})

// Endpoint para retornar a documentação OpenAPI
app.get('/docs', (_, res) => {
  res.send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>API Docs</title>
  </head>
  <body>
    <div id="app"></div>

    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      const blob = new Blob([JSON.stringify(${JSON.stringify(documentation)})], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      Scalar.createApiReference('#app', { url });
    </script>
  </body>
</html>
  `)
})

const PORT = 8000
app.listen(PORT, () => {
  console.log(`
─────────────────────────୨ৎ────────────────────────
ྀི Server: http://localhost:${PORT}

𖤍 Documentation: http://localhost:${PORT}/api/docs
─────────────────────────୨ৎ────────────────────────
`)
})
