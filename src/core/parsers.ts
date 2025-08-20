import type { ZodType } from 'zod'
import type { RequestHandler } from 'express'

import { error } from '../lib/result'

export function createParser<T extends 'body' | 'query' | 'params'>(
  key: T,
  schema: ZodType
): RequestHandler {
  return (req, _req, next) => {
    const result = schema.safeParse(req[key])

    if (!result.success) {
      const firstIssue = result.error.issues[0]

      const errorMessage = `'${firstIssue.path}' ${firstIssue.message}` || `Invalid ${key}`

      console.error(`Validation error for ${key}:`, result.error.issues, req[key])

      throw error('BAD_REQUEST', errorMessage)
    }

    req[key] = result.data
    next()
  }
}
