import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import Image from 'next/image'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
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
      </Banner>
    </div>
  )
}

export default BeforeDashboard
