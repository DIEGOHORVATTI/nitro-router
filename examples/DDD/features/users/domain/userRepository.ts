import type { Paginated } from '../../../core/utils/pagination'

import { User } from './user'

export type PaginatedUsers = Paginated<User>

export type UserRepository = {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(page: number, limit: number): Promise<PaginatedUsers>
  save(user: User): Promise<void>
}
