import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isModerator: Access<User> = ({ req: { user } }: AccessArgs<User>) => {
  return Boolean(user && (user.role === 'moderator' || user.role === 'admin'))
}