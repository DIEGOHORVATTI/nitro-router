import { conflict } from '../../../core/infra/http/errors/apiError'

import { User, createUser } from '../domain/user'
import { UserRepository } from '../domain/userRepository'

export const makeCreateUser =
  (userRepository: UserRepository) =>
  async (data: { name: string; email: string }): Promise<User> => {
    const existingUser = await userRepository.findByEmail(data.email)

    if (existingUser) {
      throw conflict('User with this email already exists.')
    }

    const user = createUser(data)

    await userRepository.save(user)

    return user
  }
