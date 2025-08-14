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
export { ok, err, match, error } from './lib/result'
export type { Ok, Err, Result, HttpErrorDetails } from './lib/result'

// Re-export docs functions
export { default as openApi, registerRoute } from './lib/docs'

// Re-export core functions
export { NitroRouter } from './nitro-router'
