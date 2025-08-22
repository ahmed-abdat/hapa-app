import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const canManageSubmissions: Access<User> = ({ req: { user } }: AccessArgs<User>) => {
  if (!user) return false
  
  // Admin sees all submissions
  if (user.role === 'admin') return true
  
  // Moderator has full access to all submissions for management
  // Admin oversight maintained through audit trail and internal notes
  if (user.role === 'moderator') return true
  
  // Editor can read submissions but not manage them
  if (user.role === 'editor') {
    return true // Can read all, but update/delete controlled separately
  }
  
  return false
}