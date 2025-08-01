"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { SearchIcon, Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcherSuspense } from "@/components/LanguageSwitcher/LanguageSwitcherSuspense";
import { type Locale } from "@/utilities/locale";
import {
  navigationItems,
  getNavigationItemText,
  type NavigationItem,
} from "./navigation-items";
import { cn } from "@/lib/utils";

export function ModernHeader() {
  const pathname = usePathname();
  const validLocale = useLocale() as Locale;
  const t = useTranslations();

  const renderNavigationItem = (item: NavigationItem) => {
    const title = getNavigationItemText(item, validLocale, "title");

    if (item.href) {
      return (
        <NavigationMenuItem key={title}>
          <NavigationMenuLink asChild>
            <Link
              href={item.href}
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-header-x py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/15 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                pathname ===
                  `/${validLocale}${item.href === "/" ? "" : item.href}` &&
                  "bg-primary/15 text-primary"
              )}
            >
              {title}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      );
    }

    if (item.items) {
      return (
        <NavigationMenuItem key={title}>
          <NavigationMenuTrigger className="font-medium text-sm px-header-x hover:bg-primary/10 hover:text-primary focus:bg-primary/15 focus:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
            {title}
          </NavigationMenuTrigger>
          <NavigationMenuContent 
            className={cn(
              "!w-[400px] md:!w-[420px] p-4 md:p-6 bg-white shadow-xl border border-gray-100 rounded-lg",
              validLocale === "ar" ? "mr-2" : "ml-2"
            )} 
            dir={validLocale === "ar" ? "rtl" : "ltr"}
          >
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Group Info */}
              <div className="flex flex-col justify-between min-h-0">
                <div className="flex flex-col flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      {item.icon && (
                        <item.icon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {item.description
                      ? getNavigationItemText(item, validLocale, "description")
                      : ""}
                  </p>
                </div>
                <div className="mt-4 lg:mt-6 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    asChild
                  >
                    <Link href={
                      title === "تعريف" || title === "À propos" 
                        ? "/about/mission" 
                        : title === "إصدارات" || title === "Publications"
                        ? "/publications/decisions"
                        : "/about/mission"
                    }>
                      {t('moreInfo')}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Group Items */}
              <div className="flex flex-col gap-1 lg:gap-2 min-h-0">
                {item.items?.map((subItem) => {
                  const subTitle = getNavigationItemText(
                    subItem,
                    validLocale,
                    "title"
                  );
                  const subDescription = subItem.description
                    ? getNavigationItemText(subItem, validLocale, "description")
                    : "";

                  return (
                    <NavigationMenuLink
                      key={subTitle}
                      asChild
                      className="flex items-center justify-between hover:bg-gray-50 hover:text-primary py-2 lg:py-3 px-3 lg:px-4 rounded-lg group transition-all duration-200 border border-transparent hover:border-primary/20 hover:shadow-sm min-h-0"
                    >
                      <Link href={subItem.href || "#"} className="flex items-center justify-between w-full min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary transition-colors flex-shrink-0" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-sm leading-tight truncate">{subTitle}</span>
                            {subDescription && (
                              <span className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                {subDescription}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 ms-2">
                          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={validLocale === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                          </svg>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  );
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return null;
  };

  return (
    <div className="hidden lg:flex items-center gap-8">
      <NavigationMenu className="flex items-start">
        <NavigationMenuList
          className="justify-start gap-nav-gap"
          dir={validLocale === "ar" ? "rtl" : "ltr"}
        >
          {navigationItems.map((item) => renderNavigationItem(item))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Action Items */}
      <div className="flex items-center gap-action-gap">
        {/* Search */}
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/search"
            aria-label={t('searchAriaLabel')}
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-primary/10 text-primary"
          >
            <SearchIcon className="w-4 h-4 text-primary" />
          </Link>
        </Button>

        {/* Language Switcher */}
        <LanguageSwitcherSuspense />

        {/* Prominent Report Button */}
        <Button 
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm border-0 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          asChild
        >
          <Link href="/forms/media-content-report">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>{t('reportMediaContent')}</span>
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
