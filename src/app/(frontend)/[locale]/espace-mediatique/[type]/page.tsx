import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/utilities/locale";
import { 
  getStationsByType, 
  getStationCounts, 
  searchStations, 
  mediaTypes, 
  type Station 
} from "@/utilities/stations-data";
import { 
  Radio, 
  Tv, 
  Globe, 
  Newspaper, 
  Search, 
  Filter, 
  MapPin, 
  Signal,
  ArrowRight,
  ArrowLeft,
  Building,
  Users
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Use ISR for media directory with 30 minute cache
export const revalidate = 1800;

type Args = {
  params: Promise<{
    locale: string;
    type: string;
  }>;
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
};

const iconMap = {
  Radio,
  Tv,
  Globe,
  Newspaper,
} as const;

// Station Card Component with HAPA design patterns
async function StationCard({ 
  station, 
  locale, 
  type 
}: { 
  station: Station; 
  locale: Locale;
  type: 'radio' | 'television';
}) {
  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale as 'fr' | 'ar')
  
  const t = await getTranslations({ locale });
  const isRtl = locale === 'ar';
  const stationName = locale === 'ar' ? station.labelAr : station.label;
  const stationDesc = locale === 'ar' ? station.descriptionAr : station.description;
  const categoryLabel = station.category === 'state' ? t('stateOwned') : t('privateOwned');
  
  const IconComponent = type === 'radio' ? Radio : Tv;
  const categoryColor = station.category === 'state' ? 'text-green-600' : 'text-blue-600';
  const categoryBg = station.category === 'state' ? 'bg-green-50' : 'bg-blue-50';

  return (
    <Link 
      href={`/espace-mediatique/${type}/${station.value}`}
      className="block h-full group"
    >
      <Card className={cn(
        'h-full flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]',
        'border-gray-100/80 hover:border-primary/30 overflow-hidden',
        'bg-white/80 backdrop-blur-sm group-hover:bg-white relative'
      )}>
        {/* Station Logo/Image - Fixed Height */}
        <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-center h-full">
            <div className={cn(
              'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center',
              'group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 shadow-lg',
              station.category === 'state' 
                ? 'from-green-500 to-green-600' 
                : 'from-blue-500 to-blue-600'
            )}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Station Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={cn(
              'backdrop-blur-md border-0 text-xs font-medium',
              station.category === 'state' 
                ? 'bg-green-500/90 text-white'
                : 'bg-blue-500/90 text-white'
            )}>
              <bdi>{categoryLabel}</bdi>
            </Badge>
          </div>
          
          {/* HAPA Brand Corner */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Station Info */}
        <div className="flex flex-col flex-1 p-5">
          {/* Station Name */}
          <h3 
            className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight min-h-[2.8rem]"
            title={stationName} // Full text on hover for accessibility
          >
            <bdi>{stationName}</bdi>
          </h3>
          
          {/* Station Details */}
          <div className="space-y-2 mb-4">
            {station.frequency && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Signal className="h-4 w-4 shrink-0" />
                <bdi>{station.frequency}</bdi>
              </div>
            )}
            
            {station.coverage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <bdi>{station.coverage}</bdi>
              </div>
            )}
          </div>

          {/* Description */}
          {stationDesc && (
            <p 
              className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-3 min-h-[4.5rem]"
              title={stationDesc} // Full text on hover for accessibility
            >
              <bdi>{stationDesc}</bdi>
            </p>
          )}
          
          <div className="flex-1" />
          
          {/* CTA Section */}
          <div className="pt-4 border-t border-gray-100 group-hover:border-primary/20 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="text-primary font-semibold text-sm group-hover:text-accent transition-colors duration-300">
                <bdi>{t('viewDetails')}</bdi>
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                {isRtl ? (
                  <ArrowLeft className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* HAPA Brand Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Card>
    </Link>
  );
}

// Coming Soon Component
async function ComingSoonSection({ 
  type, 
  locale 
}: { 
  type: string; 
  locale: Locale; 
}) {
  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale as 'fr' | 'ar')
  
  const t = await getTranslations({ locale });
  const isRtl = locale === 'ar';
  const mediaType = mediaTypes.find(m => m.id === type);
  if (!mediaType) return null;

  const IconComponent = iconMap[mediaType.icon as keyof typeof iconMap];

  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        {/* Enhanced Icon with HAPA Brand Colors */}
        <div className="relative pb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl flex items-center justify-center mx-auto shadow-lg backdrop-blur-sm">
            <IconComponent className="w-14 h-14 text-primary" />
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 -z-10 blur-3xl">
            <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto" />
          </div>
        </div>
        
        {/* Typography with Brand Colors */}
        <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent pb-4">
          <bdi>{t('comingSoon')}</bdi>
        </h3>
        
        <div className="w-20 h-1 bg-gradient-to-r from-primary via-secondary to-accent mx-auto rounded-full" />
        
        <p className="text-base text-gray-600 pt-6">
          <bdi>{t('stayTuned')}</bdi>
        </p>

        {/* Optional: Add a subtle decorative element */}
        <div className="pt-8 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-secondary/40 animate-pulse delay-75" />
          <div className="w-2 h-2 rounded-full bg-accent/40 animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
}

