'use client'

import React from 'react'
import Image from 'next/image'
import { useAuth } from '@payloadcms/ui'
import { User } from '@/payload-types'

export const CustomAvatar: React.FC = () => {
  const { user } = useAuth<User>()

  if (!user) return null

  // Get user name for display and initials fallback
  const userName = user?.name || user?.email || 'Utilisateur'
  
  // Get initials from name (first letter of first two words)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }

  const initials = getInitials(userName)

  // Check if user has an avatar
  const avatarUrl = user?.avatar && typeof user.avatar === 'object' && user.avatar.url 
    ? user.avatar.url 
    : null

  return (
    <div className="custom-avatar-container" title={`${userName} - ${user?.role || 'Admin'}`}>
      {/* Avatar image or initials circle */}
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Avatar de ${userName}`}
          width={32}
          height={32}
          className="custom-avatar-image"
          unoptimized // For external URLs and admin context
        />
      ) : (
        <div className="custom-avatar-initials">
          {initials}
        </div>
      )}
    </div>
  )
}

export default CustomAvatar