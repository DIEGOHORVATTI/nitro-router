import type { Router, RequestHandler } from 'express'

import { createParser } from './parsers'
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

    if (options?.body) {
      middleware.push(createParser('body', options.body))
    }

    if (options?.query) {
      middleware.push(createParser('query', options.query))
    }

    if (options?.injectContext) {
      for (const typed of options.injectContext) {
        middleware.push(createUseHandler(typed))
      }
    }

    const fullPath = prefix + path

    registerRoute({
      method,
      path: fullPath,
      ...options,
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
