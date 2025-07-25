'use client'
import React from 'react'
import '../AdminLogo/admin-styles.css'

const AdminProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <React.Fragment>{children}</React.Fragment>
}

export default AdminProvider