export default async function MediaDirectoryPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale, type } = await paramsPromise;
  const { category, search } = await searchParamsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Validate media type
  const validTypes = ['radio', 'television', 'digital', 'print'];
  if (!validTypes.includes(type)) {
    notFound();
  }

  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale as 'fr' | 'ar')

  const t = await getTranslations({ locale });
  const isRtl = locale === 'ar';
  const mediaType = mediaTypes.find(m => m.id === type);
  
  if (!mediaType) {
    notFound();
  }

  // Handle coming soon types
  if (mediaType.comingSoon) {
    return (
      <div className="pb-24">
        {/* Hero Section with Back Button */}
        <div className="relative -mt-[10.4rem] min-h-[60vh] overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(19,139,58,0.08)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,122,46,0.08)_0%,transparent_50%)]" />
          </div>
          
          <div className="relative z-10 flex min-h-[60vh] items-center pt-[10.4rem] pb-12">
            <div className="hapa-container">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    {React.createElement(iconMap[mediaType.icon as keyof typeof iconMap], {
                      className: "h-10 w-10 text-primary"
                    })}
                  </div>
                </div>
                
                <div className="space-y-6 mb-8">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary">
                    <bdi>{t(mediaType.titleKey as any)}</bdi>
                  </h1>
                  <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto" />
                </div>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  <bdi>{t(mediaType.descKey as any)}</bdi>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hapa-container">
          <ComingSoonSection type={type} locale={locale} />
        </div>
      </div>
    );
  }

  // Get stations for radio/television types
  const allStations = getStationsByType(type as 'radio' | 'television');
  let filteredStations = allStations;

  // Apply search filter
  if (search) {
    filteredStations = searchStations(type as 'radio' | 'television', search, locale);
  }

  // Apply category filter
  if (category && category !== 'all') {
    filteredStations = filteredStations.filter(station => station.category === category);
  }

  const counts = getStationCounts();
  const typeCount = type === 'radio' ? counts.radio.total : counts.television.total;

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative -mt-[10.4rem] min-h-[60vh] overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(19,139,58,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,122,46,0.08)_0%,transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[60vh] items-center pt-[10.4rem] pb-12">
          <div className="hapa-container">
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  {React.createElement(iconMap[mediaType.icon as keyof typeof iconMap], {
                    className: "h-10 w-10 text-primary"
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-6 mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary">
                  <bdi>{t(mediaType.titleKey as any)}</bdi>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto" />
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
                <bdi>{t(mediaType.descKey as any)}</bdi>
              </p>

              {/* Statistics */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {type === 'radio' ? (
                    <Radio className="h-4 w-4 text-primary" />
                  ) : (
                    <Tv className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-lg font-semibold text-primary">{typeCount}</span>
                <span className="text-gray-600">
                  <bdi>{type === 'radio' ? t('allStations') : t('allChannels')}</bdi>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="hapa-container">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Button
              variant={!category || category === 'all' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/espace-mediatique/${type}`}>
                <bdi>{type === 'radio' ? t('allStations') : t('allChannels')}</bdi>
              </Link>
            </Button>
            <Button
              variant={category === 'state' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/espace-mediatique/${type}?category=state`}>
                <Building className="h-4 w-4 mr-2" />
                <bdi>{t('stateOwned')}</bdi>
              </Link>
            </Button>
            <Button
              variant={category === 'private' ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/espace-mediatique/${type}?category=private`}>
                <Users className="h-4 w-4 mr-2" />
                <bdi>{t('privateOwned')}</bdi>
              </Link>
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            <bdi>
              {filteredStations.length === 0 
                ? (type === 'radio' ? t('noStationsFound') : t('noChannelsFound'))
                : type === 'radio' 
                  ? (t as any)('stationCount', { count: filteredStations.length })
                  : (t as any)('channelCount', { count: filteredStations.length })
              }
            </bdi>
          </p>
        </div>

        {/* Stations Grid */}
        {filteredStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-spacing">
            {filteredStations.map((station) => (
              <StationCard
                key={station.value}
                station={station}
                locale={locale}
                type={type as 'radio' | 'television'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {type === 'radio' ? (
                  <Radio className="w-8 h-8 text-gray-400" />
                ) : (
                  <Tv className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <bdi>{type === 'radio' ? t('noStationsFound') : t('noChannelsFound')}</bdi>
              </h3>
              <p className="text-gray-600">
                <bdi>{t('tryAnotherFilter')}</bdi>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale, type } = await paramsPromise;
  
  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale as 'fr' | 'ar')
  
  const t = await getTranslations({ locale: locale as 'fr' | 'ar' });
  const mediaType = mediaTypes.find(m => m.id === type);
  
  if (!mediaType) {
    return { title: 'HAPA - Espace Médiatique' };
  }

  const title = t(mediaType.titleKey as any);
  const description = t(mediaType.descKey as any);

  return {
    title: `HAPA - ${title}`,
    description,
    openGraph: {
      title: `HAPA - ${title}`,
      description,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return [
    { locale: "fr", type: "radio" },
    { locale: "fr", type: "television" },
    { locale: "fr", type: "digital" },
    { locale: "fr", type: "print" },
    { locale: "ar", type: "radio" },
    { locale: "ar", type: "television" },
    { locale: "ar", type: "digital" },
    { locale: "ar", type: "print" },
  ];
}