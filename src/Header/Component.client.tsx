"use client";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';

import { ModernHeader } from "@/components/navigation/modern-header";
import { ModernMobileNav } from "@/components/navigation/modern-mobile-nav";

interface HeaderClientProps {
  data?: unknown; // Optional data parameter for compatibility (not used)
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  // Ignore any Payload header data - we use static navigation
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null);
  const { headerTheme, setHeaderTheme } = useHeaderTheme();
  const pathname = usePathname();
  const t = useTranslations();
  
  // Get locale from next-intl context (server-side aware)
  const locale = useLocale();

  useEffect(() => {
    setHeaderTheme(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

      {/* Main Header - Consistent spacing layout */}
      <div className="w-full px-header-x sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-header-y lg:py-5">
          {/* Logo and Organization Info */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              {/* Official Government Seal/Logo */}
              <div className="relative">
                <Image
                  src="/logo_hapa1.png"
                  alt="HAPA Logo"
                  width={64}
                  height={64}
                  className="w-12 h-12 lg:w-16 lg:h-16 object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                  priority
                />
              </div>

              {/* Organization Information */}
              <div className="flex flex-col">
                <h1 className="text-base lg:text-xl font-bold text-primary leading-tight">
                  HAPA
                </h1>
                <p className="hidden md:block text-sm lg:text-sm text-gray-600 font-medium">
                  {t('organizationName')}
                </p>

              </div>
            </Link>
          </div>

          {/* Navigation */}
          <ModernHeader />
          
          {/* Mobile Navigation with Report Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* Prominent Report Button - Mobile Header */}
            <Button
              className="bg-secondary-cta hover:bg-secondary-cta/90 text-secondary-cta-foreground font-semibold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm border-0 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              asChild
            >
              <Link href="/forms/media-content-report">
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>{t('reportMediaContent')}</span>
                </span>
              </Link>
            </Button>
            
            <ModernMobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};
