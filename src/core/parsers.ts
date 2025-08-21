import type { ZodType } from 'zod'
import type { RequestHandler } from 'express'
import { z } from 'zod'

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

/**
 * Extrai parâmetros da URL e cria um schema Zod para validação
 * @param path Caminho da URL (ex: '/users/:id')
 * @returns Schema Zod para validação dos parâmetros ou undefined se não houver parâmetros
 */
export function createParamsSchemaFromPath(path: string) {
  // Extrair todos os segmentos do caminho que começam com ':'
  const params = path
    .split('/')
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => segment.substring(1))

  if (params.length === 0) {
    return undefined
  }

  // Criar um objeto de schema para cada parâmetro
  const schemaObj = params.reduce<Record<string, z.ZodString>>((acc, param) => {
    acc[param] = z.string()
    return acc
  }, {})

  return z.object(schemaObj)
}
