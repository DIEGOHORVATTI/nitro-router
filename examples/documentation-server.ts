import express from 'express'

import { openApi } from '../dist'

const app = express()
app.use(express.json())

// ===== IMPORTAR TODOS OS EXEMPLOS =====

// Importar os routers dos exemplos (sem iniciar os servidores)
import basicApp from './basic-usage'
import middlewareApp from './middleware-example'
import fileApp from './file-upload-example'
import authApp from './auth-example'

// ===== CRIAR DOCUMENTAÇÃO =====

const documentation = openApi({
  openapi: '3.0.0',
  info: {
    title: 'Nitro Router - API Examples',
    version: '1.0.0',
    description: `
# Nitro Router Examples API

Esta documentação foi gerada automaticamente usando as rotas definidas com Nitro Router.

## Recursos Demonstrados

### 🔧 Básico
- Validação automática com Zod
- Tipagem TypeScript completa
- Rotas HTTP padrão (GET, POST, PUT, DELETE)
- Documentação OpenAPI automática

### 🛡️ Middleware
- Sistema de middleware tipado
- Autenticação e autorização
- Logs e validações personalizadas
- Composição de middlewares

### 📁 Upload de Arquivos
- Middleware de upload integrado
- Validação de tipos de arquivo
- Gerenciamento de permissões
- Compartilhamento de arquivos

### 🔐 Autenticação
- Sistema completo de auth
- Diferentes níveis de acesso
- Gestão de usuários
- Rotas administrativas

## Como Usar

1. Instale as dependências: \`npm install nitro-router zod express\`
2. Import a biblioteca: \`import { NitroRouter } from 'nitro-router'\`
3. Crie suas rotas tipadas
4. Gere documentação automática

## Links Úteis

- [GitHub Repository](https://github.com/DIEGOHORVATTI/nitro-router)
- [NPM Package](https://www.npmjs.com/package/nitro-router)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod Validation](https://zod.dev/)
    `,
    contact: {
      name: 'Diego Horvatti',
      url: 'https://github.com/DIEGOHORVATTI',
      email: 'diego@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento',
    },
    {
      url: 'https://api.example.com',
      description: 'Servidor de produção',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'Operações relacionadas a usuários',
    },
    {
      name: 'Posts',
      description: 'Gerenciamento de posts do blog',
    },
    {
      name: 'Files',
      description: 'Upload e gerenciamento de arquivos',
    },
    {
      name: 'Authentication',
      description: 'Sistema de autenticação',
    },
    {
      name: 'Admin',
      description: 'Rotas administrativas',
    },
  ],
})

// ===== SERVIDOR DE DOCUMENTAÇÃO =====

app.get('/', (req, res) => {
  res.json({
    title: '📚 Nitro Router - Examples & Documentation',
    description: 'Exemplos completos da biblioteca Nitro Router',
    version: '1.0.0',
    author: 'Diego Horvatti',
    links: {
      documentation: '/docs',
      openapi: '/openapi.json',
      examples: {
        basic: 'http://localhost:3000 - Uso básico',
        middleware: 'http://localhost:3001 - Sistema de middleware',
        files: 'http://localhost:3002 - Upload de arquivos',
        auth: 'http://localhost:3003 - Autenticação e autorização',
      },
    },
    features: [
      '✅ Type Safety completo',
      '✅ Validação automática com Zod',
      '✅ Middleware tipado',
      '✅ Documentação OpenAPI',
      '✅ Sistema de grupos',
      '✅ Tratamento de erros',
      '✅ Upload de arquivos',
      '✅ Autenticação JWT',
      '✅ Autorização por roles',
    ],
  })
})

// Endpoint para retornar a documentação OpenAPI
app.get('/openapi.json', (req, res) => {
  res.json(documentation)
})

// Página de documentação Swagger
app.get('/docs', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Nitro Router - API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #3b4151; }
    .swagger-ui .scheme-container { background: #fff; box-shadow: 0 1px 2px 0 rgba(0,0,0,.15); }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        filter: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        onComplete: function() {
          console.log('Swagger UI carregado com sucesso!');
        }
      });
    };
  </script>
