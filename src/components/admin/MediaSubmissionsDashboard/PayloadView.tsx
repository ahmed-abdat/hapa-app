import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import React from 'react'
import { MediaSubmissionsDashboard } from './index'

export function MediaSubmissionsPayloadView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    req: { i18n, payload, user },
    locale,
    permissions,
    visibleEntities,
  } = initPageResult

  // Ensure user is authenticated
  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <MediaSubmissionsDashboard />
    </DefaultTemplate>
  )
}

// Export as default for Payload to import properly
export default MediaSubmissionsPayloadView