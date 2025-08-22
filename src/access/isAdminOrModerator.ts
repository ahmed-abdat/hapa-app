import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isAdminOrModerator: Access<User> = ({ req: { user } }: AccessArgs<User>) => {
  return Boolean(user && ['admin', 'moderator'].includes(user.role))
}