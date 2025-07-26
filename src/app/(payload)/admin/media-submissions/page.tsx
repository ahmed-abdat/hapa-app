import React from 'react'
import { Metadata } from 'next'
import { MediaSubmissionsDashboard } from '@/components/admin/MediaSubmissionsDashboard'

export const metadata: Metadata = {
  title: 'Soumissions Médiatiques - HAPA Admin',
  description: 'Tableau de bord pour gérer les signalements et plaintes concernant le contenu médiatique',
}

export default function MediaSubmissionsPage() {
  return <MediaSubmissionsDashboard />
}

// This is a protected admin route
export const dynamic = 'force-dynamic'