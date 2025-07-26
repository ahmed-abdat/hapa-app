'use client'
import React from 'react'

const AdminProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <React.Fragment>{children}</React.Fragment>
}

export default AdminProvider