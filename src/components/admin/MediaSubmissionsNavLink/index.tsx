'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export const MediaSubmissionsNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname === '/admin/media-submissions'

  return (
    <div className="nav-group" style={{ marginTop: '1rem' }}>
      <div className="nav-group__header">
        <span className="nav-group__label">Tableau de Bord</span>
      </div>
      <Link
        href="/admin/media-submissions"
        className={`nav__link ${isActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          textDecoration: 'none',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          backgroundColor: isActive ? 'var(--theme-elevation-100)' : 'transparent',
          color: isActive ? 'var(--theme-text)' : 'var(--theme-text-secondary)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ marginRight: '0.75rem' }}
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Soumissions Médiatiques
      </Link>
    </div>
  )
}

export default MediaSubmissionsNavLink