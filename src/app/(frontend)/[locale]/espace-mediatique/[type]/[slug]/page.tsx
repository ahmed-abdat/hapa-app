import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/utilities/locale";
import { 
  getStationBySlug,
  getStationsByCategory,
  type Station 
} from "@/utilities/stations-data";
import { 
  Radio, 
  Tv, 
  Signal, 
  MapPin, 
  Building, 
  Users, 
  ExternalLink, 
  Home,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Globe
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

// Use ISR for station details with longer cache
export const revalidate = 3600; // 1 hour

type Args = {
  params: Promise<{
    locale: string;
    type: string;
    slug: string;
  }>;
};

// Related Stations Component
async function RelatedStations({ 
  currentStation, 
  type, 
  locale 
}: { 
  currentStation: Station;
  type: 'radio' | 'television';
  locale: Locale;
}) {
  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale as 'fr' | 'ar')
  
  const t = await getTranslations({ locale });
  const relatedStations = getStationsByCategory(type, currentStation.category)
    .filter(station => station.value !== currentStation.value)
    .slice(0, 3);
  
  if (relatedStations.length === 0) return null;

  const IconComponent = type === 'radio' ? Radio : Tv;
  const isRtl = locale === 'ar';

  return (
    <section className="mt-16 mb-8">
      <div className="hapa-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              <bdi>{type === 'radio' ? t('relatedStations') : t('relatedChannels')}</bdi>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedStations.map((station) => {
              const stationName = locale === 'ar' ? station.labelAr : station.label;
              const stationDesc = locale === 'ar' ? station.descriptionAr : station.description;
              const categoryColor = station.category === 'state' ? 'text-green-600' : 'text-blue-600';
              
              return (
                <Link
                  key={station.value}
                  href={`/espace-mediatique/${type}/${station.value}`}
                  className="block group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                          station.category === 'state' 
                            ? 'from-green-500 to-green-600' 
                            : 'from-blue-500 to-blue-600'
                        )}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                            <bdi>{stationName}</bdi>
                          </h3>
                          {station.frequency && (
                            <p className="text-sm text-gray-500 mt-1">
                              <bdi>{station.frequency}</bdi>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {stationDesc && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          <bdi>{stationDesc}</bdi>
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function StationDetailPage({
  params: paramsPromise,
}: Args) {
  const { locale, type, slug } = await paramsPromise;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // Validate media type
  if (type !== 'radio' && type !== 'television') {
    notFound();
  }

  // Get station data
  const station = getStationBySlug(type, slug);
  
  if (!station) {
    notFound();
  }

  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server')
  setRequestLocale(locale as 'fr' | 'ar')

  const t = await getTranslations({ locale });
  const isRtl = locale === 'ar';
  const stationName = locale === 'ar' ? station.labelAr : station.label;
  const stationDesc = locale === 'ar' ? station.descriptionAr : station.description;
  const categoryLabel = station.category === 'state' ? t('stateOwned') : t('privateOwned');
  
  const IconComponent = type === 'radio' ? Radio : Tv;
  const typeLabel = type === 'radio' ? t('radioStations') : t('televisionChannels');

  return (
    <article className="pb-24">
      {/* Hero Section */}
      <div className="relative -mt-[10.4rem] min-h-[50vh] overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(19,139,58,0.06)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,122,46,0.06)_0%,transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[50vh] items-center pt-[10.4rem] pb-8">
          <div className="hapa-container">
            {/* Back Button in Header */}
            <div className="pb-8">
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2 bg-white/90 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                asChild
              >
                <Link href={`/espace-mediatique/${type}`}>
                  {isRtl ? (
                    <ArrowRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ArrowLeft className="h-5 w-5 text-primary" />
                  )}
                  <span className="hidden sm:inline text-primary font-medium">
                    <bdi>{t('backToDirectory')}</bdi>
                  </span>
                </Link>
              </Button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Station Icon */}
              <div className="flex justify-center mb-6">
                <div className={cn(
                  'w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-xl',
                  station.category === 'state' 
                    ? 'from-green-500 to-green-600' 
                    : 'from-blue-500 to-blue-600'
                )}>
                  <IconComponent className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Station Title */}
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-primary mb-4">
                  <bdi>{stationName}</bdi>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto mb-6" />
                
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 mb-4">
                  {station.category === 'state' ? (
                    <Building className="h-4 w-4 text-green-600" />
                  ) : (
                    <Users className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium text-gray-700">
                    <bdi>{categoryLabel}</bdi>
                  </span>
                </div>

                {/* Description */}
                {stationDesc && (
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    <bdi>{stationDesc}</bdi>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hapa-container">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mt-8 mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Home className="h-3.5 w-3.5" />
                      <span><bdi>{t('home')}</bdi></span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/espace-mediatique/${type}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <IconComponent className="h-3.5 w-3.5" />
                      <span><bdi>{typeLabel}</bdi></span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[300px] truncate font-medium">
                    <bdi>{stationName}</bdi>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Station Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Technical Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Signal className="h-5 w-5 text-primary" />
                <bdi>{t('technicalInfo')}</bdi>
              </h2>
              
              <div className="space-y-4">
                {station.frequency && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600"><bdi>{t('frequency')}</bdi></span>
                    <span className="font-medium"><bdi>{station.frequency}</bdi></span>
                  </div>
                )}
                
                {station.coverage && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600"><bdi>{t('coverage')}</bdi></span>
                    <span className="font-medium"><bdi>{station.coverage}</bdi></span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600"><bdi>{t('stationType')}</bdi></span>
                  <Badge variant={station.category === 'state' ? 'default' : 'secondary'}>
                    <bdi>{categoryLabel}</bdi>
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600"><bdi>{t('status')}</bdi></span>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    <bdi>{locale === 'ar' ? 'نشط' : 'Actif'}</bdi>
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <bdi>{t('contactInfo')}</bdi>
              </h2>
              
              <div className="space-y-4">
                {station.website && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={station.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      <bdi>{t('visitWebsite')}</bdi>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Link>
                  </Button>
                )}
                
                <div className="text-center text-gray-500 py-4">
                  <p><bdi>{locale === 'ar' ? 'معلومات الاتصال الإضافية متوفرة عند الطلب' : 'Informations de contact supplémentaires disponibles sur demande'}</bdi></p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Related Stations */}
      <RelatedStations 
        currentStation={station}
        type={type}
        locale={locale}
      />
    </article>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { locale, type, slug } = await paramsPromise;
  const station = getStationBySlug(type as 'radio' | 'television', slug);
  
  if (!station) {
    return { title: 'HAPA - Station introuvable' };
  }

  const stationName = locale === 'ar' ? station.labelAr : station.label;
  const stationDesc = locale === 'ar' ? station.descriptionAr : station.description;
  const typeLabel = type === 'radio' ? 'Station Radio' : 'Chaîne TV';

  return {
    title: `HAPA - ${stationName}`,
    description: stationDesc || `${typeLabel} ${stationName} - Informations officielles HAPA`,
    openGraph: {
      title: `HAPA - ${stationName}`,
      description: stationDesc || `${typeLabel} ${stationName} - Informations officielles HAPA`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  // Import station data locally to avoid circular imports
  const { tvChannels, radioStations } = await import("@/utilities/stations-data");
  
  const params = [];
  
  // Generate radio station params
  for (const station of radioStations) {
    if (station.value !== 'other') { // Skip the 'other' option
      params.push({ locale: "fr", type: "radio", slug: station.value });
      params.push({ locale: "ar", type: "radio", slug: station.value });
    }
  }
  
  // Generate TV channel params
  for (const channel of tvChannels) {
    if (channel.value !== 'other') { // Skip the 'other' option
      params.push({ locale: "fr", type: "television", slug: channel.value });
      params.push({ locale: "ar", type: "television", slug: channel.value });
    }
  }
  
  return params;
}