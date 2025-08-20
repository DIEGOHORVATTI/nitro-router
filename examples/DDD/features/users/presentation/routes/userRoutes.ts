import NR, { z } from '../../../../../../src'

import { userRepositoryImpl } from '../../infrastructure/userRepositoryImpl'

import { makeCreateUser } from '../../application/createUser'
import { makeListUsers } from '../../application/listUsers'

export const userRoutes = new NR().group({ prefix: '/users', tags: ['Users'] })

userRoutes.post(
  '/',
  async ({ body }) => {
    const result = await makeCreateUser(userRepositoryImpl)(body)

    return result
  },
  {
    tags: ['Users'],
    summary: 'Criar um novo usuário',
    body: z.object({
      name: z.string(),
      email: z.email(),
    }),
  }
)

userRoutes.get(
  '/',
  async ({ query: { page, limit } }) => {
    const result = await makeListUsers(userRepositoryImpl)(page, limit)

    return result
  },
  {
    tags: ['Users'],
    summary: 'Listar usuários',
    query: z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
    }),
  }
)
