import type { ZodSchema } from 'zod'
import type { RequestHandler } from 'express'

import { error } from '../lib/result'

export function createParser<T extends 'body' | 'query'>(
  key: T,
  schema: ZodSchema
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[key])

    if (!result.success) {
      const errorMessage = result.error.issues[0].message || `Invalid ${key}`

      console.error(`Validation error for ${key}:`, result.error.issues, req[key])

      throw error('BAD_REQUEST', errorMessage)
    }

    req[key] = result.data
    next()
  }
}
