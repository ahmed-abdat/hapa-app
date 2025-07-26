import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Image
              src="/logo_hapa1.png"
              alt="HAPA Logo"
              width={96}
              height={17}
              style={{ maxWidth: '100px', height: 'auto' }}
            />
            <div>
              <h4 style={{ margin: 0, color: '#138B3A' }}>Tableau de bord HAPA</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Interface d&apos;administration - Haute Autorité de la Presse et de l&apos;Audiovisuel
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              href="/admin/media-submissions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white no-underline rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
              </svg>
              Soumissions Médiatiques
            </Link>
            <Link
              href="/admin/collections/media-content-submissions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary no-underline rounded-md text-sm font-medium border border-primary transition-all duration-200 hover:bg-primary/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Gérer les Collections
            </Link>
          </div>
        </div>
      </Banner>
    </div>
  )
}

export default BeforeDashboard
