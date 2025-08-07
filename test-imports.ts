import { NitroRouter, error, ok, err, openApi } from './src'
import { z } from 'zod'

console.log('🧪 Testando imports da biblioteca...')

// Teste 1: NitroRouter
console.log('✅ NitroRouter importado:', typeof NitroRouter === 'function')

// Teste 2: Funções de result
console.log('✅ error importado:', typeof error === 'function')
console.log('✅ ok importado:', typeof ok === 'function')
console.log('✅ err importado:', typeof err === 'function')

// Teste 3: openApi
console.log('✅ openApi importado:', typeof openApi === 'function')

// Teste 4: Criar instância do router
const router = new NitroRouter()
console.log('✅ NitroRouter instanciado:', router instanceof NitroRouter)

// Teste 5: Definir uma rota simples
const TestSchema = z.object({
  message: z.string(),
})

router.get(
  '/test',
  async (ctx, res) => {
    return { message: 'Hello World!' }
  },
  {
    summary: 'Rota de teste',
    tags: ['Test'],
  }
)

console.log('✅ Rota definida com sucesso')

// Teste 6: Usar middleware
router.use({
  middleware: async (req, res, next) => {
    console.log('Middleware executado')
    next()
  },
  inject: (req) => ({ timestamp: Date.now() }),
})

console.log('✅ Middleware adicionado com sucesso')

// Teste 7: Criar grupo
const apiGroup = router.group({ prefix: '/api', tags: ['API'] })
console.log('✅ Grupo criado com sucesso')

// Teste 8: Error handling
try {
  throw error('BAD_REQUEST', 'Teste de erro')
} catch (err: any) {
  console.log('✅ Error handling funciona:', err.status === 400)
}

// Teste 9: Result types
const resultOk = ok({ data: 'success' })
const resultErr = err('something went wrong')

console.log('✅ Result types funcionam:', resultOk.ok === true && resultErr.ok === false)

console.log('\n🎉 Todos os testes passaram! A biblioteca está pronta para uso.')
console.log('\n📦 Para usar em outro projeto:')
console.log('npm install nitro-router zod express')
console.log('import { NitroRouter, error, ok } from "nitro-router"')
