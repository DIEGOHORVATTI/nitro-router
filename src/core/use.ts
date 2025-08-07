import type { Request, RequestHandler } from 'express'

import type { TypedMiddleware } from '../types'

export function createUseHandler<Ext extends Record<string, unknown>>(
  typed: TypedMiddleware<Ext>
): RequestHandler {
  return async (req, res, next) => {
    const request = req as Request & Ext

    await typed.middleware(request, res, next)

    Object.assign(request, typed.inject?.(request))
  }
}
