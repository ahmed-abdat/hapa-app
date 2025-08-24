"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Menu, ArrowRight, ArrowLeft, Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { LanguageSwitcherSuspense } from "@/components/LanguageSwitcher/LanguageSwitcherSuspense";
import { useLocale, useTranslations } from "next-intl";
import { type Locale } from "@/utilities/locale";
import {
  navigationItems,
  getNavigationItemText,
  hasHref,
  type NavigationItem,
} from "./navigation-items";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ModernMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Get locale from next-intl context (proper way)
  const validLocale = useLocale() as Locale;
  const t = useTranslations();

  const closeSheet = () => setIsOpen(false);

  const renderMobileMenuItem = (item: NavigationItem) => {
    const title = getNavigationItemText(item, validLocale, "title");

    if (item.href) {
      return (
        <Link
          key={title}
          href={item.href}
          className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary/5 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          onClick={closeSheet}
        >
          <div className="flex items-center gap-3">
            {item.icon && <item.icon className="w-4 h-4 text-primary" />}
            <span>{title}</span>
          </div>
          {validLocale === "ar" ? (
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          )}
        </Link>
      );
    }

    if (item.items) {
      return (
        <AccordionItem key={title} value={title} className="border-b-0">
          <AccordionTrigger className="py-3 px-4 font-medium hover:no-underline rounded-lg hover:bg-primary/5 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
            <div className="flex items-center gap-3">
              {item.icon && <item.icon className="w-4 h-4 text-primary" />}
              <span>{title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="mt-2 pb-2">
            {item.items?.map((subItem) => {
              if (!hasHref(subItem)) return null; // Skip items without href

              const subTitle = getNavigationItemText(
                subItem,
                validLocale,
                "title"
              );
              const subDescription = subItem.description
                ? getNavigationItemText(subItem, validLocale, "description")
                : "";

              return (
                <Link
                  key={subTitle}
                  href={subItem.href}
                  className={cn(
                    "flex select-none gap-3 rounded-md p-3 leading-none outline-none transition-colors hover:bg-primary/5 hover:text-primary focus:bg-primary/10 focus:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-0",
                    validLocale === "ar" ? "mr-4" : "ml-4"
                  )}
                  onClick={closeSheet}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-primary/60 rounded-full flex-shrink-0" />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight truncate">
                        {subTitle}
                      </div>
                      {subDescription && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {subDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2">
                    <svg
                      className="w-full h-full"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          validLocale === "ar"
                            ? "M15 19l-7-7 7-7"
                            : "M9 5l7 7-7 7"
                        }
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">{t("openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={validLocale === "ar" ? "left" : "right"}
        className={`flex flex-col w-[320px] max-w-[85vw] p-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm`}
        dir={validLocale === "ar" ? "rtl" : "ltr"}
      >
        <SheetHeader className="p-6 bg-gradient-to-r from-primary to-primary/80">
          <SheetTitle asChild>
            <Link
              href="/"
              className={`flex items-center gap-3 text-white`}
              onClick={closeSheet}
            >
              <div className="bg-white p-2 rounded-xl shadow-lg">
                <Image
                  src="/hapa-logo.webp"
                  alt="HAPA Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white">HAPA</span>
                <span className="text-xs text-white/80">
                  {validLocale === "ar"
                    ? "الهيئة العليا للصحافة والإعلام"
                    : "Mauritanie"}
                </span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <nav className="space-y-2">
            <Accordion
              type="single"
              collapsible
              className="flex w-full flex-col gap-2"
            >
              {navigationItems.map((item) => renderMobileMenuItem(item))}
            </Accordion>
          </nav>

          <Separator className="my-6 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Prominent Report Button - Mobile */}
          <div className="mb-6">
            <Button
              className="w-full bg-secondary-cta hover:bg-secondary-cta/90 text-secondary-cta-foreground font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm border-0 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              asChild
            >
              <Link href="/forms/media-content-report" onClick={closeSheet}>
                <span className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span>{t("reportMediaContent")}</span>
                </span>
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-primary px-2">
              {t("search")}
            </h3>
            <nav className="space-y-2">
              <Link
                href="/search"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 active:scale-95"
                onClick={closeSheet}
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="font-medium">{t("search")}</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Settings and Contact Section */}
        <div className="border-t border-primary/10 p-6 space-y-4 bg-muted/50">
          {/* Language Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {t("language")}
            </span>
            <LanguageSwitcherSuspense />
          </div>

          <Separator className="bg-primary/10" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