</body>
</html>
  `)
})

// Informações sobre cada exemplo
app.get('/examples', (req, res) => {
  res.json({
    examples: [
      {
        name: 'Uso Básico',
        description: 'CRUD simples de usuários com validação',
        port: 3000,
        file: 'basic-usage.ts',
        endpoints: [
          'GET /api/users - Listar usuários',
          'GET /api/users/:id - Buscar usuário',
          'POST /api/users - Criar usuário',
          'PUT /api/users/:id - Atualizar usuário',
          'DELETE /api/users/:id - Deletar usuário',
        ],
      },
      {
        name: 'Sistema de Middleware',
        description: 'Middleware tipado, autenticação e autorização',
        port: 3001,
        file: 'middleware-example.ts',
        endpoints: [
          'GET /api/v1/posts - Posts públicos',
          'POST /api/v1/posts - Criar post (auth)',
          'GET /api/v1/admin/posts - Todos posts (admin)',
          'DELETE /api/v1/admin/posts/:id - Deletar (admin)',
        ],
      },
      {
        name: 'Upload de Arquivos',
        description: 'Sistema completo de gerenciamento de arquivos',
        port: 3002,
        file: 'file-upload-example.ts',
        endpoints: [
          'POST /api/files - Upload de arquivo',
          'GET /api/files - Listar arquivos',
          'POST /api/files/:id/share - Compartilhar',
          'DELETE /api/files/:id - Deletar arquivo',
        ],
      },
      {
        name: 'Autenticação Completa',
        description: 'Sistema de auth com diferentes níveis de acesso',
        port: 3003,
        file: 'auth-example.ts',
        endpoints: [
          'POST /auth/login - Fazer login',
          'POST /auth/register - Registrar',
          'GET /user/me - Meu perfil',
          'GET /admin/users - Listar usuários (admin)',
        ],
      },
    ],
    instructions: {
      run: 'Para executar um exemplo: npm run dev examples/<file>',
      test: 'Use Postman, Insomnia ou curl para testar os endpoints',
      auth: 'Para rotas protegidas use: Authorization: Bearer <token>',
    },
  })
})

// Tutorial interativo
app.get('/tutorial', (req, res) => {
  res.json({
    tutorial: {
      step1: {
        title: '1. Instalação',
        code: 'npm install nitro-router zod express @types/express',
        description: 'Instale as dependências necessárias',
      },
      step2: {
        title: '2. Import básico',
        code: `import { NitroRouter } from 'nitro-router'
import { z } from 'zod'
import express from 'express'`,
        description: 'Importe as bibliotecas necessárias',
      },
      step3: {
        title: '3. Criar router',
        code: `const router = new NitroRouter()
const app = express()
app.use(express.json())`,
        description: 'Crie uma instância do router e configure o Express',
      },
      step4: {
        title: '4. Definir schema',
        code: `const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})`,
        description: 'Defina schemas de validação com Zod',
      },
      step5: {
        title: '5. Criar rota',
        code: `router.post('/users', async (ctx, res) => {
  return { id: 1, ...ctx.body }
}, {
  body: UserSchema,
  summary: 'Criar usuário'
})`,
        description: 'Crie rotas tipadas com validação automática',
      },
      step6: {
        title: '6. Usar no Express',
        code: `app.use('/api', router.export())
app.listen(3000)`,
        description: 'Integre o router ao Express e inicie o servidor',
      },
    },
    nextSteps: [
      'Veja os exemplos em /examples',
      'Leia a documentação em /docs',
      'Teste as APIs com Postman',
      'Explore middleware tipado',
      'Configure documentação OpenAPI',
    ],
  })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`📚 Documentação Nitro Router rodando na porta ${PORT}`)
  console.log(`🌐 Acesse: http://localhost:${PORT}`)
  console.log(`📖 Documentação: http://localhost:${PORT}/docs`)
  console.log(`📋 OpenAPI: http://localhost:${PORT}/openapi.json`)
  console.log(`📝 Exemplos: http://localhost:${PORT}/examples`)
  console.log(`🎓 Tutorial: http://localhost:${PORT}/tutorial`)
})

export default app
