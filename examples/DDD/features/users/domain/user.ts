import { Entity } from '../../../core/domain/entity'

export type UserProps = {
  name: string
  email: string
}

export type User = Entity<UserProps>

export const createUser = (props: UserProps, id?: string): User => ({
  id: id || crypto.randomUUID(),
  ...props,
})
