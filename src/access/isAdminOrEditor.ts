import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isAdminOrEditor: Access<User> = ({ req: { user } }: AccessArgs<User>) => {
  return Boolean(user && ['admin', 'editor'].includes(user.role))
}