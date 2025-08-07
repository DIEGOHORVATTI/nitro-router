import type { RequestHandler } from 'express'

import { Router } from 'express'

import { createUseHandler } from './core/use'
import { createRegister } from './core/register'
import { createMethodFactory } from './core/method-factory'

import type { Group, RouteConfig, RouteMethod, TypedMiddleware } from './types'

export class RouteBuilder<Ext extends Record<string, unknown> = {}> {
  private router = Router()
  private middlewares: Array<RequestHandler> = []
  private prefix: string
  private name: string
  private tags: string[]

  constructor(options?: Partial<RouteConfig>) {
    this.prefix = options?.prefix ?? ''
    this.name = options?.name ?? ''
    this.tags = options?.tags ?? []
    this.router = options?.router ?? Router()
    this.middlewares = options?.middlewares ?? []
  }

  use<MExt extends Record<string, unknown>>(typed: TypedMiddleware<MExt>) {
    this.middlewares.push(createUseHandler(typed))

    return this as RouteBuilder<Ext & MExt>
  }

  group(options: Group) {
    return new RouteBuilder<Ext>({
      prefix: this.prefix + (options.prefix ?? ''),
      tags: [...this.tags, ...(options.tags ?? [])],
      router: this.router,
      name: this.name,
      middlewares: this.middlewares,
    })
  }

  get _register() {
    return createRegister<Ext>(this.middlewares, this.router, this.prefix, this.tags)
  }

  get: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).get(path, handler, options)

  post: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).post(path, handler, options)

  put: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).put(path, handler, options)

  patch: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).patch(path, handler, options)

  delete: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).delete(path, handler, options)

  export() {
    return this.router
  }
}
