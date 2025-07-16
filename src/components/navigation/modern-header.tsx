'use client'

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { SearchIcon, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { isValidLocale, defaultLocale } from "@/utilities/locale"
import { navigationItems, getNavigationItemText, type NavigationItem } from "./navigation-items"
import { cn } from "@/lib/utils"

export function ModernHeader() {
  const pathname = usePathname()
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1]
  const validLocale = isValidLocale(currentLocale) ? currentLocale : defaultLocale

  const renderNavigationItem = (item: NavigationItem) => {
    const title = getNavigationItemText(item, validLocale, 'title')
    
    if (item.href) {
      return (
        <NavigationMenuItem key={title}>
          <NavigationMenuLink asChild>
            <Link
              href={`/${validLocale}${item.href === '/' ? '' : item.href}`}
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                pathname === `/${validLocale}${item.href === '/' ? '' : item.href}` && "bg-primary/10 text-primary"
              )}
            >
              {title}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      )
    }

    if (item.items) {
      return (
        <NavigationMenuItem key={title}>
          <NavigationMenuTrigger className="font-medium text-sm hover:bg-primary/5 hover:text-primary focus:bg-primary/10 focus:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2">
            {title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="!w-[450px] p-4">
            <div className="flex flex-col lg:grid grid-cols-2 gap-4">
              <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon && <item.icon className="w-5 h-5 text-primary" />}
                    <p className="text-base font-semibold">{title}</p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.description ? getNavigationItemText(item, validLocale, 'description') : ''}
                  </p>
                </div>
                <Button size="sm" className="mt-6" asChild>
                  <Link href={`/${validLocale}/services`}>
                    {validLocale === 'ar' ? 'الخدمات' : 'Services'}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col text-sm h-full justify-end">
                {item.items?.map((subItem) => {
                  const subTitle = getNavigationItemText(subItem, validLocale, 'title')
                  const subDescription = subItem.description ? getNavigationItemText(subItem, validLocale, 'description') : ''
                  
                  return (
                    <NavigationMenuLink
                      key={subTitle}
                      asChild
                      className="flex flex-row justify-between items-center hover:bg-primary/5 hover:text-primary py-3 px-4 rounded group transition-colors"
                    >
                      <Link href={`/${validLocale}${subItem.href}`}>
                        <div className="flex items-start gap-3">
                          {subItem.icon && <subItem.icon className="w-4 h-4 text-muted-foreground mt-0.5" />}
                          <div className="flex flex-col">
                            <span className="font-medium">{subTitle}</span>
                            {subDescription && (
                              <span className="text-xs text-muted-foreground mt-1">{subDescription}</span>
                            )}
                          </div>
                        </div>
                        {validLocale === 'ar' ? (
                          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </Link>
                    </NavigationMenuLink>
                  )
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      )
    }

    return null
  }

  return (
    <div className="hidden lg:flex items-center gap-2">
      <NavigationMenu className="flex justify-start items-start">
        <NavigationMenuList className="flex justify-start gap-2 flex-row">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </NavigationMenuList>
      </NavigationMenu>
      
      {/* Action Items */}
      <div className="flex items-center gap-2 ml-4">
        {/* Search */}
        <Button variant="ghost" size="sm" asChild>
          <Link 
            href={`/${validLocale}/search`}
            aria-label={validLocale === 'ar' ? 'بحث' : 'Rechercher'}
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <SearchIcon className="w-4 h-4" />
          </Link>
        </Button>
        
        {/* Services Button */}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${validLocale}/services`} className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {validLocale === 'ar' ? 'الخدمات' : 'Services'}
          </Link>
        </Button>
        
        {/* Language Switcher */}
        <LanguageSwitcher currentLocale={validLocale} />
      </div>
    </div>
  )
}