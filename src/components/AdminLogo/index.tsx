import React from 'react'
import Image from 'next/image'

const AdminLogo: React.FC = () => {
  return (
    <div className="flex items-center py-2 max-w-32">
      <Image
        src="/logo_hapa1.png"
        alt="HAPA - Haute Autorité de la Presse et de l'Audiovisuel"
        width={120}
        height={21}
        className="max-w-full h-auto object-contain"
        priority
      />
    </div>
  )
}

export default AdminLogo