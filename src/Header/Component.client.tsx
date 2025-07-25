"use client";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ModernHeader } from "@/components/navigation/modern-header";
import { ModernMobileNav } from "@/components/navigation/modern-mobile-nav";
import { isValidLocale, defaultLocale } from "@/utilities/locale";

interface HeaderClientProps {
  data?: any; // Optional data parameter for compatibility (not used)
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  // Ignore any Payload header data - we use static navigation
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

              </div>
            </Link>
          </div>

          {/* Navigation */}
          <ModernHeader />
          
          {/* Mobile Navigation with Search */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary transition-colors"
              asChild
            >
              <Link href={`/${validLocale}/search`}>
                <Search className="w-5 h-5" />
                <span className="sr-only">
                  {validLocale === "ar" ? "البحث" : "Rechercher"}
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
