import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isEditor: Access<User> = ({ req: { user } }: AccessArgs<User>) => {
  return Boolean(user && (user.role === 'editor' || user.role === 'admin'))
}