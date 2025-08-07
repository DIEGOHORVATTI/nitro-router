import type { Method, RouteMethod, RegisterFunction } from '../types'

type HttpMethodHandlers<Ext> = {
  [M in Method]: RouteMethod<Ext>
}

export function createMethodFactory<Ext>(register: RegisterFunction<Ext>): HttpMethodHandlers<Ext> {
  const createMethod =
    (method: Method): RouteMethod<Ext> =>
    (path, handler, options) =>
      register(method, path, handler, options)

  return {
    get: createMethod('get'),
    post: createMethod('post'),
    put: createMethod('put'),
    patch: createMethod('patch'),
    delete: createMethod('delete'),
  }
}
