"use client";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import type { Header } from "@/payload-types";

import { ModernHeader } from "@/components/navigation/modern-header";
import { ModernMobileNav } from "@/components/navigation/modern-mobile-nav";
import { isValidLocale, defaultLocale } from "@/utilities/locale";

interface HeaderClientProps {
  data: Header;
}

export const HeaderClient: React.FC<HeaderClientProps> = ({}) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null);
  const { headerTheme, setHeaderTheme } = useHeaderTheme();
  const pathname = usePathname();

  // Extract current locale from pathname
  const currentLocale = pathname.split("/")[1];
  const validLocale = isValidLocale(currentLocale)
    ? currentLocale
    : defaultLocale;

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
      {/* Government Identity Bar */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-2 text-xs lg:text-sm">
            {validLocale === "ar" ? (
              <>
                <div className="hidden md:flex items-center gap-x-2 text-xs">
                  <span className="text-primary-foreground/80">www.hapa.mr</span>
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-primary-foreground/80">الموقع الرسمي</span>
                </div>
                <div className="flex items-center gap-x-4">
                  <span className="text-primary-foreground/80">شرف - عدل - عمل</span>
                  <span className="font-medium">الجمهورية الإسلامية الموريتانية</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-x-4">
                  <span className="font-medium">République Islamique de Mauritanie</span>
                  <span className="text-primary-foreground/80">Honneur - Justice - Travail</span>
                </div>
                <div className="hidden md:flex items-center gap-x-2 text-xs">
                  <span className="text-primary-foreground/80">Site officiel</span>
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-primary-foreground/80">www.hapa.mr</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Consistent spacing layout */}
      <div className="w-full px-header-x sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-header-y lg:py-5">
          {/* Logo and Organization Info */}
          <div className="flex items-center gap-6">
            <Link
              href={`/${validLocale}`}
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
                  {validLocale === "ar"
                    ? "الهيئة العليا للصحافة والإعلام"
                    : "Haute Autorité de la Presse et de l'Audiovisuel"}
                </p>
                <p className="text-xs lg:text-xs text-gray-500">
                  {validLocale === "ar" ? "موريتانيا" : "Mauritanie"}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <ModernHeader />
          <ModernMobileNav />
        </div>
      </div>
    </header>
  );
};
