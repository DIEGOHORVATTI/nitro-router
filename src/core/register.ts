import type { Router, RequestHandler } from 'express'

import { createParser, createParamsSchemaFromPath } from './parsers'
import { createUseHandler } from './use'
import { registerRoute } from '../lib/docs'

import type { RegisterFunction } from '../types'

export function createRegister<Ext>(
  middlewares: Array<RequestHandler>,
  router: ReturnType<typeof Router>,
  prefix = '',
  tags: Array<string> = []
): RegisterFunction<Ext> {
  return (method, path, handler, options) => {
    const middleware: Array<RequestHandler> = []

    // Adicionar validadores para body, query e params
    if (options?.body) {
      middleware.push(createParser('body', options.body))
    }

    if (options?.query) {
      middleware.push(createParser('query', options.query))
    }

    let paramsSchema = options?.params

    if (!paramsSchema) {
      paramsSchema = createParamsSchemaFromPath(path)
    }

    if (paramsSchema) {
      middleware.push(createParser('params', paramsSchema))
    }

    // Processar injeção de contexto
    if (options?.injectContext) {
      for (const typed of options.injectContext) {
        middleware.push(createUseHandler(typed))
      }
    }

    const fullPath = prefix + path

    // Registrar rota na documentação OpenAPI
    registerRoute({
      method,
      path: fullPath,
      ...options,
      params: paramsSchema, // Incluir schema de parâmetros (definido ou inferido)
      tags: options?.tags ?? tags,
      prefix,
    })

    const expressHandler: RequestHandler = async (req, res, next) => {
      try {
        const result = await handler(req as any, res)
        if (!res.headersSent && result !== undefined) {
          res.json(result)
        }
      } catch (err) {
        next(err)
      }
    }

    router[method](fullPath, ...middlewares, ...middleware, expressHandler)
  }
}
