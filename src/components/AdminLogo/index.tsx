import React from 'react'
import Image from 'next/image'

const AdminLogo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.5rem 0',
      maxWidth: '200px'
    }}>
      <Image
        src="/logo_hapa1.png"
        alt="HAPA - Haute Autorité de la Presse et de l'Audiovisuel"
        width={193}
        height={34}
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain'
        }}
        priority
      />
    </div>
  )
}

export default AdminLogo