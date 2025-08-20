import { error } from 'nitro-router'

export const badRequest = (message: string) => error('BAD_REQUEST', message)
export const notFound = (message: string) => error('NOT_FOUND', message)
export const conflict = (message: string) => error('CONFLICT', message)
export const internal = (message: string) => error('INTERNAL_SERVER_ERROR', message)
