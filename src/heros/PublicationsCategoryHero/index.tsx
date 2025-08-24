"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, BookOpen, Scale, Newspaper, Briefcase } from "lucide-react";
import { useHeaderTheme } from "@/providers/HeaderTheme";
import { type Locale } from "@/utilities/locale";

interface PublicationsCategoryHeroProps {
  locale: Locale;
  categoryTitle: string;
  categorySlug: string;
  totalDocs?: number;
}

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  decisions: Scale,
  rapports: FileText,
  "lois-et-reglements": BookOpen,
  "qwanyn-w-tshryaat": BookOpen,
  publications: Briefcase,
  actualites: Newspaper,
};

// Category descriptions
const categoryDescriptions = {
  fr: {
    decisions: "Découvrez les décisions officielles et communiqués de presse de HAPA.",
    rapports: "Consultez nos rapports d'activité et études sectorielles.",
    "lois-et-reglements": "Accédez aux textes juridiques et réglementaires en vigueur.",
    publications: "Explorez l'ensemble de nos publications officielles.",
    actualites: "Restez informé de l'actualité réglementaire des médias.",
  },
  ar: {
    decisions: "اطلع على القرارات الرسمية والبيانات الصحفية لهابا.",
    rapports: "استعرض تقارير أنشطتنا والدراسات القطاعية.",
    "qwanyn-w-tshryaat": "احصل على النصوص القانونية والتنظيمية السارية.",
    publications: "استكشف مجموعة إصداراتنا الرسمية.",
    actualites: "ابق على اطلاع بأحدث الأخبار التنظيمية للإعلام.",
  },
};

export const PublicationsCategoryHero: React.FC<PublicationsCategoryHeroProps> = ({ 
  locale, 
  categoryTitle, 
  categorySlug, 
  totalDocs = 0 
}) => {
  const { setHeaderTheme } = useHeaderTheme();
  
  // Get the appropriate icon for the category
  const IconComponent = categoryIcons[categorySlug] || FileText;
  
  // Get category description with proper fallback handling
  const getDescription = (): string => {
    // Handle the Arabic specific mapping for lois-et-reglements
    if (locale === 'ar' && categorySlug === 'lois-et-reglements') {
      return categoryDescriptions.ar['qwanyn-w-tshryaat'] || 'تصفح مجموعتنا من الوثائق والمنشورات.';
    }
    
    // Handle French specific mapping for qwanyn-w-tshryaat  
    if (locale === 'fr' && categorySlug === 'qwanyn-w-tshryaat') {
      return categoryDescriptions.fr['lois-et-reglements'] || 'Parcourez notre collection de documents et publications.';
    }
    
    // Direct lookup for other categories
    const descriptions = categoryDescriptions[locale];
    const directDesc = (descriptions as any)[categorySlug];
    if (directDesc) return directDesc;
    
    // Fallback
    return locale === 'ar' ? 'تصفح مجموعتنا من الوثائق والمنشورات.' : 'Parcourez notre collection de documents et publications.';
  };
  
  const description = getDescription();

  useEffect(() => {
    setHeaderTheme("light");
  }, [setHeaderTheme]);

  return (
    <div
      className="relative -mt-[10.4rem] min-h-[60vh] overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(19,139,58,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,122,46,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.015]">
          <Image
            src="/hero.webp"
            alt="HAPA Background"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[60vh] items-center pt-[10.4rem] pb-12">
        <div className="hapa-container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Category Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <IconComponent className="h-10 w-10 text-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6 mb-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary">
                {categoryTitle}
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-secondary to-accent mx-auto" />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8"
            >
              {description}
            </motion.p>

            {/* Statistics */}
            {totalDocs > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-lg font-semibold text-primary">{totalDocs}</span>
                <span className="text-gray-600">
                  {totalDocs === 1 
                    ? (locale === 'ar' ? 'وثيقة' : 'document')
                    : (locale === 'ar' ? 'وثيقة' : 'documents')
                  }
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};