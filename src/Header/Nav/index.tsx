'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MobileNav } from '../MobileNav'
import { usePathname } from 'next/navigation'
import { isValidLocale, defaultLocale } from '@/utilities/locale'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1]
  const validLocale = isValidLocale(currentLocale) ? currentLocale : defaultLocale

  return (
    <nav className="flex items-center gap-2 lg:gap-4">
      {/* Main Navigation */}
      <div className="hidden lg:flex items-center gap-1">
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink 
              key={i} 
              {...link} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md transition-all duration-200 border-b-2 border-transparent hover:border-primary/20"
            />
          )
        })}
      </div>
      
      {/* Action Items - Removed separator line for cleaner look */}
      <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-6">
        {/* Search - Moved before services for better UX flow */}
        <Link 
          href={`/${validLocale}/search`}
          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors duration-200"
          aria-label={validLocale === 'ar' ? 'بحث' : 'Rechercher'}
        >
          <SearchIcon className="w-4 h-4 lg:w-5 lg:h-5" />
        </Link>
        
        {/* Quick Access Button - Repositioned for better visual hierarchy */}
        <Link 
          href={`/${validLocale}/services`}
          className="hidden lg:inline-flex items-center px-3 py-2 bg-secondary text-accent text-sm font-medium rounded-md hover:bg-secondary/90 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {validLocale === 'ar' ? 'الخدمات' : 'Services'}
        </Link>
        
        {/* Language Switcher - Clean positioning without separator */}
        <LanguageSwitcher currentLocale={validLocale} />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav data={data} />
    </nav>
  )
}
