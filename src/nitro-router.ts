import type { RequestHandler } from 'express'

import { Router } from 'express'

import { createUseHandler } from './core/use'
import { createRegister } from './core/register'
import { createMethodFactory } from './core/method-factory'

import type { Group, RouteConfig, RouteMethod, TypedMiddleware } from './types'

export class NitroRouter<Ext extends Record<string, unknown> = {}> {
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

  /**
   * @title use method to add middleware
   * @description This allows chaining of middlewares
   * @returns A new NitroRouter instance with the added middleware
   */
  use<MExt extends Record<string, unknown>>(typed: TypedMiddleware<MExt>) {
    this.middlewares.push(createUseHandler(typed))

    return this as NitroRouter<Ext & MExt>
  }

  /**
   * @title group method to create a new NitroRouter with a prefix and tags
   * @description This allows creating a new router with a specific prefix and tags
   * @returns A new NitroRouter instance with the specified prefix and tags
   */
  group(options: Group) {
    return new NitroRouter<Ext>({
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

  /**
   * @title Methods to register routes
   * @description These methods allow registering routes with different HTTP methods
   */
  get: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).get(path, handler, options)

  /**
   * @title Methods to register routes
   * @description These methods allow registering routes with different HTTP methods
   */
  post: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).post(path, handler, options)

  /**
   * @title Methods to register routes
   * @description These methods allow registering routes with different HTTP methods
   */
  put: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).put(path, handler, options)

  /**
   * @title Methods to register routes
   * @description These methods allow registering routes with different HTTP methods
   */
  patch: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).patch(path, handler, options)

  /**
   * @title Methods to register routes
   * @description These methods allow registering routes with different HTTP methods
   */
  delete: RouteMethod<Ext> = (path, handler, options) =>
    createMethodFactory<Ext>(this._register).delete(path, handler, options)

  /**
   * @title Methods to register routes
   * @description These methods allow registering routes with different HTTP methods
   */
  export() {
    return this.router
  }
}
