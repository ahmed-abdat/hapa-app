"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Locale, getLocaleDirection } from "@/utilities/locale";

interface UnifiedHeroCTAProps {
  locale: Locale;
  translations: {
    reportMediaContent: string;
    contactHapa: string;
  };
  variant?: 'default' | 'glass' | 'outline' | 'minimal' | 'corporate' | 'authority' | 'interactive' | 'floating' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  alignment?: 'center' | 'left' | 'right';
}

export const UnifiedHeroCTA: React.FC<UnifiedHeroCTAProps> = ({
  locale,
  translations,
  variant = 'default',
  size = 'md',
  className = '',
  alignment = 'center'
}) => {
  const isRTL = locale === "ar";
  const direction = getLocaleDirection(locale);

  // Size configurations following Material Design 3 recommendations
  const sizeConfig = {
    sm: { height: 'h-11', icon: 'h-4 w-4', gap: 'gap-3', text: 'text-sm', padding: 'px-5' },
    md: { height: 'h-12', icon: 'h-5 w-5', gap: 'gap-4', text: 'text-base', padding: 'px-6' },
    lg: { height: 'h-14', icon: 'h-5 w-5', gap: 'gap-4', text: 'text-base font-semibold', padding: 'px-8' }
  };

  // Alignment configurations
  const alignmentConfig = {
    center: 'justify-center items-center',
    left: 'justify-center lg:justify-start items-center lg:items-start',
    right: 'justify-center lg:justify-end items-center lg:items-end'
  };

  // HAPA Brand-Consistent Configuration  
  // Primary CTAs use HAPA Orange-Amber (#F59E0B) for "Alertez nous" functionality, with white text for optimal accessibility
  const getVariantStyles = () => {
    const baseStyles = {
      primary: {
        base: "bg-secondary-cta hover:bg-secondary-cta/90 text-secondary-cta-foreground",
        effects: "shadow-md hover:shadow-lg transition-all duration-200"
      },
      secondary: {
        base: "bg-background hover:bg-muted border-2 border-primary/20 hover:border-primary/40",
        text: "text-foreground hover:text-primary",
        effects: "shadow-sm hover:shadow-md transition-all duration-200"
      }
    };

    // Variant-specific adjustments while maintaining HAPA brand consistency
    switch (variant) {
      case 'glass': // For floating/glass backgrounds
        return {
          ...baseStyles,
          primary: {
            base: "bg-secondary-cta/90 hover:bg-secondary-cta backdrop-blur-sm text-secondary-cta-foreground",
            effects: "shadow-lg hover:shadow-xl transition-all duration-200"
          },
          secondary: {
            base: "bg-white/90 hover:bg-white backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50",
            text: "text-foreground hover:text-primary",
            effects: "shadow-md hover:shadow-lg transition-all duration-200"
          }
        };
      
      case 'outline': // For minimal/clean variants
        return {
          ...baseStyles,
          primary: {
            base: "bg-background hover:bg-secondary-cta border-2 border-secondary-cta hover:border-secondary-cta/90 text-secondary-cta hover:text-secondary-cta-foreground",
            effects: "shadow-sm hover:shadow-md transition-all duration-200"
          }
        };
        
      default:
        return baseStyles;
    }
  };

  const styles = getVariantStyles();
  const currentSize = sizeConfig[size];

  return (
    <div 
      className={cn(
        "flex flex-col sm:flex-row w-full",
        alignmentConfig[alignment],
        currentSize.gap,
        "max-w-2xl mx-auto lg:mx-0",
        className
      )}
      dir={direction}
    >
      {/* Primary CTA - Alert/Report Media Content */}
      <Link 
        href="/forms/media-content-report" 
        className="w-full sm:w-auto"
      >
        <Button
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          className={cn(
            "w-full sm:w-auto min-w-[200px] lg:min-w-[220px]",
            styles.primary.base,
            styles.primary.effects,
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            currentSize.height,
            currentSize.text,
            currentSize.padding
          )}
        >
          <Bell className={cn(currentSize.icon, "shrink-0")} />
          <span>{translations.reportMediaContent}</span>
        </Button>
      </Link>

      {/* Secondary CTA - Contact HAPA */}
      <Link 
        href="/contact" 
        className="w-full sm:w-auto"
      >
        <Button
          variant="outline"
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          className={cn(
            "w-full sm:w-auto min-w-[180px] lg:min-w-[200px]",
            styles.secondary.base,
            styles.secondary.text,
            styles.secondary.effects,
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            currentSize.height,
            currentSize.text,
            currentSize.padding
          )}
        >
          <span>{translations.contactHapa}</span>
          {isRTL ? (
            <ArrowLeft className="h-4 w-4 opacity-60" />
          ) : (
            <ArrowRight className="h-4 w-4 opacity-60" />
          )}
        </Button>
      </Link>
    </div>
  );
};