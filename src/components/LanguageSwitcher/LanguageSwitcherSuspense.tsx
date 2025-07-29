'use client'
import { Suspense } from 'react'
import { LanguageSwitcher } from './index'
import { cn } from '@/lib/utils'

type Props = {
  label?: string;
  className?: string;
}

// Loading fallback for LanguageSwitcher
function LanguageSwitcherFallback({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-block", className)}>
      <div className="animate-pulse">
        <div className="w-[100px] lg:w-[120px] h-8 lg:h-9 bg-gray-200 rounded border border-gray-200"></div>
      </div>
    </div>
  )
}

export function LanguageSwitcherSuspense({ label, className }: Props) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback className={className} />}>
      <LanguageSwitcher 
        label={label}
        className={className}
      />
    </Suspense>
  )
}