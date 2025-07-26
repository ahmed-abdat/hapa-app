import React from 'react'
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">
        The page you are looking for does not exist.
      </p>
      <Link 
        href="/" 
        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}

export const metadata: Metadata = {
  title: '404 - Page Not Found | HAPA',
  description: 'The page you are looking for does not exist.',
}