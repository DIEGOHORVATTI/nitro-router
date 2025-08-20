import { PaginatedUsers, UserRepository } from '../domain/userRepository'

export const makeListUsers =
  (userRepository: UserRepository) =>
  async (page: number, limit: number): Promise<PaginatedUsers> => {
    const users = await userRepository.findAll(page, limit)

    return users
  }
