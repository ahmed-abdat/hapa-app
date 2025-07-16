'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { XIcon, MenuIcon, PhoneIcon, MailIcon } from 'lucide-react'
import { CMSLink } from '@/components/Link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { usePathname } from 'next/navigation'
import { isValidLocale, defaultLocale } from '@/utilities/locale'

import type { Header as HeaderType } from '@/payload-types'

interface MobileNavProps {
  data: HeaderType
}

export const MobileNav: React.FC<MobileNavProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navItems = data?.navItems || []
  const pathname = usePathname()
  
  const currentLocale = pathname.split('/')[1]
  const validLocale = isValidLocale(currentLocale) ? currentLocale : defaultLocale

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors duration-200"
        aria-label={validLocale === 'ar' ? 'فتح القائمة' : 'Ouvrir le menu'}
        onClick={toggleMenu}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={toggleMenu} />
      )}

      {/* Mobile Menu Panel */}
      <div className={`lg:hidden fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">HAPA</span>
              </div>
              <span className="font-bold text-primary">
                {validLocale === 'ar' ? 'الهيئة العليا للصحافة والإعلام' : 'HAPA'}
              </span>
            </div>
            <button 
              onClick={toggleMenu}
              className="p-2 text-gray-500 hover:text-primary rounded-md"
              aria-label={validLocale === 'ar' ? 'إغلاق القائمة' : 'Fermer le menu'}
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navItems.map(({ link }, i) => (
                <CMSLink 
                  key={i} 
                  {...link} 
                  className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md transition-colors duration-200 font-medium"
                  onClick={toggleMenu}
                />
              ))}
              
              {/* Mobile-specific links */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Link 
                  href={`/${validLocale}/services`}
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md transition-colors duration-200 font-medium"
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validLocale === 'ar' ? 'الخدمات' : 'Services'}
                </Link>
                
                <Link 
                  href={`/${validLocale}/search`}
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-md transition-colors duration-200 font-medium"
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {validLocale === 'ar' ? 'بحث' : 'Rechercher'}
                </Link>
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {/* Language Switcher */}
            <div className="mb-4 flex justify-center">
              <LanguageSwitcher currentLocale={validLocale} />
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600 text-center">
              <div className="flex items-center justify-center gap-x-2">
                <PhoneIcon className="w-4 h-4" />
                <span>+222 45 25 26 79</span>
              </div>
              <div className="flex items-center justify-center gap-x-2">
                <MailIcon className="w-4 h-4" />
                <span>contact@hapa.mr</span>
              </div>
              <div className="text-xs text-gray-500 pt-2">
                {validLocale === 'ar' ? 'الموقع الرسمي' : 'Site officiel'} • www.hapa.mr
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}