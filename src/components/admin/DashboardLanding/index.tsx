'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Gutter, Button } from '@payloadcms/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart3, ListChecks, TriangleAlert, Languages, Clock, Inbox } from 'lucide-react'
import { useAdminTranslation } from '@/utilities/admin-translations'

type FetchState<T> = {
  loading: boolean
  error: string | null
  data: T | null
}

type Submission = {
  id: string
  title: string
  formType: 'report' | 'complaint'
  submissionStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  submittedAt: string
  locale: 'fr' | 'ar'
  contentInfo?: { programName?: string; mediaType?: string; specificChannel?: string }
}

type StatsResponse = {
  success: boolean
  stats: {
    totalSubmissions: number
    reportSubmissions: number
    complaintSubmissions: number
    pendingCount: number
    reviewingCount: number
    resolvedCount: number
    dismissedCount: number
    todaySubmissions: number
    weekSubmissions: number
    monthSubmissions: number
  }
  submissions: Submission[]
}

/**
 * DashboardLanding
 * Modern, brand-aligned landing view for the virtual collection `dashboard-submissions`.
 * - Fetches aggregated stats from our admin API
 * - Displays quick KPI cards and the latest submissions
 * - Provides clear calls-to-action matching frontend brand identity
 */
export default function DashboardLanding(): React.JSX.Element {
  const { dt } = useAdminTranslation()
  const router = useRouter()
  const [state, setState] = useState<FetchState<StatsResponse>>({ loading: true, error: null, data: null })

  useEffect(() => {
    let ignore = false
    const fetchStats = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }))
        const response = await fetch('/api/admin/media-submissions-stats', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = (await response.json()) as StatsResponse
        if (!ignore) setState({ loading: false, error: null, data: json })
      } catch (error) {
        if (!ignore) setState({ loading: false, error: dt('errors.fetchFailed'), data: null })
      }
    }
    fetchStats()
    return () => {
      ignore = true
    }
  }, [dt])

  const latestSubmissions = useMemo(() => {
    return state.data?.submissions?.slice(0, 6) ?? []
  }, [state.data])

  return (
    <Gutter>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--hapa-primary)' }}>{dt('dashboard.title')}</h2>
            <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>{dt('dashboard.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/admin/collections/dashboard-submissions" style={buttonPrimaryStyle}>
              <BarChart3 style={iconStyle} /> {dt('common.openInAdmin')}
            </Link>
            <Link href="/admin/collections/media-content-submissions" style={buttonOutlineStyle}>
              <ListChecks style={iconStyle} /> {dt('common.viewAllSubmissions')}
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1rem' }}>
          {/* KPI Cards */}
          <div style={gridSpan(12, 4)}>
            <div style={cardStyle}>
              <div style={cardIconWrap('#138b3a10')}><Inbox style={iconPrimary} /></div>
              <div style={cardStatWrap}>
                <span style={cardStatLabel}>{dt('stats.total')}</span>
                <strong style={cardStatValue}>{state.data?.stats.totalSubmissions ?? (state.loading ? '…' : 0)}</strong>
              </div>
            </div>
          </div>
          <div style={gridSpan(12, 4)}>
            <div style={cardStyle}>
              <div style={cardIconWrap('#e6e61920')}><TriangleAlert style={{ ...iconPrimary, color: '#b45309' }} /></div>
              <div style={cardStatWrap}>
                <span style={cardStatLabel}>{dt('status.pending')}</span>
                <strong style={cardStatValue}>{state.data?.stats.pendingCount ?? (state.loading ? '…' : 0)}</strong>
              </div>
            </div>
          </div>
          <div style={gridSpan(12, 4)}>
            <div style={cardStyle}>
              <div style={cardIconWrap('#0f7a2e15')}><Clock style={{ ...iconPrimary, color: '#065f46' }} /></div>
              <div style={cardStatWrap}>
                <span style={cardStatLabel}>{dt('stats.thisWeek')}</span>
                <strong style={cardStatValue}>{state.data?.stats.weekSubmissions ?? (state.loading ? '…' : 0)}</strong>
              </div>
            </div>
          </div>

          {/* Latest Submissions */}
          <div style={gridSpan(12, 12)}>
            <div style={{ ...panelStyle }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: 'var(--hapa-primary)', fontSize: 16 }}>{dt('recent.title')}</h3>
                <Link href="/admin/collections/media-content-submissions" style={linkStyle}>{dt('recent.viewAll')}</Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>{dt('table.title')}</th>
                      <th style={thStyle}>{dt('table.type')}</th>
                      <th style={thStyle}>{dt('table.status')}</th>
                      <th style={thStyle}>{dt('table.priority')}</th>
                      <th style={thStyle}>{dt('table.submittedOn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.loading && (
                      <tr>
                        <td colSpan={5} style={tdStyle}>{dt('common.loading')}</td>
                      </tr>
                    )}
                    {!state.loading && latestSubmissions.length === 0 && (
                      <tr>
                        <td colSpan={5} style={tdStyle}>{dt('recent.subtitle')}</td>
                      </tr>
                    )}
                    {latestSubmissions.map((s) => (
                      <tr key={s.id}>
                        <td style={tdStyle}>{s.title}</td>
                        <td style={tdStyle}><span style={badgeStyle(s.formType === 'complaint' ? '#f59e0b' : '#0ea5e9')}>{s.formType === 'complaint' ? dt('forms.complaint') : dt('forms.report')}</span></td>
                        <td style={tdStyle}><StatusBadge status={s.submissionStatus} /></td>
                        <td style={tdStyle}><PriorityBadge priority={s.priority} /></td>
                        <td style={tdStyle}>{formatDate(s.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Gutter>
  )
}

// --- Styles (scoped, brand-aligned via CSS variables) ---
const buttonPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px',
  background: 'var(--hapa-primary)', color: '#fff', borderRadius: 8,
  textDecoration: 'none', fontWeight: 600, border: '1px solid var(--hapa-primary)'
}

const buttonOutlineStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px',
  background: '#fff', color: 'var(--hapa-primary)', borderRadius: 8,
  textDecoration: 'none', fontWeight: 600, border: '1px solid var(--hapa-primary)'
}

const iconStyle: React.CSSProperties = { width: 16, height: 16 }
const iconPrimary: React.CSSProperties = { width: 20, height: 20, color: 'var(--hapa-primary)' }

const gridSpan = (columns: number, span: number): React.CSSProperties => ({
  gridColumn: `span ${Math.min(Math.max(span, 1), columns)} / span ${Math.min(Math.max(span, 1), columns)}`,
})

const cardStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: 16, borderRadius: 10,
  background: '#fff', border: '1px solid #e5e7eb',
}

const cardIconWrap = (bg: string): React.CSSProperties => ({
  width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', background: bg,
})

const cardStatWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const cardStatLabel: React.CSSProperties = { fontSize: 12, color: '#6b7280' }
const cardStatValue: React.CSSProperties = { fontSize: 22, color: '#111827', lineHeight: 1.1 }

const panelStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16,
}

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'separate', borderSpacing: 0,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600,
  padding: '10px 12px', borderBottom: '1px solid #e5e7eb',
}

