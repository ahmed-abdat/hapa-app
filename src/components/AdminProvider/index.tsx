'use client'
import React from 'react'

const AdminProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <style jsx global>{`
        /* Replace user account avatar with HAPA logo */
        .app-header__account .gravatar-account {
          content: url('/logo_hapa1.png') !important;
          width: 25px !important;
          height: 25px !important;
          object-fit: contain !important;
          border-radius: 4px !important;
        }
      `}</style>
      {children}
    </>
  )
}

export default AdminProvider