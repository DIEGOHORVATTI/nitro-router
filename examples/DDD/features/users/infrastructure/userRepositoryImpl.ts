import type { User } from '../domain/user'

import { paginate } from '../../../core/utils/pagination'

import { UserRepository } from '../domain/userRepository'

const users: User[] = []

export const userRepositoryImpl: UserRepository = {
  async findById(id) {
    return users.find((user) => user.id === id) || null
  },

  async findByEmail(email) {
    return users.find((user) => user.email === email) || null
  },

  async findAll(page, limit) {
    return paginate<User>(users, page, limit)
  },

  async save(user) {
    const index = users.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users[index] = user
    } else {
      users.push(user)
    }
  },
}
