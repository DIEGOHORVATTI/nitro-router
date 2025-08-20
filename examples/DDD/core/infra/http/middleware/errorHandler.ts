import { NextFunction, Request, Response } from 'express'
import { HttpError } from 'nitro-router'

export default function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: [err.message || 'Internal Server Error'],
      kind: 'HttpError',
    })
  }

  return res.status(500).json({
    error: [err.message || 'Internal Server Error'],
    kind: 'InternalServerError',
  })
}
