import { StatusCodes, getReasonPhrase } from 'http-status-codes'

export type Ok<T> = { ok: true; value: T }
export type Err<E> = { ok: false; error: E }
export type Result<T, E> = Ok<T> | Err<E>

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export const match = <T, E, R>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => R; err: (error: E) => R }
): R => (result.ok ? handlers.ok(result.value) : handlers.err(result.error))

export interface HttpErrorDetails {
  code: keyof typeof StatusCodes
  message: string
  details?: string
}

class HttpError extends Error {
  status: number
  details?: string

  constructor({ code, message, details }: HttpErrorDetails) {
    const status = StatusCodes[code]
    super(message)
    this.name = getReasonPhrase(status)
    this.status = status
    this.details = details
    this.stack = details
  }
}

export const error = (code: keyof typeof StatusCodes, error: string, details?: string) =>
  new HttpError({ code, message: error, details })