const tdStyle: React.CSSProperties = {
  fontSize: 13, color: '#111827', padding: '10px 12px', borderBottom: '1px solid #f3f4f6',
}

const linkStyle: React.CSSProperties = { color: 'var(--hapa-primary)', textDecoration: 'none', fontWeight: 600 }

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
  fontSize: 12, borderRadius: 999, color: '#fff', background: color,
})

function StatusBadge({ status }: { status: Submission['submissionStatus'] }): React.JSX.Element {
  const { dt } = useAdminTranslation()
  const map: Record<Submission['submissionStatus'], { label: string; color: string }> = {
    pending: { label: dt('status.pending'), color: '#f59e0b' },
    reviewing: { label: dt('status.reviewing'), color: '#3b82f6' },
    resolved: { label: dt('status.resolved'), color: '#10b981' },
    dismissed: { label: dt('status.dismissed'), color: '#ef4444' },
  }
  const { label, color } = map[status]
  return <span style={badgeStyle(color)}>{label}</span>
}

function PriorityBadge({ priority }: { priority: Submission['priority'] }): React.JSX.Element {
  const { dt } = useAdminTranslation()
  const map: Record<Submission['priority'], { label: string; color: string }> = {
    low: { label: dt('priority.low'), color: '#6b7280' },
    medium: { label: dt('priority.medium'), color: '#6366f1' },
    high: { label: dt('priority.high'), color: '#f97316' },
    urgent: { label: dt('priority.urgent'), color: '#dc2626' },
  }
  const { label, color } = map[priority]
  return <span style={badgeStyle(color)}>{label}</span>
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
  } catch {
    return '—'
  }
}



