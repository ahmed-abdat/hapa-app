'use client'
import React from 'react'
import { Toaster } from '@/components/ui/sonner'

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
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </>
  )
}

export default AdminProvider