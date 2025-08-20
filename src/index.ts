// Automatically extend Zod with OpenAPI functionality
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

// Extend Zod with OpenAPI functionality automatically when nitro-router is imported
extendZodWithOpenApi(z)

// re-export types and interfaces
export type {
  Group,
  RouteConfig,
  RouteMethod,
  TypedMiddleware,
  Method,
  RouteOptions,
  RouteMeta,
} from './types'

// Re-export utility functions
export { ok, err, match, error, HttpError } from './lib/result'
export type { Ok, Err, Result, HttpErrorDetails } from './lib/result'

// Re-export docs functions
export { default as openApi, registerRoute } from './lib/docs'

// Re-export core functions
export { NitroRouter } from './nitro-router'

// Also export NitroRouter as default for easier importing
import { NitroRouter as NR } from './nitro-router'
export default NR

// Re-export z for convenience so users don't need to import zod separately
export { z }
